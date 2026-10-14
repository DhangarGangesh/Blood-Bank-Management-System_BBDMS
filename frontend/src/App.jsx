import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import DonorDashboard from './pages/DonorDashboard';
import DonorProfile from './pages/DonorProfile';
import HealthScreening from './pages/HealthScreening';
import InventoryDashboard from './pages/InventoryDashboard';
import AddBloodUnit from './pages/AddBloodUnit';
import DonorDirectory from './pages/DonorDirectory';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('bbdms_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [donor, setDonor] = useState(() => {
    const saved = localStorage.getItem('bbdms_donor');
    return saved ? JSON.parse(saved) : null;
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLoginSuccess = (userData, donorData, token) => {
    setUser(userData);
    setDonor(donorData);
    localStorage.setItem('bbdms_user', JSON.stringify(userData));
    if (donorData) localStorage.setItem('bbdms_donor', JSON.stringify(donorData));
    localStorage.setItem('bbdms_token', token);
  };

  const handleLogout = () => {
    setUser(null);
    setDonor(null);
    localStorage.removeItem('bbdms_user');
    localStorage.removeItem('bbdms_donor');
    localStorage.removeItem('bbdms_token');
    setSidebarOpen(false);
  };

  const isStaffOrAdmin = user && (user.role === 'admin' || user.role === 'staff');

  return (
    <ToastProvider>
      <Router>
        <div className="app-container">
          <Navbar 
            user={user} 
            donor={donor} 
            onLogout={handleLogout}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            isSidebarOpen={sidebarOpen}
          />
          
          {user ? (
            <div className="portal-layout">
              <Sidebar 
                user={user} 
                donor={donor} 
                onLogout={handleLogout}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
              />
              <div className="portal-content">
                <Routes>
                  {/* Root redirect based on role */}
                  <Route 
                    path="/" 
                    element={isStaffOrAdmin ? <Navigate to="/inventory" replace /> : <Navigate to="/donor-dashboard" replace />} 
                  />

                  {/* Public routes redirect when already logged in */}
                  <Route 
                    path="/login" 
                    element={<Navigate to={isStaffOrAdmin ? "/inventory" : "/donor-dashboard"} replace />} 
                  />
                  <Route 
                    path="/register" 
                    element={<Navigate to={isStaffOrAdmin ? "/inventory" : "/donor-dashboard"} replace />} 
                  />

                  {/* Module 1: Donor Portal */}
                  <Route 
                    path="/donor-dashboard" 
                    element={
                      <ProtectedRoute user={user} allowedRoles={['donor']}>
                        <DonorDashboard user={user} donor={donor} setDonor={setDonor} />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute user={user} allowedRoles={['donor']}>
                        <DonorProfile user={user} donor={donor} setDonor={setDonor} />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/screening" 
                    element={
                      <ProtectedRoute user={user} allowedRoles={['donor']}>
                        <HealthScreening user={user} donor={donor} setDonor={setDonor} />
                      </ProtectedRoute>
                    } 
                  />

                  {/* Module 2: Staff / Admin Inventory Portal */}
                  <Route 
                    path="/inventory" 
                    element={
                      <ProtectedRoute user={user} allowedRoles={['admin', 'staff']}>
                        <InventoryDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/inventory/add" 
                    element={
                      <ProtectedRoute user={user} allowedRoles={['admin', 'staff']}>
                        <AddBloodUnit />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/donors" 
                    element={
                      <ProtectedRoute user={user} allowedRoles={['admin', 'staff']}>
                        <DonorDirectory />
                      </ProtectedRoute>
                    } 
                  />

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </div>
          ) : (
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
                <Route path="/register" element={<Register onLoginSuccess={handleLoginSuccess} />} />
                
                {/* Fallback protection for deep links */}
                <Route path="/donor-dashboard" element={<Navigate to="/login" replace />} />
                <Route path="/profile" element={<Navigate to="/login" replace />} />
                <Route path="/screening" element={<Navigate to="/login" replace />} />
                <Route path="/inventory" element={<Navigate to="/login" replace />} />
                <Route path="/inventory/add" element={<Navigate to="/login" replace />} />
                <Route path="/admin/donors" element={<Navigate to="/login" replace />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </main>
          )}
        </div>
      </Router>
    </ToastProvider>
  );
}
