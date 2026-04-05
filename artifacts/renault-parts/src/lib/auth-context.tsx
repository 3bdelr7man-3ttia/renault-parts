import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCurrentUser, getGetCurrentUserQueryKey } from "@workspace/api-client-react";
import { type AppRole, type AppUser, type Permission, hasPermission as checkPermission, isRole as matchRole, normalizeEmployeeRole, normalizeRole } from "@/lib/permissions";

const TOKEN_STORAGE_KEY = 'renault_token';
const USER_STORAGE_KEY = 'renault_user';

function isAuthFailure(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const candidate = error as {
    status?: number;
    data?: { error?: string } | null;
    message?: string;
  };

  if (candidate.status === 401) return true;

  const apiError = candidate.data?.error;
  if (apiError === "رمز غير صالح" || apiError === "المستخدم غير موجود" || apiError === "غير مصرح") {
    return true;
  }

  return typeof candidate.message === "string" && candidate.message.includes("401");
}

function normalizeUser(raw: unknown): AppUser | null {
  if (!raw || typeof raw !== "object") return null;

  const candidate = raw as Record<string, unknown>;
  const id = typeof candidate.id === "number" ? candidate.id : null;
  const name = typeof candidate.name === "string" ? candidate.name : null;

  if (!id || !name) return null;

  return {
    id,
    name,
    phone: typeof candidate.phone === "string" || candidate.phone == null ? (candidate.phone as string | null | undefined) : null,
    email: typeof candidate.email === "string" || candidate.email == null ? (candidate.email as string | null | undefined) : null,
    carModel: typeof candidate.carModel === "string" || candidate.carModel == null ? (candidate.carModel as string | null | undefined) : null,
    carYear: typeof candidate.carYear === "number" || candidate.carYear == null ? (candidate.carYear as number | null | undefined) : null,
    address: typeof candidate.address === "string" || candidate.address == null ? (candidate.address as string | null | undefined) : null,
    area: typeof candidate.area === "string" || candidate.area == null ? (candidate.area as string | null | undefined) : null,
    role: normalizeRole(typeof candidate.role === "string" ? candidate.role : undefined),
    employeeRole: normalizeEmployeeRole(typeof candidate.employeeRole === "string" ? candidate.employeeRole : null),
    workshopId: typeof candidate.workshopId === "number" || candidate.workshopId == null ? (candidate.workshopId as number | null | undefined) : null,
    createdAt: typeof candidate.createdAt === "string" || candidate.createdAt instanceof Date ? candidate.createdAt : undefined,
  };
}

interface AuthContextType {
  token: string | null;
  user: AppUser | null;
  isLoading: boolean;
  isFetching: boolean;
  login: (token: string, user: AppUser) => void;
  logout: () => void;
  getAuthHeaders: () => { headers?: { Authorization: string } };
  hasPermission: (permission: Permission) => boolean;
  isRole: (role: AppRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [localUser, setLocalUser] = useState<AppUser | null>(() => {
    const saved = localStorage.getItem(USER_STORAGE_KEY);
    if (!saved) return null;
    try {
      return normalizeUser(JSON.parse(saved));
    } catch {
      return null;
    }
  });
  const queryClient = useQueryClient();
  const clearAuthState = React.useCallback((options?: { redirectToLogin?: boolean }) => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setTokenState(null);
    setLocalUser(null);
    queryClient.clear();

    if (options?.redirectToLogin && typeof window !== 'undefined') {
      const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      if (!currentPath.startsWith('/login')) {
        window.location.replace('/login');
      }
    }
  }, [queryClient]);
  
  // We pass the token explicitly to the query to ensure it authenticates
  // refetchInterval: re-check every 30s so role changes (e.g. customer→workshop after approval) apply automatically
  const { data: fetchedUser, error, isError, isLoading, isFetching, refetch } = useGetCurrentUser({
    query: {
      queryKey: getGetCurrentUserQueryKey(),
      enabled: !!token,
      retry: false,
      refetchOnWindowFocus: true,
      refetchInterval: 30_000,
      staleTime: 0,
    },
    request: token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
  });

  const normalizedFetchedUser = useMemo(() => normalizeUser(fetchedUser), [fetchedUser]);
  const user = normalizedFetchedUser ?? localUser;

  useEffect(() => {
    if (normalizedFetchedUser) {
      const serializedFetchedUser = JSON.stringify(normalizedFetchedUser);
      const serializedLocalUser = localUser ? JSON.stringify(localUser) : null;

      localStorage.setItem(USER_STORAGE_KEY, serializedFetchedUser);
      if (serializedFetchedUser !== serializedLocalUser) {
        setLocalUser(normalizedFetchedUser);
      }
      return;
    }

    if (!token) {
      localStorage.removeItem(USER_STORAGE_KEY);
      setLocalUser(null);
    }
  }, [localUser, normalizedFetchedUser, token]);

  useEffect(() => {
    if (token && isError && isAuthFailure(error)) {
      clearAuthState({ redirectToLogin: true });
    }
  }, [clearAuthState, error, isError, token]);

  const login = (newToken: string, newUser: AppUser) => {
    const normalizedUser = normalizeUser(newUser);
    localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
    setTokenState(newToken);
    if (normalizedUser) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(normalizedUser));
      setLocalUser(normalizedUser);
      queryClient.setQueryData(getGetCurrentUserQueryKey(), normalizedUser);
    }
    setTimeout(() => refetch(), 0);
  };

  const logout = () => {
    clearAuthState();
  };

  const getAuthHeaders = () => {
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  const hasPermission = (permission: Permission) => checkPermission(user, permission);
  const isRole = (role: AppRole) => matchRole(user, role);

  return (
    <AuthContext.Provider value={{ token, user, isLoading, isFetching, login, logout, getAuthHeaders, hasPermission, isRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
