import { Box, Card, CardContent, SxProps, Typography, useTheme } from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactElement<SvgIconComponent>;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  sx?: SxProps;
}

const StatCard = ({ title, value, icon, color = 'primary', sx }: StatCardProps) => {
  const theme = useTheme();
  
  return (
    <Card className="common-card" sx={{ height: '100%', ...sx }}>
      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
        <Box display="flex" alignItems="center" width="100%">
          <Box
            sx={{
              backgroundColor: theme.palette[color].light,
              borderRadius: '50%',
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.palette[color].main,
              boxShadow: '0 2px 8px rgba(44,62,80,0.10)',
              mr: 3,
              flex: 1
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="subtitle1" color="text.secondary" fontWeight={600}>
              {title}
            </Typography>
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{ color: theme.palette[color].main, mt: 0.5 }}
            >
              {value}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;
 