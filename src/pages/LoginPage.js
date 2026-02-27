import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import '../css/LoginPage.css';
import { API } from '../services/apiConfig';
import AlphanumericCaptcha from '../component/AlphanumericCaptcha';

function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [captchaValid, setCaptchaValid] = useState(false);
  const [captchaReset, setCaptchaReset] = useState(false);

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
    if (!data?.token || !data?.user) {
      throw new Error('Invalid server response');
    }

    const user = data.user;

    const email = user.email || fallbackEmail || '';
    const name =
      user.name ||
      (email ? email.split('@')[0] : 'User');

    localStorage.setItem('token', data.token);
    localStorage.setItem('userRole', user.role || 'client');
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userName', name);
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

    if (!captchaValid) {
      console.log('Login Debug - CAPTCHA not valid:', captchaValid);
      setError('Please enter the correct CAPTCHA code to continue.');
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(API.LOGIN, {
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

      if (data.user.role === "client") {
        navigate("/client/dashboard");
      } else if (data.user.role === "organizer") {
        navigate("/organizer/dashboard");
      } else {
        navigate("/");
      }

    } catch (err) {
      setError(err.message || 'Something went wrong.');
      setCaptchaReset(prev => !prev);
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

      const res = await fetch(API.GOOGLE_AUTH, {
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

      if (data.user.role === "client") {
        navigate("/client/dashboard");
      } else if (data.user.role === "organizer") {
        navigate("/organizer/dashboard");
      } else {
        navigate("/");
      }

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

            <AlphanumericCaptcha 
              onCaptchaChange={setCaptchaValid}
              reset={captchaReset}
            />

            <button
              type="submit"
              className="primary-btn"
              style={{ backgroundColor: 'var(--brown)' }}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Log in'}
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
            New here? <a href="/register">Create an account</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;