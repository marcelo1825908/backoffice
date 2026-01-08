import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMosquePayments, getMosquePaymentById } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { SkeletonTable } from '../components/Skeleton';
import VirtualKeyboard from '../components/VirtualKeyboard';

const Payments = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeField, setActiveField] = useState(null);
  const [keyboardPosition, setKeyboardPosition] = useState({ top: 0, left: 0, width: 0 });
  const searchInputRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPayments();
  }, []);

  // Update keyboard position on scroll/resize
  useEffect(() => {
    if (!activeField || !searchInputRef?.current) return;

    const updatePosition = () => {
      const input = searchInputRef.current;
      if (input) {
        const rect = input.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        const keyboardHeight = 400; // Approximate full keyboard height
        
        // Check if keyboard would go off-screen at bottom
        let top = rect.bottom + 8;
        if (top + keyboardHeight > viewportHeight) {
          // Position above input if not enough space below
          top = rect.top - keyboardHeight - 8;
          if (top < 8) {
            // If still off-screen, position at bottom of viewport
            top = viewportHeight - keyboardHeight - 8;
          }
        }
        
        // Ensure keyboard doesn't go off-screen horizontally
        let left = rect.left;
        const keyboardWidth = Math.max(rect.width, 800);
        if (left + keyboardWidth > viewportWidth) {
          left = viewportWidth - keyboardWidth - 8;
        }
        if (left < 8) {
          left = 8;
        }

        setKeyboardPosition({
          top,
          left,
          width: keyboardWidth
        });
      }
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [activeField]);

  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page on search
    fetchPayments();
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      let paymentsData = [];

      try {
      const response = await getMosquePayments();

      // Handle response structure
      if (Array.isArray(response.data?.data)) {
        paymentsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        paymentsData = response.data;
      } else if (Array.isArray(response)) {
        paymentsData = response;
        }
      } catch (apiError) {
        console.error('API call failed:', apiError);
        paymentsData = [];
      }

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        paymentsData = paymentsData.filter(payment => 
          (payment.member_name && payment.member_name.toLowerCase().includes(query)) ||
          (payment.transaction_id && payment.transaction_id.toLowerCase().includes(query))
        );
      }

      // Sort by date (newest first)
      paymentsData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setPayments(paymentsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setLoading(false);
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(payments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPayments = payments.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewPayment = async (paymentId) => {
    try {
      let payment = null;

    try {
      const response = await getMosquePaymentById(paymentId);
      // Handle response structure
        payment = response.data?.data || response.data || null;
      } catch (apiError) {
        console.error('API call failed:', apiError);
        payment = null;
      }

      if (payment) {
        setSelectedPayment(payment);
      setShowPaymentModal(true);
      } else {
        console.error('Payment not found');
      }
    } catch (error) {
      console.error('Error fetching payment details:', error);
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

  const handleInputFocus = (fieldName, event) => {
    setActiveField(fieldName);
    // Calculate position for keyboard modal
    if (event && event.target) {
      const rect = event.target.getBoundingClientRect();
      setKeyboardPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width
      });
    }
  };

  const handleInputBlur = () => {
    // Delay to allow keyboard clicks to register
    setTimeout(() => {
      setActiveField(null);
    }, 200);
  };

  const handleKeypadInput = (key) => {
    if (activeField === 'search') {
      setSearchQuery(prev => (prev || '') + key);
    }
  };

  const handleKeypadBackspace = () => {
    if (activeField === 'search') {
      setSearchQuery(prev => (prev || '').slice(0, -1));
    }
  };

  const handleKeypadClear = () => {
    if (activeField === 'search') {
      setSearchQuery('');
    }
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

  return (
    <div className="bg-pos-bg-primary pt-[200px]">
      <div className="flex flex-col">
        {/* Header */}
        <div className="w-[80%] mx-auto border-2 border-pos-border-primary rounded-3xl overflow-hidden shadow-2xl mb-8">
          <div className="p-5 border-2 border-pos-border-secondary rounded-2xl m-5 bg-pos-bg-secondary">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate('/')}
                className="p-3 bg-rose-500 hover:bg-rose-600 rounded-xl transition-colors duration-200 flex items-center justify-center shadow-md hover:shadow-lg"
                title="Go Back"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
              </button>
              <div className="flex-1 text-center">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-pos-text-primary">Payments</h1>
                <p className="text-pos-text-secondary mt-1">All payments made at the kiosk</p>
              </div>
              <div className="w-[48px]" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden pb-4">
          <div className="w-[90%] mx-auto border-2 border-pos-border-primary rounded-3xl overflow-hidden shadow-2xl mb-6">
            <div className="p-5 border-2 border-pos-border-secondary rounded-2xl m-5 bg-pos-bg-secondary">
              {/* Search */}
              <div className="bg-pos-bg-primary border-2 border-pos-border-primary rounded-xl shadow-lg p-6 mb-6">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-pos-text-primary mb-2">Search Payments</label>
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search by member name or transaction ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={(e) => handleInputFocus('search', e)}
                      onBlur={handleInputBlur}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSearch();
                        }
                      }}
                      className="w-full px-4 py-2 border-2 border-pos-border-primary rounded-xl bg-pos-bg-secondary text-pos-text-primary focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleSearch}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shadow-md hover:shadow-lg"
                    >
                      Search
                    </button>
                  </div>
                </div>
              </div>

              {/* Payments Table */}
              <div className="bg-pos-bg-primary border-2 border-pos-border-primary rounded-xl shadow-lg p-6">
                {loading ? (
                  <SkeletonTable rows={10} cols={6} />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-pos-border-secondary">
                          <th className="text-left py-3 px-4 font-semibold text-pos-text-primary">Date</th>
                          <th className="text-left py-3 px-4 font-semibold text-pos-text-primary">Member</th>
                          <th className="text-left py-3 px-4 font-semibold text-pos-text-primary">Type</th>
                          <th className="text-left py-3 px-4 font-semibold text-pos-text-primary">Method</th>
                          <th className="text-right py-3 px-4 font-semibold text-pos-text-primary">Amount</th>
                          <th className="text-center py-3 px-4 font-semibold text-pos-text-primary">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="py-8">
                              <EmptyState message="No payments found" />
                            </td>
                          </tr>
                        ) : (
                          paginatedPayments.map((payment) => (
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
                              <td className="py-3 px-4 text-center">
                                <button
                                  onClick={() => handleViewPayment(payment.id)}
                                  className="text-blue-400 hover:text-blue-300 font-medium"
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
                
                {/* Pagination Controls */}
                {!loading && payments.length > 0 && (
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-pos-text-secondary">
                      Showing {startIndex + 1} to {Math.min(endIndex, payments.length)} of {payments.length} payments
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 rounded-xl transition-colors ${
                          currentPage === 1
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        Previous
                      </button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                          // Show first page, last page, current page, and pages around current
                          if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          ) {
                            return (
                              <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`px-3 py-2 rounded-xl transition-colors ${
                                  currentPage === page
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                }`}
                              >
                                {page}
                              </button>
                            );
                          } else if (page === currentPage - 2 || page === currentPage + 2) {
                            return <span key={page} className="px-2 text-pos-text-secondary">...</span>;
                          }
                          return null;
                        })}
                      </div>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 rounded-xl transition-colors ${
                          currentPage === totalPages
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Details Modal */}
        {showPaymentModal && selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-pos-bg-secondary border-2 border-pos-border-primary rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-pos-border-secondary">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-pos-text-primary">
                    Payment Details
                  </h2>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="text-pos-text-secondary hover:text-pos-text-primary"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-pos-text-secondary">Transaction ID</p>
                    <p className="font-semibold text-pos-text-primary">{selectedPayment.transaction_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-pos-text-secondary">Date</p>
                    <p className="font-semibold text-pos-text-primary">{formatDate(selectedPayment.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-pos-text-secondary">Member</p>
                    <p className="font-semibold text-pos-text-primary">{selectedPayment.member_name || 'Anonymous'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-pos-text-secondary">Payment Type</p>
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400">
                      {getPaymentTypeLabel(selectedPayment.payment_type)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-pos-text-secondary">Payment Method</p>
                    <p className="font-semibold text-pos-text-primary">{getPaymentMethodLabel(selectedPayment.payment_method)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-pos-text-secondary">Amount</p>
                    <p className="text-2xl font-bold text-pos-text-primary">
                      {formatCurrency(parseFloat(selectedPayment.amount) || 0)}
                    </p>
                  </div>
                  {selectedPayment.rent_start_date && (
                    <div>
                      <p className="text-sm text-pos-text-secondary">Rental Period</p>
                      <p className="font-semibold text-pos-text-primary">
                        {formatDate(selectedPayment.rent_start_date)} - {formatDate(selectedPayment.rent_end_date)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Keyboard Modal */}
        {activeField && (
          <div
            className="fixed z-[60] bg-gray-800 border-2 border-gray-600 rounded-xl shadow-2xl p-4 overflow-x-auto"
            style={{
              top: `${keyboardPosition.top}px`,
              left: `${keyboardPosition.left}px`,
              width: `${Math.max(keyboardPosition.width, 800)}px`,
              minWidth: '800px',
              maxWidth: '95vw'
            }}
            onMouseDown={(e) => e.preventDefault()}
          >
            <div className="mb-2 text-sm text-gray-400 text-center">
              Active Field: <span className="text-gray-200 font-medium">{activeField.replace('_', ' ')}</span>
            </div>
            <div className="w-full min-w-[750px]">
              <VirtualKeyboard
                value={searchQuery || ''}
                onChange={setSearchQuery}
                onInput={handleKeypadInput}
                onBackspace={handleKeypadBackspace}
                onClear={handleKeypadClear}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payments;

