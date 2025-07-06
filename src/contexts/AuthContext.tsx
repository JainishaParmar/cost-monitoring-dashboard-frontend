import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { getProfile, isAuthenticated, login as authLogin, logout as authLogout, refreshAccessToken } from '../services/authService';
import { log } from '../utils/logger';

interface User {
  id: number;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Proactive token refresh interval
  useEffect(() => {
    let refreshInterval: NodeJS.Timeout;

    const setupTokenRefresh = () => {
      // Refresh token every 14 minutes (before the 15-minute expiration)
      refreshInterval = setInterval(async () => {
        try {
          if (isAuthenticated()) {
            await refreshAccessToken();
            log.info('Token refreshed proactively');
          }
        } catch (error) {
          log.error('Proactive token refresh failed', { error: error instanceof Error ? error.message : 'Unknown error' });
          // If refresh fails, clear tokens and redirect to login
          authLogout();
          setUser(null);
        }
      }, 14 * 60 * 1000); // 14 minutes
    };

    if (isAuthenticated()) {
      setupTokenRefresh();
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [user]);

  const checkAuth = async () => {
    try {
      if (isAuthenticated()) {
        const response = await getProfile();
        if (response.success && response.data.user) {
          setUser(response.data.user);
        } else {
          // If profile fetch fails, try to refresh token
          const refreshed = await refreshAccessToken();
          if (refreshed) {
            const profileResponse = await getProfile();
            if (profileResponse.success && profileResponse.data.user) {
              setUser(profileResponse.data.user);
            } else {
              authLogout();
              setUser(null);
            }
          } else {
            authLogout();
            setUser(null);
          }
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      log.error('Auth check error', { error: error instanceof Error ? error.message : 'Unknown error' });
      authLogout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authLogin(email, password);
      if (response.success && response.data?.user) {
        setUser(response.data.user);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      log.error('Login error', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authLogout();
    } catch (error) {
      log.error('Logout error', { error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 
