import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Heart, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight, 
  ClipboardList, 
  Award, 
  Activity, 
  Sparkles,
  Droplet,
  Info,
  Clock,
  CheckCircle2
} from 'lucide-react';

// Blood Group Transfusion Compatibility Matrix
const COMPATIBILITY_MAP = {
  'O-': {
    canDonateTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    canReceiveFrom: ['O-'],
    role: 'Universal Red Blood Cell Donor'
  },
  'O+': {
    canDonateTo: ['O+', 'A+', 'B+', 'AB+'],
    canReceiveFrom: ['O+', 'O-'],
    role: 'Most Needed Hospital Donor'
  },
  'A-': {
    canDonateTo: ['A-', 'A+', 'AB-', 'AB+'],
    canReceiveFrom: ['A-', 'O-'],
    role: 'Specialized Platelet & RBC Donor'
  },
  'A+': {
    canDonateTo: ['A+', 'AB+'],
    canReceiveFrom: ['A+', 'A-', 'O+', 'O-'],
    role: 'High Demand Blood Group'
  },
  'B-': {
    canDonateTo: ['B-', 'B+', 'AB-', 'AB+'],
    canReceiveFrom: ['B-', 'O-'],
    role: 'Rare Donor Group'
  },
  'B+': {
    canDonateTo: ['B+', 'AB+'],
    canReceiveFrom: ['B+', 'B-', 'O+', 'O-'],
    role: 'Critical Surgery Blood Group'
  },
  'AB-': {
    canDonateTo: ['AB-', 'AB+'],
    canReceiveFrom: ['AB-', 'A-', 'B-', 'O-'],
    role: 'Rare Plasma & Platelet Donor'
  },
  'AB+': {
    canDonateTo: ['AB+'],
    canReceiveFrom: ['Everyone (Universal Recipient)'],
    role: 'Universal Plasma Donor & Recipient'
  }
};

