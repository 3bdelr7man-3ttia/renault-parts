import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCurrentUser, getGetCurrentUserQueryKey, type User } from "@workspace/api-client-react";

interface AuthContextType {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  isFetching: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  getAuthHeaders: () => { headers?: { Authorization: string } };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem('renault_token'));
  const queryClient = useQueryClient();
  
  // We pass the token explicitly to the query to ensure it authenticates
  // refetchInterval: re-check every 30s so role changes (e.g. customer→workshop after approval) apply automatically
  const { data: user, isLoading, isFetching, refetch } = useGetCurrentUser({
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

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('renault_token', newToken);
    setTokenState(newToken);
    // User state will update on next render/refetch, but we can optimistically set it if needed
    // The query will refetch automatically because token changed (if we added it to a key, but here we just refetch)
    setTimeout(() => refetch(), 0);
  };

  const logout = () => {
    localStorage.removeItem('renault_token');
    setTokenState(null);
    // Clear all cached query data so stale user info doesn't persist
    queryClient.clear();
  };

  const getAuthHeaders = () => {
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  return (
    <AuthContext.Provider value={{ token, user: user || null, isLoading, isFetching, login, logout, getAuthHeaders }}>
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
