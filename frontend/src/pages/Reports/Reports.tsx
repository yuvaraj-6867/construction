import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import projectService from '../../services/projectService';

const formatCurrency = (n: number) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const Reports: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'worker' | 'project'>('worker');
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [workerData, setWorkerData] = useState<any[]>([]);
  const [projectData, setProjectData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    projectService.getAll().then(setProjects).catch(console.error);
  }, []);

  const generateReport = async () => {
    setLoading(true);
    setGenerated(false);
    try {
      const params: any = {};
      if (selectedProject) params.project_id = selectedProject;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      if (activeTab === 'worker') {
        const res = await api.get('/reports/worker_summary', { params });
        setWorkerData(res.data.workers);
      } else {
        const res = await api.get('/reports/project_summary', { params });
        setProjectData(res.data.projects);
      }
      setGenerated(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (activeTab === 'worker') {
      const headers = ['Name', 'Role', 'Phone', 'Project', 'Type', 'Days Present', 'Half Days', 'Days Absent', 'Wages Earned', 'Advances', 'Paid', 'Balance'];
      const rows = workerData.map(w => [
        w.name, w.role, w.phone, w.project_name, w.payment_type,
        w.total_days_present, w.total_half_days, w.total_days_absent,
        w.total_wages_earned, w.total_advances, w.total_payments, w.balance_due
      ]);
      downloadCSV([headers, ...rows], 'worker_report');
    } else {
      const headers = ['Project', 'Client', 'Status', 'Budget', 'Labor Cost', 'Material Cost', 'Expenses', 'Total Cost', 'Received', 'Balance Due', 'Profit/Loss'];
      const rows = projectData.map(p => [
        p.name, p.client_name, p.status, p.budget,
        p.total_labor_cost, p.total_material_cost, p.total_expenses,
        p.total_cost, p.total_received, p.worker_balance_due, p.profit_loss
      ]);
      downloadCSV([headers, ...rows], 'project_report');
    }
  };

  const downloadCSV = (rows: any[][], filename: string) => {
    const csv = rows.map(r => r.map(v => `"${v ?? ''}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printReport = () => window.print();

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', padding: '2rem 3rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'white', padding: '1.5rem 2rem', borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button onClick={() => navigate('/dashboard')}
            style={{ background: '#f8f9fa', color: '#1F7A8C', border: '2px solid #1F7A8C', padding: '0.65rem 1.25rem', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>
            ← Back
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem', background: 'linear-gradient(135deg, #1F7A8C, #16616F)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 'bold' }}>
              📊 Reports
            </h1>
            <p style={{ margin: 0, color: '#6c757d' }}>Generate worker & project reports</p>
          </div>
        </div>
        {generated && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={exportCSV}
              style={{ background: '#2E7D32', color: 'white', border: 'none', padding: '0.65rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}>
              📥 Export CSV
            </button>
            <button onClick={printReport}
              style={{ background: '#1F7A8C', color: 'white', border: 'none', padding: '0.65rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }} className="no-print">
              🖨️ Print
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div style={{ background: 'white', padding: '1.5rem 2rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginBottom: '2rem' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {(['worker', 'project'] as const).map(tab => (
            <button key={tab} onClick={() => { setActiveTab(tab); setGenerated(false); }}
              style={{
                padding: '0.6rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600',
                border: 'none', fontSize: '0.95rem',
                background: activeTab === tab ? 'linear-gradient(135deg, #1F7A8C, #16616F)' : '#f0f0f0',
                color: activeTab === tab ? 'white' : '#666'
              }}>
              {tab === 'worker' ? '👷 Worker Report' : '🏗️ Project Report'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#1F7A8C', marginBottom: '0.4rem' }}>Project</label>
            <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)}
              style={{ padding: '0.65rem 1rem', border: '2px solid #e9ecef', borderRadius: '8px', fontSize: '0.95rem', minWidth: '200px' }}>
              <option value="">All Projects</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#1F7A8C', marginBottom: '0.4rem' }}>Start Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
              style={{ padding: '0.65rem 1rem', border: '2px solid #e9ecef', borderRadius: '8px', fontSize: '0.95rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#1F7A8C', marginBottom: '0.4rem' }}>End Date</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
              style={{ padding: '0.65rem 1rem', border: '2px solid #e9ecef', borderRadius: '8px', fontSize: '0.95rem' }} />
          </div>
          <button onClick={generateReport} disabled={loading}
            style={{
              background: loading ? '#95a5a6' : 'linear-gradient(135deg, #1F7A8C, #16616F)',
              color: 'white', border: 'none', padding: '0.65rem 2rem',
              borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600', fontSize: '0.95rem'
            }}>
            {loading ? '⏳ Generating...' : '🔍 Generate Report'}
          </button>
        </div>
      </div>

      {/* Worker Report Table */}
      {generated && activeTab === 'worker' && (
        <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f0f0f0', fontWeight: '700', fontSize: '1.1rem', color: '#1F7A8C' }}>
            👷 Worker Summary — {workerData.length} workers
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'linear-gradient(135deg, #1F7A8C, #16616F)', color: 'white' }}>
                <tr>
                  {['Name', 'Role', 'Project', 'Type', 'Present', 'Half', 'Absent', 'Earned', 'Advance', 'Paid', 'Balance'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {workerData.map((w, i) => (
                  <tr key={w.id} style={{ background: i % 2 === 0 ? 'white' : '#f8f9fa' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: '600', color: '#333' }}>{w.name}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#666', fontSize: '0.9rem' }}>{w.role}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#666', fontSize: '0.9rem' }}>{w.project_name}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ background: w.payment_type === 'contract' ? '#e3f2fd' : '#e8f5e9', color: w.payment_type === 'contract' ? '#1565c0' : '#2e7d32', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.78rem', fontWeight: '600' }}>
                        {w.payment_type}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#2E7D32', fontWeight: '600' }}>{w.total_days_present}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#E36414', fontWeight: '600' }}>{w.total_half_days}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#C62828', fontWeight: '600' }}>{w.total_days_absent}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: '700', color: '#1F7A8C' }}>{formatCurrency(w.total_wages_earned)}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#E36414' }}>{formatCurrency(w.total_advances)}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#2E7D32' }}>{formatCurrency(w.total_payments)}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: '700', color: w.balance_due > 0 ? '#C62828' : '#2E7D32' }}>
                      {formatCurrency(w.balance_due)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot style={{ background: '#f0f9ff', borderTop: '2px solid #1F7A8C' }}>
                <tr>
                  <td colSpan={7} style={{ padding: '0.75rem 1rem', fontWeight: '700', color: '#1F7A8C' }}>TOTAL ({workerData.length} workers)</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: '700', color: '#1F7A8C' }}>{formatCurrency(workerData.reduce((s, w) => s + Number(w.total_wages_earned), 0))}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: '700', color: '#E36414' }}>{formatCurrency(workerData.reduce((s, w) => s + Number(w.total_advances), 0))}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: '700', color: '#2E7D32' }}>{formatCurrency(workerData.reduce((s, w) => s + Number(w.total_payments), 0))}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: '700', color: '#C62828' }}>{formatCurrency(workerData.reduce((s, w) => s + Number(w.balance_due), 0))}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Project Report Table */}
      {generated && activeTab === 'project' && (
        <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f0f0f0', fontWeight: '700', fontSize: '1.1rem', color: '#1F7A8C' }}>
            🏗️ Project Summary — {projectData.length} projects
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'linear-gradient(135deg, #1F7A8C, #16616F)', color: 'white' }}>
                <tr>
                  {['Project', 'Client', 'Status', 'Budget', 'Labor', 'Material', 'Expenses', 'Total Cost', 'Received', 'Balance Due', 'Profit/Loss', 'Budget %'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projectData.map((p, i) => (
                  <tr key={p.id} style={{ background: i % 2 === 0 ? 'white' : '#f8f9fa' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: '600', color: '#333' }}>{p.name}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#666', fontSize: '0.9rem' }}>{p.client_name}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ background: p.status === 'in-progress' ? '#e8f5e9' : '#f0f0f0', color: p.status === 'in-progress' ? '#2e7d32' : '#666', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.78rem', fontWeight: '600' }}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#1F7A8C', fontWeight: '600' }}>{formatCurrency(p.budget)}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>{formatCurrency(p.total_labor_cost)}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>{formatCurrency(p.total_material_cost)}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>{formatCurrency(p.total_expenses)}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: '700', color: '#E36414' }}>{formatCurrency(p.total_cost)}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#2E7D32', fontWeight: '600' }}>{formatCurrency(p.total_received)}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#C62828', fontWeight: '600' }}>{formatCurrency(p.worker_balance_due)}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: '700', color: p.profit_loss >= 0 ? '#2E7D32' : '#C62828' }}>
                      {p.profit_loss >= 0 ? '+' : ''}{formatCurrency(p.profit_loss)}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ flex: 1, background: '#e9ecef', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(p.budget_utilization, 100)}%`, height: '100%', background: p.budget_utilization > 90 ? '#C62828' : '#2E7D32' }} />
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: '600', color: p.budget_utilization > 90 ? '#C62828' : '#2E7D32' }}>{p.budget_utilization}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!generated && !loading && (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#999' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📊</div>
          <p style={{ fontSize: '1.1rem' }}>Select filters and click Generate Report</p>
        </div>
      )}
    </div>
  );
};

export default Reports;
