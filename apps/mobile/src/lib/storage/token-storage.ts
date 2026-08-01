import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "procureai.accessToken";
const REFRESH_TOKEN_KEY = "procureai.refreshToken";

export async function getStoredAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function getStoredRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function setStoredTokens(
  accessToken: string | null,
  refreshToken: string | null,
): Promise<void> {
  if (accessToken) {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
  } else {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  }

  if (refreshToken) {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  } else {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  }
}

export async function clearStoredTokens(): Promise<void> {
  await setStoredTokens(null, null);
}
