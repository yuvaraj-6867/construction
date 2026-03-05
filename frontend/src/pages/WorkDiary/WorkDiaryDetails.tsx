import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const WorkDiaryDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [diary, setDiary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDiary();
  }, [id]);

  const fetchDiary = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/work_diaries/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDiary(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!diary) return <div>Work Diary not found</div>;

  return (
    <div className="work-diary-details">
      <div className="page-header">
        <button onClick={() => navigate(-1)} className="back-btn">← Back</button>
        <h1>Work Diary - {new Date(diary.date).toLocaleDateString()}</h1>
      </div>

      <div className="details-card">
        <h2>Work Diary Information</h2>
        <div className="info-grid">
          <div className="info-item">
            <label>Date:</label>
            <span>{new Date(diary.date).toLocaleDateString()}</span>
          </div>
          <div className="info-item">
            <label>Project:</label>
            <span>{diary.project_name}</span>
          </div>
          <div className="info-item">
            <label>Weather:</label>
            <span>{diary.weather}</span>
          </div>
          <div className="info-item">
            <label>Workers Present:</label>
            <span>{diary.workers_present}</span>
          </div>
          <div className="info-item full-width">
            <label>Work Done:</label>
            <span>{diary.work_done}</span>
          </div>
          {diary.materials_used && (
            <div className="info-item full-width">
              <label>Materials Used:</label>
              <span>{diary.materials_used}</span>
            </div>
          )}
          {diary.issues && (
            <div className="info-item full-width">
              <label>Issues:</label>
              <span>{diary.issues}</span>
            </div>
          )}
          {diary.notes && (
            <div className="info-item full-width">
              <label>Notes:</label>
              <span>{diary.notes}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkDiaryDetails;
