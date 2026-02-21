import React, { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, avatarDataUrl?: string) => Promise<boolean>;
  updateUser: (updates: Partial<User>) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider(props: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('bolao_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, _password: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser: User = {
      id: '1',
      name: 'Usuario Teste',
      email: email,
      avatar: undefined,
      points: 245,
      createdAt: new Date()
    };
    
    setUser(mockUser);
    localStorage.setItem('bolao_user', JSON.stringify(mockUser));
    setIsLoading(false);
    return true;
  };

  const register = async (name: string, email: string, _password: string, avatarDataUrl?: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser: User = {
      id: Date.now().toString(),
      name: name,
      email: email,
      avatar: avatarDataUrl?.trim() || undefined,
      points: 0,
      createdAt: new Date()
    };
    
    setUser(mockUser);
    localStorage.setItem('bolao_user', JSON.stringify(mockUser));
    setIsLoading(false);
    return true;
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('bolao_user', JSON.stringify(updatedUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bolao_user');
  };

  const value = { user, login, register, updateUser, logout, isLoading };
  
  return React.createElement(AuthContext.Provider, { value }, props.children);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
