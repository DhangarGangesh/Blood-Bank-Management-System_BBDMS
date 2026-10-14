import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';

export default function ProtectedRoute({ user, allowedRoles, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = (user.role || '').toLowerCase();
    const isAllowed = allowedRoles.some((r) => r.toLowerCase() === userRole);

    if (!isAllowed) {
      const isDonor = userRole === 'donor';
      return (
        <div style={{ maxWidth: '580px', margin: '4rem auto', padding: '0 1.5rem' }}>
          <div className="card" style={{ textAlign: 'center', borderColor: 'var(--status-red-border)', padding: '2.5rem 2rem' }}>
            <div style={{ 
              display: 'inline-flex', 
              padding: '1.25rem', 
              borderRadius: '50%', 
              background: 'var(--status-red-bg)', 
              color: 'var(--status-red)', 
              marginBottom: '1.25rem',
              border: '1px solid var(--status-red-border)'
            }}>
              <ShieldAlert size={44} />
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '0.5rem' }}>
              Restricted Clinical Zone
            </h2>

            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              padding: '0.2rem 0.65rem', 
              borderRadius: 'var(--radius-full)', 
              background: 'var(--status-red-bg)', 
              color: 'var(--status-red-text)', 
              fontSize: '0.8rem', 
              fontWeight: 700, 
              marginBottom: '1rem' 
            }}>
              <Lock size={12} /> RBAC Enforcement (HTTP 403)
            </div>

            <p style={{ color: 'var(--text-body)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              {isDonor ? (
                <>
                  You are currently authenticated as a registered <strong>Donor</strong>. 
                  <br />
                  Hospital <strong>Blood Inventory Operations & Add Unit controls</strong> are strictly restricted to authorized medical staff and system administrators.
                </>
              ) : (
                <>
                  You are authenticated with role: <strong>{user.role}</strong>. 
                  <br />
                  This view is reserved for active <strong>Donors</strong>.
                </>
              )}
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
              {isDonor ? (
                <Link to="/donor-dashboard" className="btn btn-primary">
                  <ArrowLeft size={16} /> Return to Donor Dashboard
                </Link>
              ) : (
                <Link to="/inventory" className="btn btn-primary">
                  <ArrowLeft size={16} /> Return to Staff Inventory
                </Link>
              )}
            </div>
          </div>
        </div>
      );
    }
  }

  return children;
}
