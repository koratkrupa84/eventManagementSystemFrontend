import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/ClientDashboard.css';
import colors from '../css/themeColors';
import { API } from '../services/apiConfig';
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

  useEffect(() => {
    fetchOrganizerData();
    fetchAppointments();
    fetchClients();
    fetchEventPhotos();
  }, []);

  const fetchEventPhotos = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API.ORGANIZER_PROFILE}/event-photos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setEventPhotos(data.data || []);
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
      const res = await fetch(`${API.GET_APPOINTMENTS}?organizer=${localStorage.getItem('userEmail')}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (res.ok) {
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
      const res = await fetch(API.GET_USERS, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Filter clients only
        const clientList = data.data.filter(user => user.role === 'client');
        setClients(clientList);
      }
    } catch (err) {
      console.error('Failed to fetch clients:', err);
    }
  };

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API.UPDATE_APPOINTMENT_STATUS}/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();
      if (res.ok) {
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
      case 'pending': return colors.sand;
      case 'confirmed': return colors.brown;
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

  const handleDeletePhoto = async (photoIndex) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API.ORGANIZER_PROFILE}/delete-event-photo/${photoIndex}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setEventPhotos(prev => prev.filter((_, index) => index !== photoIndex));
        setMessage('Photo deleted successfully!');
      } else {
        setError(data.message || 'Failed to delete photo');
      }
    } catch (err) {
      setError('Failed to delete photo. Please try again.');
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: `linear-gradient(135deg, ${colors.cream}, ${colors.sand})`
      }}>
        <div>Loading organizer dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{ 
      background: `linear-gradient(135deg, ${colors.cream}, ${colors.sand})`,
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
              <h2 style={{ margin: 0, color: colors.brown }}>
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
                backgroundColor: colors.brown,
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
          <h3 style={{ margin: '0 0 10px 0', color: colors.brown }}>Total Appointments</h3>
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
          <h3 style={{ margin: '0 0 10px 0', color: colors.brown }}>Total Clients</h3>
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
          <h3 style={{ margin: '0 0 10px 0', color: colors.brown }}>Event Photos</h3>
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
              background: activeTab === 'appointments' ? colors.brown : 'transparent',
              color: activeTab === 'appointments' ? 'white' : colors.brown,
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
              background: activeTab === 'clients' ? colors.brown : 'transparent',
              color: activeTab === 'clients' ? 'white' : colors.brown,
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
              background: activeTab === 'gallery' ? colors.brown : 'transparent',
              color: activeTab === 'gallery' ? 'white' : colors.brown,
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
            <h3 style={{ color: colors.brown, marginBottom: '20px' }}>Your Appointments</h3>
            {appointments.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
                No appointments found
              </p>
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
                                backgroundColor: colors.brown,
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
            <h3 style={{ color: colors.brown, marginBottom: '20px' }}>Your Clients</h3>
            {clients.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
                No clients found
              </p>
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
                          {client.address ? 
                            `${client.address.city || ''}, ${client.address.state || ''}`.trim() || 'N/A' 
                            : 'N/A'
                          }
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ color: colors.brown, margin: 0 }}>Event Gallery</h3>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  id="eventPhotoInput"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setNewEventPhotos(Array.from(e.target.files))}
                  style={{ display: 'none' }}
                />
                <button
                  onClick={() => document.getElementById('eventPhotoInput').click()}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: colors.brown,
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Choose Photos
                </button>
                {newEventPhotos.length > 0 && (
                  <>
                    <span style={{ color: '#666', fontSize: '14px' }}>
                      {newEventPhotos.length} photo(s) selected
                    </span>
                    <button
                      onClick={handlePhotoUpload}
                      disabled={uploadingPhoto}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: uploadingPhoto ? '#ccc' : '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: uploadingPhoto ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {uploadingPhoto ? 'Uploading...' : `Upload ${newEventPhotos.length} Photo(s)`}
                    </button>
                    <button
                      onClick={() => {
                        setNewEventPhotos([]);
                        document.getElementById('eventPhotoInput').value = '';
                      }}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      Clear
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {/* Photo Preview Section */}
            {newEventPhotos.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ color: colors.brown, marginBottom: '10px' }}>Photo Preview:</h4>
                <div style={{ 
                  display: 'flex', 
                  gap: '10px', 
                  flexWrap: 'wrap',
                  padding: '15px',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '8px',
                  border: '1px solid #ddd'
                }}>
                  {newEventPhotos.map((photo, index) => (
                    <div key={index} style={{
                      position: 'relative',
                      width: '100px',
                      height: '100px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '2px solid #ddd'
                    }}>
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Preview ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {eventPhotos.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
                No event photos found. Upload your first event photo above!
              </p>
            ) : (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                gap: '20px' 
              }}>
                {eventPhotos.map((photo, index) => (
                  <div key={index} style={{
                    position: 'relative',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    backgroundColor: 'white'
                  }}>
                    <img
                      src={photo}
                      alt={`Event photo ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover',
                        display: 'block'
                      }}
                    />
                    <button
                      onClick={() => handleDeletePhoto(index)}
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        backgroundColor: 'rgba(244, 67, 54, 0.9)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '30px',
                        height: '30px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px'
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
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
