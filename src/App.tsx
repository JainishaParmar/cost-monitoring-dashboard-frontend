import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Box, CircularProgress, createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { format as formatDate, startOfMonth } from 'date-fns';
import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';

import AuthWrapper from './components/AuthWrapper';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardView from './components/DashboardView';
import Navigation from './components/Navigation';
import TableView from './components/TableView';
import { FilterState } from './types';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
    },
    secondary: {
      main: '#764ba2',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const today = new Date();
  const firstDayOfMonth = startOfMonth(today);
  const [filters, setFilters] = useState<FilterState>({
    dateRange: {
      startDate: formatDate(firstDayOfMonth, 'yyyy-MM-dd'),
      endDate: formatDate(today, 'yyyy-MM-dd'),
    },
    selectedServices: [],
    selectedRegions: [],
    selectedAccounts: [],
  });

  const { isAuthenticated, loading } = useAuth();

  const handleTabChange = (tab: number) => {
    setCurrentTab(tab);
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const renderContent = () => {
    switch (currentTab) {
      case 0:
        return <DashboardView filters={filters} onFiltersChange={handleFiltersChange} />;
      case 1:
        return <TableView filters={filters} onFiltersChange={handleFiltersChange} />;
      default:
        return <DashboardView filters={filters} onFiltersChange={handleFiltersChange} />;
    }
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <CircularProgress size={60} sx={{ color: 'white' }} />
      </Box>
    );
  }

  // Show authentication forms if not authenticated
  if (!isAuthenticated) {
    return <AuthWrapper />;
  }

  // Show main app if authenticated
  return (
    <ProtectedRoute>
      <Box sx={{ flexGrow: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navigation currentTab={currentTab} onTabChange={handleTabChange} />
        <Box sx={{ flexGrow: 1 }}>
          {renderContent()}
        </Box>
      </Box>
    </ProtectedRoute>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <AuthProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
