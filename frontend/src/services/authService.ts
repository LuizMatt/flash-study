import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import {
  AuthSession,
  AuthTokens,
  LoginCredentials,
  RegisterCredentials,
} from '../types/Auth';

const BASE_URL = 'http://localhost:3333/api/auth';

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

async function post<T>(path: string, body: object, accessToken?: string): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    const message = data?.error?.message ?? data?.message ?? 'Erro desconhecido';
    throw new Error(message);
  }

  return data as T;
}

export async function loginRequest(credentials: LoginCredentials): Promise<AuthSession> {
  return post<AuthSession>('/login', credentials);
}

export async function registerRequest(credentials: RegisterCredentials): Promise<AuthSession> {
  return post<AuthSession>('/register', credentials);
}

export async function refreshRequest(refreshToken: string): Promise<AuthTokens> {
  return post<AuthTokens>('/refresh', { refreshToken });
}

export async function logoutRequest(accessToken: string): Promise<void> {
  await post<void>('/logout', {}, accessToken);
}
