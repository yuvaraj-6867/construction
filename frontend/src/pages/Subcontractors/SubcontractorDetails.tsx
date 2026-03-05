import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SubcontractorDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [subcontractor, setSubcontractor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubcontractor();
  }, [id]);

  const fetchSubcontractor = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/subcontractors/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubcontractor(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!subcontractor) return <div>Subcontractor not found</div>;

  return (
    <div className="subcontractor-details">
      <div className="page-header">
        <button onClick={() => navigate(-1)} className="back-btn">← Back</button>
        <h1>{subcontractor.name}</h1>
      </div>

      <div className="details-card">
        <h2>Subcontractor Information</h2>
        <div className="info-grid">
          <div className="info-item">
            <label>Name:</label>
            <span>{subcontractor.name}</span>
          </div>
          <div className="info-item">
            <label>Company:</label>
            <span>{subcontractor.company_name}</span>
          </div>
          <div className="info-item">
            <label>Phone:</label>
            <span>{subcontractor.phone}</span>
          </div>
          <div className="info-item">
            <label>Email:</label>
            <span>{subcontractor.email}</span>
          </div>
          <div className="info-item">
            <label>Trade:</label>
            <span>{subcontractor.trade}</span>
          </div>
          <div className="info-item">
            <label>Contract Amount:</label>
            <span>₹{subcontractor.contract_amount}</span>
          </div>
          <div className="info-item">
            <label>Amount Paid:</label>
            <span>₹{subcontractor.amount_paid}</span>
          </div>
          <div className="info-item">
            <label>Balance:</label>
            <span>₹{subcontractor.balance}</span>
          </div>
          <div className="info-item">
            <label>Project:</label>
            <span>{subcontractor.project_name}</span>
          </div>
          <div className="info-item">
            <label>Status:</label>
            <span className={`status-badge ${subcontractor.status}`}>{subcontractor.status}</span>
          </div>
          {subcontractor.address && (
            <div className="info-item full-width">
              <label>Address:</label>
              <span>{subcontractor.address}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubcontractorDetails;
