import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Droplet, 
  Menu, 
  X, 
  LogIn, 
  UserPlus, 
  LogOut, 
  Activity, 
  ShieldCheck, 
  HeartHandshake
} from 'lucide-react';

export default function Navbar({ user, donor, onLogout, onToggleSidebar, isSidebarOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isStaffOrAdmin = user && (user.role === 'admin' || user.role === 'staff');
  const isDonor = user && user.role === 'donor';

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Left Section: Brand & Mobile Toggle */}
        <div className="navbar-left">
          {user && (
            <button 
              className="mobile-menu-toggle"
              onClick={onToggleSidebar}
              aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
            >
              {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          )}

          <Link to={user ? (isStaffOrAdmin ? '/inventory' : '/donor-dashboard') : '/login'} className="brand">
            <div className="brand-icon-box">
              <Droplet size={22} fill="white" />
            </div>
            <div className="brand-text">
              <span className="brand-title">Life<span>Pulse</span></span>
              <span className="brand-subtitle">Blood Bank & Donor System</span>
            </div>
          </Link>

          {/* Clinical Live Status Indicator */}
          <div className="system-status-pill" title="Operational Blood Management Server">
            <span className="status-dot"></span>
            <span>Clinical Systems Active</span>
          </div>
        </div>

        {/* Right Section */}
        <div className="navbar-right">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div className="user-profile-badge">
                <div className="user-avatar-initials">
                  {getInitials(user.name)}
                </div>
                <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name}
                </span>
                <span className={`role-tag ${isDonor ? 'role-tag-donor' : 'role-tag-admin'}`}>
                  {isDonor ? 'Donor' : 'Hospital Staff'}
                </span>
                {donor?.blood_group && (
                  <span style={{ 
                    fontSize: '0.72rem', 
                    fontWeight: 800, 
                    color: 'white', 
                    background: 'var(--primary)', 
                    padding: '0.1rem 0.4rem', 
                    borderRadius: '4px' 
                  }}>
                    {donor.blood_group}
                  </span>
                )}
              </div>

              <button 
                onClick={() => {
                  onLogout();
                  navigate('/login');
                }}
                className="btn btn-secondary btn-sm"
                title="Sign out of system"
              >
                <LogOut size={16} />
                <span className="hide-on-mobile">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="nav-links">
              <Link to="/login" className="btn btn-secondary btn-sm">
                <LogIn size={16} /> Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                <UserPlus size={16} /> Register as Donor
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
