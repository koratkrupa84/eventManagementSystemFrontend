import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API, BASE_URL } from '../services/apiConfig';
import '../css/OrganizerProfileView.css';
import Header from '../component/Header';
import Footer from '../component/Footer';

function OrganizerProfileView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [organizer, setOrganizer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  useEffect(() => {
    fetchOrganizerDetails();
  }, [id]);

  const fetchOrganizerDetails = async () => {
    try {
      const res = await fetch(`${API.GET_PUBLIC_ORGANIZERS}/${id}`);
      const data = await res.json();
      
      if (res.ok && data.success) {
        setOrganizer(data.data);
      } else {
        setError(data.message || 'Failed to fetch organizer details');
      }
    } catch (err) {
      setError('Failed to fetch organizer details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoClick = (index) => {
    setSelectedPhotoIndex(index);
  };

  const closePhotoViewer = () => {
    setSelectedPhotoIndex(null);
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading organizer profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-error">
        <div className="error-content">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={() => navigate('/team')} className="back-btn">
            Back
          </button>
        </div>
      </div>
    );
  }

  if (!organizer) {
    return (
      <div className="profile-not-found">
        <div className="not-found-content">
          <h3>Organizer Not Found</h3>
          <p>The organizer you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/team')} className="back-btn">
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
    <Header />
    <div className="profile-container">
      {/* Header */}
      <div className="org-profile-header">
        <button onClick={() => navigate('/team')} className="back-btn">
          ← Back
        </button>
        <h1>Organizer Profile</h1>
      </div>

      {/* Main Content */}
      <div className="org-profile-content">
        {/* Left Column - Basic Info */}
        <div className="org-profile-left">
          <div className="org-profile-card">
            <div className="org-profile-image-section">
              <img
                src={organizer.profileImage || 'https://via.placeholder.com/300x300?text=Organizer'}
                alt={organizer.name}
                className="org-profile-image"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x300?text=Organizer';
                }}
              />
            </div>

            <div className="org-profile-info">
              <div className="org-profile-info-header">
                <h2>{organizer.name}</h2>
                {organizer.company && (
                  <p className="company">{organizer.company}</p>
                )}
              </div>
              
              <div className="org-profile-details">
                {organizer.specialization && organizer.specialization !== 'other' && (
                  <div className="org-detail-item">
                    <span className="label">Specialization:</span>
                    <span className="value">{organizer.specialization}</span>
                  </div>
                )}
                
                {organizer.experience && (
                  <div className="org-detail-item">
                    <span className="label">Experience:</span>
                    <span className="value">{organizer.experience} years</span>
                  </div>
                )}
                
                {organizer.phone && (
                  <div className="org-detail-item">
                    <span className="label">Phone:</span>
                    <span className="value">{organizer.phone}</span>
                  </div>
                )}
                
                {organizer.email && (
                  <div className="org-detail-item">
                    <span className="label">Email:</span>
                    <span className="value">{organizer.email}</span>
                  </div>
                )}
                
                {organizer.website && (
                  <div className="org-detail-item">
                    <span className="label">Website:</span>
                    <a 
                      href={organizer.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="website-link"
                    >
                      {organizer.website}
                    </a>
                  </div>
                )}
                
                {organizer.licenseNumber && (
                  <div className="org-detail-item">
                    <span className="label">License:</span>
                    <span className="value">{organizer.licenseNumber}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Bio, Services, Photos */}
        <div className="profile-right">
          {/* Bio Section */}
          {organizer.bio && (
            <div className="bio-section">
              <h3>About</h3>
              <p className="bio-text">{organizer.bio}</p>
            </div>
          )}

          {/* Services Section */}
          {organizer.services && organizer.services.length > 0 && (
            <div className="services-section">
              <h3>Services</h3>
              <ul className="services-list">
                {organizer.services.map((service, index) => (
                  <li className="service-list-item">
                    <span className="service-name">{service}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Photos Section */}
          {organizer.eventPhotos && organizer.eventPhotos.length > 0 && (
            <div className="photos-section">
              <h3>Event Photos</h3>
              <div className="photos-grid">
                {organizer.eventPhotos.map((photo, index) => {
                  let imagePath, fullImageUrl;
                  
                  if (typeof photo === 'string') {
                    imagePath = photo;
                    fullImageUrl = photo.startsWith('http') ? photo : `${BASE_URL}${photo}`;
                  } else {
                    imagePath = photo.image_path || photo.path || photo.url || photo.photo_url || photo.filename;
                    fullImageUrl = imagePath && imagePath.startsWith('http') 
                      ? imagePath 
                      : imagePath ? `${BASE_URL}${imagePath}` : null;
                  }
                  
                  if (!imagePath) return null;
                  
                  return (
                    <div 
                      key={index} 
                      className="photo-item"
                      onClick={() => handlePhotoClick(index)}
                    >
                      <img
                        src={fullImageUrl}
                        alt={`Event photo ${index + 1}`}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/200x200?text=Photo+Not+Available';
                        }}
                      />
                      <div className="photo-overlay">
                        <span className="view-icon">👁️</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Photo Viewer Modal */}
      {selectedPhotoIndex !== null && (
        <div className="photo-viewer-modal" onClick={closePhotoViewer}>
          <div className="photo-viewer-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-viewer" onClick={closePhotoViewer}>×</button>
            {organizer.eventPhotos && organizer.eventPhotos[selectedPhotoIndex] && (
              <img
                src={
                  typeof organizer.eventPhotos[selectedPhotoIndex] === 'string'
                    ? (organizer.eventPhotos[selectedPhotoIndex].startsWith('http') 
                        ? organizer.eventPhotos[selectedPhotoIndex] 
                        : `${BASE_URL}${organizer.eventPhotos[selectedPhotoIndex]}`)
                    : (() => {
                        const photo = organizer.eventPhotos[selectedPhotoIndex];
                        const imagePath = photo.image_path || photo.path || photo.url || photo.photo_url || photo.filename;
                        return imagePath && imagePath.startsWith('http') 
                          ? imagePath 
                          : `${BASE_URL}${imagePath}`;
                      })()
                }
                alt={`Event photo ${selectedPhotoIndex + 1}`}
                className="viewer-image"
              />
            )}
            <div className="photo-info">
              <span>Photo {selectedPhotoIndex + 1} of {organizer.eventPhotos?.length || 0}</span>
            </div>
          </div>
        </div>
      )}
    </div>
    <Footer />
    </>
  );
}

export default OrganizerProfileView;
