export interface User {
  id: number;
  email: string;
  isVerified?: boolean;
  createdAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user?: User;
    tokens?: AuthTokens;
    expiresIn?: number;
  };
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data?: {
    user?: User;
    tokens?: AuthTokens;
    expiresIn?: number;
  };
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
} 