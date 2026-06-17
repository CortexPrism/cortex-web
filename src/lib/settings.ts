import { prisma } from "@/lib/prisma";

export async function getSetting(key: string): Promise<string | null> {
  try {
    const setting = await prisma.setting.findUnique({ where: { key } });
    return setting?.value ?? null;
  } catch {
    return null;
  }
}

export async function setSetting(key: string, value: string | null): Promise<void> {
  if (value === null || value === "") {
    await prisma.setting.delete({ where: { key } }).catch(() => {});
  } else {
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
}

export async function getGitHubToken(): Promise<string | null> {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  return getSetting("github_token");
}

export async function getIndexNowKey(): Promise<string | null> {
  if (process.env.INDEXNOW_API_KEY) return process.env.INDEXNOW_API_KEY;
  return getSetting("indexnow_api_key");
}
