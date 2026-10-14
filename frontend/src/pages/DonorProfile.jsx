import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { 
  User, 
  Save, 
  AlertCircle, 
  CheckCircle, 
  ArrowLeft, 
  Droplet, 
  Phone, 
  Mail, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  Lock 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function DonorProfile({ user, donor, setDonor }) {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: 'Male',
    blood_group: 'O+',
    address: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const idToFetch = donor ? donor.id : user.id;
        try {
          const res = await api.getDonor(idToFetch);
          if (res.success && res.donor) {
            const d = res.donor;
            setFormData({
              name: d.name || user.name || '',
              email: d.email || user.email || '',
              phone: d.phone || '',
              date_of_birth: d.date_of_birth ? d.date_of_birth.split('T')[0] : '',
              gender: d.gender || 'Male',
              blood_group: d.blood_group || 'O+',
              address: d.address || ''
            });
            if (setDonor) setDonor(d);
          }
        } catch (err) {
          setMessage({ type: 'error', text: 'Failed to retrieve donor records from hospital server.' });
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // Validations
    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: 'Full Name cannot be blank.' });
      return;
    }
    if (formData.phone && formData.phone.trim().length < 10) {
      setMessage({ type: 'error', text: 'Phone number must be at least 10 digits.' });
      return;
    }

    setSaving(true);
    const idToUpdate = donor ? donor.id : user.id;

    try {
      const res = await api.updateDonor(idToUpdate, formData);
      if (res.success) {
        setMessage({ type: 'success', text: 'Donor profile information updated successfully.' });
        showToast('Donor profile updated successfully!', 'success');
        if (res.donor && setDonor) {
          setDonor({
            ...res.donor,
            name: formData.name,
            email: formData.email
          });
        }
      } else {
        setMessage({ type: 'error', text: res.message || 'Failed to update profile.' });
        showToast(res.message || 'Profile update failed', 'error');
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Server error occurred while saving profile changes.' });
      showToast('Connection error while saving', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
        <div className="card skeleton" style={{ height: '350px' }}></div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Header with Navigation */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <button onClick={() => navigate('/donor-dashboard')} className="btn btn-secondary btn-sm">
            <ArrowLeft size={16} /> Dashboard
          </button>
          <div>
            <h1 className="page-title">Donor Profile</h1>
            <p className="page-subtitle">Manage personal, contact, and blood group verification records</p>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        {message.text && (
          <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'} animate-fade-in`}>
            {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <div>{message.text}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Section: Blood Group Verification */}
          <div style={{ 
            background: 'var(--primary-light)', 
            border: '1px solid var(--primary-border)', 
            borderRadius: 'var(--radius-lg)', 
            padding: '1.25rem', 
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="blood-group-badge">
                {formData.blood_group}
              </div>
              <div>
                <div style={{ fontWeight: 800, color: 'var(--text-heading)', fontSize: '1.05rem' }}>
                  Blood Group: {formData.blood_group}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Active Biological Blood Classification
                </div>
              </div>
            </div>

            <div style={{ minWidth: '160px' }}>
              <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '0.2rem' }}>
                Change Blood Group:
              </label>
              <select 
                name="blood_group" 
                className="form-select"
                value={formData.blood_group}
                onChange={handleChange}
                style={{ background: 'white' }}
              >
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Section: Personal Information */}
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <User size={16} color="var(--primary)" /> Personal Information
          </h3>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="profile-name">
                Full Legal Name <span className="required-indicator">*</span>
              </label>
              <input 
                id="profile-name"
                type="text" 
                name="name"
                className="form-input" 
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profile-email">
                Email Address (Verified Account ID)
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  id="profile-email"
                  type="email" 
                  className="form-input" 
                  value={formData.email}
                  disabled
                  style={{ opacity: 0.75, cursor: 'not-allowed', background: 'var(--bg-subtle)' }}
                />
                <Lock size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
              <span className="form-help-text">Email address is permanently tied to medical login.</span>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="profile-phone">
                Primary Phone Number
              </label>
              <input 
                id="profile-phone"
                type="tel" 
                name="phone"
                className="form-input" 
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profile-dob">
                Date of Birth
              </label>
              <input 
                id="profile-dob"
                type="date" 
                name="date_of_birth"
                className="form-input" 
                value={formData.date_of_birth}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="profile-gender">
                Gender
              </label>
              <select 
                id="profile-gender"
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
              <label className="form-label" htmlFor="profile-address">
                Residential Street Address & City
              </label>
              <input 
                id="profile-address"
                type="text" 
                name="address"
                className="form-input" 
                placeholder="Apartment, Street, City, State"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button 
              type="button" 
              onClick={() => navigate('/donor-dashboard')} 
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={saving}
              style={{ minWidth: '170px' }}
            >
              {saving ? (
                <>
                  <span className="spinner"></span>
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save size={18} /> Save Profile Records
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
