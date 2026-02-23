import React, { useState, useEffect } from 'react';
import '../../css/RegistrationPage.css';
import { API } from '../../services/apiConfig';

function OrganizerProfileModal({ isOpen, onClose, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    specialization: 'other',
    experience: '0-2',
    bio: '',
    website: '',
    licenseNumber: '',
    services: []
  });
  
  const [serviceInput, setServiceInput] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [previewImage, setPreviewImage] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchOrganizerProfile();
    }
  }, [isOpen]);

  const fetchOrganizerProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch(API.ORGANIZER_PROFILE, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setForm({
          name: data.data.name || '',
          email: data.data.email || '',
          company: data.data.company || '',
          phone: data.data.phone || '',
          specialization: data.data.specialization || 'other',
          experience: data.data.experience || '0-2',
          bio: data.data.bio || '',
          website: data.data.website || '',
          licenseNumber: data.data.licenseNumber || '',
          services: data.data.services || []
        });
        setProfileImage(data.data.profileImage || '');
        setPreviewImage(data.data.profileImage || '');
      } else {
        setError(data.message || 'Failed to fetch profile');
      }
    } catch (err) {
      setError('Failed to fetch profile. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleServiceAdd = () => {
    if (serviceInput.trim() && !form.services.includes(serviceInput.trim())) {
      setForm(prev => ({
        ...prev,
        services: [...prev.services, serviceInput.trim()]
      }));
      setServiceInput('');
    }
  };

  const handleServiceRemove = (serviceToRemove) => {
    setForm(prev => ({
      ...prev,
      services: prev.services.filter(service => service !== serviceToRemove)
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleImageUpload = async () => {
    const fileInput = document.getElementById('profilePhoto');
    const file = fileInput.files[0];
    
    if (!file) {
      setError('Please select an image first');
      return;
    }

    try {
      setUploading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('profilePhoto', file);

      const res = await fetch(API.ORGANIZER_UPLOAD_PHOTO, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setProfileImage(data.data.profileImage);
        setMessage('Profile photo uploaded successfully!');
        
        // Update localStorage with new image
        const organizerData = JSON.parse(localStorage.getItem('organizerData') || '{}');
        organizerData.profileImage = data.data.profileImage;
        localStorage.setItem('organizerData', JSON.stringify(organizerData));
        onUpdate && onUpdate(data.data);
      } else {
        setError(data.message || 'Failed to upload photo');
      }
    } catch (err) {
      setError('Failed to upload photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!form.name || !form.email) {
      setError('Name and email are required.');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const res = await fetch(API.ORGANIZER_PROFILE, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage('Profile updated successfully!');
        
        // Update localStorage with new data
        localStorage.setItem('userName', data.data.name);
        const organizerData = JSON.parse(localStorage.getItem('organizerData') || '{}');
        Object.assign(organizerData, data.data);
        localStorage.setItem('organizerData', JSON.stringify(organizerData));
        onUpdate && onUpdate(data.data);
        
        // Close modal after successful update
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          background: `linear-gradient(135deg, var(--brown), var(--brownDark))`,
          color: 'white',
          padding: '20px',
          borderRadius: '12px 12px 0 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0 }}>Edit Profile</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '0',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px' }}>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Update your professional information and manage your profile.
          </p>

          {error && (
            <div style={{
              backgroundColor: '#f44336',
              color: 'white',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '15px'
            }}>
              {error}
            </div>
          )}
          {message && (
            <div style={{
              backgroundColor: '#4CAF50',
              color: 'white',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '15px'
            }}>
              {message}
            </div>
          )}

          {/* Profile Photo Section */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Profile Photo
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                border: '2px solid #ddd',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f5f5f5'
              }}>
                <img
                  src={previewImage || profileImage || 'https://via.placeholder.com/80'}
                  alt="Profile"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div>
                <input
                  id="profilePhoto"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('profilePhoto').click()}
                  style={{
                    padding: '8px 16px',
                    marginRight: '10px',
                    backgroundColor: 'var(--brown)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Choose Photo
                </button>
                {previewImage && (
                  <button
                    type="button"
                    onClick={handleImageUpload}
                    disabled={uploading}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: uploading ? '#ccc' : 'var(--brown)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: uploading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: '15px' }}>
              <div>
                <label htmlFor="name" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Full Name *
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Email *
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="organizer@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  disabled
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: '#f5f5f5'
                  }}
                />
                <small style={{ color: '#666' }}>Email cannot be changed</small>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label htmlFor="company" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Company Name
                  </label>
                  <input
                    id="company"
                    type="text"
                    placeholder="Your company name"
                    value={form.company}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="phone" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={form.phone}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label htmlFor="specialization" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Specialization
                  </label>
                  <select
                    id="specialization"
                    value={form.specialization}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="wedding">Wedding</option>
                    <option value="corporate">Corporate</option>
                    <option value="birthday">Birthday</option>
                    <option value="concert">Concert</option>
                    <option value="conference">Conference</option>
                    <option value="sports">Sports</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="experience" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Experience
                  </label>
                  <select
                    id="experience"
                    value={form.experience}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="0-2">0-2 years</option>
                    <option value="2-5">2-5 years</option>
                    <option value="5-10">5-10 years</option>
                    <option value="10+">10+ years</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="bio" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Bio
                </label>
                <textarea
                  id="bio"
                  placeholder="Tell us about your event organizing experience..."
                  value={form.bio}
                  onChange={handleChange}
                  rows="3"
                  maxLength="500"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label htmlFor="website" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Website
                  </label>
                  <input
                    id="website"
                    type="url"
                    placeholder="https://yourwebsite.com"
                    value={form.website}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="licenseNumber" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    License Number
                  </label>
                  <input
                    id="licenseNumber"
                    type="text"
                    placeholder="Business license number"
                    value={form.licenseNumber}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Services
                </label>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    placeholder="Add a service"
                    value={serviceInput}
                    onChange={(e) => setServiceInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleServiceAdd())}
                    style={{
                      flex: 1,
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleServiceAdd}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: 'var(--brown)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Add
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {form.services.map((service, index) => (
                    <span key={index} style={{
                      background: 'var(--brown)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      {service}
                      <button
                        type="button"
                        onClick={() => handleServiceRemove(service)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'white',
                          cursor: 'pointer',
                          padding: '0',
                          fontSize: '14px'
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#ccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: loading ? '#ccc' : 'var(--brown)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default OrganizerProfileModal;
