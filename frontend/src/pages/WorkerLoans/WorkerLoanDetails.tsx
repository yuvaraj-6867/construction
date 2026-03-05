import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const WorkerLoanDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loan, setLoan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoan();
  }, [id]);

  const fetchLoan = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/worker_loans/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLoan(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!loan) return <div>Loan not found</div>;

  return (
    <div className="worker-loan-details">
      <div className="page-header">
        <button onClick={() => navigate(-1)} className="back-btn">← Back</button>
        <h1>Loan Details</h1>
      </div>

      <div className="details-card">
        <h2>Loan Information</h2>
        <div className="info-grid">
          <div className="info-item">
            <label>Worker:</label>
            <span>{loan.worker_name}</span>
          </div>
          <div className="info-item">
            <label>Loan Amount:</label>
            <span className="amount">₹{loan.loan_amount}</span>
          </div>
          <div className="info-item">
            <label>Amount Paid:</label>
            <span>₹{loan.amount_paid}</span>
          </div>
          <div className="info-item">
            <label>Balance:</label>
            <span className="amount">₹{loan.balance}</span>
          </div>
          <div className="info-item">
            <label>Loan Date:</label>
            <span>{new Date(loan.loan_date).toLocaleDateString()}</span>
          </div>
          <div className="info-item">
            <label>Status:</label>
            <span className={`status-badge ${loan.status}`}>{loan.status}</span>
          </div>
          <div className="info-item">
            <label>Interest Rate:</label>
            <span>{loan.interest_rate}%</span>
          </div>
          <div className="info-item">
            <label>Project:</label>
            <span>{loan.project_name}</span>
          </div>
          {loan.purpose && (
            <div className="info-item full-width">
              <label>Purpose:</label>
              <span>{loan.purpose}</span>
            </div>
          )}
          {loan.notes && (
            <div className="info-item full-width">
              <label>Notes:</label>
              <span>{loan.notes}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkerLoanDetails;
