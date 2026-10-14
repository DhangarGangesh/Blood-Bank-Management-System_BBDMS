import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { 
  LogIn, 
  AlertCircle, 
  Sparkles, 
  Eye, 
  EyeOff, 
  Droplet, 
  ShieldCheck, 
  User, 
  Building2,
  Lock
} from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both your registered email and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.login({ email, password });
      if (res.success) {
        showToast(`Welcome back, ${res.user.name}!`, 'success');
        onLoginSuccess(res.user, res.donor, res.token);
        if (res.user.role === 'admin' || res.user.role === 'staff') {
          navigate('/inventory');
        } else {
          navigate('/donor-dashboard');
        }
      } else {
        setError(res.message || 'Authentication failed. Please verify credentials.');
      }
    } catch (err) {
      setError('Cannot connect to hospital authentication service. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail, roleLabel) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
    showToast(`Loaded demo credentials for ${roleLabel}`, 'info', 2000);
  };

  return (
    <div style={{ maxWidth: '480px', margin: '2.5rem auto 3rem', width: '100%' }}>
      {/* Hospital Trust Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <div style={{ 
          display: 'inline-flex', 
          width: '54px', 
          height: '54px', 
          borderRadius: 'var(--radius-xl)', 
          background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)', 
          alignItems: 'center', 
          justifyContent: 'center', 
          color: 'white',
          boxShadow: '0 6px 16px rgba(185, 28, 28, 0.28)',
          marginBottom: '0.85rem'
        }}>
          <Droplet size={28} fill="white" />
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-heading)', letterSpacing: '-0.5px' }}>
          LifePulse Portal
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '0.2rem' }}>
          Secure Clinical Access for Donors & Hospital Medical Staff
        </p>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <div className="card-header" style={{ marginBottom: '1.5rem', paddingBottom: '0.75rem' }}>
          <span className="card-title" style={{ fontSize: '1.15rem' }}>
            <Lock size={18} /> Sign In to Your Account
          </span>
          <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>
            <ShieldCheck size={12} /> SSL 256-Bit
          </span>
        </div>

        {error && (
          <div className="alert alert-error animate-fade-in">
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              Institutional Email <span className="required-indicator">*</span>
            </label>
            <input 
              id="login-email"
              type="email" 
              className="form-input" 
              placeholder="e.g. aarav.sharma@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
              <label className="form-label" htmlFor="login-password" style={{ marginBottom: 0 }}>
                Password <span className="required-indicator">*</span>
              </label>
            </div>
            <div style={{ position: 'relative' }}>
              <input 
                id="login-password"
                type={showPassword ? 'text' : 'password'} 
                className="form-input" 
                placeholder="Enter account password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingRight: '42px' }}
                autoComplete="current-password"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ 
                  position: 'absolute', 
                  right: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--text-muted)', 
                  cursor: 'pointer',
                  padding: '2px'
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '0.5rem', height: '44px' }} 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                <span>Authenticating Credentials...</span>
              </>
            ) : (
              <>
                <LogIn size={18} /> Sign In
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Credential Switcher */}
        <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)' }}>
          <div style={{ 
            fontSize: '0.8rem', 
            fontWeight: 700, 
            color: 'var(--text-muted)', 
            marginBottom: '0.85rem', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between' 
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={14} color="#d97706" /> Instant Demo Sign-in:
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', fontWeight: 500 }}>
              One-click auto-fill
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm" 
                style={{ fontSize: '0.78rem', justifyContent: 'flex-start' }}
                onClick={() => handleDemoFill('aarav.sharma@example.com', 'Aarav (Donor O+)')}
              >
                <User size={13} color="var(--primary)" />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Aarav (O+ Donor)
                </span>
              </button>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm" 
                style={{ fontSize: '0.78rem', justifyContent: 'flex-start' }}
                onClick={() => handleDemoFill('priya.patel@example.com', 'Priya (Donor A+)')}
              >
                <User size={13} color="var(--primary)" />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Priya (A+ Donor)
                </span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm" 
                style={{ fontSize: '0.78rem', justifyContent: 'flex-start' }}
                onClick={() => handleDemoFill('rohan.verma@example.com', 'Rohan (AB- Restricted)')}
              >
                <User size={13} color="#dc2626" />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Rohan (AB- Restr.)
                </span>
              </button>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm" 
                style={{ 
                  fontSize: '0.78rem', 
                  justifyContent: 'flex-start',
                  borderColor: 'var(--primary-border)',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)'
                }}
                onClick={() => handleDemoFill('admin@lifesave.org', 'Hospital Admin')}
              >
                <Building2 size={13} color="var(--primary)" />
                <span style={{ fontWeight: 700 }}>
                  Dr. Sunita (Admin)
                </span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm" 
                style={{ fontSize: '0.78rem', justifyContent: 'flex-start' }}
                onClick={() => handleDemoFill('nurse.anita@lifesave.org', 'Nurse Anita (Staff)')}
              >
                <Building2 size={13} color="var(--status-blue)" />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 600 }}>
                  Nurse Anita (Staff)
                </span>
              </button>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm" 
                style={{ fontSize: '0.78rem', justifyContent: 'flex-start' }}
                onClick={() => handleDemoFill('lab.vikram@lifesave.org', 'Vikram (Lab Staff)')}
              >
                <Building2 size={13} color="var(--status-blue)" />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 600 }}>
                  Lab Tech (Staff)
                </span>
              </button>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          New blood donor?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700 }}>
            Register as Blood Donor
          </Link>
        </div>
      </div>
    </div>
  );
}
