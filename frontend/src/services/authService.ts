import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import {
  AuthSession,
  AuthTokens,
  LoginCredentials,
  RegisterCredentials,
} from '../types/Auth';
import { apiFetch } from './apiClient';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth_access_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  USER: 'auth_user',
} as const;

async function storeItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function removeItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}

export async function saveTokens(tokens: AuthTokens): Promise<void> {
  await Promise.all([
    storeItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken),
    storeItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken),
  ]);
}

export async function getStoredTokens(): Promise<AuthTokens | null> {
  const [accessToken, refreshToken] = await Promise.all([
    getItem(STORAGE_KEYS.ACCESS_TOKEN),
    getItem(STORAGE_KEYS.REFRESH_TOKEN),
  ]);

  if (!accessToken || !refreshToken) return null;
  return { accessToken, refreshToken };
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    removeItem(STORAGE_KEYS.ACCESS_TOKEN),
    removeItem(STORAGE_KEYS.REFRESH_TOKEN),
    removeItem(STORAGE_KEYS.USER),
  ]);
}

export async function saveUser(user: AuthSession['user']): Promise<void> {
  await storeItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

export async function getStoredUser(): Promise<AuthSession['user'] | null> {
  const raw = await getItem(STORAGE_KEYS.USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function loginRequest(credentials: LoginCredentials): Promise<AuthSession> {
  return apiFetch<AuthSession>('/auth/login', { method: 'POST', body: credentials });
}

export async function registerRequest(credentials: RegisterCredentials): Promise<AuthSession> {
  return apiFetch<AuthSession>('/auth/register', { method: 'POST', body: credentials });
}

export async function refreshRequest(refreshToken: string): Promise<AuthTokens> {
  return apiFetch<AuthTokens>('/auth/refresh', { method: 'POST', body: { refreshToken } });
}

export async function logoutRequest(accessToken: string): Promise<void> {
  await apiFetch<void>('/auth/logout', { method: 'POST', body: {}, accessToken });
}
