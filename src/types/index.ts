export interface CostRecord {
  id: number;
  date: string;
  serviceName: string;
  costAmount: number;
  region: string;
  accountId: string;
  resourceId?: string;
  usageType?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CostSummary {
  serviceName: string;
  totalCost: number;
  recordCount: number;
}

export interface CostTrend {
  date: string;
  dailyCost: number;
}

export interface CostFilters {
  services: string[];
  regions: string[];
  accounts: string[];
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  recordsPerPage: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: PaginationInfo;
  message?: string;
  error?: string;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface FilterState {
  dateRange: DateRange | null;
  selectedServices: string[];
  selectedRegions: string[];
  selectedAccounts: string[];
} 