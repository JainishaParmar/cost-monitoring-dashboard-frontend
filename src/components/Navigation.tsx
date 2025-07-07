import { AppBar, Avatar, Box, Divider, IconButton, Menu, MenuItem, Tab, Tabs, Toolbar, Typography } from '@mui/material';
import { Dashboard as DashboardIcon, Logout, Person, TableChart as TableIcon } from '@mui/icons-material';
import React, { useState } from 'react';

import { useAuth } from '../contexts/AuthContext';
import { log } from '../utils/logger';
import './Navigation.css';

interface NavigationProps {
  currentTab: number;
  onTabChange: (tab: number) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentTab, onTabChange }) => {
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
    <AppBar position="sticky" elevation={0} className="navigation-appbar">
      <Toolbar className="navigation-toolbar">
        <Box display="flex" alignItems="center" gap={2}>
          <Typography
            variant="h6"
            noWrap
            className="navigation-title"
          >
            Cost Monitoring
          </Typography>
        </Box>
        <Box className="navigation-tabs-container">
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            textColor="inherit"
            TabIndicatorProps={{ style: { background: '#fff', height: 3, borderRadius: 2 } }}
            className="navigation-tabs"
          >
            {tabs.map((tab) => (
              <Tab key={tab.value} icon={tab.icon} iconPosition="start" label={tab.label} value={tab.value} />
            ))}
          </Tabs>
        </Box>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={handleMenu} className="navigation-avatar-button">
            <Avatar className="navigation-avatar">
              {user?.email ? getInitials(user.email) : 'P'}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{ className: 'navigation-menu-paper' }}
          >
            <MenuItem disabled>
              <Person fontSize="small" className="navigation-menu-icon" />
              {user?.email}
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <Logout fontSize="small" className="navigation-menu-icon" /> Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;
 