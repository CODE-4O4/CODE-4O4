"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ActionResult, ClubUser } from "@/types";

type AuthContextValue = {
  user: ClubUser | null;
  login: (credentials: LoginCredentials) => Promise<ActionResult>;
  logout: () => void;
  updateUser: (updates: Partial<ClubUser>) => void;
  isAuthenticated: boolean;
};

type LoginCredentials = {
  username: string;
  password: string;
};

const STORAGE_KEY = "code404-user";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<ClubUser | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const cached = window.localStorage.getItem(STORAGE_KEY);
      return cached ? (JSON.parse(cached) as ClubUser) : null;
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    
    
    setHydrated(true);
  }, []);

  useEffect(() => {
    
    
    if (typeof window !== "undefined" && user && hydrated) {
      const hasCookie = document.cookie.includes('code404-user');
      if (!hasCookie) {
        console.log('🔄 Restoring session cookie from localStorage');
        const isSecure = window.location.protocol === 'https:';
        const cookieValue = encodeURIComponent(JSON.stringify(user));
        const cookieParts = [
          `code404-user=${cookieValue}`,
          'path=/',
          'max-age=2592000', 
          'SameSite=Lax',
        ];
        if (isSecure) {
          cookieParts.push('Secure');
        }
        document.cookie = cookieParts.join('; ');
      }
    }
  }, [user, hydrated]);

  const login = useCallback(async ({
    username,
    password,
  }: LoginCredentials): Promise<ActionResult> => {
    try {
      
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username: username.trim().toLowerCase(), 
          password 
        }),
      });

      const result = await response.json();

      if (result.ok && result.user) {
        setUser(result.user);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(result.user));
          
          
          const isSecure = window.location.protocol === 'https:';
          const cookieValue = encodeURIComponent(JSON.stringify(result.user));
          const cookieParts = [
            `code404-user=${cookieValue}`,
            'path=/',
            'max-age=2592000', 
            'SameSite=Lax',
          ];
          if (isSecure) {
            cookieParts.push('Secure');
          }
          document.cookie = cookieParts.join('; ');
          
          
          console.log('🍪 Cookie set:', document.cookie.includes('code404-user') ? 'Success' : 'Failed');
        }
        
        try {
          
          const webpush = await import('@/lib/webpush');
          
          webpush.registerServiceWorker().then(() => {
            
            webpush.subscribeForPush(result.user.id).then((sub) => {
              if (sub) console.log('🔔 Subscribed for web-push during login');
            }).catch((e) => console.warn('Subscribe error after login', e));
          }).catch((e) => console.warn('SW register error after login', e));
        } catch (err) {
          console.warn('Webpush helper not available', err);
        }

        return {
          ok: true,
          message: result.message,
          user: result.user,
        };
      }

      
      return { 
        ok: false, 
        message: result.message || "Login failed. Please check your credentials." 
      };
    } catch (error) {
      console.error("Login error:", error);
      return { ok: false, message: "Network error. Please try again." };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
      
      document.cookie = "code404-user=; path=/; max-age=0";
      
      window.location.href = "/";
    }
  }, []);

  const updateUser = useCallback((updates: Partial<ClubUser>) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      const updatedUser = { ...prevUser, ...updates };
      
      
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
        
        const isSecure = window.location.protocol === 'https:';
        const cookieValue = encodeURIComponent(JSON.stringify(updatedUser));
        const cookieParts = [
          `code404-user=${cookieValue}`,
          'path=/',
          'max-age=2592000', 
          'SameSite=Lax',
        ];
        if (isSecure) {
          cookieParts.push('Secure');
        }
        document.cookie = cookieParts.join('; ');
      }
      
      return updatedUser;
    });
  }, []);

  const sessionUser = hydrated ? user : null;

  const value = useMemo<AuthContextValue>(
    () => ({
      user: sessionUser,
      login,
      logout,
      updateUser,
      isAuthenticated: Boolean(sessionUser),
    }),
    [login, logout, updateUser, sessionUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider />");
  }
  return ctx;
};
