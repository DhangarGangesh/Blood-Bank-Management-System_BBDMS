import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { 
  Users, 
  Search, 
  Filter, 
  ShieldCheck, 
  AlertTriangle, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Heart, 
  Eye, 
  X, 
  CheckCircle2, 
  Printer, 
  ChevronLeft, 
  ChevronRight,
  ClipboardList
} from 'lucide-react';

const ALL_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const ITEMS_PER_PAGE = 8;

export default function DonorDirectory() {
  const { showToast } = useToast();
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('');
  const [eligibilityFilter, setEligibilityFilter] = useState('');

  // Selected donor for modal inspection
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [donorDetailsLoading, setDonorDetailsLoading] = useState(false);
  const [fullDonorData, setFullDonorData] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  const fetchDonors = async () => {
    setLoading(true);
    try {
      const res = await api.getAllDonors();
      if (res.success) {
        setDonors(res.donors || []);
      }
    } catch (err) {
      console.error('Failed to load donors directory:', err);
      showToast('Error loading donor directory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  const handleInspectDonor = async (donorItem) => {
    setSelectedDonor(donorItem);
    setDonorDetailsLoading(true);
    setFullDonorData(null);

    try {
      const res = await api.getDonor(donorItem.id);
      if (res.success && res.donor) {
        setFullDonorData(res.donor);
      }
    } catch (err) {
      showToast('Could not fetch detailed donor screening history', 'error');
    } finally {
      setDonorDetailsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedDonor(null);
    setFullDonorData(null);
  };

  const stats = useMemo(() => {
    const total = donors.length;
    const eligibleCount = donors.filter(d => d.eligibility_status === 'Eligible').length;
    const ineligibleCount = total - eligibleCount;
    return { total, eligibleCount, ineligibleCount };
  }, [donors]);

  const filteredDonors = useMemo(() => {
    return donors.filter(d => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        (d.name && d.name.toLowerCase().includes(q)) ||
        (d.email && d.email.toLowerCase().includes(q)) ||
        (d.phone && d.phone.toLowerCase().includes(q)) ||
        (d.address && d.address.toLowerCase().includes(q));

      const matchesGroup = !bloodGroupFilter || (d.blood_group === bloodGroupFilter);
      const matchesEligibility = !eligibilityFilter || (d.eligibility_status === eligibilityFilter);

      return matchesSearch && matchesGroup && matchesEligibility;
    });
  }, [donors, searchQuery, bloodGroupFilter, eligibilityFilter]);

  const totalPages = Math.ceil(filteredDonors.length / ITEMS_PER_PAGE) || 1;
  const paginatedDonors = filteredDonors.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const getInitials = (name) => {
    if (!name) return 'D';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div style={{ maxWidth: '1380px', margin: '0 auto' }}>
      {/* 1. Header with Hospital Oversight Badges */}
      <div className="page-header">
        <div className="page-header-text">
          <h1 className="page-title">Donor Directory Oversight</h1>
          <p className="page-subtitle">Authorized hospital medical staff oversight of donor records, biological groups, and screening evaluations</p>
        </div>

        <div className="page-actions">
          <button 
            onClick={() => window.print()} 
            className="btn btn-secondary btn-sm"
            title="Print or export donor directory"
          >
            <Printer size={16} /> Print Records
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Total Donors</span>
            <div className="stat-icon-wrapper" style={{ background: '#f1f5f9', color: '#0f172a' }}>
              <Users size={18} />
            </div>
          </div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-footer">Enrolled across hospital network</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Eligible Donors</span>
            <div className="stat-icon-wrapper" style={{ background: 'var(--status-green-bg)', color: 'var(--status-green)' }}>
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="stat-value" style={{ color: 'var(--status-green)' }}>{stats.eligibleCount}</div>
          <div className="stat-footer">Passed clinical screening parameters</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Temporarily Restricted</span>
            <div className="stat-icon-wrapper" style={{ background: 'var(--status-amber-bg)', color: 'var(--status-amber)' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="stat-value" style={{ color: 'var(--status-amber)' }}>{stats.ineligibleCount}</div>
          <div className="stat-footer">Due to illness, medications, or weight</div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div className="form-row" style={{ gridTemplateColumns: '2fr 1fr 1fr auto', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search by donor name, email, phone, city..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              style={{ paddingLeft: '36px' }}
            />
          </div>

          <div>
            <select 
              className="form-select"
              value={bloodGroupFilter}
              onChange={(e) => { setBloodGroupFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="">All Blood Groups</option>
              {ALL_BLOOD_GROUPS.map((bg) => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>

          <div>
            <select 
              className="form-select"
              value={eligibilityFilter}
              onChange={(e) => { setEligibilityFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="">All Statuses</option>
              <option value="Eligible">Eligible Donors</option>
              <option value="Not Eligible">Not Eligible / Restricted</option>
            </select>
          </div>

          {(searchQuery || bloodGroupFilter || eligibilityFilter) && (
            <button 
              onClick={() => {
                setSearchQuery('');
                setBloodGroupFilter('');
                setEligibilityFilter('');
                setCurrentPage(1);
              }}
              className="btn btn-secondary btn-sm"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* 4. Donors Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Donor ID</th>
              <th>Donor Name & Gender</th>
              <th>Blood Group</th>
              <th>Eligibility Status</th>
              <th>Contact Details</th>
              <th>Date of Birth</th>
              <th>Last Donation Date</th>
              <th style={{ textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem' }}>
                  <div className="spinner" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent', width: '28px', height: '28px' }}></div>
                  <div style={{ marginTop: '0.75rem', color: 'var(--text-muted)' }}>Loading Donor Directory...</div>
                </td>
              </tr>
            ) : paginatedDonors.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No registered donors found matching current criteria.
                </td>
              </tr>
            ) : (
              paginatedDonors.map((d) => {
                const isEligible = d.eligibility_status === 'Eligible';
                return (
                  <tr key={d.id}>
                    <td style={{ fontWeight: 700 }}>#DONOR-00{d.id}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div className="user-avatar-initials" style={{ background: 'var(--bg-subtle-hover)', color: 'var(--text-heading)', fontWeight: 800 }}>
                          {getInitials(d.name)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-heading)' }}>{d.name}</div>
                          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{d.gender || 'Not specified'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="blood-group-badge blood-group-badge-sm">
                        {d.blood_group}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${isEligible ? 'badge-green' : 'badge-red'}`}>
                        {isEligible ? <ShieldCheck size={12} /> : <AlertTriangle size={12} />}
                        {d.eligibility_status || 'Eligible'}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{d.phone || 'No phone'}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{d.email}</div>
                    </td>
                    <td>
                      {d.date_of_birth ? new Date(d.date_of_birth).toLocaleDateString() : 'N/A'}
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {d.last_donation_date 
                        ? new Date(d.last_donation_date).toLocaleDateString()
                        : <span style={{ color: 'var(--text-muted)' }}>None recorded</span>}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        onClick={() => handleInspectDonor(d)}
                        className="btn btn-secondary btn-sm"
                        title="View Full Medical & Screening Profile"
                      >
                        <Eye size={14} /> Inspect
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination Bar */}
        {filteredDonors.length > 0 && (
          <div className="pagination-bar">
            <div>
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredDonors.length)} of {filteredDonors.length} donors
            </div>
            <div className="pagination-controls">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="btn btn-secondary btn-sm"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <span style={{ padding: '0 0.5rem', fontWeight: 600 }}>
                Page {currentPage} of {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="btn btn-secondary btn-sm"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. Donor Inspection Modal */}
      {selectedDonor && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content animate-slide-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span className="blood-group-badge blood-group-badge-sm">
                  {selectedDonor.blood_group}
                </span>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                    {selectedDonor.name}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Donor Record #DONOR-00{selectedDonor.id}
                  </div>
                </div>
              </div>
              <button onClick={handleCloseModal} className="btn btn-secondary btn-sm btn-icon-only">
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {donorDetailsLoading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <div className="spinner" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }}></div>
                  <div style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>Fetching complete clinical file...</div>
                </div>
              ) : (
                <div>
                  {/* Summary Profile Grid */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '1rem', 
                    background: 'var(--bg-subtle)', 
                    padding: '1.25rem', 
                    borderRadius: 'var(--radius-md)', 
                    marginBottom: '1.5rem',
                    border: '1px solid var(--border-light)'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Eligibility Status</div>
                      <div style={{ marginTop: '0.2rem' }}>
                        <span className={`badge ${selectedDonor.eligibility_status === 'Eligible' ? 'badge-green' : 'badge-red'}`}>
                          {selectedDonor.eligibility_status || 'Eligible'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Blood Group</div>
                      <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}>
                        {selectedDonor.blood_group}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Contact Phone</div>
                      <div style={{ fontWeight: 600 }}>{selectedDonor.phone || 'Not recorded'}</div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Email Address</div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{selectedDonor.email}</div>
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Residential Address</div>
                      <div style={{ fontWeight: 600 }}>{selectedDonor.address || 'Not specified'}</div>
                    </div>
                  </div>

                  {/* Health Screening Evaluations */}
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <ClipboardList size={16} color="var(--primary)" /> Clinical Health Screening Submissions ({fullDonorData?.screenings?.length || 0})
                  </h4>

                  {!fullDonorData?.screenings || fullDonorData.screenings.length === 0 ? (
                    <div style={{ padding: '1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                      No health screening submissions on record for this donor.
                    </div>
                  ) : (
                    <div className="table-container" style={{ margin: 0, maxHeight: '240px', overflowY: 'auto' }}>
                      <table className="data-table" style={{ fontSize: '0.85rem' }}>
                        <thead>
                          <tr>
                            <th>Screening Date</th>
                            <th>Age / Weight</th>
                            <th>Reported Illness</th>
                            <th>Active Meds</th>
                            <th>Eligibility Result</th>
                          </tr>
                        </thead>
                        <tbody>
                          {fullDonorData.screenings.map((sc) => (
                            <tr key={sc.id}>
                              <td>{new Date(sc.screening_date).toLocaleDateString()}</td>
                              <td>{sc.age} yrs / {sc.weight} kg</td>
                              <td>{sc.recent_illness}</td>
                              <td>{sc.medication}</td>
                              <td>
                                <span className={`badge ${sc.eligible ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '0.68rem' }}>
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
              )}
            </div>

            <div className="modal-footer">
              <button onClick={handleCloseModal} className="btn btn-secondary btn-sm">
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
