import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Payments from './pages/Payments';
import Members from './pages/Members';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Navigation from './components/Navigation';
import ServerUrlModal from './components/ServerUrlModal';
import { updateAPIBaseURL, setAuthToken } from './services/api';
import './App.css';

function App() {
  const [serverConfigured, setServerConfigured] = useState(false);
  const [showServerModal, setShowServerModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if server URL is already configured
    const serverUrl = localStorage.getItem('serverUrl');
    if (serverUrl) {
      // Update API base URL with stored server URL
      updateAPIBaseURL(serverUrl);
      setServerConfigured(true);
    } else {
      // Show modal if no server URL is configured
      setShowServerModal(true);
    }

    // Check if user is already authenticated
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      setAuthToken(authToken);
      setIsAuthenticated(true);
    }
  }, []);

  const handleConnectionSuccess = (serverUrl) => {
    // Update API base URL
    updateAPIBaseURL(serverUrl);
    // Hide modal - will show login page next
    setShowServerModal(false);
    setServerConfigured(true);
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  // Show server configuration modal if not configured
  if (showServerModal || !serverConfigured) {
    return <ServerUrlModal onConnectionSuccess={handleConnectionSuccess} />;
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Show main app if authenticated
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <div className="flex h-screen overflow-hidden">
        <Navigation />
        <main className="flex-1 overflow-y-auto ml-64">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/members" element={<Members />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

