import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { 
  UserPlus, 
  AlertCircle, 
  CheckCircle, 
  Droplet, 
  ShieldCheck, 
  Heart, 
  Eye, 
  EyeOff,
  Calendar,
  Lock,
  User,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function Register({ onLoginSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: 'Male',
    blood_group: 'O+',
    address: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBloodGroupSelect = (group) => {
    setFormData({ ...formData, blood_group: group });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!formData.name.trim()) {
      setError('Please provide your full legal name.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      setError('Please provide a valid contact phone number (min 10 digits).');
      return;
    }
    if (!formData.date_of_birth) {
      setError('Please select your Date of Birth.');
      return;
    }

    // Age validation (18-65)
    const birthDate = new Date(formData.date_of_birth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 18) {
      setError(`Blood donors must be at least 18 years old. (Current calculated age: ${age} years)`);
      return;
    }
    if (age > 65) {
      setError(`Donors over 65 years require special physician clearance. Please consult our staff.`);
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        blood_group: formData.blood_group,
        address: formData.address.trim(),
        password: formData.password
      };

      const res = await api.register(payload);
      if (res.success) {
        showToast('Registration complete! Welcome to LifePulse Donor Network.', 'success', 4000);
        onLoginSuccess(res.user, res.donor, res.token);
        navigate('/donor-dashboard');
      } else {
        setError(res.message || 'Donor registration failed. Please try again.');
      }
    } catch (err) {
      setError('Network connection error while submitting registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '2rem auto 3rem', width: '100%' }}>
      {/* Hospital Trust Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <div style={{ 
          display: 'inline-flex', 
          width: '52px', 
          height: '52px', 
          borderRadius: 'var(--radius-xl)', 
          background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)', 
          alignItems: 'center', 
          justifyContent: 'center', 
          color: 'white',
          boxShadow: '0 6px 16px rgba(185, 28, 28, 0.25)',
          marginBottom: '0.75rem'
        }}>
          <Heart size={26} fill="white" />
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-heading)', letterSpacing: '-0.5px' }}>
          Donor Registration
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '0.2rem' }}>
          Join the LifePulse Lifesaver Network & Help Save Critical Lives
        </p>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <div className="card-header" style={{ marginBottom: '1.5rem', paddingBottom: '0.75rem' }}>
          <span className="card-title">
            <UserPlus size={18} /> New Donor Enrollment Form
          </span>
          <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>
            <ShieldCheck size={12} /> Confidential & HIPAA Compliant
          </span>
        </div>

        {error && (
          <div className="alert alert-error animate-fade-in">
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Section 1: Blood Group Selector */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ marginBottom: '0.65rem' }}>
              Select Your Blood Group <span className="required-indicator">*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem' }}>
              {BLOOD_GROUPS.map((bg) => {
                const isSelected = formData.blood_group === bg;
                return (
                  <button
                    key={bg}
                    type="button"
                    onClick={() => handleBloodGroupSelect(bg)}
                    style={{
                      padding: '0.65rem 0.5rem',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-default)',
                      backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--bg-surface)',
                      color: isSelected ? 'var(--primary)' : 'var(--text-heading)',
                      fontWeight: 800,
                      fontSize: '1.05rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.2rem',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Droplet size={14} fill={isSelected ? 'var(--primary)' : 'none'} color={isSelected ? 'var(--primary)' : 'var(--text-muted)'} />
                    {bg}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Personal Details */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">
                Full Legal Name <span className="required-indicator">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  id="reg-name"
                  type="text" 
                  name="name"
                  className="form-input" 
                  placeholder="e.g. Johnathan Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">
                Email Address <span className="required-indicator">*</span>
              </label>
              <input 
                id="reg-email"
                type="email" 
                name="email"
                className="form-input" 
                placeholder="john.doe@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="reg-phone">
                Phone Number <span className="required-indicator">*</span>
              </label>
              <input 
                id="reg-phone"
                type="tel" 
                name="phone"
                className="form-input" 
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-dob">
                Date of Birth <span className="required-indicator">*</span>
              </label>
              <input 
                id="reg-dob"
                type="date" 
                name="date_of_birth"
                className="form-input" 
                value={formData.date_of_birth}
                onChange={handleChange}
                required
              />
              <span className="form-help-text">Must be 18 to 65 years old</span>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="reg-gender">
                Gender
              </label>
              <select 
                id="reg-gender"
                name="gender" 
                className="form-select"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-address">
                City / Residential Address
              </label>
              <input 
                id="reg-address"
                type="text" 
                name="address"
                className="form-input" 
                placeholder="Street, City, Postal Code"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Section 3: Password */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">
                Password <span className="required-indicator">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'} 
                  name="password"
                  className="form-input" 
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  style={{ paddingRight: '40px' }}
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
                    cursor: 'pointer' 
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-confirm-password">
                Confirm Password <span className="required-indicator">*</span>
              </label>
              <input 
                id="reg-confirm-password"
                type={showPassword ? 'text' : 'password'} 
                name="confirmPassword"
                className="form-input" 
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '0.75rem', height: '46px' }} 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                <span>Creating Donor Profile...</span>
              </>
            ) : (
              <>
                <UserPlus size={18} /> Register as Blood Donor
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
