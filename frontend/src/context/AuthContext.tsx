"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  address: string;
  username: string;
  email: string;
}

interface AuthContextType {
  isAuthorized: boolean;
  user: User | null;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUserJSON = localStorage.getItem('userSession');
      if (savedUserJSON) {
        const savedUser = JSON.parse(savedUserJSON);
        // Add a validation check to ensure the data from localStorage is valid
        if (savedUser && savedUser.address) {
          setUser(savedUser);
        } else {
          // If data is invalid or doesn't have an address, clear it
          localStorage.removeItem('userSession');
        }
      }
    } catch (error) {
      console.error("Failed to parse user session from localStorage", error);
      localStorage.removeItem('userSession');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('userSession', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userSession');
  };

  const value = {
    isAuthorized: !!user,
    user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

