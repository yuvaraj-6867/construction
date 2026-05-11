import { formatDate } from '../../utils/formatDate';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
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
  const [wagePayments, setWagePayments] = useState<any[]>([]);
  const [showQR, setShowQR] = useState(false);
  const today = new Date();
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [showIDCardModal, setShowIDCardModal] = useState(false);
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
      setWagePayments(all.filter((p: any) => p.payment_type !== 'advance'));
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
      doc.text(`Generated on ${formatDate(new Date())} | Construction Worker Tracker`, 14, y3);

      doc.save(`salary_slip_${worker.name.replace(/\s+/g, '_')}_${monthName.replace(/\s+/g, '_')}.pdf`);
      setShowSlipModal(false);
    } catch (e) {
      console.error('Salary slip error:', e);
    }
  };

  const downloadIDCard = async () => {
    const canvas = document.getElementById('worker-id-qr') as HTMLCanvasElement;
    const qrDataUrl = canvas ? canvas.toDataURL('image/png') : null;

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [85, 54] });

    // Card background
    doc.setFillColor(31, 122, 140);
    doc.rect(0, 0, 85, 18, 'F');

    // Header text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('WORKER ID CARD', 42.5, 7, { align: 'center' });
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.text('Construction Worker Tracker', 42.5, 13, { align: 'center' });

    // Worker name
    doc.setTextColor(20, 20, 20);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(worker.name, 5, 25);

    // Worker details
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(`Role: ${worker.role}`, 5, 31);
    doc.text(`Phone: ${worker.phone || 'N/A'}`, 5, 36);
    doc.text(`Project: ${(worker.project?.name || 'N/A').substring(0, 22)}`, 5, 41);
    doc.text(`ID: #${workerId}`, 5, 46);
    doc.text(`Wage: \u20B9${Number(worker.daily_wage || 0).toLocaleString('en-IN')}/day`, 5, 51);

    // QR code
    if (qrDataUrl) {
      doc.addImage(qrDataUrl, 'PNG', 62, 20, 20, 20);
    }

    // Border line
    doc.setDrawColor(31, 122, 140);
    doc.setLineWidth(0.5);
    doc.rect(1, 1, 83, 52);

    doc.save(`id_card_${worker.name.replace(/\s+/g, '_')}.pdf`);
    setShowIDCardModal(false);
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
  const totalAdvances = worker.total_advances || 0;
  const totalPaid = worker.total_payments || 0;

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
        marginBottom: '1rem',
        background: 'white',
        padding: '0.75rem 1.25rem',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.07)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => navigate(isProjectRoute ? `/projects/${projectId}/workers` : '/workers')}
            style={{
              background: '#f8f9fa', color: '#1F7A8C', border: '1.5px solid #1F7A8C',
              padding: '0.35rem 0.9rem', fontSize: '0.82rem', fontWeight: '600',
              borderRadius: '8px', cursor: 'pointer'
            }}
          >
            ← Back to Workers
          </button>
          <div>
            <h1 style={{
              margin: 0, fontSize: '1.4rem',
              background: 'linear-gradient(135deg, #1F7A8C 0%, #16616F 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 'bold'
            }}>
              {worker.name}
            </h1>
            <p style={{ margin: '0.1rem 0 0 0', color: '#6c757d', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span>💼</span> {worker.role}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => navigate(isProjectRoute ? `/projects/${projectId}/workers/${workerId}/edit` : `/workers/${workerId}/edit`)}
            style={{
              background: 'linear-gradient(135deg, #1F7A8C 0%, #16616F 100%)', border: 'none',
              color: 'white', padding: '0.4rem 1rem', fontSize: '0.85rem', fontWeight: '600',
              borderRadius: '8px', cursor: 'pointer'
            }}
          >
            Edit Worker
          </button>
          <button
            onClick={handleDeleteClick}
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', border: 'none',
              color: 'white', padding: '0.4rem 1rem', fontSize: '0.85rem', fontWeight: '600',
              borderRadius: '8px', cursor: 'pointer'
            }}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Financial Stats Cards */}
      <div className="grid grid-cols-4" style={{ gap: '0.5rem', marginBottom: '1rem' }}>
        {[
          { label: 'Wages Earned', value: `₹${totalWages.toLocaleString('en-IN')}`, color: '#1F7A8C' },
          { label: 'Advances', value: `₹${totalAdvances.toLocaleString('en-IN')}`, color: '#f59e0b' },
          { label: 'Paid', value: `₹${totalPaid.toLocaleString('en-IN')}`, color: '#22c55e' },
          { label: balanceDue >= 0 ? 'Net Pay (Due)' : 'Overpaid', value: `₹${Math.abs(balanceDue).toLocaleString('en-IN')}`, color: balanceDue >= 0 ? '#8b5cf6' : '#ef4444' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            background: 'white', borderRadius: '8px', padding: '0.6rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center', border: '1px solid #e9ecef'
          }}>
            <div style={{ color, fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.15rem' }}>{value}</div>
            <div style={{ color: '#6c757d', fontSize: '0.7rem' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Two-column layout: Quick Actions (left) + Worker Information (right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>

        {/* Quick Actions - Left */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.25rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
          border: '1px solid #e9ecef'
        }}>
          <h2 style={{
            margin: '0 0 1rem 0',
            fontSize: '1.1rem',
            color: '#1F7A8C',
            fontWeight: 'bold',
            borderBottom: '2px solid #e9ecef',
            paddingBottom: '0.5rem'
          }}>
            Quick Actions
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
            <button
              onClick={() => navigate(`/attendance?project_id=${worker.project_id}`)}
              style={{ background: 'linear-gradient(135deg, #1F7A8C 0%, #16616F 100%)', border: 'none', color: 'white', padding: '0.6rem 0.75rem', fontSize: '0.8rem', fontWeight: '600', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.3s' }}
            >
              Mark Attendance
            </button>
            <button
              onClick={() => navigate(`/payments?worker_id=${worker.id}`)}
              style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', border: 'none', color: 'white', padding: '0.6rem 0.75rem', fontSize: '0.8rem', fontWeight: '600', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.3s' }}
            >
              Make Payment
            </button>
            <button
              onClick={() => navigate(`/attendance/history?worker_id=${worker.id}`)}
              style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', border: 'none', color: 'white', padding: '0.6rem 0.75rem', fontSize: '0.8rem', fontWeight: '600', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.3s' }}
            >
              Attendance History
            </button>
            <button
              onClick={() => navigate(`/workers/${workerId}/attendance-calendar`)}
              style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', border: 'none', color: 'white', padding: '0.6rem 0.75rem', fontSize: '0.8rem', fontWeight: '600', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.3s' }}
            >
              📅 Calendar View
            </button>
            <button
              onClick={() => setShowQR(!showQR)}
              style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', border: 'none', color: 'white', padding: '0.6rem 0.75rem', fontSize: '0.8rem', fontWeight: '600', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.3s' }}
            >
              QR Code
            </button>
            <button
              onClick={() => setShowSlipModal(true)}
              style={{ background: 'linear-gradient(135deg, #C62828 0%, #8E0000 100%)', border: 'none', color: 'white', padding: '0.6rem 0.75rem', fontSize: '0.8rem', fontWeight: '600', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.3s' }}
            >
              📄 Salary Slip
            </button>
            <button
              onClick={downloadIDCard}
              style={{ background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)', border: 'none', color: 'white', padding: '0.6rem 0.75rem', fontSize: '0.8rem', fontWeight: '600', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.3s' }}
            >
              🪪 ID Card PDF
            </button>
            <button
              onClick={() => navigate(`/workers/${workerId}/loans`)}
              style={{ background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', border: 'none', color: 'white', padding: '0.6rem 0.75rem', fontSize: '0.8rem', fontWeight: '600', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.3s' }}
            >
              💰 Loans
            </button>
          </div>
        </div>

        {/* Worker Information - Right */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.25rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
          border: '1px solid #e9ecef'
        }}>
          <h2 style={{
            margin: '0 0 1rem 0',
            fontSize: '1.1rem',
            color: '#1F7A8C',
            fontWeight: 'bold',
            borderBottom: '2px solid #e9ecef',
            paddingBottom: '0.5rem'
          }}>
            Worker Information
          </h2>
          <div style={{ display: 'grid', gap: '0.4rem' }}>
            {[
              { label: 'Name', value: worker.name, bg: '#f8f9fa' },
              { label: 'Role', value: worker.role, bg: 'white' },
              { label: 'Phone', value: worker.phone, bg: '#f8f9fa' },
              { label: 'Address', value: worker.address || 'N/A', bg: 'white' },
            ].map(({ label, value, bg }) => (
              <div key={label} style={{ display: 'grid', gridTemplateColumns: '100px 1fr', padding: '0.45rem 0.6rem', borderRadius: '6px', background: bg, fontSize: '0.85rem' }}>
                <strong style={{ color: '#1F7A8C' }}>{label}</strong>
                <span>{value}</span>
              </div>
            ))}
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', padding: '0.45rem 0.6rem', borderRadius: '6px', background: '#f8f9fa', fontSize: '0.85rem' }}>
              <strong style={{ color: '#1F7A8C' }}>Status</strong>
              <span style={{
                display: 'inline-block', padding: '0.2rem 0.5rem', borderRadius: '12px',
                fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase',
                background: worker.status === 'active' ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white', alignSelf: 'center', width: 'fit-content'
              }}>
                {worker.status}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', padding: '0.45rem 0.6rem', borderRadius: '6px', background: 'white', fontSize: '0.85rem' }}>
              <strong style={{ color: '#1F7A8C' }}>Joined Date</strong>
              <span>{formatDate(worker.created_at)}</span>
            </div>
          </div>
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

      {/* Attendance Records Section */}
      {worker.recent_attendances && worker.recent_attendances.length > 0 && (
        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', border: '1px solid #e9ecef', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#1F7A8C', fontWeight: 'bold', borderBottom: '2px solid #e9ecef', paddingBottom: '0.5rem' }}>
            Attendance Records ({worker.days_worked} days worked)
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #1F7A8C, #16616F)', color: 'white' }}>
                  <th style={{ padding: '0.6rem 1rem', textAlign: 'left' }}>Date</th>
                  <th style={{ padding: '0.6rem 1rem', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '0.6rem 1rem', textAlign: 'right' }}>Wage (₹)</th>
                  <th style={{ padding: '0.6rem 1rem', textAlign: 'left' }}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {worker.recent_attendances.map((a: any, i: number) => (
                  <tr key={a.id} style={{ background: i % 2 === 0 ? 'white' : '#f8f9fa', borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '0.6rem 1rem' }}>{formatDate(a.date + 'T00:00:00')}</td>
                    <td style={{ padding: '0.6rem 1rem', textAlign: 'center' }}>
                      <span style={{
                        padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600',
                        background: a.status === 'present' ? '#dcfce7' : a.status === 'half-day' ? '#fef9c3' : '#fee2e2',
                        color: a.status === 'present' ? '#166534' : a.status === 'half-day' ? '#854d0e' : '#991b1b'
                      }}>
                        {a.status === 'half-day' ? 'Half Day' : a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: '0.6rem 1rem', textAlign: 'right', fontWeight: '600', color: '#1F7A8C' }}>
                      {Number(a.wage) > 0 ? `₹${Number(a.wage).toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td style={{ padding: '0.6rem 1rem', color: '#666' }}>{a.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: '#e8f5e9', fontWeight: '700' }}>
                  <td style={{ padding: '0.6rem 1rem' }} colSpan={2}>Total Wages Earned</td>
                  <td style={{ padding: '0.6rem 1rem', textAlign: 'right', color: '#1F7A8C' }}>₹{totalWages.toLocaleString('en-IN')}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Wage Payments Section */}
      {wagePayments.length > 0 && (
        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', border: '1px solid #e9ecef', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#2E7D32', fontWeight: 'bold', borderBottom: '2px solid #e9ecef', paddingBottom: '0.5rem' }}>
            Wage Payments ({wagePayments.length})
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #2E7D32, #1B5E20)', color: 'white' }}>
                  <th style={{ padding: '0.6rem 1rem', textAlign: 'left' }}>Date</th>
                  <th style={{ padding: '0.6rem 1rem', textAlign: 'right' }}>Amount (₹)</th>
                  <th style={{ padding: '0.6rem 1rem', textAlign: 'left' }}>Method</th>
                  <th style={{ padding: '0.6rem 1rem', textAlign: 'left' }}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {wagePayments.map((p: any, i: number) => (
                  <tr key={p.id} style={{ background: i % 2 === 0 ? 'white' : '#f8f9fa', borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '0.6rem 1rem' }}>{new Date((p.payment_date || p.date) + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td style={{ padding: '0.6rem 1rem', textAlign: 'right', fontWeight: '700', color: '#2E7D32' }}>₹{Number(p.amount).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '0.6rem 1rem', color: '#666' }}>{p.payment_method || 'cash'}</td>
                    <td style={{ padding: '0.6rem 1rem', color: '#666' }}>{p.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: '#e8f5e9', fontWeight: '700' }}>
                  <td style={{ padding: '0.6rem 1rem' }}>Total Paid</td>
                  <td style={{ padding: '0.6rem 1rem', textAlign: 'right', color: '#2E7D32' }}>₹{totalPaid.toLocaleString('en-IN')}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
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
                    <td style={{ padding: '0.75rem' }}>{formatDate(a.payment_date || a.date)}</td>
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

      {/* Hidden QR canvas for ID card PDF */}
      <div style={{ position: 'absolute', left: '-9999px', visibility: 'hidden' }}>
        <QRCodeCanvas id="worker-id-qr" value={`${window.location.origin}/workers/${workerId}`} size={200} level="H" />
      </div>

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
