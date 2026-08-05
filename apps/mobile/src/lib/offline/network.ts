import NetInfo, { type NetInfoState } from "@react-native-community/netinfo";

export type NetworkStatus = {
  isConnected: boolean;
  isInternetReachable: boolean | null;
};

export function getNetworkStatus(state: NetInfoState): NetworkStatus {
  return {
    isConnected: Boolean(state.isConnected),
    isInternetReachable: state.isInternetReachable,
  };
}

export function isOnline(status: NetworkStatus): boolean {
  return status.isConnected && status.isInternetReachable !== false;
}

export function subscribeToNetworkStatus(
  listener: (status: NetworkStatus) => void,
): () => void {
  return NetInfo.addEventListener((state) => {
    listener(getNetworkStatus(state));
  });
}

export async function fetchNetworkStatus(): Promise<NetworkStatus> {
  const state = await NetInfo.fetch();
  return getNetworkStatus(state);
}
