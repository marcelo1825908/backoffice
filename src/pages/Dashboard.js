import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMosquePayments, getMosquePaymentStatsByType, getMosquePaymentStatsByMethod } from '../services/api';
import Skeleton, { SkeletonTable } from '../components/Skeleton';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPayments: 0,
    todayPayments: 0,
    totalAmount: 0,
    todayAmount: 0,
    byType: {},
    byMethod: {},
  });
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      let allPayments = [];

      try {
        const [paymentsResponse, statsByTypeResponse, statsByMethodResponse] = await Promise.all([
          getMosquePayments(),
          getMosquePaymentStatsByType(todayStr, tomorrowStr),
          getMosquePaymentStatsByMethod(todayStr, tomorrowStr),
        ]);

        // Handle response structure
        if (Array.isArray(paymentsResponse.data?.data)) {
          allPayments = paymentsResponse.data.data;
        } else if (Array.isArray(paymentsResponse.data)) {
          allPayments = paymentsResponse.data;
        } else if (Array.isArray(paymentsResponse)) {
          allPayments = paymentsResponse;
        }
      } catch (apiError) {
        console.error('API call failed:', apiError);
        allPayments = [];
      }

      // Calculate today's payments
      const todayPayments = allPayments.filter(payment => {
        const paymentDate = new Date(payment.created_at);
        return paymentDate >= today;
      });

      // Calculate totals
      const totalAmount = allPayments.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);
      const todayAmount = todayPayments.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);

      // Calculate stats from payments data
      let statsByType = {};
      let statsByMethod = {};

      allPayments.forEach(payment => {
        // Count by type
        const type = payment.payment_type;
        if (!statsByType[type]) {
          statsByType[type] = { count: 0, total: 0 };
        }
        statsByType[type].count++;
        statsByType[type].total += parseFloat(payment.amount) || 0;

        // Count by method
        const method = payment.payment_method;
        if (!statsByMethod[method]) {
          statsByMethod[method] = { count: 0, total: 0 };
        }
        statsByMethod[method].count++;
        statsByMethod[method].total += parseFloat(payment.amount) || 0;
      });

      setStats({
        totalPayments: allPayments.length,
        todayPayments: todayPayments.length,
        totalAmount,
        todayAmount,
        byType: statsByType,
        byMethod: statsByMethod,
      });

      // Get recent payments (last 10)
      const sortedPayments = [...allPayments].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      setRecentPayments(sortedPayments.slice(0, 10));

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
      'mortuarium': 'Mortuarium',
      'renovation': 'Renovation',
      'other': 'Other'
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
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-pos-text-primary">Church Office Panel</h1>
                <p className="text-pos-text-secondary mt-1">Monitor and manage kiosk payments</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/payments')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shadow-md hover:shadow-lg"
                >
                  View All Payments
                </button>
                <button
                  onClick={() => navigate('/members')}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors shadow-md hover:shadow-lg"
                >
                  Members
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden pb-4">
          <div className="w-[90%] mx-auto border-2 border-pos-border-primary rounded-3xl overflow-hidden shadow-2xl mb-6">
            <div className="p-5 border-2 border-pos-border-secondary rounded-2xl m-5 bg-pos-bg-secondary">
              <div className="h-full flex flex-col">
                {loading ? (
                  <>
                    {/* Stats Cards Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-pos-bg-primary border-2 border-pos-border-primary rounded-xl shadow-lg p-6">
                          <Skeleton className="h-4 w-24 mb-4 bg-pos-bg-tertiary" />
                          <Skeleton className="h-8 w-16 mb-2 bg-pos-bg-tertiary" />
                          <Skeleton className="h-3 w-20 bg-pos-bg-tertiary" />
                        </div>
                      ))}
                    </div>
                    {/* Recent Payments Table Skeleton */}
                    <div className="bg-pos-bg-primary border-2 border-pos-border-primary rounded-xl shadow-lg p-6">
                      <Skeleton className="h-6 w-32 mb-4 bg-pos-bg-tertiary" />
                      <SkeletonTable rows={5} cols={5} />
                    </div>
                  </>
                ) : (
                  <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                      <div className="bg-pos-bg-primary border-2 border-pos-border-primary rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-pos-text-secondary text-sm font-medium">Total Payments</p>
                            <p className="text-3xl font-bold text-pos-text-primary mt-2">{stats.totalPayments}</p>
                            <p className="text-pos-text-muted text-sm mt-1">Today: {stats.todayPayments}</p>
                          </div>
                          <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className="bg-pos-bg-primary border-2 border-pos-border-primary rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-pos-text-secondary text-sm font-medium">Total Amount</p>
                            <p className="text-3xl font-bold text-pos-text-primary mt-2">{formatCurrency(stats.totalAmount)}</p>
                            <p className="text-pos-text-muted text-sm mt-1">Today: {formatCurrency(stats.todayAmount)}</p>
                          </div>
                          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className="bg-pos-bg-primary border-2 border-pos-border-primary rounded-xl shadow-lg p-6">
                        <div>
                          <p className="text-pos-text-secondary text-sm font-medium mb-2">Payments by Type</p>
                          <div className="space-y-2">
                            {Object.keys(stats.byType).length === 0 ? (
                              <div className="flex items-center justify-center py-4">
                                <div className="w-12 h-12 bg-pos-bg-tertiary rounded-full flex items-center justify-center">
                                  <svg className="w-6 h-6 text-pos-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                                  </svg>
                                </div>
                              </div>
                            ) : (
                              Object.entries(stats.byType).map(([type, data]) => (
                                <div key={type} className="flex justify-between">
                                  <span className="text-pos-text-secondary text-xs">{getPaymentTypeLabel(type)}</span>
                                  <span className="text-pos-text-primary font-semibold text-sm">{data.count}</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="bg-pos-bg-primary border-2 border-pos-border-primary rounded-xl shadow-lg p-6">
                        <div>
                          <p className="text-pos-text-secondary text-sm font-medium mb-2">Payments by Method</p>
                          <div className="space-y-2">
                            {Object.keys(stats.byMethod).length === 0 ? (
                              <div className="flex items-center justify-center py-4">
                                <div className="w-12 h-12 bg-pos-bg-tertiary rounded-full flex items-center justify-center">
                                  <svg className="w-6 h-6 text-pos-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                                  </svg>
                                </div>
                              </div>
                            ) : (
                              Object.entries(stats.byMethod).map(([method, data]) => (
                                <div key={method} className="flex justify-between">
                                  <span className="text-pos-text-secondary text-xs">{getPaymentMethodLabel(method)}</span>
                                  <span className="text-pos-text-primary font-semibold text-sm">{data.count}</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recent Payments */}
                    <div className="bg-pos-bg-primary border-2 border-pos-border-primary rounded-xl shadow-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-pos-text-primary">Recent Payments</h2>
                        <button
                          onClick={() => navigate('/payments')}
                          className="text-blue-400 hover:text-blue-300 font-medium"
                        >
                          View All →
                        </button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-pos-border-secondary">
                              <th className="text-left py-3 px-4 font-semibold text-pos-text-primary">Date</th>
                              <th className="text-left py-3 px-4 font-semibold text-pos-text-primary">Member</th>
                              <th className="text-left py-3 px-4 font-semibold text-pos-text-primary">Type</th>
                              <th className="text-left py-3 px-4 font-semibold text-pos-text-primary">Method</th>
                              <th className="text-right py-3 px-4 font-semibold text-pos-text-primary">Amount</th>
                            </tr>
                          </thead>
                      <tbody>
                        {recentPayments.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="py-8">
                              <EmptyState message="No payments found" />
                            </td>
                          </tr>
                        ) : (
                              recentPayments.map((payment) => (
                                <tr key={payment.id} className="border-b border-pos-border-secondary hover:bg-pos-bg-tertiary">
                                  <td className="py-3 px-4 text-pos-text-secondary">
                                    {formatDate(payment.created_at)}
                                  </td>
                                  <td className="py-3 px-4 text-pos-text-primary font-medium">
                                    {payment.member_name || 'Anonymous'}
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400">
                                      {getPaymentTypeLabel(payment.payment_type)}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-pos-text-secondary">
                                    {getPaymentMethodLabel(payment.payment_method)}
                                  </td>
                                  <td className="py-3 px-4 text-right font-semibold text-pos-text-primary">
                                    {formatCurrency(parseFloat(payment.amount) || 0)}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
