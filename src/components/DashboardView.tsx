import { Box, Typography, useTheme } from '@mui/material';
import { AccountBalance, Storage, Timeline, TrendingUp } from '@mui/icons-material';
import { addDays, differenceInDays, format, parseISO } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import CostFilters from './CostFilters';
import StatCard from './StatCard';
import { costApi } from '../services/api';
import { CostSummary, CostTrend, FilterState } from '../types';
import { handleApiError } from '../utils/errorHandler';
import ErrorAlert from './ErrorAlert';
import EmptyState from './EmptyState';
import FilterContainer from './FilterContainer';
import ChartContainer from './ChartContainer';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B', '#4ECDC4', '#45B7D1'];

interface DashboardViewProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ filters, onFiltersChange }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [costSummary, setCostSummary] = useState<CostSummary[]>([]);
  const [costTrends, setCostTrends] = useState<CostTrend[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          startDate: filters.dateRange?.startDate,
          endDate: filters.dateRange?.endDate,
          serviceName: filters.selectedServices.length > 0 ? filters.selectedServices : undefined,
          region: filters.selectedRegions.length > 0 ? filters.selectedRegions : undefined,
          accountId: filters.selectedAccounts.length > 0 ? filters.selectedAccounts : undefined,
        };
        const [summaryResponse, trendsResponse] = await Promise.all([
          costApi.getCostSummary(params),
          costApi.getCostTrends(params),
        ]);
        if (isMounted) {
          if (summaryResponse.success) setCostSummary(summaryResponse.data);
          if (trendsResponse.success) setCostTrends(trendsResponse.data);
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage = handleApiError(err, 'fetchDashboardData');
          setError(errorMessage);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [filters]);

  const totalCost = costSummary.reduce((sum, item) => sum + item.totalCost, 0);
  const totalRecords = costSummary.reduce((sum, item) => sum + item.recordCount, 0);
  const averageDailyCost = costTrends.length > 0 
    ? costTrends.reduce((sum, item) => sum + item.dailyCost, 0) / costTrends.length 
    : 0;

  const chartData = React.useMemo(
    () => costSummary.map((item, index) => ({
      name: item.serviceName,
      value: parseFloat(item.totalCost.toFixed(2)),
      color: COLORS[index % COLORS.length],
    })),
    [costSummary]
  );

  const trendData = React.useMemo(() => {
    let startDateStr = filters.dateRange?.startDate;
    let endDateStr = filters.dateRange?.endDate;
    if (!startDateStr || !endDateStr) {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      startDateStr = format(firstDayOfMonth, 'yyyy-MM-dd');
      endDateStr = format(today, 'yyyy-MM-dd');
    }
    const start = parseISO(startDateStr);
    const end = parseISO(endDateStr);
    const totalDays = differenceInDays(end, start) + 1;
    const partitions = 5;
    let partitionDates: Date[] = [];
    if (totalDays <= partitions) {
      // If range is short, just use each day
      for (let i = 0; i < totalDays; i++) {
        partitionDates.push(addDays(start, i));
      }
    } else {
      // Evenly spaced, unique dates
      partitionDates = Array.from({ length: partitions }, (_, i) => {
        const day = Math.round(i * (totalDays - 1) / (partitions - 1));
        return addDays(start, day);
      });
    }

    // Prepare a map of date string to cost
    const costMap = new Map<string, number>();
    costTrends.forEach(item => {
      costMap.set(format(parseISO(item.date), 'yyyy-MM-dd'), item.dailyCost);
    });

    // For each partition, calculate average cost
    const result = [];
    for (let i = 0; i < partitionDates.length; i++) {
      const partStart = partitionDates[i];
      const partEnd = i === partitionDates.length - 1 ? partitionDates[i] : partitionDates[i + 1];
      let sum = 0;
      let count = 0;
      for (let d = partStart; d <= partEnd; d = addDays(d, 1)) {
        const key = format(d, 'yyyy-MM-dd');
        if (costMap.has(key)) {
          sum += costMap.get(key)!;
          count++;
        }
        if (d.getTime() === partEnd.getTime()) break;
      }
      result.push({
        date: format(partStart, 'MMM dd'),
        cost: count > 0 ? parseFloat((sum / count).toFixed(2)) : 0,
      });
    }
    return result;
  }, [costTrends, filters.dateRange]);

  return (
    <div className="common-container">
      <ErrorAlert error={error} onClose={() => setError(null)} />

      <FilterContainer>
        <CostFilters filters={filters} onFiltersChange={onFiltersChange} />
      </FilterContainer>

      {/* Statistics Cards */}
      <div className="dashboard-summary-grid">
        <StatCard
          title="Total Cost"
          value={`$${totalCost.toFixed(2)}`}
          icon={<AccountBalance />}
          color="primary"
        />
        <StatCard
          title="Total Records"
          value={totalRecords.toLocaleString()}
          icon={<Storage />}
          color="secondary"
        />
        <StatCard
          title="Avg Daily Cost"
          value={`$${averageDailyCost.toFixed(2)}`}
          icon={<TrendingUp />}
          color="success"
        />
        <StatCard
          title="Services"
          value={costSummary.length.toString()}
          icon={<Timeline />}
          color="info"
        />
      </div>

      {/* Charts */}
      <div className="dashboard-charts-grid">
        {/* Cost Distribution Pie Chart */}
        <ChartContainer 
          title="Cost Distribution by Service"
          loading={loading}
          empty={chartData.length === 0}
          onEmptyState={<EmptyState />}
        >
            <>
              <ResponsiveContainer width="100%" height={340} minWidth={250} minHeight={250}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    innerRadius={55}
                    fill="#8884d8"
                    dataKey="value"
                    isAnimationActive={true}
                    stroke="#fff"
                    strokeWidth={2}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string, props: any) => [
                      `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                      chartData[props.dataIndex]?.name || name
                    ]}
                    contentStyle={{ fontWeight: 600 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ width: '100%', mt: 2, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2 }}>
                {chartData.map((entry, idx) => (
                  <Box key={entry.name} sx={{ display: 'flex', alignItems: 'center', mr: 2, mb: 1 }}>
                    <span style={{
                      display: 'inline-block',
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      background: entry.color,
                      marginRight: 8,
                      border: '2px solid #fff',
                      boxShadow: '0 0 2px #bbb',
                    }} />
                    <Typography sx={{ fontSize: 15, fontWeight: 500, color: '#444' }}>{entry.name}</Typography>
                  </Box>
                ))}
              </Box>
            </>
        </ChartContainer>

        {/* Cost Trends Line Chart */}
        <ChartContainer 
          title="Daily Cost Trends"
          loading={loading}
          empty={trendData.length === 0}
          onEmptyState={<EmptyState />}
        >
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={trendData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, textAnchor: 'end' }}
                  minTickGap={20}
                  interval={0}
                />
                <YAxis tick={{ fontSize: 12 }} label={{ value: 'Cost (USD)', angle: -90, position: 'insideLeft', offset: 10 }} />
                <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Cost']} contentStyle={{ fontWeight: 600 }} />
                <Line
                  type="monotone"
                  dataKey="cost"
                  stroke={theme.palette.primary.main}
                  strokeWidth={3}
                  dot={{ fill: theme.palette.primary.main, r: 4 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
};

export default DashboardView;
