import axios from "axios";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

// Função para detectar a URL correta automaticamente
function getApiUrl(): string {
  // Se tiver variável de ambiente configurada, usa ela
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Tenta pegar o IP de várias fontes do Expo
  const hostUri = Constants.expoConfig?.hostUri;
  const debuggerHost = Constants.manifest?.debuggerHost;
  const expoGoHost = Constants.manifest2?.extra?.expoGo?.debuggerHost;
  
  const detectedHost = hostUri || debuggerHost || expoGoHost;
  const hostIP = detectedHost?.split(':')[0];

  if (Platform.OS === 'android') {
    // Se conseguiu pegar o IP do Expo e não é localhost
    if (hostIP && hostIP !== 'localhost' && hostIP !== '127.0.0.1') {
      return `http://${hostIP}:3333/api`;
    }
    // Fallback para emulador Android
    return 'http://10.0.2.2:3333/api';
  }

  if (Platform.OS === 'ios') {
    // Se conseguiu pegar o IP do Expo e não é localhost
    if (hostIP && hostIP !== 'localhost' && hostIP !== '127.0.0.1') {
      return `http://${hostIP}:3333/api`;
    }
    return 'http://localhost:3333/api';
  }

  // Web e outras plataformas
  return 'http://localhost:3333/api';
}

export const API_BASE_URL = getApiUrl();

console.log('[API] Platform:', Platform.OS);
console.log('[API] URL:', API_BASE_URL);

// ---------------------------------------------------------------------------
// Storage: SecureStore em mobile, localStorage na web
// ---------------------------------------------------------------------------
export const storage = {
  async get(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      return typeof localStorage !== "undefined"
        ? localStorage.getItem(key)
        : null;
    }
    return SecureStore.getItemAsync(key);
  },

  async set(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
      if (typeof localStorage !== "undefined") localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },

  async remove(key: string): Promise<void> {
    if (Platform.OS === "web") {
      if (typeof localStorage !== "undefined") localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

// ---------------------------------------------------------------------------
// Instância Axios
// ---------------------------------------------------------------------------
export const api = axios.create({ baseURL: API_BASE_URL });

// Interceptor de request: anexa token de acesso
api.interceptors.request.use(async (config) => {
  const token = await storage.get("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---------------------------------------------------------------------------
// Interceptor de response: renovação silenciosa do token em 401
// ---------------------------------------------------------------------------
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as typeof error.config & { _retry?: boolean };

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await storage.get("refreshToken");
      if (!refreshToken) throw new Error("No refresh token stored");

      const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refreshToken,
      });

      await storage.set("accessToken", data.accessToken);
      await storage.set("refreshToken", data.refreshToken);

      processQueue(null, data.accessToken);
      original.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(original);
    } catch (err) {
      processQueue(err);
      await storage.remove("accessToken");
      await storage.remove("refreshToken");
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);
