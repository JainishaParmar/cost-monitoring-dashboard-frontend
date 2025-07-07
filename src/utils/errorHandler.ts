import { log } from './logger';

export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{ field: string; message: string }>;
  error?: string;
}

export interface ErrorResponse {
  status: number;
  data: ApiError;
}

export interface ErrorInfo {
  type: 'network' | 'auth' | 'validation' | 'server' | 'unknown';
  message: string;
  userFriendlyMessage: string;
  retryable: boolean;
}

/**
 * Categorize errors for better handling
 */
export const categorizeError = (error: any): ErrorInfo => {
  const errorMessage = error?.message || error?.toString() || 'Unknown error';
  
  // Network errors
  if (errorMessage.includes('Failed to fetch') || 
      errorMessage.includes('NetworkError') || 
      errorMessage.includes('Network request failed') ||
      errorMessage.includes('ERR_NETWORK') ||
      errorMessage.includes('ERR_INTERNET_DISCONNECTED') ||
      error.code === 'NETWORK_ERROR') {
    return {
      type: 'network',
      message: errorMessage,
      userFriendlyMessage: 'Network connection issue. Please check your internet connection and try again.',
      retryable: true
    };
  }

  // Authentication errors
  if (errorMessage.includes('401') || 
      errorMessage.includes('Unauthorized') ||
      errorMessage.includes('Token expired') ||
      errorMessage.includes('Invalid token') ||
      error.response?.status === 401) {
    return {
      type: 'auth',
      message: errorMessage,
      userFriendlyMessage: 'Session expired. Please log in again.',
      retryable: false
    };
  }

  // Authorization errors
  if (errorMessage.includes('403') || 
      errorMessage.includes('Forbidden') ||
      error.response?.status === 403) {
    return {
      type: 'auth',
      message: errorMessage,
      userFriendlyMessage: 'Access denied. You don\'t have permission to perform this action.',
      retryable: false
    };
  }

  // Validation errors
  if (errorMessage.includes('400') || 
      errorMessage.includes('Bad Request') ||
      errorMessage.includes('Validation failed') ||
      error.response?.status === 400 ||
      error.response?.status === 422) {
    return {
      type: 'validation',
      message: errorMessage,
      userFriendlyMessage: 'Invalid data provided. Please check your input and try again.',
      retryable: false
    };
  }

  // Server errors
  if (errorMessage.includes('500') || 
      errorMessage.includes('Internal Server Error') ||
      errorMessage.includes('502') ||
      errorMessage.includes('503') ||
      errorMessage.includes('504') ||
      (error.response?.status && error.response.status >= 500)) {
    return {
      type: 'server',
      message: errorMessage,
      userFriendlyMessage: 'Server error. Please try again later.',
      retryable: true
    };
  }

  // Not found errors
  if (errorMessage.includes('404') || 
      errorMessage.includes('Not Found') ||
      error.response?.status === 404) {
    return {
      type: 'validation',
      message: errorMessage,
      userFriendlyMessage: 'The requested resource was not found.',
      retryable: false
    };
  }

  // Default unknown error
  return {
    type: 'unknown',
    message: errorMessage,
    userFriendlyMessage: 'An unexpected error occurred. Please try again.',
    retryable: true
  };
};

/**
 * Extract meaningful error message from API response
 */
export const extractErrorMessage = (error: any): string => {
  // If it's an axios error with response data
  if (error.response?.data) {
    const responseData = error.response.data;
    
    // If the API returned a structured error response
    if (responseData.message) {
      return responseData.message;
    }
    
    // If there are validation errors
    if (responseData.errors && Array.isArray(responseData.errors)) {
      const errorMessages = responseData.errors.map((err: any) => err.message).join(', ');
      return errorMessages || 'Validation error occurred';
    }
    
    // If there's a generic error field
    if (responseData.error) {
      return responseData.error;
    }
  }
  
  // If it's a network error
  if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
    return 'Unable to connect to the server. Please check your internet connection.';
  }
  
  // If it's a timeout error
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }
  
  // If it's a 401/403 error
  if (error.response?.status === 401) {
    return 'Your session has expired. Please log in again.';
  }
  
  if (error.response?.status === 403) {
    return 'You do not have permission to perform this action.';
  }
  
  if (error.response?.status === 404) {
    return 'The requested resource was not found.';
  }
  
  if (error.response?.status === 409) {
    return 'This resource already exists.';
  }
  
  if (error.response?.status === 422) {
    return 'The provided data is invalid.';
  }
  
  if (error.response?.status >= 500) {
    return 'A server error occurred. Please try again later.';
  }
  
  // Default error message
  return error.message || 'An unexpected error occurred. Please try again.';
};

/**
 * Handle API errors and log them appropriately
 */
export const handleApiError = (error: any, context?: string): string => {
  const errorInfo = categorizeError(error);
  
  // Log the error with context
  log.error('API Error', {
    type: errorInfo.type,
    message: errorInfo.message,
    userFriendlyMessage: errorInfo.userFriendlyMessage,
    retryable: errorInfo.retryable,
    originalError: error.message,
    status: error.response?.status,
    url: error.config?.url,
    method: error.config?.method,
    context,
    responseData: error.response?.data
  });
  
  return errorInfo.userFriendlyMessage;
};

/**
 * Handle form validation errors
 */
export const handleValidationError = (errors: Array<{ field: string; message: string }>): string => {
  const errorMessages = errors.map(err => `${err.field}: ${err.message}`).join(', ');
  log.warn('Validation error', { errors });
  return errorMessages;
};

/**
 * Check if error is a network error
 */
export const isNetworkError = (error: any): boolean => {
  return !error.response && (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error'));
};

/**
 * Check if error is a timeout error
 */
export const isTimeoutError = (error: any): boolean => {
  return error.code === 'ECONNABORTED' || error.message?.includes('timeout');
};

/**
 * Check if error is an authentication error
 */
export const isAuthError = (error: any): boolean => {
  return error.response?.status === 401 || error.response?.status === 403;
};

/**
 * Check if error should be retried
 */
export const shouldRetry = (error: any): boolean => {
  const errorInfo = categorizeError(error);
  return errorInfo.retryable;
};

/**
 * Get retry delay with exponential backoff
 */
export const getRetryDelay = (attempt: number): number => {
  // Exponential backoff: 1s, 2s, 4s, 8s, max 10s
  return Math.min(1000 * Math.pow(2, attempt - 1), 10000);
};

/**
 * Retry function with exponential backoff
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  context?: string
): Promise<T> => {
  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (!shouldRetry(error) || attempt === maxAttempts) {
        throw error;
      }

      const delay = getRetryDelay(attempt);
      log.warn(`Retrying operation (${attempt}/${maxAttempts})`, {
        context,
        delay,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}; 
