import { getOfflineCache, setOfflineCache } from "@/lib/offline/cache";
import { isOnline, type NetworkStatus } from "@/lib/offline/network";

export async function fetchWithOfflineCache<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  network: NetworkStatus,
  onSynced?: () => void,
): Promise<T> {
  try {
    const data = await fetcher();
    await setOfflineCache(cacheKey, data);
    onSynced?.();
    return data;
  } catch (error) {
    if (!isOnline(network)) {
      const cached = await getOfflineCache<T>(cacheKey);
      if (cached) {
        return cached;
      }
    }
    throw error;
  }
}
