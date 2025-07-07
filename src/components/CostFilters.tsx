import { Box, Button, Chip, FormControl, IconButton, InputAdornment, InputLabel, MenuItem, OutlinedInput, Select, Tooltip, Typography } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Clear, FilterList, Refresh } from '@mui/icons-material';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';

import { costApi } from '../services/api';
import { CostFilters as CostFiltersType, FilterState } from '../types';
import './CostFilters.css';

interface CostFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const CostFilters: React.FC<CostFiltersProps> = ({ filters, onFiltersChange }) => {
  const [availableFilters, setAvailableFilters] = useState<CostFiltersType>({
    services: [],
    regions: [],
    accounts: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFilters = async () => {
      setLoading(true);
      try {
        const response = await costApi.getAvailableFilters();
        if (response.success) {
          setAvailableFilters(response.data);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchFilters();
  }, []);

  const handleDateRangeChange = (key: 'startDate' | 'endDate', value: Date | null) => {
    const prev = filters.dateRange || { startDate: '', endDate: '' };
    const newDateRange = {
      startDate: key === 'startDate' ? (value ? format(value, 'yyyy-MM-dd') : '') : prev.startDate,
      endDate: key === 'endDate' ? (value ? format(value, 'yyyy-MM-dd') : '') : prev.endDate,
    };
    onFiltersChange({ ...filters, dateRange: newDateRange });
  };

  const handleClearStartDate = () => {
    const prev = filters.dateRange || { startDate: '', endDate: '' };
    const newDateRange = {
      startDate: '',
      endDate: prev.endDate,
    };
    onFiltersChange({ ...filters, dateRange: newDateRange });
  };

  const handleClearEndDate = () => {
    const prev = filters.dateRange || { startDate: '', endDate: '' };
    const newDateRange = {
      startDate: prev.startDate,
      endDate: '',
    };
    onFiltersChange({ ...filters, dateRange: newDateRange });
  };

  const handleServiceChange = (event: any) => {
    onFiltersChange({ ...filters, selectedServices: event.target.value });
  };
  const handleRegionChange = (event: any) => {
    onFiltersChange({ ...filters, selectedRegions: event.target.value });
  };
  const handleAccountChange = (event: any) => {
    onFiltersChange({ ...filters, selectedAccounts: event.target.value });
  };

  const handleClear = (key: keyof FilterState) => {
    onFiltersChange({ ...filters, [key]: key === 'dateRange' ? null : [] });
  };

  const handleResetAll = () => {
    onFiltersChange({ dateRange: null, selectedServices: [], selectedRegions: [], selectedAccounts: [] });
  };

  return (
    <div className="common-filter-bar">
      <Box className="cost-filters-header">
        <Box display="flex" alignItems="center" className="cost-filters-title-container">
          <FilterList className="cost-filters-title-icon" />
          <Typography variant="h6" fontWeight={700} mr={2} color="text.primary">Filters</Typography>
        </Box>
        <Button
          onClick={handleResetAll}
          size="small"
          startIcon={<Refresh />}
          className="cost-filters-reset-button"
        >
          Reset All Filters
        </Button>
      </Box>
      <div className="common-filter-controls">
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Box className="cost-filters-controls">
            {/* Start Date */}
            <Box className="cost-filters-date-box">
              <DatePicker
                label="Start Date"
                value={filters.dateRange?.startDate ? new Date(filters.dateRange.startDate) : null}
                onChange={(value) => handleDateRangeChange('startDate', value)}
                disableFuture
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                    InputProps: {
                      endAdornment: filters.dateRange?.startDate ? (
                        <InputAdornment position="end">
                          <Tooltip title="Clear">
                            <IconButton size="small" onClick={handleClearStartDate}>
                              <Clear fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      ) : null,
                    },
                  },
                }}
              />
            </Box>
            {/* End Date */}
            <Box className="cost-filters-date-box">
              <DatePicker
                label="End Date"
                value={filters.dateRange?.endDate ? new Date(filters.dateRange.endDate) : null}
                onChange={(value) => handleDateRangeChange('endDate', value)}
                disableFuture
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                    variant: 'outlined',
                    InputLabelProps: { shrink: true },
                    InputProps: {
                      endAdornment: filters.dateRange?.endDate ? (
                        <InputAdornment position="end">
                          <Tooltip title="Clear">
                            <IconButton size="small" onClick={handleClearEndDate}>
                              <Clear fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      ) : null,
                    },
                  },
                }}
              />
            </Box>
            {/* Services */}
            <Box className="cost-filters-select-box">
              <FormControl fullWidth size="small">
                <InputLabel>Services</InputLabel>
                <Select
                  multiple
                  value={filters.selectedServices}
                  onChange={handleServiceChange}
                  input={<OutlinedInput label="Services" />}
                  renderValue={(selected) => (
                    <Box className="cost-filters-chip-container">
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                  endAdornment={filters.selectedServices.length > 0 ? (
                    <InputAdornment position="end">
                      <Tooltip title="Clear">
                        <IconButton size="small" onClick={() => handleClear('selectedServices')}>
                          <Clear fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ) : null}
                  disabled={loading}
                >
                  {availableFilters.services.map((service) => (
                    <MenuItem key={service} value={service}>
                      {service}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            {/* Regions */}
            <Box
              sx={{
                flex: '1 1 0',
                minWidth: { xs: '100%', sm: 100 },
                mb: { xs: 2, md: 0 },
              }}
            >
              <FormControl fullWidth size="small">
                <InputLabel>Regions</InputLabel>
                <Select
                  multiple
                  value={filters.selectedRegions}
                  onChange={handleRegionChange}
                  input={<OutlinedInput label="Regions" />}
                  renderValue={(selected) => (
                    <Box className="cost-filters-chip-container">
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                  endAdornment={filters.selectedRegions.length > 0 ? (
                    <InputAdornment position="end">
                      <Tooltip title="Clear">
                        <IconButton size="small" onClick={() => handleClear('selectedRegions')}>
                          <Clear fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ) : null}
                  disabled={loading}
                >
                  {availableFilters.regions.map((region) => (
                    <MenuItem key={region} value={region}>
                      {region}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            {/* Accounts */}
            <Box
              sx={{
                flex: '1 1 0',
                minWidth: { xs: '100%', sm: 100 },
                mb: { xs: 2, md: 0 },
              }}
            >
              <FormControl fullWidth size="small">
                <InputLabel>Accounts</InputLabel>
                <Select
                  multiple
                  value={filters.selectedAccounts}
                  onChange={handleAccountChange}
                  input={<OutlinedInput label="Accounts" />}
                  renderValue={(selected) => (
                    <Box className="cost-filters-chip-container">
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                  endAdornment={filters.selectedAccounts.length > 0 ? (
                    <InputAdornment position="end">
                      <Tooltip title="Clear">
                        <IconButton size="small" onClick={() => handleClear('selectedAccounts')}>
                          <Clear fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ) : null}
                  disabled={loading}
                >
                  {availableFilters.accounts.map((account) => (
                    <MenuItem key={account} value={account}>
                      {account}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </LocalizationProvider>
      </div>
    </div>
  );
};

export default CostFilters;
 