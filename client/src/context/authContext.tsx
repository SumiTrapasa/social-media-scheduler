import { createContext, useContext, useEffect, useState } from "react";
import api from "@/api/axios";
import type { User } from "@/types";

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser || savedUser === "undefined") return null;
    try {
      return JSON.parse(savedUser);
    } catch (error) {
      console.error("AuthContext: Failed to parse user", error);
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token"),
  );
  const [isLoading] = useState(false);

  // Sync API headers whenever the token state changes
  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, [token]);

  const login = (user: User, token: string) => {
    console.log(user, token);
    setUser(user);
    setToken(token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, logout, isAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
};
