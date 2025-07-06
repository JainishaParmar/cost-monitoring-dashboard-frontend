import { Box, Typography } from '@mui/material';

interface ChartContainerProps {
  title: string;
  children: React.ReactNode;
  loading?: boolean;
  empty?: boolean;
  onEmptyState?: React.ReactNode;
}

const ChartContainer = ({ 
  title, 
  children, 
  loading = false,
  empty = false,
  onEmptyState
}: ChartContainerProps) => {
  return (
    <div className="common-chart-container">
      <Typography 
        variant="h5" 
        gutterBottom 
        sx={{ 
          fontWeight: 800, 
          color: '#2c3e50', 
          textAlign: 'center', 
          mt: 5, 
          mb: 2, 
          fontSize: { xs: 20, md: 26 } 
        }}
      >
        {title}
      </Typography>
      {loading && (
        <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 2 }}>
          <Box 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            minHeight="28px"
          >
            <Box
              sx={{
                width: 28,
                height: 28,
                border: '3px solid #f3f3f3',
                borderTop: '3px solid #667eea',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
          </Box>
        </Box>
      )}
      {empty ? onEmptyState : children}
    </div>
  );
};

export default ChartContainer;
 