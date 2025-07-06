import { AuthTokens, LoginResponse } from '../types/auth';
import { log } from '../utils/logger';

// Use proxy, but always prefix with /api/auth for auth endpoints
const API_BASE_URL = '/api/auth';

// Token storage keys
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// Token management
export const getStoredTokens = (): AuthTokens | null => {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  
  if (accessToken && refreshToken) {
    return { accessToken, refreshToken };
  }
  return null;
};

export const storeTokens = (tokens: AuthTokens): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
};

export const clearTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

// Refresh token function
export const refreshAccessToken = async (): Promise<AuthTokens | null> => {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    const response = await fetch(`${API_BASE_URL}/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text };
    }

    if (!response.ok) {
      throw new Error(data.message || 'Token refresh failed');
    }

    if (data.success && data.data && data.data.tokens) {
      const tokens: AuthTokens = {
        accessToken: data.data.tokens.accessToken,
        refreshToken: data.data.tokens.refreshToken,
      };
      storeTokens(tokens);
      return tokens;
    }

    return null;
  } catch (error) {
    log.error('Token refresh error', { error: error instanceof Error ? error.message : 'Unknown error' });
    clearTokens();
    return null;
  }
};

// API request helper with automatic token refresh
const apiRequest = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text };
    }

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  } catch (error) {
    log.error('API request error', { error: error instanceof Error ? error.message : 'Unknown error' });
    throw error;
  }
};

// Authentication functions
export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await apiRequest('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // If login is successful, store tokens
    if (response.success && response.data.tokens) {
      storeTokens(response.data.tokens);
    }

    return response;
  } catch (error) {
    log.error('Login error', { error: error instanceof Error ? error.message : 'Unknown error' });
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    const accessToken = getAccessToken();
    if (accessToken) {
      await apiRequest('/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    }
  } catch (error) {
    log.error('Logout error', { error: error instanceof Error ? error.message : 'Unknown error' });
  } finally {
    clearTokens();
  }
};

export const getProfile = async (): Promise<any> => {
  try {
    const accessToken = getAccessToken();
    if (!accessToken) {
      throw new Error('No access token available');
    }

    return await apiRequest('/profile', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch (error) {
    log.error('Get profile error', { error: error instanceof Error ? error.message : 'Unknown error' });
    throw error;
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const accessToken = getAccessToken();
  return !!accessToken;
}; 
