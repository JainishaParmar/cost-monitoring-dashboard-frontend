import { Typography } from '@mui/material';

import CostFilters from './CostFilters';
import CostTable from './CostTable';
import { FilterState } from '../types';
import FilterContainer from './FilterContainer';

interface TableViewProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const TableView = ({ filters, onFiltersChange }: TableViewProps) => {
  return (
    <div className="common-container">
      <FilterContainer>
        <CostFilters filters={filters} onFiltersChange={onFiltersChange} />
      </FilterContainer>
      {/* Cost Records Table */}
      <div style={{ marginTop: 32 }}>
        <div className="common-card">
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#2c3e50', mb: 3 }}>
            Detailed Cost Records
          </Typography>
          <CostTable filters={filters} />
        </div>
      </div>
    </div>
  );
};

export default TableView;
