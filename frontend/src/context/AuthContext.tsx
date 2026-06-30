import React, { createContext, useContext, useEffect, useState } from "react";
import { api, storage } from "../services/api";
import { User } from "../types/User";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export default function AuthContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restaura sessão ao iniciar o app
  useEffect(() => {
    async function restoreSession() {
      try {
        const token = await storage.get("accessToken");
        if (!token) return;
        const { data } = await api.get("/me");
        setUser(data.user);
      } catch {
        await storage.remove("accessToken");
        await storage.remove("refreshToken");
      } finally {
        setIsLoading(false);
      }
    }
    restoreSession();
  }, []);

  async function login(email: string, password: string) {
    const { data } = await api.post("/auth/login", { email, password });
    await storage.set("accessToken", data.accessToken);
    await storage.set("refreshToken", data.refreshToken);
    setUser(data.user);
  }

  async function register(name: string, email: string, password: string) {
    const { data } = await api.post("/auth/register", {
      name,
      email,
      password,
    });
    await storage.set("accessToken", data.accessToken);
    await storage.set("refreshToken", data.refreshToken);
    setUser(data.user);
  }

  async function logout() {
    try {
      await api.post("/auth/logout");
    } catch {}
    await storage.remove("accessToken");
    await storage.remove("refreshToken");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
