import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/ClientDashboard.css';
import { API, BASE_URL } from '../services/apiConfig';
import OrganizerProfileModal from '../component/organizer/OrganizerProfileModal';

function OrganizerDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('appointments');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const [organizerData, setOrganizerData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [eventPhotos, setEventPhotos] = useState([]);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [newEventPhotos, setNewEventPhotos] = useState([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const fetchEventPhotos = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching event photos with token:', token ? 'Token exists' : 'No token');
      console.log('API URL:', `${API.ORGANIZER_PROFILE}/event-photos`);
      
      const res = await fetch(`${API.ORGANIZER_PROFILE}/event-photos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('API Response status:', res.status);
      const data = await res.json();
      console.log('API Response data:', data);
      
      if (res.ok && data.success) {
        setEventPhotos(data.data || []);
        console.log('Photos set:', data.data);
      } else {
        console.error('API Error:', data.message || 'Unknown error');
      }
    } catch (err) {
      console.error('Failed to fetch event photos:', err);
    }
  };

  const fetchOrganizerData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/organizer/login');
        return;
      }

      const res = await fetch(API.ORGANIZER_PROFILE, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        setOrganizerData(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch organizer data:', err);
    }
  };

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch(API.ORGANIZER_APPOINTMENTS, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        setAppointments(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch(API.ORGANIZER_CLIENTS, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        setClients(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch clients:', err);
    }
  };

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API.ORGANIZER_APPOINTMENTS}/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage('Appointment status updated successfully');
        fetchAppointments();
      } else {
        setError(data.message || 'Failed to update appointment');
      }
    } catch (err) {
      setError('Failed to update appointment status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'var(--sand)';
      case 'confirmed': return 'var(--brown)';
      case 'completed': return '#4CAF50';
      case 'cancelled': return '#f44336';
      default: return '#ccc';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleProfileUpdate = (updatedData) => {
    setOrganizerData(prev => ({ ...prev, ...updatedData }));
    setMessage('Profile updated successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handlePhotoUpload = async () => {
    if (newEventPhotos.length === 0) {
      setError('Please select photos first');
      return;
    }

    try {
      setUploadingPhoto(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      // Append all selected photos
      newEventPhotos.forEach((photo, index) => {
        formData.append('eventPhotos', photo);
      });

      const res = await fetch(`${API.ORGANIZER_PROFILE}/upload-event-photos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setEventPhotos(prev => [...prev, ...data.data.eventPhotos]);
        setNewEventPhotos([]);
        setMessage(`${data.data.eventPhotos.length} photo(s) uploaded successfully!`);
        document.getElementById('eventPhotoInput').value = '';
      } else {
        setError(data.message || 'Failed to upload photos');
      }
    } catch (err) {
      setError('Failed to upload photos. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API.ORGANIZER_PROFILE}/delete-event-photo/${photoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setEventPhotos(prev => prev.filter(photo => photo._id !== photoId));
        setMessage('Photo deleted successfully!');
      } else {
        setError(data.message || 'Failed to delete photo');
      }
    } catch (err) {
      setError('Failed to delete photo. Please try again.');
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (!token) {
      navigate('/organizer/login');
      return;
    }
    
    if (userRole !== 'organizer') {
      navigate('/organizer/login');
      return;
    }
    
    // Fetch all data
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchOrganizerData(),
          fetchAppointments(),
          fetchClients(),
          fetchEventPhotos()
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: `linear-gradient(135deg, var(--cream), var(--sand))`
      }}>
        <div>Loading organizer dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{ 
      background: `linear-gradient(135deg, var(--cream), var(--sand))`,
      minHeight: '100vh',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              border: '2px solid #ddd',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f5f5f5'
            }}>
              <img
                src={organizerData?.profileImage || 'https://via.placeholder.com/60'}
                alt="Profile"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div>
              <h2 style={{ margin: 0, color: 'var(--brown)' }}>
                Welcome, {organizerData?.name || 'Organizer'}
              </h2>
              <p style={{ margin: '5px 0 0 0', color: '#666' }}>
                {organizerData?.company || 'Event Organizer'}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowProfileModal(true)}
              style={{
                padding: '10px 20px',
                backgroundColor: 'var(--brown)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Edit Profile
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                navigate('/organizer/login');
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div style={{
          background: '#4CAF50',
          color: 'white',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          {message}
        </div>
      )}
      {error && (
        <div style={{
          background: '#f44336',
          color: 'white',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px',
        marginBottom: '20px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: 'var(--brown)' }}>Total Appointments</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
            {appointments.length}
          </p>
        </div>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: 'var(--brown)' }}>Total Clients</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
            {clients.length}
          </p>
        </div>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: 'var(--brown)' }}>Event Photos</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
            {eventPhotos.length}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', borderBottom: '2px solid #eee', marginBottom: '20px' }}>
          <button
            onClick={() => setActiveTab('appointments')}
            style={{
              padding: '12px 24px',
              border: 'none',
              background: activeTab === 'appointments' ? 'var(--brown)' : 'transparent',
              color: activeTab === 'appointments' ? 'white' : 'var(--brown)',
              cursor: 'pointer',
              borderRadius: '6px 6px 0 0',
              fontWeight: 'bold'
            }}
          >
            Appointments ({appointments.length})
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            style={{
              padding: '12px 24px',
              border: 'none',
              background: activeTab === 'clients' ? 'var(--brown)' : 'transparent',
              color: activeTab === 'clients' ? 'white' : 'var(--brown)',
              cursor: 'pointer',
              borderRadius: '6px 6px 0 0',
              fontWeight: 'bold',
              marginLeft: '10px'
            }}
          >
            Clients ({clients.length})
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            style={{
              padding: '12px 24px',
              border: 'none',
              background: activeTab === 'gallery' ? 'var(--brown)' : 'transparent',
              color: activeTab === 'gallery' ? 'white' : 'var(--brown)',
              cursor: 'pointer',
              borderRadius: '6px 6px 0 0',
              fontWeight: 'bold',
              marginLeft: '10px'
            }}
          >
            Gallery ({eventPhotos.length})
          </button>
        </div>

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div>
            <h3 style={{ color: 'var(--brown)', marginBottom: '20px' }}>Your Appointments</h3>
            {loading ? (
              <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
                Loading appointments...
              </p>
            ) : appointments.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
                <p>No appointments found</p>
                <p style={{ fontSize: '14px', marginTop: '10px' }}>
                  Appointments will appear here once clients book events with you.
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #eee' }}>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Client</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Service</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appointment) => (
                      <tr key={appointment._id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px' }}>
                          {appointment.clientName || appointment.name || 'N/A'}
                        </td>
                        <td style={{ padding: '12px' }}>
                          {appointment.clientEmail || appointment.email || 'N/A'}
                        </td>
                        <td style={{ padding: '12px' }}>
                          {formatDate(appointment.date || appointment.createdAt)}
                        </td>
                        <td style={{ padding: '12px' }}>
                          {appointment.service || appointment.eventType || 'General'}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            background: getStatusColor(appointment.status),
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '12px'
                          }}>
                            {appointment.status || 'pending'}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          {appointment.status === 'pending' && (
                            <div style={{ display: 'flex', gap: '5px' }}>
                              <button
                                onClick={() => updateAppointmentStatus(appointment._id, 'confirmed')}
                                style={{
                                  padding: '4px 8px',
                                  backgroundColor: '#4CAF50',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '12px'
                                }}
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => updateAppointmentStatus(appointment._id, 'cancelled')}
                                style={{
                                  padding: '4px 8px',
                                  backgroundColor: '#f44336',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '12px'
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                          {appointment.status === 'confirmed' && (
                            <button
                              onClick={() => updateAppointmentStatus(appointment._id, 'completed')}
                              style={{
                                padding: '4px 8px',
                                backgroundColor: 'var(--brown)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              Mark Complete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Clients Tab */}
        {activeTab === 'clients' && (
          <div>
            <h3 style={{ color: 'var(--brown)', marginBottom: '20px' }}>Your Clients</h3>
            {loading ? (
              <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
                Loading clients...
              </p>
            ) : clients.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
                <p>No clients found</p>
                <p style={{ fontSize: '14px', marginTop: '10px' }}>
                  Client information will appear here once you have appointments.
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #eee' }}>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Phone</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Address</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client) => (
                      <tr key={client._id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px' }}>{client.name}</td>
                        <td style={{ padding: '12px' }}>{client.email}</td>
                        <td style={{ padding: '12px' }}>{client.phone || 'N/A'}</td>
                        <td style={{ padding: '12px' }}>
                          {client.address && client.address !== 'N/A' ? client.address : 'N/A'}
                        </td>
                        <td style={{ padding: '12px' }}>
                          {formatDate(client.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Gallery Tab */}
        {activeTab === 'gallery' && (
          <div>
            <div className="gallery-upload-header">
              <h3 className="gallery-title">Event Gallery</h3>
              <div className="upload-controls">
                <input
                  id="eventPhotoInput"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setNewEventPhotos(Array.from(e.target.files))}
                  className="file-input-hidden"
                />
                <button
                  onClick={() => document.getElementById('eventPhotoInput').click()}
                  className="choose-photos-btn"
                >
                  <span className="btn-icon">📷</span>
                  Choose Photos
                </button>
                {newEventPhotos.length > 0 && (
                  <>
                    <span className="photo-count">
                      {newEventPhotos.length} photo(s) selected
                    </span>
                    <button
                      onClick={handlePhotoUpload}
                      disabled={uploadingPhoto}
                      className={`upload-btn ${uploadingPhoto ? 'uploading' : ''}`}
                    >
                      {uploadingPhoto ? (
                        <>
                          <span className="spinner"></span>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <span className="btn-icon">⬆️</span>
                          Upload {newEventPhotos.length} Photo(s)
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setNewEventPhotos([]);
                        document.getElementById('eventPhotoInput').value = '';
                      }}
                      className="clear-btn"
                    >
                      <span className="btn-icon">🗑️</span>
                      Clear
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {/* Photo Preview Section */}
            {newEventPhotos.length > 0 && (
              <div className="photo-preview-section">
                <h4 className="preview-title">Photo Preview:</h4>
                <div className="photo-preview-grid">
                  {newEventPhotos.map((photo, index) => (
                    <div key={index} className="preview-item">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Preview ${index + 1}`}
                        className="preview-image"
                      />
                      <div className="preview-overlay">
                        <span className="preview-number">{index + 1}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {eventPhotos.length === 0 ? (
              <div className="no-photos-state">
                <div className="no-photos-icon">📷</div>
                <h4>No Photos Yet</h4>
                <p>Upload your first event photo above to get started!</p>
              </div>
            ) : (
              <div className="event-photos-grid">
                {eventPhotos.map((photo, index) => {
                    const imagePath = photo.image_path || photo.path || photo.url;
                    const fullImageUrl = imagePath && imagePath.startsWith('http') ? imagePath : `${BASE_URL}${imagePath || ''}`;
                    
                    return (
                      <div key={index} className="photo-card">
                        <img
                          src={fullImageUrl}
                          alt={`Event photo ${index + 1}`}
                          className="photo-image"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/200x150";
                          }}
                        />
                        <div className="photo-overlay">
                          <div className="photo-info">
                            <span className="photo-date">
                              {photo.uploaded_at ? new Date(photo.uploaded_at).toLocaleDateString() : 'No date'}
                            </span>
                            <button className="delete-photo-btn" onClick={() => handleDeletePhoto(photo._id || index)}>
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Profile Modal */}
      <OrganizerProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onUpdate={handleProfileUpdate}
      />
    </div>
  );
}

export default OrganizerDashboard;
