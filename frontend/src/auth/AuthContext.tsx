import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getMe, loginUser, registerUser, clearToken } from "../api/client";

type User = { id: number | string; email: string; name?: string; role?: "USER" | "OWNER" | "ADMIN"; address?: string | null } | null;

type AuthCtx = {
  user: User;
  setUser: (u: User) => void;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, address: string, role?: "USER" | "OWNER" | "ADMIN") => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx>(null as any);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const me = await getMe();
        setUser(me);
      } catch {
        clearToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await loginUser({ email, password });
    setUser(res.user ?? null);
  };

  const register = async (name: string, email: string, password: string, address: string, role: "USER" | "OWNER" | "ADMIN" = "USER") => {
    const res = await registerUser({ name, email, password, address, role });
    setUser(res.user ?? null);
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
