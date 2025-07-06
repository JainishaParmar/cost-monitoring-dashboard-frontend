import { Alert, AlertProps } from '@mui/material';

interface SuccessAlertProps extends Omit<AlertProps, 'severity'> {
  message: string | null;
  onClose?: () => void;
}

const SuccessAlert = ({ message, onClose, ...alertProps }: SuccessAlertProps) => {
  if (!message) return null;

  return (
    <Alert 
      severity="success" 
      onClose={onClose}
      sx={{ mb: 2 }}
      {...alertProps}
    >
      {message}
    </Alert>
  );
};

export default SuccessAlert;
 