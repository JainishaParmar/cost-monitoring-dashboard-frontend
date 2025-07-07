import React from 'react';

interface SuccessAlertProps {
  message: string | null;
  onClose: () => void;
}

const SuccessAlert: React.FC<SuccessAlertProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="success-alert">
      <div className="success-content">
        <div className="success-icon">
          ✅
        </div>
        <div className="success-message">
          <strong>Success:</strong> {message}
        </div>
        <button className="success-close" onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  );
};

export default SuccessAlert;
 