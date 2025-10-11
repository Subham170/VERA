"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

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
    // Check if we're in browser environment
    if (typeof window === "undefined") {
      setIsLoading(false);
      return;
    }

    try {
      const savedUserJSON = localStorage.getItem("userSession");
      console.log(
        "Checking localStorage for user session:",
        savedUserJSON ? "Found" : "Not found"
      );
      if (savedUserJSON) {
        const savedData = JSON.parse(savedUserJSON);

        // Handle both old format (full API response) and new format (user object)
        let userData;
        if (savedData.data && savedData.data.user) {
          // Old format: full API response with nested user data
          userData = {
            address: savedData.data.user.address,
            username: savedData.data.user.username,
            email: savedData.data.user.email,
          };
        } else if (savedData.address) {
          // New format: direct user object
          userData = savedData;
        } else {
          // Invalid data format
          localStorage.removeItem("userSession");
          setIsLoading(false);
          return;
        }

        // Validate the user data
        if (
          userData &&
          userData.address &&
          userData.username &&
          userData.email
        ) {
          setUser(userData);
        } else {
          // If data is invalid, clear it
          localStorage.removeItem("userSession");
        }
      }
    } catch (error) {
      console.error("Failed to parse user session from localStorage", error);
      localStorage.removeItem("userSession");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("userSession", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("userSession");
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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
