import AsyncStorage from "@react-native-async-storage/async-storage";

const SYNC_QUEUE_KEY = "spendwise.offline.syncQueue";

export type SyncQueueItem = {
  id: string;
  type: "approve" | "reject" | "acknowledge-po" | "mark-notification-read";
  payload: Record<string, unknown>;
  createdAt: string;
};

export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  const raw = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as SyncQueueItem[];
  } catch {
    return [];
  }
}

export async function enqueueSyncItem(item: Omit<SyncQueueItem, "createdAt">) {
  const queue = await getSyncQueue();
  queue.push({ ...item, createdAt: new Date().toISOString() });
  await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  return queue;
}

export async function replaceSyncQueue(queue: SyncQueueItem[]) {
  await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
}

export async function clearSyncQueue() {
  await AsyncStorage.removeItem(SYNC_QUEUE_KEY);
}
