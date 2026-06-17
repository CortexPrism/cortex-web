import { SITE_URL } from "@/lib/seo";
import { getIndexNowKey } from "@/lib/settings";
import { collectAllSiteUrls } from "@/lib/site-urls";

const INDEXNOW_ENDPOINTS = [
  "https://api.indexnow.org/indexnow",
  "https://www.bing.com/indexnow",
  "https://search.seznam.cz/indexnow",
  "https://yandex.com/indexnow",
];

interface IndexNowResponse {
  statusCode: number;
  message: string;
}

async function pingEndpoint(
  endpoint: string,
  host: string,
  key: string,
  keyLocation: string,
  urlList: string[],
): Promise<number | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ host, key, keyLocation, urlList }),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    return response.status;
  } catch {
    return null;
  }
}

async function pingAllEndpoints(
  host: string,
  key: string,
  keyLocation: string,
  urlList: string[],
): Promise<IndexNowResponse[]> {
  const statuses = await Promise.all(
    INDEXNOW_ENDPOINTS.map((endpoint) =>
      pingEndpoint(endpoint, host, key, keyLocation, urlList),
    ),
  );

  return statuses.map((status) => ({
    statusCode: status ?? 0,
    message: status ? `HTTP ${status}` : "Request failed",
  }));
}

export async function submitUrls(
  urls: string[],
): Promise<{ success: boolean; message: string; results: IndexNowResponse[] }> {
  const key = await getIndexNowKey();
  if (!key) {
    return {
      success: false,
      message: "IndexNow API key not configured",
      results: [],
    };
  }

  const host = new URL(SITE_URL).hostname;
  const keyLocation = `${SITE_URL}/indexnow-key.txt`;
  const results = await pingAllEndpoints(host, key, keyLocation, urls);

  const primaryResult = results[0];
  const success =
    primaryResult.statusCode === 200 || primaryResult.statusCode === 202;

  return {
    success,
    message: success
      ? `Submitted ${urls.length} URLs to IndexNow`
      : `IndexNow submission failed: ${primaryResult.message}`,
    results,
  };
}

export async function submitUrl(
  url: string,
): Promise<{ success: boolean; message: string; results: IndexNowResponse[] }> {
  return submitUrls([url]);
}

export async function submitOnApproval(
  type: "plugin" | "agent",
  slug: string,
): Promise<void> {
  await submitUrl(`${SITE_URL}/marketplace/${type}s/${slug}`);
}

export { collectAllSiteUrls };
