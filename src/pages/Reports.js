import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMosquePaymentStatsByType, getMosquePaymentStatsByMethod, getMosquePayments } from '../services/api';
import Skeleton, { SkeletonTable } from '../components/Skeleton';
import CustomDatePicker from '../components/CustomDatePicker';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

const Reports = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [statsByType, setStatsByType] = useState([]);
  const [statsByMethod, setStatsByMethod] = useState([]);
  const [dailyPayments, setDailyPayments] = useState([]);
  const [totalStats, setTotalStats] = useState({
    totalPayments: 0,
    totalAmount: 0,
  });

  // Chart colors for dark theme
  const COLORS = {
    type: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'],
    method: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
  };

  useEffect(() => {
    generateReport();
  }, [dateRange]);

  const generateReport = async () => {
    try {
      setLoading(true);
      const startDate = dateRange.start || new Date().toISOString().split('T')[0];
      const endDate = dateRange.end || new Date().toISOString().split('T')[0];
      
      // Add time to end date to include the full day
      const endDateWithTime = `${endDate}T23:59:59`;

      let allPayments = [];
      let typeStats = [];
      let methodStats = [];

      try {
        const [typeResponse, methodResponse, paymentsResponse] = await Promise.all([
          getMosquePaymentStatsByType(startDate, endDateWithTime),
          getMosquePaymentStatsByMethod(startDate, endDateWithTime),
          getMosquePayments(),
        ]);

        // Handle response structures
        if (Array.isArray(typeResponse.data?.data)) {
          typeStats = typeResponse.data.data;
        } else if (Array.isArray(typeResponse.data)) {
          typeStats = typeResponse.data;
        }

        if (Array.isArray(methodResponse.data?.data)) {
          methodStats = methodResponse.data.data;
        } else if (Array.isArray(methodResponse.data)) {
          methodStats = methodResponse.data;
        }

        if (Array.isArray(paymentsResponse.data?.data)) {
          allPayments = paymentsResponse.data.data;
        } else if (Array.isArray(paymentsResponse.data)) {
          allPayments = paymentsResponse.data;
        }
      } catch (apiError) {
        console.error('API call failed:', apiError);
        allPayments = [];
      }

      // Filter payments by date range
      const filteredPayments = allPayments.filter(payment => {
        const paymentDate = new Date(payment.created_at);
        const start = new Date(startDate);
        const end = new Date(endDateWithTime);
        return paymentDate >= start && paymentDate <= end;
      });

      const totalAmount = filteredPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

      // Calculate stats from payments data if API stats are empty
      if (typeStats.length === 0) {
        const typeData = {};
        const methodData = {};

        filteredPayments.forEach(payment => {
          // Count by type
          const type = payment.payment_type;
          if (!typeData[type]) {
            typeData[type] = { payment_type: type, count: 0, total_amount: 0 };
          }
          typeData[type].count++;
          typeData[type].total_amount += parseFloat(payment.amount) || 0;

          // Count by method
          const method = payment.payment_method;
          if (!methodData[method]) {
            methodData[method] = { payment_method: method, count: 0, total_amount: 0 };
          }
          methodData[method].count++;
          methodData[method].total_amount += parseFloat(payment.amount) || 0;
        });

        typeStats = Object.values(typeData);
        methodStats = Object.values(methodData);
      }

      // Calculate daily payments for line chart
      const dailyData = {};
      filteredPayments.forEach(payment => {
        const date = new Date(payment.created_at).toISOString().split('T')[0];
        if (!dailyData[date]) {
          dailyData[date] = { date, amount: 0, count: 0 };
        }
        dailyData[date].amount += parseFloat(payment.amount) || 0;
        dailyData[date].count += 1;
      });
      
      const dailyArray = Object.values(dailyData)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map(item => ({
          date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          amount: item.amount,
          count: item.count,
        }));

      setStatsByType(typeStats);
      setStatsByMethod(methodStats);
      setDailyPayments(dailyArray);
      setTotalStats({
        totalPayments: filteredPayments.length,
        totalAmount,
      });

      setLoading(false);
    } catch (error) {
      console.error('Error generating report:', error);
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPaymentTypeLabel = (type) => {
    const labels = {
      'member_fee': 'Member Fee',
      'rent': 'Rental',
      'sadaka': 'Sadaka'
    };
    return labels[type] || type;
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      'cashmatic': 'Cashmatic',
      'payworld': 'Payworld'
    };
    return labels[method] || method;
  };

  // Prepare chart data
  const pieChartDataByType = statsByType.map((stat, index) => ({
    name: getPaymentTypeLabel(stat.payment_type),
    value: parseFloat(stat.total_amount) || 0,
    count: parseInt(stat.count) || 0,
    color: COLORS.type[index % COLORS.type.length],
  }));

  const pieChartDataByMethod = statsByMethod.map((stat, index) => ({
    name: getPaymentMethodLabel(stat.payment_method),
    value: parseFloat(stat.total_amount) || 0,
    count: parseInt(stat.count) || 0,
    color: COLORS.method[index % COLORS.method.length],
  }));

  const barChartDataByType = statsByType.map((stat, index) => ({
    name: getPaymentTypeLabel(stat.payment_type),
    amount: parseFloat(stat.total_amount) || 0,
    count: parseInt(stat.count) || 0,
  }));

  const barChartDataByMethod = statsByMethod.map((stat, index) => ({
    name: getPaymentMethodLabel(stat.payment_method),
    amount: parseFloat(stat.total_amount) || 0,
    count: parseInt(stat.count) || 0,
  }));

  // Custom tooltip for dark theme
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-pos-bg-secondary border-2 border-pos-border-primary rounded-lg p-3 shadow-lg">
          <p className="text-pos-text-primary font-semibold">{payload[0].name}</p>
          {payload[0].payload.count !== undefined && (
            <p className="text-pos-text-secondary text-sm">Count: {payload[0].payload.count}</p>
          )}
          <p className="text-pos-text-primary font-bold">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Empty State Component
  const EmptyState = ({ message = "No data available" }) => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-20 h-20 bg-pos-bg-tertiary rounded-full flex items-center justify-center mb-4">
        <svg className="w-10 h-10 text-pos-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
        </svg>
      </div>
      <p className="text-pos-text-muted text-lg font-medium">{message}</p>
    </div>
  );

  return (
    <div className="bg-pos-bg-primary pt-16">
      <div className="flex flex-col">
        {/* Header */}
        <div className="w-[80%] mx-auto border-2 border-pos-border-primary rounded-3xl overflow-hidden shadow-2xl mb-8">
          <div className="p-5 border-2 border-pos-border-secondary rounded-2xl m-5 bg-pos-bg-secondary">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-pos-text-primary">Reports</h1>
                <p className="text-pos-text-secondary mt-1">Payment statistics and reports</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden pb-4">
          <div className="w-[90%] mx-auto border-2 border-pos-border-primary rounded-3xl overflow-hidden shadow-2xl mb-6">
            <div className="p-5 border-2 border-pos-border-secondary rounded-2xl m-5 bg-pos-bg-secondary">
              <div className="h-full flex flex-col space-y-6">
                {/* Date Range Selector */}
                <div className="bg-pos-bg-primary border-2 border-pos-border-primary rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-pos-text-primary mb-4">Select Date Range</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-pos-text-primary mb-2">Start Date</label>
                      <CustomDatePicker
                        value={dateRange.start}
                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        min={null}
                        showTodayButton={true}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-pos-text-primary mb-2">End Date</label>
                      <CustomDatePicker
                        value={dateRange.end}
                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        min={dateRange.start || null}
                        showTodayButton={true}
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={generateReport}
                        disabled={loading}
                        className="w-full px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                      >
                        {loading ? 'Loading...' : 'Generate Report'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="bg-pos-bg-primary border-2 border-pos-border-primary rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-pos-text-primary mb-4">Summary</h2>
                  {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-pos-bg-secondary border-2 border-pos-border-primary rounded-xl p-4">
                        <Skeleton className="h-4 w-24 mb-2 bg-pos-bg-tertiary" />
                        <Skeleton className="h-8 w-16 bg-pos-bg-tertiary" />
                      </div>
                      <div className="bg-pos-bg-secondary border-2 border-pos-border-primary rounded-xl p-4">
                        <Skeleton className="h-4 w-24 mb-2 bg-pos-bg-tertiary" />
                        <Skeleton className="h-8 w-20 bg-pos-bg-tertiary" />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-pos-bg-secondary border-2 border-pos-border-primary rounded-xl p-4">
                        <p className="text-sm text-pos-text-secondary">Total Payments</p>
                        <p className="text-3xl font-bold text-pos-text-primary">{totalStats.totalPayments}</p>
                      </div>
                      <div className="bg-pos-bg-secondary border-2 border-pos-border-primary rounded-xl p-4">
                        <p className="text-sm text-pos-text-secondary">Total Amount</p>
                        <p className="text-3xl font-bold text-pos-text-primary">{formatCurrency(totalStats.totalAmount)}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Daily Payments Trend - Line Chart */}
                {!loading && dailyPayments.length > 0 && (
                  <div className="bg-pos-bg-primary border-2 border-pos-border-primary rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-pos-text-primary mb-4">Daily Payment Trend</h2>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={dailyPayments}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#3b4f66" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#a0aec0"
                          style={{ fontSize: '12px' }}
                        />
                        <YAxis 
                          stroke="#a0aec0"
                          style={{ fontSize: '12px' }}
                          tickFormatter={(value) => `€${value.toFixed(0)}`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend 
                          wrapperStyle={{ color: '#cbd5f5' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="amount" 
                          stroke="#3b82f6" 
                          strokeWidth={3}
                          name="Amount (€)"
                          dot={{ fill: '#3b82f6', r: 4 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="count" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          name="Count"
                          dot={{ fill: '#10b981', r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Payments by Type - Pie Chart */}
                  <div className="bg-pos-bg-primary border-2 border-pos-border-primary rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-pos-text-primary mb-4">Payments by Type</h2>
                    {loading ? (
                      <div className="h-[300px] flex items-center justify-center">
                        <Skeleton className="h-[300px] w-full bg-pos-bg-tertiary" />
                      </div>
                    ) : pieChartDataByType.length === 0 ? (
                      <EmptyState message="No data available" />
                    ) : (
                      <>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={pieChartDataByType}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {pieChartDataByType.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                        {/* Legend */}
                        <div className="mt-4 grid grid-cols-2 gap-2">
                          {pieChartDataByType.map((entry, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div 
                                className="w-4 h-4 rounded" 
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="text-sm text-pos-text-secondary">
                                {entry.name}: {formatCurrency(entry.value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Payments by Method - Pie Chart */}
                  <div className="bg-pos-bg-primary border-2 border-pos-border-primary rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-pos-text-primary mb-4">Payments by Method</h2>
                    {loading ? (
                      <div className="h-[300px] flex items-center justify-center">
                        <Skeleton className="h-[300px] w-full bg-pos-bg-tertiary" />
                      </div>
                    ) : pieChartDataByMethod.length === 0 ? (
                      <EmptyState message="No data available" />
                    ) : (
                      <>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={pieChartDataByMethod}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {pieChartDataByMethod.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                        {/* Legend */}
                        <div className="mt-4 grid grid-cols-2 gap-2">
                          {pieChartDataByMethod.map((entry, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div 
                                className="w-4 h-4 rounded" 
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="text-sm text-pos-text-secondary">
                                {entry.name}: {formatCurrency(entry.value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Bar Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Payments by Type - Bar Chart */}
                  <div className="bg-pos-bg-primary border-2 border-pos-border-primary rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-pos-text-primary mb-4">Amount by Payment Type</h2>
                    {loading ? (
                      <div className="h-[300px] flex items-center justify-center">
                        <Skeleton className="h-[300px] w-full bg-pos-bg-tertiary" />
                      </div>
                    ) : barChartDataByType.length === 0 ? (
                      <EmptyState message="No data available" />
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={barChartDataByType}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#3b4f66" />
                          <XAxis 
                            dataKey="name" 
                            stroke="#a0aec0"
                            style={{ fontSize: '12px' }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis 
                            stroke="#a0aec0"
                            style={{ fontSize: '12px' }}
                            tickFormatter={(value) => `€${value.toFixed(0)}`}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="amount" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  {/* Payments by Method - Bar Chart */}
                  <div className="bg-pos-bg-primary border-2 border-pos-border-primary rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-pos-text-primary mb-4">Amount by Payment Method</h2>
                    {loading ? (
                      <div className="h-[300px] flex items-center justify-center">
                        <Skeleton className="h-[300px] w-full bg-pos-bg-tertiary" />
                      </div>
                    ) : barChartDataByMethod.length === 0 ? (
                      <EmptyState message="No data available" />
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={barChartDataByMethod}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#3b4f66" />
                          <XAxis 
                            dataKey="name" 
                            stroke="#a0aec0"
                            style={{ fontSize: '12px' }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis 
                            stroke="#a0aec0"
                            style={{ fontSize: '12px' }}
                            tickFormatter={(value) => `€${value.toFixed(0)}`}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="amount" fill="#10b981" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Stats by Type - Table */}
                <div className="bg-pos-bg-primary border-2 border-pos-border-primary rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-pos-text-primary mb-4">Detailed Breakdown by Type</h2>
                  {loading ? (
                    <SkeletonTable rows={3} cols={3} />
                  ) : statsByType.length === 0 ? (
                    <EmptyState message="No data available" />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-pos-border-secondary">
                            <th className="text-left py-3 px-4 font-semibold text-pos-text-primary">Payment Type</th>
                            <th className="text-center py-3 px-4 font-semibold text-pos-text-primary">Count</th>
                            <th className="text-right py-3 px-4 font-semibold text-pos-text-primary">Total Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {statsByType.map((stat, index) => (
                            <tr key={index} className="border-b border-pos-border-secondary hover:bg-pos-bg-tertiary">
                              <td className="py-3 px-4 text-pos-text-primary font-medium">
                                {getPaymentTypeLabel(stat.payment_type)}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400">
                                  {stat.count || 0}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right font-semibold text-pos-text-primary">
                                {formatCurrency(parseFloat(stat.total_amount) || 0)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Stats by Method - Table */}
                <div className="bg-pos-bg-primary border-2 border-pos-border-primary rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-pos-text-primary mb-4">Detailed Breakdown by Method</h2>
                  {loading ? (
                    <SkeletonTable rows={3} cols={3} />
                  ) : statsByMethod.length === 0 ? (
                    <EmptyState message="No data available" />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-pos-border-secondary">
                            <th className="text-left py-3 px-4 font-semibold text-pos-text-primary">Payment Method</th>
                            <th className="text-center py-3 px-4 font-semibold text-pos-text-primary">Count</th>
                            <th className="text-right py-3 px-4 font-semibold text-pos-text-primary">Total Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {statsByMethod.map((stat, index) => (
                            <tr key={index} className="border-b border-pos-border-secondary hover:bg-pos-bg-tertiary">
                              <td className="py-3 px-4 text-pos-text-primary font-medium">
                                {getPaymentMethodLabel(stat.payment_method)}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400">
                                  {stat.count || 0}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right font-semibold text-pos-text-primary">
                                {formatCurrency(parseFloat(stat.total_amount) || 0)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;

