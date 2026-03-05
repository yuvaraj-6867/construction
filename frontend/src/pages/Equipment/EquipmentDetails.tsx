import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EquipmentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEquipment();
  }, [id]);

  const fetchEquipment = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/equipment/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEquipment(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!equipment) return <div>Equipment not found</div>;

  return (
    <div className="equipment-details">
      <div className="page-header">
        <button onClick={() => navigate(-1)} className="back-btn">← Back</button>
        <h1>{equipment.name}</h1>
      </div>

      <div className="details-card">
        <h2>Equipment Information</h2>
        <div className="info-grid">
          <div className="info-item">
            <label>Name:</label>
            <span>{equipment.name}</span>
          </div>
          <div className="info-item">
            <label>Type:</label>
            <span>{equipment.type}</span>
          </div>
          <div className="info-item">
            <label>Status:</label>
            <span className={`status-badge ${equipment.status}`}>{equipment.status}</span>
          </div>
          <div className="info-item">
            <label>Purchase Date:</label>
            <span>{new Date(equipment.purchase_date).toLocaleDateString()}</span>
          </div>
          <div className="info-item">
            <label>Purchase Cost:</label>
            <span>₹{equipment.purchase_cost}</span>
          </div>
          <div className="info-item">
            <label>Current Value:</label>
            <span>₹{equipment.current_value}</span>
          </div>
          <div className="info-item">
            <label>Project:</label>
            <span>{equipment.project_name || 'Not Assigned'}</span>
          </div>
          {equipment.notes && (
            <div className="info-item full-width">
              <label>Notes:</label>
              <span>{equipment.notes}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetails;
