import { Box, CircularProgress, SxProps } from '@mui/material';

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  sx?: SxProps;
  minHeight?: string | number;
}

const LoadingSpinner = ({ 
  size = 60, 
  color = 'primary', 
  sx,
  minHeight = '200px'
}: LoadingSpinnerProps) => {
  return (
    <Box 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      minHeight={minHeight}
      sx={sx}
    >
      <CircularProgress size={size} color={color as any} />
    </Box>
  );
};

export default LoadingSpinner;
 