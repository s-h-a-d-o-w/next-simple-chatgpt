import { unstable_rethrow } from "next/navigation";

const CACHE_TTL_MS = 6 * 60 * 60 * 1_000;

export function perTokenToPerMillion(costPerToken: number) {
  const result = costPerToken * 1_000_000;
  return Math.round(result * 100) / 100;
}

export async function fetchJson(url: string) {
  const response = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data: unknown = await response.json();
  return data;
}

export function createCachedFetcher<T>(fetchData: () => Promise<T>) {
  let cache: { expiresAt: number; promise: Promise<T> } | undefined = undefined;

  return () => {
    if (!cache || cache.expiresAt <= Date.now()) {
      const promise = fetchData().catch((error: unknown) => {
        cache = undefined;
        throw error;
      });

      cache = { expiresAt: Date.now() + CACHE_TTL_MS, promise };
    }

    return cache.promise;
  };
}

export async function withFilesystemFallback<T>(
  fetchRemote: () => Promise<T>,
  readFromFilesystem: () => Promise<T>,
) {
  try {
    return await fetchRemote();
  } catch (error) {
    // Next.js signals dynamic rendering/redirects via thrown errors.
    unstable_rethrow(error);

    console.error("Failed to fetch model data:", error);

    return readFromFilesystem();
  }
}
