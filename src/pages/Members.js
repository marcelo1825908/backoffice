import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMembers, getMosquePaymentsByMemberId, searchMembers, createMember, updateMember, deleteMember, getNextMemberId } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { SkeletonTable } from '../components/Skeleton';
import VirtualKeyboard from '../components/VirtualKeyboard';
import Toast from '../components/Toast';

const Members = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberPayments, setMemberPayments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeField, setActiveField] = useState(null);
  const [keyboardPosition, setKeyboardPosition] = useState({ top: 0, left: 0, width: 0 });
  const searchInputRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Add/Edit Member Modal States
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [memberForm, setMemberForm] = useState({
    member_id: '',
    full_name: '',
    phone: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const fullNameInputRef = useRef(null);
  const phoneInputRef = useRef(null);
  const memberIdInputRef = useRef(null);
  
  // Delete Confirmation Modal States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  // Toast States
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    fetchMembers();
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showMemberModal || showAddEditModal || showDeleteModal) {
      // Disable body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Re-enable body scroll
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showMemberModal, showAddEditModal, showDeleteModal]);

  // Update keyboard position on scroll/resize
  useEffect(() => {
    if (!activeField) return;

    let inputRef;
    if (activeField === 'search') {
      inputRef = searchInputRef;
    } else if (activeField === 'fullName') {
      inputRef = fullNameInputRef;
    } else if (activeField === 'phone') {
      inputRef = phoneInputRef;
    } else if (activeField === 'memberId') {
      inputRef = memberIdInputRef;
    }
    
    if (!inputRef?.current) return;

    const updatePosition = () => {
      const input = inputRef.current;
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

  const fetchMembers = async () => {
    try {
      setLoading(true);
      let response;
      let membersData = [];

      try {
        if (searchQuery) {
          response = await searchMembers(searchQuery);
        } else {
          response = await getMembers();
        }

        // Handle response structure
        if (Array.isArray(response.data?.data)) {
          membersData = response.data.data;
        } else if (Array.isArray(response.data)) {
          membersData = response.data;
        } else if (Array.isArray(response)) {
          membersData = response;
        }
      } catch (apiError) {
        console.error('API call failed:', apiError);
        membersData = [];
      }

      // Filter by search query if provided
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        membersData = membersData.filter(member =>
          (member.member_id && member.member_id.toLowerCase().includes(query)) ||
          (member.full_name && member.full_name.toLowerCase().includes(query)) ||
          (member.phone && member.phone.toLowerCase().includes(query))
        );
      }

      // Fetch payment status for each member
      const membersWithPayments = await Promise.all(
        membersData.map(async (member) => {
          try {
            const paymentsResponse = await getMosquePaymentsByMemberId(member.id);
            let payments = [];
            
            if (Array.isArray(paymentsResponse.data?.data)) {
              payments = paymentsResponse.data.data;
            } else if (Array.isArray(paymentsResponse.data)) {
              payments = paymentsResponse.data;
            } else if (Array.isArray(paymentsResponse)) {
              payments = paymentsResponse;
            }

            const totalPaid = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
            const lastPayment = payments.length > 0 ? payments[0] : null;

            return {
              ...member,
              paymentCount: payments.length,
              totalPaid,
              lastPayment,
            };
          } catch (error) {
            console.error(`Error fetching payments for member ${member.id}:`, error);
            return {
              ...member,
              paymentCount: 0,
              totalPaid: 0,
              lastPayment: null,
            };
          }
        })
      );

      setMembers(membersWithPayments);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching members:', error);
      setMembers([]);
      setLoading(false);
    }
  };

  const handleViewMember = async (member) => {
    try {
      setSelectedMember(member);
      let payments = [];

      try {
        const response = await getMosquePaymentsByMemberId(member.id);
        
        // Handle response structure
        if (Array.isArray(response.data?.data)) {
          payments = response.data.data;
        } else if (Array.isArray(response.data)) {
          payments = response.data;
        } else if (Array.isArray(response)) {
          payments = response;
        }
      } catch (apiError) {
        console.error('API call failed:', apiError);
        payments = [];
      }

      setMemberPayments(payments);
      setShowMemberModal(true);
    } catch (error) {
      console.error('Error fetching member payments:', error);
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
    } else if (activeField === 'fullName') {
      setMemberForm(prev => ({ ...prev, full_name: (prev.full_name || '') + key }));
    } else if (activeField === 'phone') {
      setMemberForm(prev => ({ ...prev, phone: (prev.phone || '') + key }));
    }
  };

  const handleKeypadBackspace = () => {
    if (activeField === 'search') {
      setSearchQuery(prev => (prev || '').slice(0, -1));
    } else if (activeField === 'fullName') {
      setMemberForm(prev => ({ ...prev, full_name: (prev.full_name || '').slice(0, -1) }));
    } else if (activeField === 'phone') {
      setMemberForm(prev => ({ ...prev, phone: (prev.phone || '').slice(0, -1) }));
    }
  };

  const handleKeypadClear = () => {
    if (activeField === 'search') {
      setSearchQuery('');
    } else if (activeField === 'fullName') {
      setMemberForm(prev => ({ ...prev, full_name: '' }));
    } else if (activeField === 'phone') {
      setMemberForm(prev => ({ ...prev, phone: '' }));
    }
  };

  // Fetch next member ID
  const fetchNextMemberId = async () => {
    try {
      const response = await getNextMemberId();
      if (response && response.data && response.data.nextMemberId) {
        setMemberForm(prev => ({ ...prev, member_id: response.data.nextMemberId }));
      } else if (response && response.nextMemberId) {
        setMemberForm(prev => ({ ...prev, member_id: response.nextMemberId }));
      }
    } catch (error) {
      console.error('Error fetching next member ID:', error);
      // Generate fallback ID
      const maxId = members.length > 0 
        ? Math.max(...members.map(m => {
            const id = m.member_id ? parseInt(m.member_id.replace(/[^0-9]/g, '')) : 0;
            return isNaN(id) ? 0 : id;
          }))
        : 0;
      const nextId = (maxId + 1).toString().padStart(4, '0');
      setMemberForm(prev => ({ ...prev, member_id: nextId }));
    }
  };

  // Handle Add Member
  const handleAddMember = async () => {
    setEditingMember(null);
    setMemberForm({
      member_id: '',
      full_name: '',
      phone: ''
    });
    setFormErrors({});
    setShowAddEditModal(true);
    // Fetch next member ID automatically
    await fetchNextMemberId();
  };

  // Handle Edit Member
  const handleEditMember = (member) => {
    setEditingMember(member);
    setMemberForm({
      member_id: member.member_id || '',
      full_name: member.full_name || member.fullName || '',
      phone: member.phone || ''
    });
    setFormErrors({});
    setShowAddEditModal(true);
  };

  // Handle Delete Member
  const handleDeleteClick = (member) => {
    setMemberToDelete(member);
    setShowDeleteModal(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!memberToDelete) return;
    
    try {
      setDeleting(true);
      
      await deleteMember(memberToDelete.id);
      
      // Remove from local state
      setMembers(prev => prev.filter(m => m.id !== memberToDelete.id));
      
      // Show success toast
      setToast({ show: true, message: 'Member deleted successfully!', type: 'success' });
      
      setShowDeleteModal(false);
      setMemberToDelete(null);
    } catch (error) {
      console.error('Error deleting member:', error);
      // Show error toast
      setToast({ show: true, message: 'Failed to delete member. Please try again.', type: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  // Handle Save Member (Add/Edit)
  const handleSaveMember = async () => {
    // Validate form
    const errors = {};
    if (!memberForm.full_name || memberForm.full_name.trim() === '') {
      errors.full_name = 'Full name is required';
    }
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      setSaving(true);
      
      if (editingMember) {
        await updateMember(editingMember.id, memberForm);
        // Show success toast for edit
        setToast({ show: true, message: 'Member updated successfully!', type: 'success' });
      } else {
        await createMember(memberForm);
      }
      // Refresh members list
      await fetchMembers();
      
      setShowAddEditModal(false);
      setEditingMember(null);
      setMemberForm({
        member_id: '',
        full_name: '',
        phone: ''
      });
    } catch (error) {
      console.error('Error saving member:', error);
      // Show error toast
      if (editingMember) {
        setToast({ show: true, message: 'Failed to update member. Please try again.', type: 'error' });
      } else {
        setToast({ show: true, message: 'Failed to create member. Please try again.', type: 'error' });
      }
    } finally {
      setSaving(false);
    }
  };

  // Empty State Component
  const EmptyState = ({ message = "No data available" }) => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-20 h-20 bg-pos-bg-tertiary rounded-full flex items-center justify-center mb-4">
        <svg className="w-10 h-10 text-pos-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" />
        </svg>
      </div>
      <p className="text-pos-text-muted text-lg font-medium">{message}</p>
    </div>
  );

  // Payment Empty State Component
  const PaymentEmptyState = ({ message = "No payments found" }) => (
    <div className="flex flex-col items-center justify-center py-12 rounded-xl border-2 border-pos-border-primary">
      <div className="w-20 h-20 bg-pos-bg-tertiary rounded-full flex items-center justify-center mb-4">
        <svg className="w-10 h-10 text-pos-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
        </svg>
      </div>
      <p className="text-pos-text-muted text-lg font-medium">{message}</p>
    </div>
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Pagination calculations
  const totalPages = Math.ceil(members.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMembers = members.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-pos-bg-primary pt-16">
      <div className="flex flex-col">
        {/* Header */}
        <div className="w-[80%] mx-auto border-2 border-pos-border-primary rounded-3xl overflow-hidden shadow-2xl mb-8">
          <div className="p-5 border-2 border-pos-border-secondary rounded-2xl m-5 bg-pos-bg-secondary">
            <div className="flex items-center justify-between">
              <div className="flex-1 text-center">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-pos-text-primary">Members</h1>
                <p className="text-pos-text-secondary mt-1">View all members and their payment status</p>
              </div>
              <button
                onClick={handleAddMember}
                className="p-3 bg-green-600 hover:bg-green-700 rounded-xl transition-colors duration-200 flex items-center justify-center shadow-md hover:shadow-lg"
                title="Add New Member"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
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
                    <label className="block text-sm font-medium text-pos-text-primary mb-2">Search Members</label>
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search by name, member ID, or phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={(e) => handleInputFocus('search', e)}
                      onBlur={handleInputBlur}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          setCurrentPage(1); // Reset to first page on search
                          fetchMembers();
                        }
                      }}
                      className="w-full px-4 py-2 border-2 border-pos-border-primary rounded-xl bg-pos-bg-secondary text-pos-text-primary focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setCurrentPage(1); // Reset to first page on search
                        fetchMembers();
                      }}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shadow-md hover:shadow-lg"
                    >
                      Search
                    </button>
                  </div>
                </div>
              </div>

              {/* Members Table */}
              <div className="bg-pos-bg-primary border-2 border-pos-border-primary rounded-xl shadow-lg p-6">
                {loading ? (
                  <SkeletonTable rows={10} cols={6} />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-pos-border-secondary">
                          <th className="text-left py-3 px-4 font-semibold text-pos-text-primary">Member ID</th>
                          <th className="text-left py-3 px-4 font-semibold text-pos-text-primary">Name</th>
                          <th className="text-left py-3 px-4 font-semibold text-pos-text-primary">Phone</th>
                          <th className="text-center py-3 px-4 font-semibold text-pos-text-primary">Payments</th>
                          <th className="text-right py-3 px-4 font-semibold text-pos-text-primary">Total Paid</th>
                          <th className="text-center py-3 px-4 font-semibold text-pos-text-primary">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {members.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="py-8">
                              <EmptyState message="No members found" />
                            </td>
                          </tr>
                        ) : (
                          paginatedMembers.map((member) => (
                            <tr key={member.id} className="border-b border-pos-border-secondary hover:bg-pos-bg-tertiary">
                              <td className="py-3 px-4 text-pos-text-primary font-medium">
                                {member.member_id || `#${member.id}`}
                              </td>
                              <td className="py-3 px-4 text-pos-text-primary font-medium">
                                {member.full_name || member.fullName}
                              </td>
                              <td className="py-3 px-4 text-pos-text-secondary">
                                {member.phone || 'N/A'}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400">
                                  {member.paymentCount || 0}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right font-semibold text-pos-text-primary">
                                {formatCurrency(member.totalPaid || 0)}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => handleViewMember(member)}
                                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                    title="View Details"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => handleEditMember(member)}
                                    className="p-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                                    title="Edit Member"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteClick(member)}
                                    className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                    title="Delete Member"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
                
                {/* Pagination Controls */}
                {!loading && members.length > 0 && (
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-pos-text-secondary">
                      Showing {startIndex + 1} to {Math.min(endIndex, members.length)} of {members.length} members
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

        {/* Member Details Modal */}
        {showMemberModal && selectedMember && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowMemberModal(false);
              }
            }}
            onWheel={(e) => {
              // Prevent scroll propagation to background
              e.stopPropagation();
            }}
            style={{ overflow: 'hidden' }}
          >
            <div 
              className="bg-pos-bg-secondary border-2 border-pos-border-primary rounded-2xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-pos-border-secondary">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-pos-text-primary">
                    {selectedMember.full_name || selectedMember.fullName}
                  </h2>
                  <button
                    onClick={() => setShowMemberModal(false)}
                    className="text-pos-text-secondary hover:text-pos-text-primary"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {/* Member Info */}
                  <div>
                    <h3 className="text-lg font-bold text-pos-text-primary mb-4">Member Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-pos-text-secondary">Member ID</p>
                        <p className="font-semibold text-pos-text-primary">{selectedMember.member_id || `#${selectedMember.id}`}</p>
                      </div>
                      <div>
                        <p className="text-sm text-pos-text-secondary">Phone</p>
                        <p className="font-semibold text-pos-text-primary">{selectedMember.phone || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-pos-text-secondary">Email</p>
                        <p className="font-semibold text-pos-text-primary">{selectedMember.email || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-pos-text-secondary">Total Payments</p>
                        <p className="font-semibold text-pos-text-primary">{memberPayments.length}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-pos-text-secondary">Total Amount Paid</p>
                        <p className="text-2xl font-bold text-pos-text-primary">
                          {formatCurrency(memberPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0))}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment History */}
                  <div>
                    <h3 className="text-lg font-bold text-pos-text-primary mb-4">Payment History</h3>
                    {memberPayments.length === 0 ? (
                      <PaymentEmptyState message="No payments found" />
                    ) : (
                      <div className="space-y-2">
                        {memberPayments.map((payment) => (
                          <div key={payment.id} className="bg-pos-bg-primary border-2 border-pos-border-primary rounded-xl p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold text-pos-text-primary">{formatDate(payment.created_at)}</p>
                                <p className="text-sm text-pos-text-secondary">{payment.payment_type} - {payment.payment_method}</p>
                              </div>
                              <p className="text-lg font-bold text-pos-text-primary">{formatCurrency(parseFloat(payment.amount) || 0)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Member Modal */}
        {showAddEditModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowAddEditModal(false);
                setEditingMember(null);
                setFormErrors({});
              }
            }}
            onWheel={(e) => {
              // Prevent scroll propagation to background
              e.stopPropagation();
            }}
            style={{ overflow: 'hidden' }}
          >
            <div 
              className="bg-pos-bg-secondary border-2 border-pos-border-primary rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-pos-border-secondary">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-pos-text-primary">
                    {editingMember ? 'Edit Member' : 'Add New Member'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddEditModal(false);
                      setEditingMember(null);
                      setFormErrors({});
                    }}
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
                  {/* Member ID - Auto-filled and read-only */}
                  <div>
                    <label className="block text-sm font-medium text-pos-text-primary mb-2">
                      Member ID
                    </label>
                    <input
                      ref={memberIdInputRef}
                      type="text"
                      value={memberForm.member_id}
                      readOnly
                      disabled
                      className="w-full px-4 py-2 border-2 border-pos-border-primary rounded-xl bg-gray-700 cursor-not-allowed opacity-60 text-pos-text-primary"
                      placeholder="Auto-generated"
                    />
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-pos-text-primary mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      ref={fullNameInputRef}
                      type="text"
                      value={memberForm.full_name}
                      onChange={(e) => {
                        setMemberForm(prev => ({ ...prev, full_name: e.target.value }));
                        if (formErrors.full_name) {
                          setFormErrors(prev => ({ ...prev, full_name: '' }));
                        }
                      }}
                      onFocus={(e) => handleInputFocus('fullName', e)}
                      onBlur={handleInputBlur}
                      className={`w-full px-4 py-2 border-2 rounded-xl bg-pos-bg-primary text-pos-text-primary focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        formErrors.full_name ? 'border-red-500' : 'border-pos-border-primary'
                      }`}
                      placeholder="Enter full name"
                    />
                    {formErrors.full_name && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.full_name}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-pos-text-primary mb-2">
                      Phone
                    </label>
                    <input
                      ref={phoneInputRef}
                      type="text"
                      value={memberForm.phone}
                      onChange={(e) => setMemberForm(prev => ({ ...prev, phone: e.target.value }))}
                      onFocus={(e) => handleInputFocus('phone', e)}
                      onBlur={handleInputBlur}
                      className="w-full px-4 py-2 border-2 border-pos-border-primary rounded-xl bg-pos-bg-primary text-pos-text-primary focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter phone number"
                    />
                  </div>

                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    onClick={() => {
                      setShowAddEditModal(false);
                      setEditingMember(null);
                      setFormErrors({});
                    }}
                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-colors"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveMember}
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : editingMember ? 'Update' : 'Add Member'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && memberToDelete && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowDeleteModal(false);
                setMemberToDelete(null);
              }
            }}
            onWheel={(e) => {
              // Prevent scroll propagation to background
              e.stopPropagation();
            }}
          >
            <div 
              className="bg-pos-bg-secondary border-2 border-pos-border-primary rounded-2xl shadow-2xl max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-pos-border-secondary">
                <h2 className="text-2xl font-bold text-pos-text-primary">Delete Member</h2>
              </div>
              <div className="p-6">
                <p className="text-pos-text-primary mb-4">
                  Are you sure you want to delete <span className="font-bold">{memberToDelete.full_name || memberToDelete.fullName}</span>?
                </p>
                <p className="text-pos-text-secondary text-sm mb-6">
                  This action cannot be undone.
                </p>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setMemberToDelete(null);
                    }}
                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-colors"
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    disabled={deleting}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
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
                value={
                  activeField === 'search' ? (searchQuery || '') :
                  activeField === 'fullName' ? (memberForm.full_name || '') :
                  activeField === 'phone' ? (memberForm.phone || '') : ''
                }
                onChange={(value) => {
                  if (activeField === 'search') {
                    setSearchQuery(value);
                  } else if (activeField === 'fullName') {
                    setMemberForm(prev => ({ ...prev, full_name: value }));
                  } else if (activeField === 'phone') {
                    setMemberForm(prev => ({ ...prev, phone: value }));
                  }
                }}
                onInput={handleKeypadInput}
                onBackspace={handleKeypadBackspace}
                onClear={handleKeypadClear}
              />
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ show: false, message: '', type: 'success' })}
          />
        )}
      </div>
    </div>
  );
};

export default Members;

