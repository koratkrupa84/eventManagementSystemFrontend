import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import '../css/LoginPage.css';
import { API } from '../services/apiConfig';

function OrganizerLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // ================= HANDLE INPUT =================
  const handleChange = (e) => {
    const { id, value } = e.target;

    if (id === 'loginEmail') {
      setForm((prev) => ({ ...prev, email: value }));
    }

    if (id === 'loginPassword') {
      setForm((prev) => ({ ...prev, password: value }));
    }
  };

  // ================= SAFE JSON PARSER =================
  const safeJsonParse = async (res) => {
    try {
      return await res.json();
    } catch {
      return null;
    }
  };

  // ================= SAVE AUTH DATA =================
  const saveAuthData = (data, fallbackEmail = '') => {
    if (!data?.token || !data?.organizer) {
      throw new Error('Invalid server response');
    }

    const organizer = data.organizer;

    const email = organizer.email || fallbackEmail || '';
    const name =
      organizer.name ||
      (email ? email.split('@')[0] : 'Organizer');

    localStorage.setItem('token', data.token);
    localStorage.setItem('userRole', 'organizer');
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userName', name);
    localStorage.setItem('organizerData', JSON.stringify(organizer));
  };

  // ================= EMAIL LOGIN =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!form.email.trim() || !form.password.trim()) {
      setError('Please enter email and password.');
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(API.ORGANIZER_LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await safeJsonParse(res);

      if (!res.ok) {
        throw new Error(data?.message || 'Login failed');
      }

      saveAuthData(data, form.email);

      setMessage('Login successful!');
      navigate("/organizer/dashboard");

    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // ================= GOOGLE LOGIN =================
  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setMessage('');

    if (!credentialResponse?.credential) {
      setError('Google authentication failed.');
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(API.ORGANIZER_GOOGLE_AUTH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: credentialResponse.credential,
        }),
      });

      const data = await safeJsonParse(res);

      if (!res.ok) {
        throw new Error(data?.message || 'Google login failed');
      }

      saveAuthData(data);

      setMessage('Login successful!');
      navigate("/organizer/dashboard");

    } catch (err) {
      setError(err.message || 'Google login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="auth-root"
      style={{
        background: `linear-gradient(135deg, var(--cream), var(--sand))`,
      }}
    >
      <div className="auth-card">
        <div
          className="auth-side-banner login-banner"
          style={{
            background: `linear-gradient(135deg, var(--brown), var(--brownDark))`,
          }}
        >
          <h1 className="auth-brand">Welcome Organizer</h1>
          <p className="auth-tagline">
            Manage your events and grow your business with our powerful tools.
          </p>
        </div>

        <div className="auth-form-wrapper">
          <h2 className="auth-title">Organizer Log in</h2>
          <p className="auth-subtitle">
            Sign in to your organizer account to manage events.
          </p>

          {error && (
            <div className="auth-alert auth-alert-error">{error}</div>
          )}
          {message && (
            <div className="auth-alert auth-alert-success">{message}</div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="loginEmail">Email</label>
              <input
                id="loginEmail"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="organizer@example.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="loginPassword">Password</label>
              <input
                id="loginPassword"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              className="primary-btn"
              style={{ backgroundColor: 'var(--brown)' }}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Log in as Organizer'}
            </button>
          </form>

          <div className="auth-divider">
            <span>or continue with</span>
          </div>

          <div className="social-buttons">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() =>
                setError('Google login failed or cancelled')
              }
              useOneTap={false}
              theme="outline"
              size="large"
              text="continue_with"
            />
          </div>

          <p className="auth-footer-text">
            New organizer? <a href="/organizer/register">Create an organizer account</a>
          </p>
          
          <p className="auth-footer-text">
            <a href="/login">Client Login</a> | <a href="/admin/login">Admin Login</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default OrganizerLogin;
