'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User } from '@kooki/shared';
import { apiClient } from './api-client';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName?: string; lastName?: string; role?: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setTokenFromOAuth: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const fetchUser = useCallback(async () => {
    try {
      const response = await apiClient.get<{ data: User }>('/auth/me');
      setState((prev) => ({
        ...prev,
        user: response.data,
        isAuthenticated: true,
        isLoading: false,
      }));
    } catch {
      apiClient.clearToken();
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('kooki_token') : null;
    if (token) {
      setState((prev) => ({ ...prev, token }));
      fetchUser();
    } else {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    const response = await apiClient.post<{ data: { token: string; user: User } }>('/auth/login', {
      email,
      password,
    });
    const { token, user } = response.data;
    apiClient.setToken(token);
    setState({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const register = async (data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    role?: string;
  }) => {
    const response = await apiClient.post<{ data: { token: string; user: User } }>('/auth/register', data);
    const { token, user } = response.data;
    apiClient.setToken(token);
    setState({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const logout = () => {
    apiClient.clearToken();
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  const setTokenFromOAuth = (token: string) => {
    apiClient.setToken(token);
    setState((prev) => ({ ...prev, token }));
    fetchUser();
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshUser, setTokenFromOAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
