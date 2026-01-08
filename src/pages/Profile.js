import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Toast from '../components/Toast';
import { updateProfile, changePassword } from '../services/api';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    email: '',
  });
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setEditFormData({
          name: parsedUser.name || '',
          phone: parsedUser.phone || '',
          email: parsedUser.email || '',
        });
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    setLoading(false);
  }, []);

  const handleEditProfileChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handlePasswordChange = (e) => {
    setPasswordFormData({
      ...passwordFormData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleEditProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      // Call API to update profile
      const response = await updateProfile({
        id: user.id,
        name: editFormData.name,
        phone: editFormData.phone,
        email: editFormData.email,
      });

      if (response.data && response.data.user) {
        // Update localStorage with new user data
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
        setShowEditProfile(false);
        setToast({ show: true, message: 'Profile updated successfully', type: 'success' });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordFormData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setSaving(true);

    try {
      // Call API to change password
      const response = await changePassword({
        id: user.id,
        currentPassword: passwordFormData.currentPassword,
        newPassword: passwordFormData.newPassword,
      });

      if (response.data) {
        setPasswordFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setShowPasswords({
          currentPassword: false,
          newPassword: false,
          confirmPassword: false,
        });
        setShowEditPassword(false);
        setToast({ show: true, message: 'Password changed successfully', type: 'success' });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-pos-text-secondary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pos-bg-primary">
      <Header title="Profile" subtitle="Manage your account settings" />
      
      <div className="px-8 py-6">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Profile Information Card */}
          <div className="bg-pos-bg-secondary rounded-xl shadow-lg p-8 border-2 border-pos-border-primary">
            {user ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-pos-text-primary">
                        {user.name || 'User'}
                      </h2>
                      <p className="text-pos-text-secondary mt-1">
                        {user.email || 'No email'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowEditProfile(true);
                      setShowEditPassword(false);
                      setError('');
                    }}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors font-medium"
                  >
                    Edit Profile
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <div className="bg-pos-bg-primary p-6 rounded-lg border border-pos-border-secondary">
                    <label className="text-sm font-medium text-pos-text-secondary">ID</label>
                    <p className="text-pos-text-primary mt-1 font-mono">{user.id || 'N/A'}</p>
                  </div>
                
                  <div className="bg-pos-bg-primary p-6 rounded-lg border border-pos-border-secondary">
                    <label className="text-sm font-medium text-pos-text-secondary">Name</label>
                    <p className="text-pos-text-primary mt-1">{user.name || 'N/A'}</p>
                  </div>
                  
                  <div className="bg-pos-bg-primary p-6 rounded-lg border border-pos-border-secondary">
                    <label className="text-sm font-medium text-pos-text-secondary">Phone</label>
                    <p className="text-pos-text-primary mt-1">{user.phone || 'N/A'}</p>
                  </div>
                  
                  <div className="bg-pos-bg-primary p-6 rounded-lg border border-pos-border-secondary">
                    <label className="text-sm font-medium text-pos-text-secondary">Email</label>
                    <p className="text-pos-text-primary mt-1">{user.email || 'N/A'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-pos-text-secondary">No user data available</p>
              </div>
            )}
          </div>

          {/* Change Password Section */}
          <div className="bg-pos-bg-secondary rounded-xl shadow-lg p-8 border-2 border-pos-border-primary">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-pos-text-primary">Change Password</h3>
                <p className="text-sm text-pos-text-secondary mt-1">Update your password to keep your account secure</p>
              </div>
              <button
                onClick={() => {
                  setShowEditPassword(true);
                  setShowEditProfile(false);
                  setError('');
                  setPasswordFormData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                  });
                  setShowPasswords({
                    currentPassword: false,
                    newPassword: false,
                    confirmPassword: false,
                  });
                }}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors font-medium"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => {
          setShowEditProfile(false);
          setError('');
        }}>
          <div className="bg-pos-bg-secondary rounded-xl shadow-lg p-8 border-2 border-pos-border-primary max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-pos-text-primary">Edit Profile</h3>
              <button
                onClick={() => {
                  setShowEditProfile(false);
                  setError('');
                }}
                className="text-pos-text-secondary hover:text-pos-text-primary"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {error && (
              <div className="bg-red-500/20 border-2 border-red-500 rounded-xl p-3 mb-4">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}
            <form onSubmit={handleEditProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-pos-text-primary mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditProfileChange}
                  required
                  className="w-full px-4 py-3 border-2 border-pos-border-primary rounded-xl bg-pos-bg-primary text-pos-text-primary focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-pos-text-primary mb-2">
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={editFormData.phone}
                  onChange={handleEditProfileChange}
                  className="w-full px-4 py-3 border-2 border-pos-border-primary rounded-xl bg-pos-bg-primary text-pos-text-primary focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-pos-text-primary mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleEditProfileChange}
                  required
                  className="w-full px-4 py-3 border-2 border-pos-border-primary rounded-xl bg-pos-bg-primary text-pos-text-primary focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors font-medium disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditProfile(false);
                    setError('');
                  }}
                  className="flex-1 px-6 py-3 bg-pos-bg-primary hover:bg-pos-bg-secondary text-pos-text-primary rounded-xl transition-colors font-medium border-2 border-pos-border-primary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showEditPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => {
          setShowEditPassword(false);
          setError('');
        }}>
          <div className="bg-pos-bg-secondary rounded-xl shadow-lg p-8 border-2 border-pos-border-primary max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-pos-text-primary">Change Password</h3>
              <button
                onClick={() => {
                  setShowEditPassword(false);
                  setError('');
                }}
                className="text-pos-text-secondary hover:text-pos-text-primary"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {error && (
              <div className="bg-red-500/20 border-2 border-red-500 rounded-xl p-3 mb-4">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-pos-text-primary mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.currentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={passwordFormData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    className="w-full px-4 py-3 pr-12 border-2 border-pos-border-primary rounded-xl bg-pos-bg-primary text-pos-text-primary focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, currentPassword: !showPasswords.currentPassword })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-pos-text-secondary hover:text-pos-text-primary"
                  >
                    {showPasswords.currentPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-pos-text-primary mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.newPassword ? "text" : "password"}
                    name="newPassword"
                    value={passwordFormData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 pr-12 border-2 border-pos-border-primary rounded-xl bg-pos-bg-primary text-pos-text-primary focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, newPassword: !showPasswords.newPassword })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-pos-text-secondary hover:text-pos-text-primary"
                  >
                    {showPasswords.newPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-pos-text-primary mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordFormData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 pr-12 border-2 border-pos-border-primary rounded-xl bg-pos-bg-primary text-pos-text-primary focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirmPassword: !showPasswords.confirmPassword })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-pos-text-secondary hover:text-pos-text-primary"
                  >
                    {showPasswords.confirmPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors font-medium disabled:opacity-50"
                >
                  {saving ? 'Changing Password...' : 'Change Password'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditPassword(false);
                    setError('');
                  }}
                  className="flex-1 px-6 py-3 bg-pos-bg-primary hover:bg-pos-bg-secondary text-pos-text-primary rounded-xl transition-colors font-medium border-2 border-pos-border-primary"
                >
                  Cancel
                </button>
              </div>
            </form>
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
  );
};

export default Profile;
