import axios from 'axios';

import { clearTokens, refreshAccessToken } from './authService';
import { log } from '../utils/logger';
import { ApiResponse, CostFilters, CostRecord, CostSummary, CostTrend } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent multiple refresh requests
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

// Request interceptor for logging and adding auth token
api.interceptors.request.use(
  (config) => {
    log.info('API Request', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL
    });
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    log.error('API Request Error', { error: error.message });
    return Promise.reject(error);
  }
);

// Response interceptor for automatic token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return api(originalRequest);
        }).catch((err) => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const tokens = await refreshAccessToken();
        if (tokens) {
          processQueue(null, tokens.accessToken);
          originalRequest.headers['Authorization'] = `Bearer ${tokens.accessToken}`;
          return api(originalRequest);
        } else {
          processQueue(new Error('Token refresh failed'), null);
          clearTokens();
          // Redirect to login page
          window.location.href = '/login';
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();
        // Redirect to login page
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle network errors with retry logic
    if (!error.response && error.code === 'NETWORK_ERROR') {
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        log.warn('Network error, retrying request', { url: originalRequest.url });
        
        // Wait 1 second before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
        return api(originalRequest);
      }
    }

    if (error.response && typeof error.response.data === 'string') {
      error.response.data = { message: error.response.data };
    }

    log.error('API Error', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url,
      code: error.code
    });
    return Promise.reject(error);
  }
);

export const costApi = {
  // Get cost records with filtering and pagination
  getCostRecords: async (params: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    serviceName?: string | string[];
    region?: string | string[];
    accountId?: string | string[];
  }): Promise<ApiResponse<CostRecord[]>> => {
    const response = await api.get('/costs', { params });
    return response.data;
  },

  // Get cost summary by service
  getCostSummary: async (params: {
    startDate?: string;
    endDate?: string;
    region?: string | string[];
    accountId?: string | string[];
  }): Promise<ApiResponse<CostSummary[]>> => {
    const response = await api.get('/costs/summary', { params });
    return response.data;
  },

  // Get cost trends over time
  getCostTrends: async (params: {
    startDate?: string;
    endDate?: string;
    serviceName?: string | string[];
    region?: string | string[];
    accountId?: string | string[];
  }): Promise<ApiResponse<CostTrend[]>> => {
    const response = await api.get('/costs/trends', { params });
    return response.data;
  },

  // Get available filters
  getAvailableFilters: async (): Promise<ApiResponse<CostFilters>> => {
    const response = await api.get('/costs/filters');
    return response.data;
  },

  // Create a new cost record
  createCostRecord: async (data: Partial<CostRecord>): Promise<ApiResponse<CostRecord>> => {
    const response = await api.post('/costs', data);
    return response.data;
  },

  // Update a cost record
  updateCostRecord: async (id: number, data: Partial<CostRecord>): Promise<ApiResponse<CostRecord>> => {
    const response = await api.put(`/costs/${id}`, data);
    return response.data;
  },

  // Delete a cost record
  deleteCostRecord: async (id: number): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete(`/costs/${id}`);
    return response.data;
  },
};

export default api;
 