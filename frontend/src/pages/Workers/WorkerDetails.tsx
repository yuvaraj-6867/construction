import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import workerService from '../../services/workerService';
import api from '../../services/api';
import Loading from '../../components/Loading';
import ConfirmDialog from '../../components/ConfirmDialog';

const WorkerDetails: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  // Check if this is a project-scoped route
  const isProjectRoute = location.pathname.includes('/projects/');
  const workerId = isProjectRoute ? params.workerId : params.id;
  const projectId = isProjectRoute ? params.id : null;
  const [worker, setWorker] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false });
  const [advances, setAdvances] = useState<any[]>([]);
  const [showQR, setShowQR] = useState(false);
  const [showSlipModal, setShowSlipModal] = useState(false);
  const today = new Date();
  const [slipMonth, setSlipMonth] = useState(today.getMonth() + 1);
  const [slipYear, setSlipYear] = useState(today.getFullYear());

  useEffect(() => {
    loadWorker();
    loadAdvances();
  }, [workerId]);

  const loadWorker = async () => {
    try {
      setLoading(true);
      const data = await workerService.getById(workerId!);
      setWorker(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load worker details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAdvances = async () => {
    try {
      const res = await api.get('/payments', { params: { worker_id: workerId } });
      const all = Array.isArray(res.data) ? res.data : res.data?.payments || [];
      setAdvances(all.filter((p: any) => p.payment_type === 'advance'));
    } catch { /* ignore */ }
  };

  const downloadSalarySlip = async () => {
    try {
      const startDate = `${slipYear}-${String(slipMonth).padStart(2, '0')}-01`;
      const endDate = new Date(slipYear, slipMonth, 0).toISOString().split('T')[0];
      const [attRes, payRes] = await Promise.all([
        api.get('/attendances', { params: { worker_id: workerId, start_date: startDate, end_date: endDate } }),
        api.get('/payments', { params: { worker_id: workerId } }),
      ]);
      const att: any[] = attRes.data || [];
      const pays: any[] = (Array.isArray(payRes.data) ? payRes.data : payRes.data?.payments || [])
        .filter((p: any) => p.payment_date >= startDate && p.payment_date <= endDate);

      const present = att.filter(a => a.status === 'present').length;
      const halfDay = att.filter(a => a.status === 'half-day').length;
      const absent = att.filter(a => a.status === 'absent').length;
      const totalWagesAtt = att.reduce((s, a) => s + Number(a.wage || 0), 0);
      const advancesMonth = pays.filter(p => p.payment_type === 'advance').reduce((s, p) => s + Number(p.amount || 0), 0);
      const wagesMonth = pays.filter(p => p.payment_type !== 'advance').reduce((s, p) => s + Number(p.amount || 0), 0);
      const netPayable = totalWagesAtt - advancesMonth - wagesMonth;
      const monthName = new Date(slipYear, slipMonth - 1, 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });

      const doc = new jsPDF();
      doc.setFillColor(31, 122, 140);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('SALARY SLIP', 14, 18);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(monthName, 14, 30);

      doc.setTextColor(50, 50, 50);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Worker Details', 14, 52);
      autoTable(doc, {
        startY: 56,
        body: [
          ['Name', worker.name, 'Role', worker.role],
          ['Phone', worker.phone || 'N/A', 'Daily Wage', `₹${Number(worker.daily_wage || 0).toLocaleString('en-IN')}`],
          ['Project', worker.project?.name || 'N/A', 'Pay Type', worker.payment_type || 'daily'],
        ],
        styles: { fontSize: 10 },
        columnStyles: { 0: { fontStyle: 'bold', fillColor: [240, 249, 255] }, 2: { fontStyle: 'bold', fillColor: [240, 249, 255] } },
        theme: 'plain',
      });

      const y1 = (doc as any).lastAutoTable.finalY + 8;
      doc.setFont('helvetica', 'bold');
      doc.text('Attendance Summary', 14, y1);
      autoTable(doc, {
        startY: y1 + 4,
        head: [['Days Present', 'Half Days', 'Days Absent', 'Total Days']],
        body: [[present, halfDay, absent, att.length]],
        headStyles: { fillColor: [31, 122, 140] },
        styles: { fontSize: 10, halign: 'center' },
      });

      const y2 = (doc as any).lastAutoTable.finalY + 8;
      doc.setFont('helvetica', 'bold');
      doc.text('Earnings & Deductions', 14, y2);
      autoTable(doc, {
        startY: y2 + 4,
        head: [['Description', 'Amount']],
        body: [
          ['Wages Earned (Attendance)', `₹${totalWagesAtt.toLocaleString('en-IN')}`],
          ['Advance Deductions', `- ₹${advancesMonth.toLocaleString('en-IN')}`],
          ['Wages Paid This Month', `- ₹${wagesMonth.toLocaleString('en-IN')}`],
        ],
        foot: [['NET PAYABLE', `₹${netPayable.toLocaleString('en-IN')}`]],
        headStyles: { fillColor: [31, 122, 140] },
        footStyles: { fillColor: [220, 252, 231], textColor: [22, 101, 52], fontStyle: 'bold', fontSize: 12 },
        styles: { fontSize: 10 },
        columnStyles: { 1: { halign: 'right' } },
      });

      const y3 = (doc as any).lastAutoTable.finalY + 12;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(150, 150, 150);
      doc.text(`Generated on ${new Date().toLocaleDateString('en-IN')} | Construction Worker Tracker`, 14, y3);

      doc.save(`salary_slip_${worker.name.replace(/\s+/g, '_')}_${monthName.replace(/\s+/g, '_')}.pdf`);
      setShowSlipModal(false);
    } catch (e) {
      console.error('Salary slip error:', e);
    }
  };

  const handleDeleteClick = () => {
    setConfirmDialog({ isOpen: true });
  };

  const handleDeleteConfirm = async () => {
    try {
      await workerService.delete(workerId!);
      setConfirmDialog({ isOpen: false });
      navigate(isProjectRoute ? `/projects/${projectId}/workers` : '/workers');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete worker');
      console.error(err);
      setConfirmDialog({ isOpen: false });
    }
  };

  const handleDeleteCancel = () => {
    setConfirmDialog({ isOpen: false });
  };

  if (loading) {
    return <Loading message="Loading worker details..." />;
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #f8f9fa 0%, #e9ecef 100%)',
        padding: '2rem 3rem 3rem 3rem'
      }}>
        <div style={{
          padding: '2rem',
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
          borderRadius: '12px',
          fontSize: '1.1rem',
          textAlign: 'center',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
        <button
          onClick={() => navigate(isProjectRoute ? `/projects/${projectId}/workers` : '/workers')}
          style={{
            background: 'linear-gradient(135deg, #1F7A8C 0%, #16616F 100%)',
            border: 'none',
            color: 'white',
            padding: '0.875rem 2rem',
            fontSize: '1rem',
            fontWeight: '600',
            borderRadius: '10px',
            cursor: 'pointer'
          }}
        >
          Back to Workers
        </button>
      </div>
    );
  }

  if (!worker) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #f8f9fa 0%, #e9ecef 100%)',
        padding: '2rem 3rem 3rem 3rem'
      }}>
        <div style={{
          padding: '2rem',
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
          borderRadius: '12px',
          fontSize: '1.1rem',
          textAlign: 'center',
          marginBottom: '1rem'
        }}>
          Worker not found
        </div>
        <button
          onClick={() => navigate(isProjectRoute ? `/projects/${projectId}/workers` : '/workers')}
          style={{
            background: 'linear-gradient(135deg, #1F7A8C 0%, #16616F 100%)',
            border: 'none',
            color: 'white',
            padding: '0.875rem 2rem',
            fontSize: '1rem',
            fontWeight: '600',
            borderRadius: '10px',
            cursor: 'pointer'
          }}
        >
          Back to Workers
        </button>
      </div>
    );
  }

  const balanceDue = worker.balance_due || 0;
  const totalWages = worker.total_wages_earned || 0;
  const totalAdvances = worker.advance_given || 0;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #f8f9fa 0%, #e9ecef 100%)',
      padding: '2rem 3rem 3rem 3rem'
    }}>
      {/* Header Section */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        background: 'white',
        padding: '1.5rem 2rem',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button
            onClick={() => navigate(isProjectRoute ? `/projects/${projectId}/workers` : '/workers')}
            style={{
              background: '#f8f9fa',
              color: '#1F7A8C',
              border: '2px solid #1F7A8C',
              padding: '0.75rem 1.5rem',
              fontSize: '0.95rem',
              fontWeight: '600',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#1F7A8C';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.transform = 'translateX(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f8f9fa';
              e.currentTarget.style.color = '#1F7A8C';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            ← Back to Workers
          </button>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: '2.5rem',
              background: 'linear-gradient(135deg, #1F7A8C 0%, #16616F 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold'
            }}>
              {worker.name}
            </h1>
            <p style={{
              margin: '0.5rem 0 0 0',
              color: '#6c757d',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span>💼</span> {worker.role}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => navigate(isProjectRoute ? `/projects/${projectId}/workers/${workerId}/edit` : `/workers/${workerId}/edit`)}
            style={{
              background: 'linear-gradient(135deg, #1F7A8C 0%, #16616F 100%)',
              border: 'none',
              color: 'white',
              padding: '0.875rem 1.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              borderRadius: '10px',
              boxShadow: '0 4px 15px rgba(31, 122, 140, 0.3)',
              transition: 'all 0.3s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(31, 122, 140, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(31, 122, 140, 0.3)';
            }}
          >
            Edit Worker
          </button>
          <button
            onClick={handleDeleteClick}
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              border: 'none',
              color: 'white',
              padding: '0.875rem 1.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              borderRadius: '10px',
              boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
              transition: 'all 0.3s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.3)';
            }}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Financial Stats Cards */}
      <div className="grid grid-cols-4" style={{ gap: '1.25rem', marginBottom: '2rem' }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
          textAlign: 'center',
          transition: 'all 0.3s',
          border: '1px solid #e9ecef'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(31, 122, 140, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.08)';
        }}
        >
          <h3 style={{
            color: '#1F7A8C',
            margin: '0 0 0.5rem 0',
            fontSize: '2rem',
            fontWeight: 'bold'
          }}>
            ₹{totalWages.toLocaleString()}
          </h3>
          <p style={{ color: '#6c757d', margin: 0, fontSize: '0.9rem' }}>Total Wages Earned</p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
          textAlign: 'center',
          transition: 'all 0.3s',
          border: '1px solid #e9ecef'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(31, 122, 140, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.08)';
        }}
        >
          <h3 style={{
            color: '#f59e0b',
            margin: '0 0 0.5rem 0',
            fontSize: '2rem',
            fontWeight: 'bold'
          }}>
            ₹{totalAdvances.toLocaleString()}
          </h3>
          <p style={{ color: '#6c757d', margin: 0, fontSize: '0.9rem' }}>Advances Given</p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
          textAlign: 'center',
          transition: 'all 0.3s',
          border: '1px solid #e9ecef'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(31, 122, 140, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.08)';
        }}
        >
          <h3 style={{
            color: balanceDue >= 0 ? '#22c55e' : '#ef4444',
            margin: '0 0 0.5rem 0',
            fontSize: '2rem',
            fontWeight: 'bold'
          }}>
            ₹{Math.abs(balanceDue).toLocaleString()}
          </h3>
          <p style={{ color: '#6c757d', margin: 0, fontSize: '0.9rem' }}>
            {balanceDue >= 0 ? 'Balance Due (Owe to Worker)' : 'Advance Outstanding'}
          </p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
          textAlign: 'center',
          transition: 'all 0.3s',
          border: '1px solid #e9ecef'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(31, 122, 140, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.08)';
        }}
        >
          <h3 style={{
            color: '#3b82f6',
            margin: '0 0 0.5rem 0',
            fontSize: '2rem',
            fontWeight: 'bold'
          }}>
            ₹{worker.daily_wage.toLocaleString()}
          </h3>
          <p style={{ color: '#6c757d', margin: 0, fontSize: '0.9rem' }}>Daily Wage</p>
        </div>
      </div>

      {/* Worker Information Card */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
        marginBottom: '2rem',
        border: '1px solid #e9ecef'
      }}>
        <h2 style={{
          margin: '0 0 1.5rem 0',
          fontSize: '1.5rem',
          color: '#1F7A8C',
          fontWeight: 'bold',
          borderBottom: '2px solid #e9ecef',
          paddingBottom: '0.75rem'
        }}>
          Worker Information
        </h2>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            padding: '0.75rem',
            borderRadius: '8px',
            background: '#f8f9fa'
          }}>
            <strong style={{ color: '#1F7A8C' }}>Name</strong>
            <span>{worker.name}</span>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            padding: '0.75rem',
            borderRadius: '8px',
            background: 'white'
          }}>
            <strong style={{ color: '#1F7A8C' }}>Role</strong>
            <span>{worker.role}</span>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            padding: '0.75rem',
            borderRadius: '8px',
            background: '#f8f9fa'
          }}>
            <strong style={{ color: '#1F7A8C' }}>Phone</strong>
            <span>{worker.phone}</span>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            padding: '0.75rem',
            borderRadius: '8px',
            background: 'white'
          }}>
            <strong style={{ color: '#1F7A8C' }}>Address</strong>
            <span>{worker.address || 'N/A'}</span>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            padding: '0.75rem',
            borderRadius: '8px',
            background: '#f8f9fa'
          }}>
            <strong style={{ color: '#1F7A8C' }}>Status</strong>
            <span style={{
              display: 'inline-block',
              padding: '0.35rem 0.75rem',
              borderRadius: '16px',
              fontSize: '0.75rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              background: worker.status === 'active'
                ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              boxShadow: worker.status === 'active'
                ? '0 2px 8px rgba(34, 197, 94, 0.3)'
                : '0 2px 8px rgba(239, 68, 68, 0.3)'
            }}>
              {worker.status}
            </span>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            padding: '0.75rem',
            borderRadius: '8px',
            background: 'white'
          }}>
            <strong style={{ color: '#1F7A8C' }}>Project</strong>
            <span
              onClick={() => navigate(`/projects/${worker.project_id}`)}
              style={{
                color: '#1F7A8C',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = 'underline';
                e.currentTarget.style.color = '#16616F';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = 'none';
                e.currentTarget.style.color = '#1F7A8C';
              }}
            >
              {worker.project?.name || 'N/A'}
            </span>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            padding: '0.75rem',
            borderRadius: '8px',
            background: '#f8f9fa'
          }}>
            <strong style={{ color: '#1F7A8C' }}>Joined Date</strong>
            <span>{new Date(worker.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
        border: '1px solid #e9ecef'
      }}>
        <h2 style={{
          margin: '0 0 1.5rem 0',
          fontSize: '1.5rem',
          color: '#1F7A8C',
          fontWeight: 'bold',
          borderBottom: '2px solid #e9ecef',
          paddingBottom: '0.75rem'
        }}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-3" style={{ gap: '1.25rem' }}>
          <button
            onClick={() => navigate(`/attendance?project_id=${worker.project_id}`)}
            style={{
              background: 'linear-gradient(135deg, #1F7A8C 0%, #16616F 100%)',
              border: 'none',
              color: 'white',
              padding: '1rem 1.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              borderRadius: '10px',
              boxShadow: '0 4px 15px rgba(31, 122, 140, 0.3)',
              transition: 'all 0.3s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(31, 122, 140, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(31, 122, 140, 0.3)';
            }}
          >
            Mark Attendance
          </button>
          <button
            onClick={() => navigate(`/payments?worker_id=${worker.id}`)}
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              border: 'none',
              color: 'white',
              padding: '1rem 1.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              borderRadius: '10px',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.3s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
            }}
          >
            Make Payment
          </button>
          <button
            onClick={() => navigate(`/attendance/history?worker_id=${worker.id}`)}
            style={{
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              border: 'none',
              color: 'white',
              padding: '1rem 1.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              borderRadius: '10px',
              boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)',
              transition: 'all 0.3s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(34, 197, 94, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(34, 197, 94, 0.3)';
            }}
          >
            View Attendance History
          </button>
          <button
            onClick={() => navigate(`/workers/${workerId}/attendance-calendar`)}
            style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', border: 'none', color: 'white', padding: '1rem 1.5rem', fontSize: '1rem', fontWeight: '600', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.3s' }}
          >
            📅 Calendar View
          </button>
          <button
            onClick={() => setShowQR(!showQR)}
            style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', border: 'none', color: 'white', padding: '1rem 1.5rem', fontSize: '1rem', fontWeight: '600', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.3s' }}
          >
            QR Code
          </button>
          <button
            onClick={() => setShowSlipModal(true)}
            style={{ background: 'linear-gradient(135deg, #C62828 0%, #8E0000 100%)', border: 'none', color: 'white', padding: '1rem 1.5rem', fontSize: '1rem', fontWeight: '600', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.3s' }}
          >
            📄 Salary Slip
          </button>
        </div>
      </div>

      {/* QR Code Section */}
      {showQR && (
        <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', border: '1px solid #e9ecef', marginTop: '2rem', textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.3rem', color: '#1F7A8C' }}>Worker QR Code</h2>
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Scan to quickly access {worker.name}'s profile</p>
          <div style={{ display: 'inline-block', padding: '1rem', background: 'white', borderRadius: '12px', border: '2px solid #e9ecef' }}>
            <QRCodeSVG
              value={`${window.location.origin}/workers/${workerId}`}
              size={180}
              level="H"
              includeMargin
            />
          </div>
          <p style={{ color: '#999', fontSize: '0.8rem', marginTop: '1rem' }}>Worker ID: #{workerId}</p>
        </div>
      )}

      {/* Advances Section */}
      {advances.length > 0 && (
        <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', border: '1px solid #e9ecef', marginTop: '2rem' }}>
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.3rem', color: '#1F7A8C', borderBottom: '2px solid #e9ecef', paddingBottom: '0.75rem' }}>
            Salary Advances ({advances.length})
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: '#666' }}>Date</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', color: '#666' }}>Amount</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: '#666' }}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {advances.map((a: any) => (
                  <tr key={a.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '0.75rem' }}>{new Date(a.payment_date || a.date).toLocaleDateString('en-IN')}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 700, color: '#E36414' }}>₹{parseFloat(a.amount).toLocaleString()}</td>
                    <td style={{ padding: '0.75rem', color: '#666' }}>{a.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: '#FFF3E0' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 700 }}>Total Advances</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 700, color: '#E36414' }}>
                    ₹{advances.reduce((s: number, a: any) => s + parseFloat(a.amount || 0), 0).toLocaleString()}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Salary Slip Modal */}
      {showSlipModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', width: '360px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', color: '#1F7A8C', fontSize: '1.3rem' }}>📄 Generate Salary Slip</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#555', marginBottom: '0.4rem' }}>Month</label>
                <select value={slipMonth} onChange={e => setSlipMonth(Number(e.target.value))}
                  style={{ width: '100%', padding: '0.6rem', border: '2px solid #e9ecef', borderRadius: '8px', fontSize: '0.95rem' }}>
                  {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
                    <option key={m} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#555', marginBottom: '0.4rem' }}>Year</label>
                <input type="number" value={slipYear} onChange={e => setSlipYear(Number(e.target.value))} min={2020} max={2030}
                  style={{ width: '100%', padding: '0.6rem', border: '2px solid #e9ecef', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={downloadSalarySlip}
                style={{ flex: 1, background: 'linear-gradient(135deg, #1F7A8C, #16616F)', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                Download PDF
              </button>
              <button onClick={() => setShowSlipModal(false)}
                style={{ flex: 1, background: '#f0f0f0', color: '#666', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Worker"
        message="Are you sure you want to delete this worker? This will also delete all associated attendance records. This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
};

export default WorkerDetails;
