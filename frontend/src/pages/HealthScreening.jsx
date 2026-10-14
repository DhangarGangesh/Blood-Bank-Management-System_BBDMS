import React, { useState } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { 
  ClipboardList, 
  ShieldCheck, 
  AlertOctagon, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft, 
  AlertTriangle,
  Info, 
  Scale, 
  Clock, 
  Pill, 
  Activity,
  HeartPulse
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HealthScreening({ user, donor, setDonor }) {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    age: '28',
    weight: '65',
    recent_illness: 'None',
    medication: 'None',
    recent_donation: '6 months ago'
  });

  const [hasIllness, setHasIllness] = useState('no');
  const [hasMedication, setHasMedication] = useState('no');
  const [illnessDetail, setIllnessDetail] = useState('');
  const [medicationDetail, setMedicationDetail] = useState('');

  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleIllnessToggle = (choice) => {
    setHasIllness(choice);
    if (choice === 'no') {
      handleInputChange('recent_illness', 'None');
    } else {
      handleInputChange('recent_illness', illnessDetail || 'Mild Fever');
    }
  };

  const handleMedicationToggle = (choice) => {
    setHasMedication(choice);
    if (choice === 'no') {
      handleInputChange('medication', 'None');
    } else {
      handleInputChange('medication', medicationDetail || 'Antibiotics');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setResult(null);

    const donorId = donor ? donor.id : (user ? user.id : 1);

    const payload = {
      age: formData.age,
      weight: formData.weight,
      recent_illness: hasIllness === 'yes' ? (illnessDetail || 'Recent illness reported') : 'None',
      medication: hasMedication === 'yes' ? (medicationDetail || 'Active medication reported') : 'None',
      recent_donation: formData.recent_donation || 'None'
    };

    try {
      const res = await api.submitScreening(donorId, payload);
      if (res.success) {
        setResult(res);
        if (res.eligible) {
          showToast('Health Screening Passed! You are eligible to donate.', 'success');
        } else {
          showToast('Screening completed. You are temporarily restricted.', 'warning');
        }
        if (setDonor && donor) {
          setDonor({ ...donor, eligibility_status: res.eligibilityStatus });
        }
      } else {
        setError(res.message || 'Screening submission failed');
      }
    } catch (err) {
      setError('Failed to submit screening. Please check server connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <button onClick={() => navigate('/donor-dashboard')} className="btn btn-secondary btn-sm">
            <ArrowLeft size={16} /> Dashboard
          </button>
          <div>
            <h1 className="page-title">Donor Health Screening</h1>
            <p className="page-subtitle">Rule-based preliminary clinical triage questionnaire for blood safety</p>
          </div>
        </div>
      </div>

      {/* Result Card Banner */}
      {result && (
        <div 
          className="card animate-slide-in" 
          style={{ 
            marginBottom: '1.75rem', 
            border: `2px solid ${result.eligible ? 'var(--status-green)' : 'var(--status-amber)'}`,
            background: result.eligible ? 'var(--status-green-bg)' : 'var(--status-amber-bg)',
            padding: '1.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: 'var(--radius-md)', 
              background: result.eligible ? 'var(--status-green)' : 'var(--status-amber)', 
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {result.eligible ? <CheckCircle2 size={30} /> : <AlertTriangle size={30} />}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: result.eligible ? 'var(--status-green-text)' : 'var(--status-amber-text)' }}>
                  Screening Outcome: {result.eligible ? 'ELIGIBLE TO DONATE' : 'TEMPORARILY RESTRICTED'}
                </h2>
                <span className={`badge ${result.eligible ? 'badge-green' : 'badge-yellow'}`}>
                  {result.eligibilityStatus}
                </span>
              </div>

              <p style={{ color: 'var(--text-heading)', marginTop: '0.4rem', fontSize: '0.94rem', lineHeight: '1.5' }}>
                {result.eligible 
                  ? 'Congratulations! You meet all established clinical parameters (Age: 18–65, Weight ≥ 50kg, no active infection, and no conflicting medications). You are fully cleared to donate.' 
                  : 'Based on clinical safety guidelines, one or more answers (underweight, young/senior age, recent illness, or active medications) requires a temporary deferral to protect your health and transfusion safety.'}
              </p>

              {/* Guidance Box */}
              <div style={{ 
                marginTop: '1rem', 
                padding: '0.85rem 1rem', 
                background: 'rgba(255, 255, 255, 0.85)', 
                borderRadius: 'var(--radius-md)', 
                border: '1px solid rgba(0,0,0,0.06)' 
              }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-heading)', marginBottom: '0.25rem' }}>
                  Clinical Recommendations:
                </div>
                {result.eligible ? (
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.84rem', color: 'var(--text-body)', lineHeight: '1.6' }}>
                    <li>You can now visit any accredited blood bank center or scheduled mobile blood drive.</li>
                    <li>Ensure you drink 500ml of fluids and avoid intense physical exertion prior to donation.</li>
                    <li>Your donor profile status is officially updated as <strong>Eligible</strong> across all hospital records.</li>
                  </ul>
                ) : (
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.84rem', color: 'var(--text-body)', lineHeight: '1.6' }}>
                    <li><strong>Medication / Illness:</strong> If you are on antibiotics or recovering from an illness, please wait at least 14 days after completing your treatment before re-screening.</li>
                    <li><strong>Weight Requirements:</strong> Donors must be at least 50 kg to ensure adequate circulating blood volume safety.</li>
                    <li>You can retake this screening questionnaire at any time when your health condition changes.</li>
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Questionnaire Card */}
      <div className="card" style={{ padding: '2rem' }}>
        <div className="card-header" style={{ marginBottom: '1.5rem', paddingBottom: '0.75rem' }}>
          <span className="card-title">
            <HeartPulse size={20} /> Pre-Donation Clinical Triage
          </span>
          <span className="badge badge-blue">
            <Info size={12} /> Hospital Rule Engine
          </span>
        </div>

        {error && (
          <div className="alert alert-error animate-fade-in">
            <AlertOctagon size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Question 1: Age */}
          <div className="form-group" style={{ 
            background: 'var(--bg-subtle)', 
            padding: '1.15rem', 
            borderRadius: 'var(--radius-md)', 
            border: '1px solid var(--border-light)',
            marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className="form-label" style={{ marginBottom: 0, fontSize: '0.92rem' }}>
                1. What is your current age? <span className="required-indicator">*</span>
              </label>
              <span className="badge badge-gray">Required: 18 – 65 years</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <input 
                type="number" 
                min="10" 
                max="100" 
                className="form-input" 
                style={{ width: '120px', background: 'white' }}
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                required
              />
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Years Old</span>
            </div>
            <div className="form-help-text" style={{ marginTop: '0.45rem' }}>
              Standard transfusion protocols require all voluntary donors to be within 18 and 65 years old.
            </div>
          </div>

          {/* Question 2: Weight */}
          <div className="form-group" style={{ 
            background: 'var(--bg-subtle)', 
            padding: '1.15rem', 
            borderRadius: 'var(--radius-md)', 
            border: '1px solid var(--border-light)',
            marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className="form-label" style={{ marginBottom: 0, fontSize: '0.92rem' }}>
                2. What is your current body weight (in kg)? <span className="required-indicator">*</span>
              </label>
              <span className="badge badge-gray">Required: Minimum 50.0 kg</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <input 
                type="number" 
                step="0.5" 
                min="30" 
                max="200" 
                className="form-input" 
                style={{ width: '120px', background: 'white' }}
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                required
              />
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Kilograms (kg)</span>
            </div>
            <div className="form-help-text" style={{ marginTop: '0.45rem' }}>
              Blood volume is proportional to weight; donating 350-450ml is only clinically safe for donors weighing 50kg or above.
            </div>
          </div>

          {/* Question 3: Recent Illness */}
          <div className="form-group" style={{ 
            background: 'var(--bg-subtle)', 
            padding: '1.15rem', 
            borderRadius: 'var(--radius-md)', 
            border: '1px solid var(--border-light)',
            marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className="form-label" style={{ marginBottom: 0, fontSize: '0.92rem' }}>
                3. Have you experienced any fever, viral cold, or infections in the past 14 days? <span className="required-indicator">*</span>
              </label>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', marginBottom: hasIllness === 'yes' ? '0.75rem' : '0' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.45rem', 
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.92rem'
              }}>
                <input 
                  type="radio" 
                  name="illness-opt" 
                  checked={hasIllness === 'no'} 
                  onChange={() => handleIllnessToggle('no')} 
                />
                No, completely healthy (None)
              </label>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.45rem', 
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.92rem'
              }}>
                <input 
                  type="radio" 
                  name="illness-opt" 
                  checked={hasIllness === 'yes'} 
                  onChange={() => handleIllnessToggle('yes')} 
                />
                Yes, experienced recent infection/illness
              </label>
            </div>

            {hasIllness === 'yes' && (
              <div className="animate-fade-in" style={{ marginTop: '0.75rem' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ background: 'white' }}
                  placeholder="Specify illness (e.g. Cold, Fever, Viral sore throat)"
                  value={illnessDetail}
                  onChange={(e) => {
                    setIllnessDetail(e.target.value);
                    handleInputChange('recent_illness', e.target.value);
                  }}
                  required={hasIllness === 'yes'}
                />
              </div>
            )}
            <div className="form-help-text" style={{ marginTop: '0.45rem' }}>
              To safeguard recipients against infectious pathogens, donors must be symptom-free for at least 14 days.
            </div>
          </div>

          {/* Question 4: Current Medications */}
          <div className="form-group" style={{ 
            background: 'var(--bg-subtle)', 
            padding: '1.15rem', 
            borderRadius: 'var(--radius-md)', 
            border: '1px solid var(--border-light)',
            marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className="form-label" style={{ marginBottom: 0, fontSize: '0.92rem' }}>
                4. Are you currently taking any prescription antibiotics, blood thinners, or active medication? <span className="required-indicator">*</span>
              </label>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', marginBottom: hasMedication === 'yes' ? '0.75rem' : '0' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.45rem', 
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.92rem'
              }}>
                <input 
                  type="radio" 
                  name="med-opt" 
                  checked={hasMedication === 'no'} 
                  onChange={() => handleMedicationToggle('no')} 
                />
                No active medications (None)
              </label>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.45rem', 
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.92rem'
              }}>
                <input 
                  type="radio" 
                  name="med-opt" 
                  checked={hasMedication === 'yes'} 
                  onChange={() => handleMedicationToggle('yes')} 
                />
                Yes, currently taking medication
              </label>
            </div>

            {hasMedication === 'yes' && (
              <div className="animate-fade-in" style={{ marginTop: '0.75rem' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ background: 'white' }}
                  placeholder="Specify medication name (e.g. Amoxicillin, Ibuprofen, Aspirin)"
                  value={medicationDetail}
                  onChange={(e) => {
                    setMedicationDetail(e.target.value);
                    handleInputChange('medication', e.target.value);
                  }}
                  required={hasMedication === 'yes'}
                />
              </div>
            )}
            <div className="form-help-text" style={{ marginTop: '0.45rem' }}>
              Certain medications affect blood clotting or can be harmful if transfused to pregnant women or newborn infants.
            </div>
          </div>

          {/* Question 5: Previous Donation */}
          <div className="form-group" style={{ 
            background: 'var(--bg-subtle)', 
            padding: '1.15rem', 
            borderRadius: 'var(--radius-md)', 
            border: '1px solid var(--border-light)',
            marginBottom: '1.75rem'
          }}>
            <label className="form-label" style={{ fontSize: '0.92rem' }}>
              5. When did you last donate blood or platelets?
            </label>
            <select 
              className="form-select" 
              style={{ background: 'white' }}
              value={formData.recent_donation}
              onChange={(e) => handleInputChange('recent_donation', e.target.value)}
            >
              <option value="First time donor">First time donor (Never donated before)</option>
              <option value="Over 6 months ago">Over 6 months ago</option>
              <option value="3 to 6 months ago">3 to 6 months ago</option>
              <option value="1 to 3 months ago">1 to 3 months ago</option>
              <option value="Within last 30 days">Within the last 30 days</option>
            </select>
            <div className="form-help-text" style={{ marginTop: '0.45rem' }}>
              Minimum recovery interval is 90 days (12 weeks) for whole blood to allow full red cell regeneration.
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button 
              type="button" 
              onClick={() => navigate('/donor-dashboard')} 
              className="btn btn-secondary"
            >
              Back to Dashboard
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={submitting}
              style={{ minWidth: '220px' }}
            >
              {submitting ? (
                <>
                  <span className="spinner"></span>
                  <span>Evaluating Clinical Triage...</span>
                </>
              ) : (
                <>
                  <ClipboardList size={18} /> Submit Health Screening
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
