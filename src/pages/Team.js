import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API, BASE_URL } from '../services/apiConfig';
import Header from '../component/Header'
import Footer from '../component/Footer'
import '../css/Team.css';

function Team() {
  const navigate = useNavigate();
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrganizers();
  }, []);

  const fetchOrganizers = async () => {
    try {
      const res = await fetch(API.GET_PUBLIC_ORGANIZERS);
      const data = await res.json();

      if (res.ok && data.success) {
        setOrganizers(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch organizers');
      }
    } catch (err) {
      setError('Failed to fetch organizers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = (organizerId) => {
    navigate(`/organizer/${organizerId}`);
  };

  if (loading) {
    return (
      <div className="team-loading">
        <div className="loading-spinner"></div>
        <p>Loading our team of organizers...</p>
      </div>
    );
  }

  return (
    <>
    <Header />
      <div className="team-container">
        {/* Header Section */}
        <div className="team-header">
          <div className="header-content">
            <h1>Our Event Team</h1>
            <p>Meet our talented and experienced event organizers who make your special moments unforgettable</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Organizers Grid */}
        {organizers.length === 0 ? (
          <div className="no-organizers">
            <div className="no-organizers-icon">👥</div>
            <h3>No Organizers Found</h3>
            <p>Our team is growing. Check back soon to meet our event organizers!</p>
          </div>
        ) : (
          <div className="organizers-grid">
            {organizers.map((organizer) => (
              <div key={organizer._id} className="organizer-card">
                <div className="organizer-image">
                  <img
                    src={organizer.profileImage || 'https://via.placeholder.com/200x200?text=Organizer'}
                    alt={organizer.name}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/200x200?text=Organizer';
                    }}
                  />
                </div>

                <div className="organizer-info">
                  <h3>{organizer.name}</h3>
                  {organizer.company && (
                    <p className="company-name">{organizer.company}</p>
                  )}

                  {organizer.specialization && organizer.specialization !== 'other' && (
                    <p className="organizer-specialization">{organizer.specialization}</p>
                  )}

                  {organizer.experience && (
                    <p className="organizer-experience">{organizer.experience} years experience</p>
                  )}

                  {organizer.services && organizer.services.length > 0 && (
                    <div className="services-section">
                      <div className="services-tags">
                        {organizer.services.slice(0, 3).map((service, index) => (
                          <span key={index} className="service-tag">
                            {service}
                          </span>
                        ))}
                        {organizer.services.length > 3 && (
                          <span className="service-tag more-services">
                            +{organizer.services.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => handleViewProfile(organizer._id)}
                    className="view-profile-btn"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
      <Footer />
    </>
  );
}

export default Team;
