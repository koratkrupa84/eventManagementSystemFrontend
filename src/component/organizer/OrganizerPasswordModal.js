import React, { useState } from 'react';
import { API } from '../../services/apiConfig';

function OrganizerPasswordModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const validateForm = () => {
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setError('All fields are required');
      return false;
    }

    if (form.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return false;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError('New password and confirm password do not match');
      return false;
    }

    if (form.currentPassword === form.newPassword) {
      setError('New password must be different from current password');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const res = await fetch(`${API.ORGANIZER_PROFILE}/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage('Password changed successfully!');
        setForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // Close modal after successful update
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(data.message || 'Failed to change password');
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
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          background: `linear-gradient(135deg, #FF9800, #F57C00)`,
          color: 'white',
          padding: '20px',
          borderRadius: '12px 12px 0 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0 }}>Change Password</h2>
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
            Update your account password for better security.
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

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: '15px' }}>
              <div>
                <label htmlFor="currentPassword" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Current Password *
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  placeholder="Enter your current password"
                  value={form.currentPassword}
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
                <label htmlFor="newPassword" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  New Password *
                </label>
                <input
                  id="newPassword"
                  type="password"
                  placeholder="Enter your new password (min 6 characters)"
                  value={form.newPassword}
                  onChange={handleChange}
                  required
                  minLength="6"
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
                <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Confirm New Password *
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your new password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength="6"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{
                backgroundColor: '#f5f5f5',
                padding: '15px',
                borderRadius: '6px',
                marginTop: '10px'
              }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
                  Password Requirements:
                </h4>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#666', fontSize: '13px' }}>
                  <li>At least 6 characters long</li>
                  <li>Should be different from current password</li>
                  <li>Use a mix of letters, numbers, and symbols for better security</li>
                </ul>
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
                    backgroundColor: loading ? '#ccc' : '#FF9800',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Updating...' : 'Change Password'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default OrganizerPasswordModal;
