import { Alert, AlertProps } from '@mui/material';

interface ErrorAlertProps extends Omit<AlertProps, 'severity'> {
  error: string | null;
  onClose?: () => void;
}

const ErrorAlert = ({ error, onClose, ...alertProps }: ErrorAlertProps) => {
  if (!error) return null;

  return (
    <Alert 
      severity="error" 
      onClose={onClose}
      sx={{ mb: 2 }}
      {...alertProps}
    >
      {error}
    </Alert>
  );
};

export default ErrorAlert;
 