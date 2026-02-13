import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import '../css/LoginPage.css';
import colors from '../css/themeColors';
import { API } from '../services/apiConfig';

function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // ---------------- EMAIL LOGIN ----------------
  const handleChange = (e) => {
    const { id, value } = e.target;

    if (id === 'loginEmail') {
      setForm((prev) => ({ ...prev, email: value }));
    }
    if (id === 'loginPassword') {
      setForm((prev) => ({ ...prev, password: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!form.email || !form.password) {
      setError('Please enter email and password.');
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(API.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Login failed');

      // ✅ Store ONLY your app JWT
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        navigate('/');        // OR '/home'
      }

      setMessage('Login successful!');
      navigate('/');        // OR '/home'
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // ---------------- GOOGLE LOGIN (FIXED) ----------------
  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setMessage('');

    try {
      setLoading(true);

      const res = await fetch(API.GOOGLE_AUTH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: credentialResponse.credential, // ✅ FIXED
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Google login failed');

      // ✅ Save ONLY backend JWT
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        navigate('/');        // OR '/home'
      }

      setMessage('Login successful!');
      navigate('/');        // OR '/home'
    } catch (err) {
      setError(err.message || 'Google login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="auth-root"
      style={{ background: `linear-gradient(135deg, ${colors.cream}, ${colors.sand})` }}
    >
      <div className="auth-card">
        <div className="auth-side-banner login-banner">
          <h1 className="auth-brand">Welcome back</h1>
          <p className="auth-tagline">
            Pick up where you left off and keep your events on track.
          </p>
        </div>

        <div className="auth-form-wrapper">
          <h2 className="auth-title">Log in</h2>
          <p className="auth-subtitle">
            Sign in with your email or continue with social login.
          </p>

          {error && <div className="auth-alert auth-alert-error">{error}</div>}
          {message && <div className="auth-alert auth-alert-success">{message}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="loginEmail">Email</label>
              <input
                id="loginEmail"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
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

            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <div className="auth-divider">
            <span>or continue with</span>
          </div>

          <div className="social-buttons">
            <div className="google-login-wrapper">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google login failed or cancelled')}
                useOneTap={false}
                theme="filled_blue"
                size="large"
                text="continue_with"
              />
            </div>

            <button
              type="button"
              className="social-btn linkedin-btn"
              disabled
              title="Coming soon"
            >
              <span className="social-icon">in</span>
              <span>Continue with LinkedIn</span>
            </button>
          </div>

          <p className="auth-footer-text">
            New here? <a href="/register">Create an account</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
