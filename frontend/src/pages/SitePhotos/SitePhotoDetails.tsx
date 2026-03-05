import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SitePhotoDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [photo, setPhoto] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPhoto();
  }, [id]);

  const fetchPhoto = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/site_photos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPhoto(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!photo) return <div>Photo not found</div>;

  return (
    <div className="site-photo-details">
      <div className="page-header">
        <button onClick={() => navigate(-1)} className="back-btn">← Back</button>
        <h1>Site Photo</h1>
      </div>

      <div className="details-card">
        <div className="photo-container">
          <img src={photo.photo_url} alt={photo.title} />
        </div>
        
        <h2>Photo Information</h2>
        <div className="info-grid">
          <div className="info-item">
            <label>Title:</label>
            <span>{photo.title}</span>
          </div>
          <div className="info-item">
            <label>Date:</label>
            <span>{new Date(photo.photo_date).toLocaleDateString()}</span>
          </div>
          <div className="info-item">
            <label>Project:</label>
            <span>{photo.project_name}</span>
          </div>
          <div className="info-item">
            <label>Category:</label>
            <span>{photo.category}</span>
          </div>
          <div className="info-item">
            <label>Uploaded By:</label>
            <span>{photo.uploaded_by}</span>
          </div>
          {photo.description && (
            <div className="info-item full-width">
              <label>Description:</label>
              <span>{photo.description}</span>
            </div>
          )}
          {photo.location && (
            <div className="info-item full-width">
              <label>Location:</label>
              <span>{photo.location}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SitePhotoDetails;
