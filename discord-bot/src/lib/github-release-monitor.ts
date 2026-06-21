import { Client, EmbedBuilder, TextChannel } from "discord.js";
import { prisma } from "../index";
import { ReleaseWatch } from "@prisma/client";

const GITHUB_API = "https://api.github.com";
const POLL_INTERVAL_MS = 5 * 60 * 1000;

let cachedToken: string | null = null;
let tokenFetched = false;

async function getGitHubToken(): Promise<string | null> {
  if (tokenFetched) return cachedToken;
  try {
    const row = await prisma.setting.findUnique({ where: { key: "github_token" } });
    cachedToken = row?.value || process.env.GITHUB_TOKEN || null;
  } catch {
    cachedToken = process.env.GITHUB_TOKEN || null;
  }
  tokenFetched = true;
  return cachedToken;
}

async function githubFetch(path: string): Promise<unknown> {
  const token = await getGitHubToken();
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "CortexPrism-Discord-Bot",
  };
  if (token) {
    headers.Authorization = `token ${token}`;
  }

  const res = await fetch(`${GITHUB_API}${path}`, { headers });
  if (!res.ok) {
    if (res.status === 403 || res.status === 429) {
      console.warn(`GitHub API rate limit hit for ${path}`);
    }
    throw new Error(`GitHub API ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

interface GitHubRelease {
  tag_name: string;
  name: string;
  published_at: string;
  html_url: string;
  body: string | null;
  prerelease: boolean;
}

interface GitHubTag {
  name: string;
  commit: { sha: string };
}

interface GitHubRepo {
  stargazers_count: number;
  forks_count: number;
  html_url: string;
  description: string | null;
}

function truncate(str: string | null, len: number): string {
  if (!str) return "";
  return str.length > len ? str.slice(0, len - 3) + "..." : str;
}

const processingLocks = new Set<string>();

export async function checkSingleRepo(
  watch: ReleaseWatch,
  channel: TextChannel | null,
): Promise<number> {
  if (processingLocks.has(watch.id)) return 0;
  processingLocks.add(watch.id);

  try {
    const { owner, repo, watchType, lastReleaseTag, lastTagName } = watch;
    let found = 0;

    try {
      if (watchType === "release" || watchType === "both") {
        const releases = (await githubFetch(`/repos/${owner}/${repo}/releases?per_page=5`)) as GitHubRelease[];

        if (releases.length > 0) {
          const latest = releases[0];

          if (latest.tag_name !== lastReleaseTag) {
            const idx = lastReleaseTag
              ? releases.findIndex((r) => r.tag_name === lastReleaseTag)
              : -1;
            const filtered = lastReleaseTag && idx !== -1
              ? releases.slice(0, idx)
              : [latest];

            for (const rel of filtered.reverse()) {
              if (channel) {
                const embed = new EmbedBuilder()
                  .setColor(rel.prerelease ? 0xf39c12 : 0x2ecc71)
                  .setTitle(`${rel.prerelease ? "[Pre-release] " : ""}${rel.name || rel.tag_name}`)
                  .setURL(rel.html_url)
                  .setDescription(truncate(rel.body, 500) || "No description provided.")
                  .setAuthor({ name: `${owner}/${repo}`, url: `https://github.com/${owner}/${repo}` })
                  .setFooter({ text: `Release • ${owner}/${repo}` })
                  .setTimestamp(new Date(rel.published_at));

                await channel.send({ embeds: [embed] }).catch(() => {});
              }
              found++;
            }

            await prisma.releaseWatch.update({
              where: { id: watch.id },
              data: {
                lastReleaseTag: latest.tag_name,
                lastReleasePublishedAt: new Date(latest.published_at),
              },
            });
          }
        }
      }

      if (watchType === "tag" || watchType === "both") {
        const tags = (await githubFetch(`/repos/${owner}/${repo}/tags?per_page=5`)) as GitHubTag[];

        if (tags.length > 0) {
          const latest = tags[0];

          if (latest.name !== lastTagName) {
            const idx = lastTagName
              ? tags.findIndex((t) => t.name === lastTagName)
              : -1;
            const filtered = lastTagName && idx !== -1
              ? tags.slice(0, idx)
              : [latest];

            for (const tag of filtered.reverse()) {
              if (channel) {
                const embed = new EmbedBuilder()
                  .setColor(0x9b59b6)
                  .setTitle(`🏷️ Tag: ${tag.name}`)
                  .setURL(`https://github.com/${owner}/${repo}/releases/tag/${tag.name}`)
                  .setAuthor({ name: `${owner}/${repo}`, url: `https://github.com/${owner}/${repo}` })
                  .addFields({ name: "Commit", value: `\`${tag.commit.sha.slice(0, 7)}\``, inline: true })
                  .setFooter({ text: `Tag • ${owner}/${repo}` })
                  .setTimestamp();

                await channel.send({ embeds: [embed] }).catch(() => {});
              }
              found++;
            }

            await prisma.releaseWatch.update({
              where: { id: watch.id },
              data: {
                lastTagName: latest.name,
              },
            });
          }
        }
      }
    } catch (err) {
      console.error(`Failed to check releases for ${owner}/${repo}:`, err);
    }

    try {
      const repoInfo = (await githubFetch(`/repos/${owner}/${repo}`)) as GitHubRepo;
      const stars = repoInfo.stargazers_count;
      const forks = repoInfo.forks_count;

      const prevStars = watch.lastStarCount;
      const prevForks = watch.lastForkCount;

      if (prevStars !== null && stars !== prevStars && channel) {
        const delta = stars - prevStars;
        const sign = delta > 0 ? "+" : "";
        const embed = new EmbedBuilder()
          .setColor(delta > 0 ? 0xf1c40f : 0xe74c3c)
          .setTitle(`⭐ Star count changed: ${stars.toLocaleString()}`)
          .setURL(repoInfo.html_url)
          .setDescription(
            `${sign}${delta} star${Math.abs(delta) !== 1 ? "s" : ""} since last check.\n` +
            `Went from **${prevStars.toLocaleString()}** → **${stars.toLocaleString()}**`
          )
          .setAuthor({ name: `${owner}/${repo}`, url: repoInfo.html_url })
          .setFooter({ text: `Stars • ${owner}/${repo}` })
          .setTimestamp();

        await channel.send({ embeds: [embed] }).catch(() => {});
        found++;
      }

      if (prevForks !== null && forks !== prevForks && channel) {
        const delta = forks - prevForks;
        const sign = delta > 0 ? "+" : "";
        const embed = new EmbedBuilder()
          .setColor(0x1abc9c)
          .setTitle(`🔱 Fork count changed: ${forks.toLocaleString()}`)
          .setURL(repoInfo.html_url)
          .setDescription(
            `${sign}${delta} fork${Math.abs(delta) !== 1 ? "s" : ""} since last check.\n` +
            `Went from **${prevForks.toLocaleString()}** → **${forks.toLocaleString()}**`
          )
          .setAuthor({ name: `${owner}/${repo}`, url: repoInfo.html_url })
          .setFooter({ text: `Forks • ${owner}/${repo}` })
          .setTimestamp();

        await channel.send({ embeds: [embed] }).catch(() => {});
        found++;
      }

      await prisma.releaseWatch.update({
        where: { id: watch.id },
        data: {
          lastStarCount: stars,
          lastForkCount: forks,
        },
      });
    } catch (err) {
      console.error(`Failed to check repo stats for ${owner}/${repo}:`, err);
    }

    return found;
  } finally {
    processingLocks.delete(watch.id);
  }
}

