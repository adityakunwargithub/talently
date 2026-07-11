import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'talently_auth_token';
const ROLE_KEY = 'talently_auth_role';
const API_PORT = 5000;

/**
 * On native, "localhost" resolves to the device itself, not the dev machine —
 * so a hardcoded localhost fallback would silently fail on a physical device or
 * emulator. Derive the dev machine's LAN IP from the Expo dev server's host
 * (available while running via `expo start`) instead.
 */
function resolveApiUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;

  if (Platform.OS !== 'web') {
    const hostUri = Constants.expoConfig?.hostUri;
    const host = hostUri?.split(':')[0];
    if (host) return `http://${host}:${API_PORT}/api`;
  }

  return `http://localhost:${API_PORT}/api`;
}

const API_URL = resolveApiUrl();

async function storageGet(key: string): Promise<string | null> {
  return Platform.OS === 'web' ? AsyncStorage.getItem(key) : SecureStore.getItemAsync(key);
}

async function storageSet(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

async function storageRemove(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}

export const getToken = () => storageGet(TOKEN_KEY);
export const setToken = (token: string) => storageSet(TOKEN_KEY, token);
export const getRole = () => storageGet(ROLE_KEY);
export const setRole = (role: string) => storageSet(ROLE_KEY, role);

export async function clearToken(): Promise<void> {
  await Promise.all([storageRemove(TOKEN_KEY), storageRemove(ROLE_KEY)]);
}

export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
