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
  const errorMessage = extractErrorMessage(error);
  
  // Log the error with context
  log.error('API Error', {
    message: errorMessage,
    originalError: error.message,
    status: error.response?.status,
    url: error.config?.url,
    method: error.config?.method,
    context,
    responseData: error.response?.data
  });
  
  return errorMessage;
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