async function resolveChannel(client: Client, channelId: string): Promise<TextChannel | null> {
  try {
    const ch = await client.channels.fetch(channelId).catch(() => null);
    if (ch && ch.isTextBased() && !ch.isDMBased()) {
      return ch as TextChannel;
    }
  } catch {}
  return null;
}

const CONCURRENT_BATCH = 3;

export async function checkAllRepos(client: Client): Promise<{ owner: string; repo: string; found: number }[]> {
  const watches = await prisma.releaseWatch.findMany({ where: { isActive: true } });
  const results: { owner: string; repo: string; found: number }[] = [];

  for (let i = 0; i < watches.length; i += CONCURRENT_BATCH) {
    const batch = watches.slice(i, i + CONCURRENT_BATCH);
    const batchResults = await Promise.allSettled(
      batch.map(async (watch) => {
        const channel = await resolveChannel(client, watch.channelId);
        const found = await checkSingleRepo(watch, channel);
        return { owner: watch.owner, repo: watch.repo, found };
      }),
    );

    for (const result of batchResults) {
      if (result.status === "fulfilled") {
        results.push(result.value);
      }
    }
  }

  return results;
}

let pollTimeout: ReturnType<typeof setTimeout> | null = null;

export async function startReleaseMonitor(client: Client) {
  console.log("Starting GitHub release monitor (polling every 5 minutes)...");

  const poll = async () => {
    try {
      await checkAllRepos(client);
    } catch (err) {
      console.error("Release monitor poll error:", err);
    }
    pollTimeout = setTimeout(poll, POLL_INTERVAL_MS);
  };

  poll();
}

export function stopReleaseMonitor() {
  if (pollTimeout) {
    clearTimeout(pollTimeout);
    pollTimeout = null;
  }
}
