import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const MilestoneDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [milestone, setMilestone] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMilestone();
  }, [id]);

  const fetchMilestone = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/milestones/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMilestone(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!milestone) return <div>Milestone not found</div>;

  return (
    <div className="milestone-details">
      <div className="page-header">
        <button onClick={() => navigate(-1)} className="back-btn">← Back</button>
        <h1>{milestone.title}</h1>
      </div>

      <div className="details-card">
        <h2>Milestone Information</h2>
        <div className="info-grid">
          <div className="info-item">
            <label>Title:</label>
            <span>{milestone.title}</span>
          </div>
          <div className="info-item">
            <label>Status:</label>
            <span className={`status-badge ${milestone.status}`}>{milestone.status}</span>
          </div>
          <div className="info-item">
            <label>Target Date:</label>
            <span>{new Date(milestone.target_date).toLocaleDateString()}</span>
          </div>
          <div className="info-item">
            <label>Completion Date:</label>
            <span>{milestone.completion_date ? new Date(milestone.completion_date).toLocaleDateString() : 'Not Completed'}</span>
          </div>
          <div className="info-item">
            <label>Progress:</label>
            <span>{milestone.progress}%</span>
          </div>
          <div className="info-item">
            <label>Project:</label>
            <span>{milestone.project_name}</span>
          </div>
          {milestone.description && (
            <div className="info-item full-width">
              <label>Description:</label>
              <span>{milestone.description}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MilestoneDetails;
