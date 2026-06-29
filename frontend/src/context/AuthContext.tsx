import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { AuthUser, LoginCredentials, RegisterCredentials } from '../types/Auth';
import {
  clearTokens,
  getStoredTokens,
  getStoredUser,
  loginRequest,
  logoutRequest,
  refreshRequest,
  registerRequest,
  saveTokens,
  saveUser,
} from '../services/authService';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthContextType = {
  user: AuthUser | null;
  status: AuthStatus;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = React.createContext({} as AuthContextType);

const REFRESH_BEFORE_EXPIRY_MS = 55 * 60 * 1000;

export default function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  const accessTokenRef = useRef<string | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleRefresh = useCallback((refreshToken: string) => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);

    refreshTimerRef.current = setTimeout(async () => {
      try {
        const tokens = await refreshRequest(refreshToken);
        accessTokenRef.current = tokens.accessToken;
        await saveTokens(tokens);
        scheduleRefresh(tokens.refreshToken);
      } catch {
        await performLogout();
      }
    }, REFRESH_BEFORE_EXPIRY_MS);
  }, []);

  useEffect(() => {
    async function restoreSession() {
      try {
        const [storedTokens, storedUser] = await Promise.all([
          getStoredTokens(),
          getStoredUser(),
        ]);

        if (!storedTokens || !storedUser) {
          setStatus('unauthenticated');
          return;
        }

        const tokens = await refreshRequest(storedTokens.refreshToken);
        accessTokenRef.current = tokens.accessToken;
        await saveTokens(tokens);

        setUser(storedUser);
        setStatus('authenticated');
        scheduleRefresh(tokens.refreshToken);
      } catch {
        await clearTokens();
        setStatus('unauthenticated');
      }
    }

    restoreSession();

    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/categories');
    } else if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status]);

  async function login(credentials: LoginCredentials) {
    const session = await loginRequest(credentials);

    accessTokenRef.current = session.accessToken;
    await Promise.all([
      saveTokens({ accessToken: session.accessToken, refreshToken: session.refreshToken }),
      saveUser(session.user),
    ]);

    setUser(session.user);
    setStatus('authenticated');
    scheduleRefresh(session.refreshToken);
  }

  async function register(credentials: RegisterCredentials) {
    const session = await registerRequest(credentials);

    accessTokenRef.current = session.accessToken;
    await Promise.all([
      saveTokens({ accessToken: session.accessToken, refreshToken: session.refreshToken }),
      saveUser(session.user),
    ]);

    setUser(session.user);
    setStatus('authenticated');
    scheduleRefresh(session.refreshToken);
  }

  async function performLogout() {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);

    try {
      if (accessTokenRef.current) {
        await logoutRequest(accessTokenRef.current);
      }
    } catch {
    } finally {
      accessTokenRef.current = null;
      await clearTokens();
      setUser(null);
      setStatus('unauthenticated');
    }
  }

  async function logout() {
    await performLogout();
  }

  return (
    <AuthContext.Provider value={{ user, status, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);