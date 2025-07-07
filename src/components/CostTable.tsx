import { Box, Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from '@mui/material';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';

import { costApi } from '../services/api';
import { CostRecord, FilterState, PaginationInfo } from '../types';
import { handleApiError } from '../utils/errorHandler';
import ErrorAlert from './ErrorAlert';
import LoadingSpinner from './LoadingSpinner';

interface CostTableProps {
  filters: FilterState;
}

const CostTable: React.FC<CostTableProps> = ({ filters }) => {
  const [costRecords, setCostRecords] = useState<CostRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  const fetchCostRecords = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: page + 1,
        limit: rowsPerPage,
        startDate: filters.dateRange?.startDate,
        endDate: filters.dateRange?.endDate,
        serviceName: filters.selectedServices.length > 0 ? filters.selectedServices : undefined,
        region: filters.selectedRegions.length > 0 ? filters.selectedRegions : undefined,
        accountId: filters.selectedAccounts.length > 0 ? filters.selectedAccounts : undefined,
      };

      const response = await costApi.getCostRecords(params);
      
      if (response.success) {
        setCostRecords(response.data);
        setPagination(response.pagination || null);
      }
    } catch (err) {
      const errorMessage = handleApiError(err, 'fetchCostRecords');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCostRecords();
  }, [filters, page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <ErrorAlert error={error} onClose={() => setError(null)} />

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="cost records table">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Service</TableCell>
              <TableCell align="right">Cost ($)</TableCell>
              <TableCell>Region</TableCell>
              <TableCell>Account ID</TableCell>
              <TableCell>Usage Type</TableCell>
              <TableCell>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {costRecords.map((record) => (
              <TableRow key={record.id} hover>
                <TableCell>
                  {format(new Date(record.date), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={record.serviceName} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="right">
                  ${Number(record.costAmount).toFixed(4)}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={record.region} 
                    size="small" 
                    color="secondary" 
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  {record.accountId}
                </TableCell>
                <TableCell>
                  {record.usageType || '-'}
                </TableCell>
                <TableCell>
                  {record.description || '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {pagination && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', width: '100%', px: 2, mt: 1 }}>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={pagination.totalRecords}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
      )}
    </>
  );
};

export default CostTable;
 