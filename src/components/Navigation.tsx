import { AppBar, Avatar, Box, Divider, IconButton, List, ListItem, ListItemIcon, ListItemText, Menu, MenuItem, Tab, Tabs, Toolbar, Typography, useTheme } from '@mui/material';
import { Dashboard as DashboardIcon, Logout, Person, TableChart as TableIcon } from '@mui/icons-material';
import React, { useState } from 'react';

import { useAuth } from '../contexts/AuthContext';
import { log } from '../utils/logger';

interface NavigationProps {
  currentTab: number;
  onTabChange: (tab: number) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentTab, onTabChange }) => {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    onTabChange(newValue);
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      handleClose();
    } catch (error) {
      log.error('Logout error', { error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  const tabs = [
    { label: 'Dashboard', icon: <DashboardIcon />, value: 0 },
    { label: 'Records', icon: <TableIcon />, value: 1 },
  ];

  return (
    <AppBar position="sticky" elevation={0} sx={{
      background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
      color: '#fff',
      boxShadow: '0 2px 12px rgba(44,62,80,0.08)',
      borderBottomLeftRadius: 18,
      borderBottomRightRadius: 18,
      minHeight: 64,
      zIndex: theme.zIndex.drawer + 1,
    }}>
      <Toolbar sx={{ minHeight: 64, px: { xs: 2, md: 4 }, display: 'flex', justifyContent: 'space-between' }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography
            variant="h6"
            noWrap
            sx={{
              fontWeight: 800,
              fontSize: '1.5rem',
              letterSpacing: '-1px',
              color: '#fff',
              fontFamily: 'Inter, Roboto, Arial, sans-serif',
            }}
          >
            Cost Monitoring
          </Typography>
        </Box>
        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            textColor="inherit"
            TabIndicatorProps={{ style: { background: '#fff', height: 3, borderRadius: 2 } }}
            sx={{
              '& .MuiTab-root': {
                fontWeight: 700,
                fontSize: '1.1rem',
                color: 'rgba(255,255,255,0.7)',
                px: 3,
                py: 1.5,
                borderRadius: 0,
                background: 'none',
                transition: 'color 0.2s',
                minHeight: 48,
                '&:hover': {
                  background: 'none',
                  color: '#fff',
                },
              },
              '& .Mui-selected': {
                color: '#fff',
                fontWeight: 800,
              },
              '& .MuiTabs-indicator': {
                background: '#fff',
                height: 3,
                borderRadius: 2,
              },
            }}
          >
            {tabs.map((tab) => (
              <Tab key={tab.value} icon={tab.icon} iconPosition="start" label={tab.label} value={tab.value} />
            ))}
          </Tabs>
        </Box>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={handleMenu} sx={{ p: 0 }}>
            <Avatar sx={{ bgcolor: '#fff', color: '#764ba2', fontWeight: 700, width: 36, height: 36, fontSize: 18 }}>
              {user?.email ? getInitials(user.email) : 'P'}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{ sx: { mt: 1.5, minWidth: 160 } }}
          >
            <MenuItem disabled>
              <Person fontSize="small" sx={{ mr: 1 }} />
              {user?.email}
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <Logout fontSize="small" sx={{ mr: 1 }} /> Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;
 