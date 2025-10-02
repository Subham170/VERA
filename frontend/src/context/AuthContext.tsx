"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

// User data interface
export interface UserData {
  [key: string]: any;
}

// Auth context interface
interface AuthContextType {
  // User data
  userData: UserData | null;
  isAuthorized: boolean;
  isLoading: boolean;

  // Auth methods
  updateUserData: (data: Partial<UserData>) => void;

  // Auth state
  token: string | null;
  refreshToken: string | null;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  // Update user data
  const updateUserData = (data: Partial<UserData>) => {
    if (userData && typeof window !== "undefined") {
      const updatedUserData = { ...userData, ...data };
      setUserData(updatedUserData);
      localStorage.setItem("userData", JSON.stringify(updatedUserData));
    }
  };

  // Initialize auth on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        // Check if we're on the client side
        if (typeof window === "undefined") {
          setIsLoading(false);
          return;
        }

        const storedToken = localStorage.getItem("authToken");
        const storedRefreshToken = localStorage.getItem("refreshToken");
        const storedUserData = localStorage.getItem("userData");

        if (storedToken && storedUserData) {
          const userData = JSON.parse(storedUserData);

          setToken(storedToken);
          setRefreshToken(storedRefreshToken);
          setUserData(userData);
          setIsAuthorized(true);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Context value
  const value: AuthContextType = {
    userData,
    isAuthorized,
    isLoading,
    updateUserData,
    token,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Export the context for direct access if needed
export { AuthContext };
