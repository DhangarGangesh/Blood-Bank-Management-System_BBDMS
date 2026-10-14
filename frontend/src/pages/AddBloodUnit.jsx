import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { 
  PlusCircle, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  Droplet, 
  Calendar, 
  Layers, 
  ShieldCheck, 
  Clock, 
  Info 
} from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Standard Clinical Shelf Life in days
const COMPONENT_SHELF_LIFE = {
  'Whole Blood': 35,
  'RBC': 42,
  'Plasma': 365,
  'Platelets': 5
};

export default function AddBloodUnit() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const todayStr = new Date().toISOString().split('T')[0];

  const calculateExpiry = (colDateStr, component) => {
    try {
      const col = new Date(colDateStr);
      const days = COMPONENT_SHELF_LIFE[component] || 35;
      col.setDate(col.getDate() + days);
      return col.toISOString().split('T')[0];
    } catch (e) {
      return '';
    }
  };

  const [formData, setFormData] = useState({
    blood_group: 'O+',
    component_type: 'Whole Blood',
    collection_date: todayStr,
    expiry_date: calculateExpiry(todayStr, 'Whole Blood'),
    status: 'Available',
    quantity: 1
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleComponentChange = (comp) => {
    const newExpiry = calculateExpiry(formData.collection_date, comp);
    setFormData(prev => ({
      ...prev,
      component_type: comp,
      expiry_date: newExpiry
    }));
  };

  const handleCollectionDateChange = (date) => {
    const newExpiry = calculateExpiry(date, formData.component_type);
    setFormData(prev => ({
      ...prev,
      collection_date: date,
      expiry_date: newExpiry
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Date validations
    const colDate = new Date(formData.collection_date);
    const expDate = new Date(formData.expiry_date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (colDate > today) {
      setError('Collection date cannot be in the future.');
      return;
    }

    if (expDate <= colDate) {
      setError('Expiry date must be after the collection date.');
      return;
    }

    if (parseInt(formData.quantity) < 1) {
      setError('Quantity must be at least 1 unit.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.addBloodUnit(formData);
      if (res.success) {
        showToast(`Successfully registered ${formData.quantity} unit(s) of ${formData.blood_group} ${formData.component_type}!`, 'success');
        navigate('/inventory');
      } else {
        setError(res.message || 'Failed to add blood unit to inventory.');
      }
    } catch (err) {
      setError('Connection error while communicating with hospital database.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '750px', margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <button onClick={() => navigate('/inventory')} className="btn btn-secondary btn-sm">
            <ArrowLeft size={16} /> Inventory
          </button>
          <div>
            <h1 className="page-title">Add Blood Unit</h1>
            <p className="page-subtitle">Register newly collected blood bags or clinical component fractions into active stock</p>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <div className="card-header" style={{ marginBottom: '1.5rem', paddingBottom: '0.75rem' }}>
          <span className="card-title">
            <PlusCircle size={20} /> Blood Bag Registration Details
          </span>
          <span className="badge badge-green">
            <ShieldCheck size={12} /> Quality Control Standard
          </span>
        </div>

        {error && (
          <div className="alert alert-error animate-fade-in">
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* 1. Blood Group Selection */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ marginBottom: '0.65rem' }}>
              Blood Group & Rh Type <span className="required-indicator">*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem' }}>
              {BLOOD_GROUPS.map((bg) => {
                const isSelected = formData.blood_group === bg;
                return (
                  <button
                    key={bg}
                    type="button"
                    onClick={() => setFormData({ ...formData, blood_group: bg })}
                    style={{
                      padding: '0.75rem 0.5rem',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-default)',
                      backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--bg-surface)',
                      color: isSelected ? 'var(--primary)' : 'var(--text-heading)',
                      fontWeight: 800,
                      fontSize: '1.1rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
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

          {/* 2. Component Type Selection */}
          <div className="form-group">
            <label className="form-label">
              Component Type <span className="required-indicator">*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.65rem' }}>
              {Object.keys(COMPONENT_SHELF_LIFE).map((comp) => {
                const isSelected = formData.component_type === comp;
                const shelfLife = COMPONENT_SHELF_LIFE[comp];
                return (
                  <div
                    key={comp}
                    onClick={() => handleComponentChange(comp)}
                    style={{
                      padding: '0.85rem',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                      backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--bg-subtle)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: isSelected ? 'var(--primary)' : 'var(--text-heading)' }}>
                      {comp}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Shelf life: ~{shelfLife} days
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Dates with Smart Expiry Calculation */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="col-date">
                Collection Date <span className="required-indicator">*</span>
              </label>
              <input 
                id="col-date"
                type="date" 
                name="collection_date"
                className="form-input"
                value={formData.collection_date}
                max={todayStr}
                onChange={(e) => handleCollectionDateChange(e.target.value)}
                required
              />
              <span className="form-help-text">Date phlebotomy was performed</span>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                <label className="form-label" htmlFor="exp-date" style={{ marginBottom: 0 }}>
                  Expiry Date <span className="required-indicator">*</span>
                </label>
                <span className="badge badge-gray" style={{ fontSize: '0.68rem' }}>
                  Auto-calculated ({COMPONENT_SHELF_LIFE[formData.component_type]} days)
                </span>
              </div>
              <input 
                id="exp-date"
                type="date" 
                name="expiry_date"
                className="form-input"
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                required
              />
              <span className="form-help-text">Can be customized per laboratory regulations</span>
            </div>
          </div>

          {/* 4. Status and Quantity */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="unit-status">
                Initial Storage Status
              </label>
              <select 
                id="unit-status"
                name="status" 
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Available">Available (Cleared for Transfusion)</option>
                <option value="Reserved">Reserved (Assigned to Patient)</option>
                <option value="Quarantine">Quarantine (Pending Serology Testing)</option>
                <option value="Expired">Expired</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="unit-qty">
                Quantity of Bags (Units) <span className="required-indicator">*</span>
              </label>
              <input 
                id="unit-qty"
                type="number" 
                min="1"
                max="100"
                name="quantity"
                className="form-input"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                required
              />
              <span className="form-help-text">Standard bag volume is 350ml or 450ml</span>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button 
              type="button" 
              onClick={() => navigate('/inventory')} 
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
              style={{ minWidth: '190px' }}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  <span>Registering Unit...</span>
                </>
              ) : (
                <>
                  <PlusCircle size={18} /> Register Unit to Stock
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
