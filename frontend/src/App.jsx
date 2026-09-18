import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import Dashboard from './pages/Dashboard'; 
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard'; // Admin import
import StaffDashboard from './pages/StaffDashboard';
import MyReservations from './pages/MyReservations';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<VerifyOTP />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminDashboard />} /> {/* Admin Route */}
        <Route path="/staff" element={<StaffDashboard />} />
        <Route path="/reservations" element={<MyReservations />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;