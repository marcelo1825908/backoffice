import React, { useState } from 'react';
import axios from 'axios';

const ServerUrlModal = ({ onConnectionSuccess }) => {
  const [serverUrl, setServerUrl] = useState('');
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const testConnection = async () => {
    if (!serverUrl.trim()) {
      setError('Please enter a server URL');
      return;
    }

    // Validate URL format
    let url = serverUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `http://${url}`;
    }

    // Remove trailing slash
    url = url.replace(/\/+$/, '');

    // Add /api if not present
    const apiUrl = url.endsWith('/api') ? url : `${url}/api`;

    setTesting(true);
    setError('');
    setSuccess(false);

    try {
      // Test connection by making a simple API call
      const response = await axios.get(`${apiUrl}/members`, {
        timeout: 5000, // 5 second timeout
      });
      
      // If we get a response (even if it's an error response, it means server is reachable)
      setSuccess(true);
      
      // Store the server URL in localStorage
      localStorage.setItem('serverUrl', url);
      
      // Wait a moment to show success message
      setTimeout(() => {
        onConnectionSuccess(url);
      }, 500);
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK' || err.message.includes('Network Error')) {
        setError('Cannot connect to server. Please check the URL and ensure the server is running.');
      } else if (err.code === 'ECONNABORTED') {
        setError('Connection timeout. Please check the URL and try again.');
      } else if (err.response) {
        // Server responded but with an error - this means connection is OK
        setSuccess(true);
        localStorage.setItem('serverUrl', url);
        setTimeout(() => {
          onConnectionSuccess(url);
        }, 500);
      } else {
        setError('Failed to connect. Please check the URL and try again.');
      }
    } finally {
      setTesting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !testing) {
      testConnection();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-pos-bg-secondary border-2 border-pos-border-primary rounded-2xl shadow-2xl max-w-md w-full mx-4">
        <div className="p-6 border-b border-pos-border-secondary">
          <h2 className="text-2xl font-bold text-pos-text-primary">Server Configuration</h2>
          <p className="text-sm text-pos-text-secondary mt-1">Enter your backend server URL to continue</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-pos-text-primary mb-2">
                Server URL
              </label>
              <input
                type="text"
                value={serverUrl}
                onChange={(e) => {
                  setServerUrl(e.target.value);
                  setError('');
                  setSuccess(false);
                }}
                onKeyPress={handleKeyPress}
                placeholder="192.168.124.44:5000 or http://192.168.124.44:5000"
                className="w-full px-4 py-2 border-2 border-pos-border-primary rounded-xl bg-pos-bg-primary text-pos-text-primary focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={testing || success}
              />
              <p className="text-xs text-pos-text-secondary mt-1">
                Example: 192.168.124.44:5000 or http://192.168.124.44:5000
              </p>
            </div>

            {error && (
              <div className="bg-red-500/20 border-2 border-red-500 rounded-xl p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-500/20 border-2 border-green-500 rounded-xl p-3">
                <p className="text-sm text-green-400">✓ Connection successful! Redirecting...</p>
              </div>
            )}

            <button
              onClick={testConnection}
              disabled={testing || success || !serverUrl.trim()}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {testing ? 'Testing Connection...' : success ? 'Connected!' : 'Test Connection'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerUrlModal;

