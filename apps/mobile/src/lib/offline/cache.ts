import AsyncStorage from "@react-native-async-storage/async-storage";

const OFFLINE_CACHE_PREFIX = "procureai.offline.";

export async function setOfflineCache<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(
    `${OFFLINE_CACHE_PREFIX}${key}`,
    JSON.stringify({ savedAt: Date.now(), value }),
  );
}

export async function getOfflineCache<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(`${OFFLINE_CACHE_PREFIX}${key}`);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as { value: T };
    return parsed.value;
  } catch {
    return null;
  }
}

export async function clearOfflineCache(key: string): Promise<void> {
  await AsyncStorage.removeItem(`${OFFLINE_CACHE_PREFIX}${key}`);
}
