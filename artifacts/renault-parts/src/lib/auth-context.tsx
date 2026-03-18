import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useGetCurrentUser, type User } from "@workspace/api-client-react";

interface AuthContextType {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  getAuthHeaders: () => { headers?: { Authorization: string } };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem('renault_token'));
  
  // We pass the token explicitly to the query to ensure it authenticates
  const { data: user, isLoading, refetch } = useGetCurrentUser({
    query: {
      enabled: !!token,
      retry: false,
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
  };

  const getAuthHeaders = () => {
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  return (
    <AuthContext.Provider value={{ token, user: user || null, isLoading, login, logout, getAuthHeaders }}>
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