export default function DonorDashboard({ user, donor, setDonor }) {
  const [donorData, setDonorData] = useState(donor || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const idToFetch = donor ? donor.id : user.id;
        try {
          const res = await api.getDonor(idToFetch);
          if (res.success && res.donor) {
            setDonorData(res.donor);
            if (setDonor) setDonor(res.donor);
          }
        } catch (err) {
          console.error('Failed to load donor dashboard profile:', err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  if (loading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
        <div className="card skeleton" style={{ height: '140px', marginBottom: '1.5rem' }}></div>
        <div className="stats-grid">
          <div className="card skeleton" style={{ height: '100px' }}></div>
          <div className="card skeleton" style={{ height: '100px' }}></div>
          <div className="card skeleton" style={{ height: '100px' }}></div>
          <div className="card skeleton" style={{ height: '100px' }}></div>
        </div>
      </div>
    );
  }

  const isEligible = donorData?.eligibility_status === 'Eligible';
  const bloodGroup = donorData?.blood_group || 'O+';
  const compatibility = COMPATIBILITY_MAP[bloodGroup] || COMPATIBILITY_MAP['O+'];

  // Days since last donation calculation
  let daysSinceLastDonation = null;
  let nextEligibleDate = null;
  if (donorData?.last_donation_date) {
    const lastDate = new Date(donorData.last_donation_date);
    const diffTime = Math.abs(new Date() - lastDate);
    daysSinceLastDonation = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // 90 days interval
    const nextDateObj = new Date(lastDate);
    nextDateObj.setDate(nextDateObj.getDate() + 90);
    nextEligibleDate = nextDateObj;
  }

  const pastScreenings = donorData?.screenings || [];

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      {/* 1. Hospital Donor Hero Banner */}
      <div className="card" style={{ 
        marginBottom: '1.75rem', 
        padding: '1.75rem 2rem',
        background: 'linear-gradient(135deg, #ffffff 0%, #fef2f2 100%)',
        borderColor: 'var(--primary-border)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div className="blood-group-badge blood-group-badge-lg">
              {bloodGroup}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-heading)', letterSpacing: '-0.5px' }}>
                  {donorData?.name || user?.name}
                </h1>
                <span className={`badge ${isEligible ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '0.78rem' }}>
                  {isEligible ? <ShieldCheck size={14} /> : <AlertTriangle size={14} />}
                  {donorData?.eligibility_status || 'Eligible'}
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '0.2rem' }}>
                Donor ID: <strong style={{ color: 'var(--text-heading)' }}>#DONOR-00{donorData?.id || 1}</strong> • {compatibility.role}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/screening" className="btn btn-primary">
              <ClipboardList size={18} /> Take Health Screening
            </Link>
            <Link to="/profile" className="btn btn-secondary">
              <User size={18} /> Edit Profile
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="stats-grid">
        {/* Card 1: Eligibility Status */}
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Eligibility Status</span>
            <div className="stat-icon-wrapper" style={{ 
              background: isEligible ? 'var(--status-green-bg)' : 'var(--status-red-bg)', 
              color: isEligible ? 'var(--status-green)' : 'var(--status-red)' 
            }}>
              {isEligible ? <ShieldCheck size={20} /> : <AlertTriangle size={20} />}
            </div>
          </div>
          <div className="stat-value" style={{ 
            fontSize: '1.45rem', 
            color: isEligible ? 'var(--status-green-text)' : 'var(--status-red-text)' 
          }}>
            {donorData?.eligibility_status || 'Eligible'}
          </div>
          <div className="stat-footer">
            {isEligible ? 'Cleared for blood donation' : 'Review health screening answers'}
          </div>
        </div>

        {/* Card 2: Blood Type & Classification */}
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Blood Group</span>
            <div className="stat-icon-wrapper" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
              <Droplet size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: 'var(--primary)' }}>
            {bloodGroup}
          </div>
          <div className="stat-footer">
            {bloodGroup.includes('+') ? 'Rh Positive (Rh+)' : 'Rh Negative (Rh-)'}
          </div>
        </div>

        {/* Card 3: Last Donation Date */}
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Last Donation</span>
            <div className="stat-icon-wrapper" style={{ background: 'var(--status-blue-bg)', color: 'var(--status-blue)' }}>
              <Calendar size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ fontSize: '1.3rem' }}>
            {donorData?.last_donation_date 
              ? new Date(donorData.last_donation_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : 'None on record'}
          </div>
          <div className="stat-footer">
            {daysSinceLastDonation !== null ? `${daysSinceLastDonation} days elapsed` : 'Ready for first donation'}
          </div>
        </div>

        {/* Card 4: Estimated Impact */}
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Life Impact</span>
            <div className="stat-icon-wrapper" style={{ background: '#fef3c7', color: '#d97706' }}>
              <Sparkles size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#d97706' }}>
            {donorData?.last_donation_date ? '3+ Lives' : 'Ready to Save'}
          </div>
          <div className="stat-footer">
            1 whole blood bag saves up to 3 patients
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.75rem' }}>
        {/* Left Column: Blood Transfusion Compatibility Guide */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <Heart size={20} /> Transfusion Compatibility for {bloodGroup}
            </span>
            <span className="badge badge-blue">
              <Info size={12} /> Clinical Guidance
            </span>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Understanding biological compatibility ensures optimal emergency blood matches for pediatric, surgery, and trauma patients.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Can Donate To */}
            <div style={{ 
              background: 'var(--status-green-bg)', 
              border: '1px solid var(--status-green-border)', 
              borderRadius: 'var(--radius-md)', 
              padding: '1rem' 
            }}>
              <div style={{ fontWeight: 700, color: 'var(--status-green-text)', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={16} /> You Can Donate Blood To:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {compatibility.canDonateTo.map((group) => (
                  <span key={group} style={{ 
                    padding: '0.2rem 0.6rem', 
                    background: 'white', 
                    borderRadius: 'var(--radius-sm)', 
                    fontWeight: 800, 
                    fontSize: '0.9rem', 
                    color: 'var(--status-green-text)',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}>
                    {group}
                  </span>
                ))}
              </div>
            </div>

            {/* Can Receive From */}
            <div style={{ 
              background: 'var(--status-blue-bg)', 
              border: '1px solid var(--status-blue-border)', 
              borderRadius: 'var(--radius-md)', 
              padding: '1rem' 
            }}>
              <div style={{ fontWeight: 700, color: 'var(--status-blue-text)', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Droplet size={16} /> You Can Safely Receive From:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {compatibility.canReceiveFrom.map((group) => (
                  <span key={group} style={{ 
                    padding: '0.2rem 0.6rem', 
                    background: 'white', 
                    borderRadius: 'var(--radius-sm)', 
                    fontWeight: 800, 
                    fontSize: '0.9rem', 
                    color: 'var(--status-blue-text)',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}>
                    {group}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              Next recommended donation cycle:
            </span>
            <span style={{ fontWeight: 700, color: 'var(--text-heading)' }}>
              {nextEligibleDate 
                ? nextEligibleDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                : 'Eligible Today'}
            </span>
          </div>
        </div>

        {/* Right Column: Verified Personal & Contact Details */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <User size={18} /> Verified Donor Details
            </span>
            <Link to="/profile" className="btn btn-secondary btn-sm">
              Edit
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Mail size={16} color="var(--primary)" />
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email Address</div>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {donorData?.email || user?.email}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Phone size={16} color="var(--primary)" />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Contact Phone</div>
                <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                  {donorData?.phone || 'Not provided'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Calendar size={16} color="var(--primary)" />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Date of Birth / Gender</div>
                <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                  {donorData?.date_of_birth ? new Date(donorData.date_of_birth).toLocaleDateString() : 'N/A'} • {donorData?.gender || 'N/A'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <MapPin size={16} color="var(--primary)" />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Residential Address</div>
                <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                  {donorData?.address || 'Not specified'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Recent Health Screenings History Table */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <div className="card-header">
          <span className="card-title">
            <ClipboardList size={18} /> Health Screening History ({pastScreenings.length})
          </span>
          <Link to="/screening" className="btn btn-outline-primary btn-sm">
            New Screening Assessment
          </Link>
        </div>

        {pastScreenings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
            <ClipboardList size={36} color="var(--text-light)" style={{ marginBottom: '0.5rem' }} />
            <p style={{ fontWeight: 600 }}>No health screening submissions on record yet.</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Complete the rule-based screening to establish your active donation eligibility.
            </p>
            <Link to="/screening" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
              Start Screening Now
            </Link>
          </div>
        ) : (
          <div className="table-container" style={{ margin: 0, border: 'none', boxShadow: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Age Recorded</th>
                  <th>Body Weight</th>
                  <th>Recent Illness</th>
                  <th>Current Medication</th>
                  <th>Eligibility Outcome</th>
                </tr>
              </thead>
              <tbody>
                {pastScreenings.map((sc) => (
                  <tr key={sc.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>
                        {new Date(sc.screening_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        {new Date(sc.screening_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td>{sc.age} yrs</td>
                    <td style={{ fontWeight: 600 }}>{sc.weight} kg</td>
                    <td>{sc.recent_illness || 'None'}</td>
                    <td>{sc.medication || 'None'}</td>
                    <td>
                      <span className={`badge ${sc.eligible ? 'badge-green' : 'badge-red'}`}>
                        {sc.eligible ? <ShieldCheck size={12} /> : <AlertTriangle size={12} />}
                        {sc.eligible ? 'Eligible' : 'Not Eligible'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Pre-Donation Clinical Preparation Guide */}
      <div className="card" style={{ background: '#f8fafc', borderColor: 'var(--border-light)' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={18} color="var(--primary)" /> Pre-Donation Safety Checklist
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div style={{ background: 'white', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--primary)', marginBottom: '0.2rem' }}>1. Hydration</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Drink 500ml extra water or juice before arrival.</div>
          </div>
          <div style={{ background: 'white', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--primary)', marginBottom: '0.2rem' }}>2. Nourishing Meal</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Eat a healthy, iron-rich meal 2–3 hours prior. Avoid fatty foods.</div>
          </div>
          <div style={{ background: 'white', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--primary)', marginBottom: '0.2rem' }}>3. Sound Rest</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ensure 7–8 hours of restful sleep the preceding night.</div>
          </div>
          <div style={{ background: 'white', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--primary)', marginBottom: '0.2rem' }}>4. Identification</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Bring a valid government-issued photo ID to the donation center.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
