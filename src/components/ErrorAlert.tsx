import React from 'react';

interface ErrorAlertProps {
  error: string | null;
  onClose: () => void;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ error, onClose }) => {
  if (!error) return null;

  // Determine if it's a network error
  const isNetworkError = error.includes('Failed to fetch') || 
                        error.includes('NetworkError') || 
                        error.includes('Network request failed');

  const getErrorMessage = (error: string) => {
    if (isNetworkError) {
      return 'Network connection issue. Please check your internet connection and try again.';
    }
    if (error.includes('401') || error.includes('Unauthorized')) {
      return 'Session expired. Please log in again.';
    }
    if (error.includes('403') || error.includes('Forbidden')) {
      return 'Access denied. You don\'t have permission to perform this action.';
    }
    if (error.includes('404') || error.includes('Not Found')) {
      return 'The requested resource was not found.';
    }
    if (error.includes('500') || error.includes('Internal Server Error')) {
      return 'Server error. Please try again later.';
    }
    return error;
  };

  return (
    <div className="error-alert">
      <div className="error-content">
        <div className="error-icon">
          {isNetworkError ? '🌐' : '⚠️'}
        </div>
        <div className="error-message">
          <strong>Error:</strong> {getErrorMessage(error)}
        </div>
        <button className="error-close" onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  );
};

export default ErrorAlert;
 