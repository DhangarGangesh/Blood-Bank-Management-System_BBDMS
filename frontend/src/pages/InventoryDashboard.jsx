import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { 
  Package, 
  PlusCircle, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle, 
  Trash2, 
  Plus, 
  Minus, 
  RefreshCw,
  Droplet,
  Layers,
  Clock,
  ShieldAlert,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  Activity,
  FileSpreadsheet
} from 'lucide-react';

const ALL_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const COMPONENTS = ['Whole Blood', 'RBC', 'Plasma', 'Platelets'];
const ITEMS_PER_PAGE = 8;

export default function InventoryDashboard() {
  const { showToast } = useToast();
  const [inventory, setInventory] = useState([]);
  const [bloodUnits, setBloodUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' or 'units'

  // Filters
  const [bloodGroupFilter, setBloodGroupFilter] = useState('');
  const [componentFilter, setComponentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Sorting
  const [sortField, setSortField] = useState('blood_group');
  const [sortDirection, setSortDirection] = useState('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (bloodGroupFilter) filters.bloodGroup = bloodGroupFilter;
      if (componentFilter) filters.componentType = componentFilter;
      if (statusFilter) filters.status = statusFilter;

      const res = await api.getInventory(filters);
      if (res.success) {
        setInventory(res.inventory || []);
        setBloodUnits(res.bloodUnits || []);
      }
    } catch (err) {
      console.error('Error fetching inventory:', err);
      showToast('Failed to load blood inventory records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
    setCurrentPage(1);
  }, [bloodGroupFilter, componentFilter, statusFilter]);

  const handleUpdateUnits = async (id, currentAvail, delta, bloodGroup, compType) => {
    const newAvail = Math.max(0, currentAvail + delta);
    try {
      const res = await api.updateInventory(id, { available_units: newAvail });
      if (res.success) {
        showToast(`Updated ${bloodGroup} (${compType}) available units to ${newAvail}`, 'success', 2000);
        fetchInventory();
      }
    } catch (err) {
      showToast('Failed to update inventory unit count', 'error');
    }
  };

  const handleDeleteUnit = async (id, bg, comp) => {
    if (window.confirm(`Are you sure you want to delete unit #${id} (${bg} ${comp})?`)) {
      try {
        const res = await api.deleteBloodUnit(id);
        if (res.success) {
          showToast(`Blood unit #${id} successfully removed from inventory.`, 'success');
          fetchInventory();
        }
      } catch (err) {
        showToast('Failed to delete blood unit record', 'error');
      }
    }
  };

  // Grouped metrics across full inventory
  const metrics = useMemo(() => {
    let totalAvail = 0;
    let totalRes = 0;
    let totalQuar = 0;
    let lowStockCount = 0;
    const groupTotals = {};

    ALL_BLOOD_GROUPS.forEach(bg => {
      groupTotals[bg] = { available: 0, total: 0 };
    });

    inventory.forEach(item => {
      totalAvail += item.available_units || 0;
      totalRes += item.reserved_units || 0;
      totalQuar += item.quarantine_units || 0;
      if (item.status === 'LOW STOCK' || item.available_units < 5) {
        lowStockCount++;
      }
      if (groupTotals[item.blood_group]) {
        groupTotals[item.blood_group].available += item.available_units || 0;
        groupTotals[item.blood_group].total += item.total_units || 0;
      }
    });

    // Count expired units from bloodUnits table
    const expiredCount = bloodUnits.filter(u => {
      if (u.status === 'Expired') return true;
      if (u.expiry_date && new Date(u.expiry_date) < new Date()) return true;
      return false;
    }).reduce((acc, u) => acc + (u.quantity || 1), 0);

    const totalStock = totalAvail + totalRes + totalQuar;

    return {
      totalAvail,
      totalRes,
      totalQuar,
      expiredCount,
      totalStock,
      lowStockCount,
      groupTotals
    };
  }, [inventory, bloodUnits]);

  // Filtered & Sorted Aggregated Inventory
  const processedInventory = useMemo(() => {
    let result = [...inventory];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.blood_group.toLowerCase().includes(q) ||
        item.component_type.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDirection === 'asc' ? (aVal - bVal) : (bVal - aVal);
    });

    return result;
  }, [inventory, searchQuery, sortField, sortDirection]);

  // Filtered & Sorted Blood Units
  const processedBloodUnits = useMemo(() => {
    let result = [...bloodUnits];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.blood_group.toLowerCase().includes(q) ||
        item.component_type.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q)
      );
    }

    return result;
  }, [bloodUnits, searchQuery]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Pagination slicing
  const activeList = activeTab === 'summary' ? processedInventory : processedBloodUnits;
  const totalPages = Math.ceil(activeList.length / ITEMS_PER_PAGE) || 1;
  const paginatedList = activeList.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div style={{ maxWidth: '1380px', margin: '0 auto' }}>
      {/* 1. Header with Controls */}
      <div className="page-header">
        <div className="page-header-text">
          <h1 className="page-title">Blood Inventory Management</h1>
          <p className="page-subtitle">Real-time clinical stock levels, component fractions, quarantine and reserve audits</p>
        </div>
        <div className="page-actions">
          <button onClick={fetchInventory} className="btn btn-secondary">
            <RefreshCw size={16} /> Refresh Stock
          </button>
          <Link to="/inventory/add" className="btn btn-primary">
            <PlusCircle size={18} /> Add Blood Unit
          </Link>
        </div>
      </div>

      {/* 2. Critical Low-Stock Hospital Banner (if any) */}
      {metrics.lowStockCount > 0 && (
        <div className="alert alert-warning animate-slide-in" style={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle size={22} color="var(--status-amber)" style={{ flexShrink: 0 }} />
            <div>
              <strong style={{ color: 'var(--status-amber-text)' }}>Critical Stock Alert:</strong>{' '}
              {metrics.lowStockCount} blood component categories are currently below threshold (&lt; 5 units available).
            </div>
          </div>
          <button 
            onClick={() => setStatusFilter('LOW STOCK')} 
            className="btn btn-sm"
            style={{ 
              background: 'white', 
              border: '1px solid var(--status-amber-border)', 
              color: 'var(--status-amber-text)',
              fontWeight: 700 
            }}
          >
            Filter Critical Stock
          </button>
        </div>
      )}

      {/* 3. Top KPI Metric Cards (6 Cards) */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        {/* Total Stock */}
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Total Units</span>
            <div className="stat-icon-wrapper" style={{ background: '#f1f5f9', color: '#0f172a' }}>
              <Layers size={18} />
            </div>
          </div>
          <div className="stat-value">{metrics.totalStock}</div>
          <div className="stat-footer">All blood bags on record</div>
        </div>

        {/* Available Units */}
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Available</span>
            <div className="stat-icon-wrapper" style={{ background: 'var(--status-green-bg)', color: 'var(--status-green)' }}>
              <CheckCircle size={18} />
            </div>
          </div>
          <div className="stat-value" style={{ color: 'var(--status-green)' }}>{metrics.totalAvail}</div>
          <div className="stat-footer">Ready for patient transfusion</div>
        </div>

        {/* Reserved Units */}
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Reserved</span>
            <div className="stat-icon-wrapper" style={{ background: 'var(--status-blue-bg)', color: 'var(--status-blue)' }}>
              <Clock size={18} />
            </div>
          </div>
          <div className="stat-value" style={{ color: 'var(--status-blue)' }}>{metrics.totalRes}</div>
          <div className="stat-footer">Allocated to surgical theaters</div>
        </div>

        {/* Quarantined Units */}
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Quarantine</span>
            <div className="stat-icon-wrapper" style={{ background: '#fef3c7', color: '#d97706' }}>
              <ShieldAlert size={18} />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#d97706' }}>{metrics.totalQuar}</div>
          <div className="stat-footer">Screening & lab testing phase</div>
        </div>

        {/* Expired Units */}
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Expired</span>
            <div className="stat-icon-wrapper" style={{ background: 'var(--status-red-bg)', color: 'var(--status-red)' }}>
              <Trash2 size={18} />
            </div>
          </div>
          <div className="stat-value" style={{ color: 'var(--status-red)' }}>{metrics.expiredCount}</div>
          <div className="stat-footer">Flagged for protocol disposal</div>
        </div>

        {/* Low Stock Categories */}
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Low Stock</span>
            <div className="stat-icon-wrapper" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
              <TrendingDown size={18} />
            </div>
          </div>
          <div className="stat-value" style={{ color: 'var(--primary)' }}>{metrics.lowStockCount}</div>
          <div className="stat-footer">&lt; 5 units threshold</div>
        </div>
      </div>

      {/* 4. Interactive 8-Blood Group Grid (Matrix) */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: '0.98rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Droplet size={18} color="var(--primary)" fill="var(--primary)" />
            Real-Time Blood Group Stock Matrix
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Click any blood group to filter tables
          </span>
        </div>

        <div className="blood-matrix-grid">
          {ALL_BLOOD_GROUPS.map((bg) => {
            const data = metrics.groupTotals[bg] || { available: 0, total: 0 };
            const isLow = data.available < 5;
            const isSelected = bloodGroupFilter === bg;

            return (
              <div 
                key={bg}
                className={`blood-matrix-card ${isSelected ? 'selected' : ''} ${isLow ? 'low-stock' : ''}`}
                onClick={() => setBloodGroupFilter(isSelected ? '' : bg)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span className="blood-group-badge blood-group-badge-sm">
                      {bg}
                    </span>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-heading)' }}>
                      {data.available} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>avail</span>
                    </span>
                  </div>

                  <span className={`badge ${isLow ? 'badge-yellow' : 'badge-green'}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                    {isLow ? 'LOW STOCK' : 'OK'}
                  </span>
                </div>

                {/* Visual Stock Meter Bar */}
                <div style={{ 
                  height: '6px', 
                  borderRadius: '3px', 
                  background: 'var(--bg-subtle-hover)', 
                  overflow: 'hidden', 
                  marginTop: '0.35rem' 
                }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${Math.min(100, (data.available / 15) * 100)}%`, 
                    background: isLow ? 'var(--status-amber)' : 'var(--status-green)',
                    borderRadius: '3px',
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <span>Total in Bank: {data.total} units</span>
                  {isSelected && <strong style={{ color: 'var(--primary)' }}>Filtered</strong>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Search & Filter Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div className="form-row" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr auto', alignItems: 'center' }}>
          {/* Live Search */}
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search by blood group, component (e.g. RBC)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '36px' }}
            />
          </div>

          {/* Blood Group Filter */}
          <div>
            <select 
              className="form-select"
              value={bloodGroupFilter}
              onChange={(e) => setBloodGroupFilter(e.target.value)}
            >
              <option value="">All Blood Groups</option>
              {ALL_BLOOD_GROUPS.map((bg) => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>

          {/* Component Filter */}
          <div>
            <select 
              className="form-select"
              value={componentFilter}
              onChange={(e) => setComponentFilter(e.target.value)}
            >
              <option value="">All Components</option>
              <option value="Whole Blood">Whole Blood</option>
              <option value="RBC">RBC (Packed Cells)</option>
              <option value="Plasma">Plasma</option>
              <option value="Platelets">Platelets</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select 
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Available">Available Stock</option>
              <option value="LOW STOCK">Low Stock (&lt; 5)</option>
              <option value="Reserved">Reserved</option>
              <option value="Quarantine">Quarantine</option>
              <option value="Expired">Expired</option>
            </select>
          </div>

          {/* Reset Filters */}
          {(bloodGroupFilter || componentFilter || statusFilter || searchQuery) && (
            <button 
              onClick={() => {
                setBloodGroupFilter('');
                setComponentFilter('');
                setStatusFilter('');
                setSearchQuery('');
              }}
              className="btn btn-secondary btn-sm"
              title="Reset all filters"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* 6. Tabs Header */}
      <div className="tabs-header">
        <button 
          className={`tab-btn ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => { setActiveTab('summary'); setCurrentPage(1); }}
        >
          <Layers size={18} />
          Aggregated Stock Summary ({processedInventory.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'units' ? 'active' : ''}`}
          onClick={() => { setActiveTab('units'); setCurrentPage(1); }}
        >
          <FileSpreadsheet size={18} />
          Itemized Blood Unit Records ({processedBloodUnits.length})
        </button>
      </div>

      {/* 7. Tab 1 Content: Aggregated Inventory Table */}
      {activeTab === 'summary' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('blood_group')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    Blood Group <ArrowUpDown size={13} />
                  </div>
                </th>
                <th onClick={() => handleSort('component_type')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    Component Type <ArrowUpDown size={13} />
                  </div>
                </th>
                <th onClick={() => handleSort('available_units')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    Available Units <ArrowUpDown size={13} />
                  </div>
                </th>
                <th>Reserved Units</th>
                <th>Quarantine Units</th>
                <th onClick={() => handleSort('total_units')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    Total Units <ArrowUpDown size={13} />
                  </div>
                </th>
                <th>Stock Status</th>
                <th style={{ textAlign: 'center' }}>Stock Adjustment</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div className="spinner" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent', width: '28px', height: '28px' }}></div>
                    <div style={{ marginTop: '0.75rem', color: 'var(--text-muted)' }}>Retrieving laboratory stock...</div>
                  </td>
                </tr>
              ) : paginatedList.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No inventory records matching current search or filters.
                  </td>
                </tr>
              ) : (
                paginatedList.map((row) => {
                  const isLow = row.status === 'LOW STOCK' || row.available_units < 5;
                  return (
                    <tr key={row.id}>
                      <td>
                        <span className="blood-group-badge blood-group-badge-sm">
                          {row.blood_group}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{row.component_type}</div>
                      </td>
                      <td>
                        <span style={{ 
                          fontWeight: 800, 
                          fontSize: '1.05rem', 
                          color: row.available_units > 0 ? 'var(--status-green)' : 'var(--status-red)' 
                        }}>
                          {row.available_units} units
                        </span>
                      </td>
                      <td>{row.reserved_units} units</td>
                      <td>{row.quarantine_units} units</td>
                      <td style={{ fontWeight: 700 }}>{row.total_units} units</td>
                      <td>
                        <span className={`badge ${isLow ? 'badge-yellow' : 'badge-green'}`}>
                          {isLow ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}
                          {row.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem' }}>
                          <button 
                            onClick={() => handleUpdateUnits(row.id, row.available_units, 1, row.blood_group, row.component_type)} 
                            className="btn btn-secondary btn-sm"
                            title="Increment Available Unit (+1)"
                          >
                            <Plus size={14} />
                          </button>
                          <button 
                            onClick={() => handleUpdateUnits(row.id, row.available_units, -1, row.blood_group, row.component_type)} 
                            className="btn btn-secondary btn-sm"
                            title="Decrement Available Unit (-1)"
                            disabled={row.available_units <= 0}
                          >
                            <Minus size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Pagination Bar */}
          {activeList.length > 0 && (
            <div className="pagination-bar">
              <div>
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, activeList.length)} of {activeList.length} items
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
      )}

      {/* 8. Tab 2 Content: Itemized Blood Units Table */}
      {activeTab === 'units' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Unit ID</th>
                <th>Blood Group</th>
                <th>Component</th>
                <th>Collection Date</th>
                <th>Expiry Date</th>
                <th>Days to Expiry</th>
                <th>Status</th>
                <th>Quantity</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div className="spinner" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent', width: '28px', height: '28px' }}></div>
                  </td>
                </tr>
              ) : paginatedList.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No itemized blood units found.
                  </td>
                </tr>
              ) : (
                paginatedList.map((unit) => {
                  let badgeClass = 'badge-green';
                  if (unit.status === 'Reserved') badgeClass = 'badge-blue';
                  if (unit.status === 'Quarantine') badgeClass = 'badge-yellow';
                  if (unit.status === 'Expired') badgeClass = 'badge-red';

                  let daysLeft = null;
                  let isExpired = unit.status === 'Expired';
                  if (unit.expiry_date) {
                    const diffMs = new Date(unit.expiry_date) - new Date();
                    daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                    if (daysLeft < 0) isExpired = true;
                  }

                  return (
                    <tr key={unit.id}>
                      <td style={{ fontWeight: 700 }}>#{unit.id}</td>
                      <td>
                        <span className="blood-group-badge blood-group-badge-sm">
                          {unit.blood_group}
                        </span>
                      </td>
                      <td>{unit.component_type}</td>
                      <td>{unit.collection_date ? new Date(unit.collection_date).toLocaleDateString() : 'N/A'}</td>
                      <td>{unit.expiry_date ? new Date(unit.expiry_date).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        {isExpired ? (
                          <span className="badge badge-red">Expired</span>
                        ) : daysLeft !== null ? (
                          <span className={`badge ${daysLeft <= 5 ? 'badge-yellow' : 'badge-gray'}`}>
                            {daysLeft} days left
                          </span>
                        ) : 'N/A'}
                      </td>
                      <td>
                        <span className={`badge ${badgeClass}`}>{unit.status}</span>
                      </td>
                      <td style={{ fontWeight: 700 }}>{unit.quantity} bag(s)</td>
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          onClick={() => handleDeleteUnit(unit.id, unit.blood_group, unit.component_type)} 
                          className="btn btn-danger btn-sm"
                          title="Delete blood unit"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Pagination Bar */}
          {activeList.length > 0 && (
            <div className="pagination-bar">
              <div>
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, activeList.length)} of {activeList.length} items
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
      )}
    </div>
  );
}
