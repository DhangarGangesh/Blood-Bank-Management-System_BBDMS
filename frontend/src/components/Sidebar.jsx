import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  User, 
  ClipboardList, 
  Package, 
  PlusCircle, 
  Users, 
  Shield, 
  Heart, 
  LogOut, 
  PhoneCall, 
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Droplet
} from 'lucide-react';

export default function Sidebar({ user, donor, onLogout, isOpen, onClose }) {
  const navigate = useNavigate();
  const isStaffOrAdmin = user && (user.role === 'admin' || user.role === 'staff');
  const isDonor = user && user.role === 'donor';

  const isEligible = donor?.eligibility_status === 'Eligible';

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
      {/* Donor Profile Highlight Chip */}
      {isDonor && (
        <div className="sidebar-header">
          <div className="sidebar-donor-chip">
            <div className="sidebar-donor-blood">
              {donor?.blood_group || 'O+'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 800, color: 'var(--text-heading)', fontSize: '0.95rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {donor?.name || user?.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                <span className={`badge ${isEligible ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}>
                  {isEligible ? <ShieldCheck size={10} /> : <AlertTriangle size={10} />}
                  {donor?.eligibility_status || 'Eligible'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Staff / Admin Hospital Badge */}
      {isStaffOrAdmin && (
        <div className="sidebar-header">
          <div style={{ 
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', 
            border: '1px solid var(--border-light)', 
            borderRadius: 'var(--radius-md)', 
            padding: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div style={{ 
              width: '38px', 
              height: '38px', 
              borderRadius: 'var(--radius-md)', 
              background: '#0f172a', 
              color: '#ffffff', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Shield size={20} color="#fca5a5" />
            </div>
            <div>
              <div style={{ fontWeight: 800, color: 'var(--text-heading)', fontSize: '0.95rem' }}>
                {user?.name || 'Staff Member'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Hospital Administrator
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        {isDonor && (
          <>
            <div className="sidebar-section-title">Donor Portal</div>
            <NavLink 
              to="/donor-dashboard" 
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink 
              to="/profile" 
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <User size={18} />
              <span>My Profile</span>
            </NavLink>
            <NavLink 
              to="/screening" 
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <ClipboardList size={18} />
              <span>Health Screening</span>
            </NavLink>
          </>
        )}

        {isStaffOrAdmin && (
          <>
            <div className="sidebar-section-title">Blood Inventory Management</div>
            <NavLink 
              to="/inventory" 
              end
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Package size={18} />
              <span>Inventory Stock</span>
            </NavLink>
            <NavLink 
              to="/inventory/add" 
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <PlusCircle size={18} />
              <span>Add Blood Unit</span>
            </NavLink>
            <NavLink 
              to="/admin/donors" 
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Users size={18} />
              <span>Donor Directory</span>
            </NavLink>
          </>
        )}
      </nav>

      {/* Sidebar Footer with Hospital Quick Widget & Logout */}
      <div className="sidebar-footer">
        {isDonor ? (
          <div className="sidebar-widget">
            <div className="sidebar-widget-title">
              <PhoneCall size={14} color="var(--primary)" />
              Donor Helpline
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
              Toll-Free: <strong>1800-LIFEPULSE</strong><br />
              Mon–Sat: 8:00 AM – 8:00 PM
            </div>
          </div>
        ) : (
          <div className="sidebar-widget">
            <div className="sidebar-widget-title">
              <ShieldCheck size={14} color="var(--status-green)" />
              Clinical Protocol
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
              ISO 9001:2026 Compliant Blood Safety Management
            </div>
          </div>
        )}

        <button 
          onClick={() => {
            onLogout();
            navigate('/login');
          }}
          className="btn btn-secondary btn-sm"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
