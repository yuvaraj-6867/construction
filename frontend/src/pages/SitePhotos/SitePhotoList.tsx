import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const SitePhotoList: React.FC = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('');

  useEffect(() => {
    loadPhotos();
    api.get(`/projects/${projectId}`).then(r => setProjectName(r.data.name || '')).catch(() => {});
  }, [projectId]);

  const loadPhotos = async () => {
    setLoading(true);
    try {
      const res = await api.get('/site_photos', { params: { project_id: projectId } });
      setPhotos(Array.isArray(res.data) ? res.data : []);
    } catch { setPhotos([]); }
    finally { setLoading(false); }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) { setError('Photo URL is required'); return; }
    setSaving(true);
    setError('');
    try {
      await api.post('/site_photos', { site_photo: { project_id: projectId, url: url.trim(), caption: caption.trim() } });
      setUrl(''); setCaption(''); setShowForm(false);
      loadPhotos();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save photo');
    } finally { setSaving(false); }
  };

  const handleDelete = async (photoId: number) => {
    if (!window.confirm('Delete this photo?')) return;
    try {
      await api.delete(`/site_photos/${photoId}`);
      setPhotos(prev => prev.filter(p => p.id !== photoId));
    } catch { alert('Failed to delete photo'); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', padding: '2rem 3rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '1.5rem 2rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button onClick={() => navigate(`/projects/${projectId}`)}
            style={{ background: '#f8f9fa', color: '#1F7A8C', border: '2px solid #1F7A8C', padding: '0.65rem 1.25rem', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>
            ← Back
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem', background: 'linear-gradient(135deg, #1F7A8C, #16616F)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 'bold' }}>
              📸 Site Photos
            </h1>
            <p style={{ margin: 0, color: '#6c757d' }}>{projectName} — {photos.length} photo(s)</p>
          </div>
        </div>
        <button onClick={() => setShowForm(true)}
          style={{ background: 'linear-gradient(135deg, #1F7A8C, #16616F)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '1rem' }}>
          + Add Photo
        </button>
      </div>

      {/* Add Photo Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', width: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', color: '#1F7A8C' }}>📸 Add Site Photo</h2>
            <form onSubmit={handleAdd}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: '600', color: '#555', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Photo URL *</label>
                <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com/photo.jpg"
                  style={{ width: '100%', padding: '0.65rem', border: '2px solid #e9ecef', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                <p style={{ margin: '0.3rem 0 0', fontSize: '0.8rem', color: '#999' }}>Paste any image URL (Google Drive share link, Imgur, etc.)</p>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', color: '#555', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Caption</label>
                <input value={caption} onChange={e => setCaption(e.target.value)} placeholder="Describe this photo..."
                  style={{ width: '100%', padding: '0.65rem', border: '2px solid #e9ecef', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box' }} />
              </div>
              {error && <p style={{ color: '#C62828', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</p>}
              {url && (
                <div style={{ marginBottom: '1rem', borderRadius: '8px', overflow: 'hidden', height: '120px', background: '#f0f0f0' }}>
                  <img src={url} alt="preview" onError={e => { (e.target as any).style.display = 'none'; }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" disabled={saving}
                  style={{ flex: 1, background: 'linear-gradient(135deg, #1F7A8C, #16616F)', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                  {saving ? 'Saving...' : 'Add Photo'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setUrl(''); setCaption(''); setError(''); }}
                  style={{ flex: 1, background: '#f0f0f0', color: '#666', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div onClick={() => setLightbox(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, cursor: 'zoom-out' }}>
          <img src={lightbox} alt="full" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: '8px', objectFit: 'contain' }} />
        </div>
      )}

      {/* Photo Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#999' }}>Loading photos...</div>
      ) : photos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem', background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📷</div>
          <h2 style={{ color: '#1F7A8C', marginBottom: '0.5rem' }}>No Photos Yet</h2>
          <p style={{ color: '#999', marginBottom: '1.5rem' }}>Add site photos to document progress</p>
          <button onClick={() => setShowForm(true)}
            style={{ background: 'linear-gradient(135deg, #1F7A8C, #16616F)', color: 'white', border: 'none', padding: '0.75rem 2rem', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>
            Add First Photo
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {photos.map(photo => (
            <div key={photo.id} style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', transition: 'transform 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
              <div style={{ height: '200px', background: '#f0f0f0', cursor: 'zoom-in', overflow: 'hidden' }} onClick={() => setLightbox(photo.url)}>
                <img src={photo.url} alt={photo.caption || 'Site photo'}
                  onError={e => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="280" height="200"><rect fill="%23e9ecef" width="280" height="200"/><text fill="%23999" font-size="14" x="50%" y="50%" text-anchor="middle" dy=".3em">Image unavailable</text></svg>'; }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                />
              </div>
              <div style={{ padding: '1rem' }}>
                {photo.caption && <p style={{ margin: '0 0 0.5rem', fontWeight: '600', color: '#333', fontSize: '0.95rem' }}>{photo.caption}</p>}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: '#999' }}>
                    {photo.uploaded_by} · {new Date(photo.created_at).toLocaleDateString('en-IN')}
                  </span>
                  <button onClick={() => handleDelete(photo.id)}
                    style={{ background: '#fee2e2', color: '#C62828', border: 'none', padding: '0.3rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' }}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SitePhotoList;
