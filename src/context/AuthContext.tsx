import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useEffect, useMemo, useState } from "react";
import { apiClient } from "../services/ApiClient";
import { authApiService } from "../services/AuthApiService";
import { AppUser, Role } from "../types/models";

interface UpdateAccountPayload {
  fullName: string;
  phone: string;
  currentPassword: string;
  newPassword?: string;
}

interface AuthContextValue {
  currentUser: AppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  updateAccount: (payload: UpdateAccountPayload) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

interface RegisterPayload {
  fullName: string;
  phone: string;
  password: string;
  role: Role;
}

const AUTH_SESSION_STORAGE_KEY = "@wmt/auth-session";

interface StoredSession {
  user: AppUser;
  token: string;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);

  // Restore session from AsyncStorage on app start
  useEffect(() => {
    const hydrateAuthState = async () => {
      try {
        const stored = await AsyncStorage.getItem(AUTH_SESSION_STORAGE_KEY);
        if (stored) {
          const session = JSON.parse(stored) as StoredSession;
          apiClient.setAuthHeaders(session.user.id, session.token);
          setCurrentUser(session.user);
        }
      } catch {
        // Ignore malformed session cache
      } finally {
        setHasHydrated(true);
      }
    };

    void hydrateAuthState();
  }, []);

  const persistSession = async (user: AppUser, token: string) => {
    apiClient.setAuthHeaders(user.id, token);
    await AsyncStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify({ user, token }));
    setCurrentUser(user);
  };

  const login = async (phone: string, password: string) => {
    const response = await authApiService.login({ phone, password });
    const user: AppUser = {
      id: response.user.id,
      fullName: response.user.fullName,
      phone: response.user.phone,
      role: response.user.role as Role
    };
    await persistSession(user, response.token);
  };

  const register = async ({ fullName, phone, password, role }: RegisterPayload) => {
    const response = await authApiService.register({ fullName, phone, password, role });
    // Auto-login after register by calling login
    const loginResponse = await authApiService.login({ phone, password });
    const user: AppUser = {
      id: response.id,
      fullName: response.fullName,
      phone: response.phone,
      role: response.role as Role
    };
    await persistSession(user, loginResponse.token);
  };

  const logout = () => {
    apiClient.clearAuth();
    setCurrentUser(null);
    void AsyncStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
  };

  const updateAccount = async ({ fullName, phone, currentPassword, newPassword }: UpdateAccountPayload) => {
    if (!currentUser) throw new Error("Not authenticated");
    const updated = await authApiService.updateAccount(fullName, phone, currentPassword, newPassword);
    const updatedUser: AppUser = {
      id: updated.id,
      fullName: updated.fullName,
      phone: updated.phone,
      role: updated.role as Role
    };
    // Refresh stored session with updated user info
    const stored = await AsyncStorage.getItem(AUTH_SESSION_STORAGE_KEY);
    const token = stored ? (JSON.parse(stored) as StoredSession).token : "demo-token-" + updated.id;
    await persistSession(updatedUser, token);
  };

  const deleteAccount = async () => {
    if (!currentUser) throw new Error("Not authenticated");
    await authApiService.deleteAccount();
    apiClient.clearAuth();
    setCurrentUser(null);
    void AsyncStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
  };

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: !!currentUser,
      isLoading: !hasHydrated,
      login,
      register,
      logout,
      updateAccount,
      deleteAccount
    }),
    [currentUser, hasHydrated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
