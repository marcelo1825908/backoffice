import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Payments from './pages/Payments';
import Members from './pages/Members';
import Reports from './pages/Reports';
import Navigation from './components/Navigation';
import './App.css';

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <div>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/payments" element={<Payments />} />
          {/* <Route path="/mosque" element={<Payments />} /> */}
          <Route path="/members" element={<Members />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
        <Navigation />
      </div>
    </Router>
  );
}

export default App;

