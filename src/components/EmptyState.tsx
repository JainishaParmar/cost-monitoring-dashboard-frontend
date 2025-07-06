import { Box, Typography } from '@mui/material';

interface EmptyStateProps {
  icon?: string;
  title?: string;
  message?: string;
  sx?: any;
}

const EmptyState = ({ 
  icon = '🌵',
  title = 'No Data Available',
  message = 'Nothing to show for the selected filter.',
  sx
}: EmptyStateProps) => {
  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      justifyContent="center" 
      height="100%" 
      py={6}
      sx={sx}
    >
      <span style={{ fontSize: 64, marginBottom: 16 }}>{icon}</span>
      <Typography variant="h6" color="text.primary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
};

export default EmptyState;
 