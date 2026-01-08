import React, { useState, useEffect } from 'react';
import { login, register, setAuthToken } from '../services/api';

const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    login: false,
    register: false,
    confirm: false,
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(formData);
      
      if (response.data && response.data.token) {
        // Store token and user data
        setAuthToken(response.data.token);
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        onLoginSuccess();
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.response && err.response.status === 401) {
        setError('Invalid username or password');
      } else if (err.response && err.response.status === 404) {
        setError('Login endpoint not found. Please check your server configuration.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pos-bg-primary flex items-center justify-center p-4">
      <div className="bg-pos-bg-secondary border-2 border-pos-border-primary rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-pos-text-primary mb-2">Welcome Back</h1>
            <p className="text-pos-text-secondary">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-pos-text-primary mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-pos-border-primary rounded-xl bg-pos-bg-primary text-pos-text-primary focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your username"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-pos-text-primary mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.login ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 pr-12 border-2 border-pos-border-primary rounded-xl bg-pos-bg-primary text-pos-text-primary focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, login: !showPasswords.login })}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-pos-text-secondary hover:text-pos-text-primary"
                  disabled={loading}
                >
                  {showPasswords.login ? (
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

            {error && (
              <div className="bg-red-500/20 border-2 border-red-500 rounded-xl p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed shadow-md hover:shadow-lg font-medium"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-pos-text-secondary">
              Don't have an account?{' '}
              <button
                onClick={() => setShowRegister(true)}
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                Register
              </button>
            </p>
          </div>
        </div>
      </div>

      {showRegister && (
        <Register
          onRegisterSuccess={onLoginSuccess}
          onBackToLogin={() => setShowRegister(false)}
        />
      )}
    </div>
  );
};

const Register = ({ onRegisterSuccess, onBackToLogin }) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    register: false,
    confirm: false,
  });

  // Generate ID automatically when component mounts
  useEffect(() => {
    // Generate a unique ID based on timestamp
    const generateId = () => {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000);
      return `USER${timestamp}${random}`.slice(0, 15); // Limit to 15 characters
    };
    
    setFormData(prev => ({
      ...prev,
      id: generateId()
    }));
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate all required fields
    if (!formData.id || !formData.id.trim()) {
      setError('ID is required');
      return;
    }

    if (!formData.name || !formData.name.trim()) {
      setError('Name is required');
      return;
    }

    if (!formData.phone || !formData.phone.trim()) {
      setError('Phone number is required');
      return;
    }

    if (!formData.email || !formData.email.trim()) {
      setError('Email is required');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Validate password
    if (!formData.password || !formData.password.trim()) {
      setError('Password is required');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // Exclude confirmPassword from the data sent to API
      const { confirmPassword, ...registerData } = formData;
      const response = await register(registerData);
      
      if (response.data && response.data.token) {
        setAuthToken(response.data.token);
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        onRegisterSuccess();
      } else {
        setError('Registration successful. Please login.');
        setTimeout(() => {
          onBackToLogin();
        }, 2000);
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.response && err.response.status === 409) {
        setError('ID or email already exists');
      } else if (err.response && err.response.status === 404) {
        setError('Register endpoint not found. Please check your server configuration.');
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-pos-bg-secondary border-2 border-pos-border-primary rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-pos-text-primary">Create Account</h2>
              <p className="text-sm text-pos-text-secondary mt-1">Sign up for a new account</p>
            </div>
            <button
              onClick={onBackToLogin}
              className="text-pos-text-secondary hover:text-pos-text-primary"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-pos-text-primary mb-2">
                ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="id"
                value={formData.id}
                readOnly
                disabled
                required
                className="w-full px-4 py-3 border-2 border-pos-border-primary rounded-xl bg-gray-700 cursor-not-allowed opacity-60 text-pos-text-primary"
                placeholder="Auto-generated"
              />
              <p className="text-xs text-pos-text-secondary mt-1">ID is automatically generated</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-pos-text-primary mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-pos-border-primary rounded-xl bg-pos-bg-primary text-pos-text-primary focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your full name"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-pos-text-primary mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-pos-border-primary rounded-xl bg-pos-bg-primary text-pos-text-primary focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your phone number"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-pos-text-primary mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-pos-border-primary rounded-xl bg-pos-bg-primary text-pos-text-primary focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-pos-text-primary mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPasswords.register ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 pr-12 border-2 border-pos-border-primary rounded-xl bg-pos-bg-primary text-pos-text-primary focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, register: !showPasswords.register })}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-pos-text-secondary hover:text-pos-text-primary"
                  disabled={loading}
                >
                  {showPasswords.register ? (
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
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 pr-12 border-2 border-pos-border-primary rounded-xl bg-pos-bg-primary text-pos-text-primary focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Confirm your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-pos-text-secondary hover:text-pos-text-primary"
                  disabled={loading}
                >
                  {showPasswords.confirm ? (
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

            {error && (
              <div className="bg-red-500/20 border-2 border-red-500 rounded-xl p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed shadow-md hover:shadow-lg font-medium"
            >
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

