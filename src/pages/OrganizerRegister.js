import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import '../css/RegistrationPage.css';
import { API } from '../services/apiConfig';
import AlphanumericCaptcha from '../component/AlphanumericCaptcha';

function OrganizerRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    phone: '',
    specialization: 'other',
    experience: '0-2',
    bio: '',
    website: '',
    licenseNumber: '',
    services: []
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [serviceInput, setServiceInput] = useState('');
  const [captchaValid, setCaptchaValid] = useState(false);
  const [captchaReset, setCaptchaReset] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!captchaValid) {
      setError('Please enter correct CAPTCHA code to continue.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(API.ORGANIZER_REGISTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed.');
      }

      // Save auth data after successful registration
      if (data.token && data.organizer) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', 'organizer');
        localStorage.setItem('userEmail', data.organizer.email);
        localStorage.setItem('userName', data.organizer.name);
        localStorage.setItem('organizerData', JSON.stringify(data.organizer));
        
        setMessage('Registration successful! Redirecting to dashboard...');
        setTimeout(() => {
          navigate('/organizer/dashboard');
        }, 1500);
      } else {
        setMessage('Registration successful! Please login.');
        setTimeout(() => {
          navigate('/organizer/login');
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setCaptchaReset(prev => !prev);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 GOOGLE SIGNUP
  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      setError('Google token is missing.');
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

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Google signup failed');
      }

      if (data.token && data.organizer) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', 'organizer');
        localStorage.setItem('userEmail', data.organizer.email);
        localStorage.setItem('userName', data.organizer.name);
        localStorage.setItem('organizerData', JSON.stringify(data.organizer));
        
        setMessage('Account created successfully with Google! Redirecting...');
        setTimeout(() => {
          navigate('/organizer/dashboard');
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Google signup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="auth-root"
      style={{
        background: `linear-gradient(135deg, var(--creamLight), var(--cream))`,
      }}
    >
      <div className="auth-card">
        <div className="auth-side-banner">
          <h1 className="auth-brand">Event Organizer</h1>
          <p className="auth-tagline">
            Join our platform and manage your events professionally.
          </p>
        </div>

        <div className="auth-form-wrapper">
          <h2 className="auth-title">Create Organizer Account</h2>
          <p className="auth-subtitle">
            Register your event organizing business with us.
          </p>

          {error && <div className="auth-alert auth-alert-error">{error}</div>}
          {message && <div className="auth-alert auth-alert-success">{message}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                id="email"
                type="email"
                placeholder="organizer@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="company">Company Name</label>
              <input
                id="company"
                type="text"
                placeholder="Your company name"
                value={form.company}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                type="tel"
                placeholder="+1 234 567 8900"
                value={form.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group form-row">
              <div>
                <label htmlFor="specialization">Specialization</label>
                <select
                  id="specialization"
                  value={form.specialization}
                  onChange={handleChange}
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
                <label htmlFor="experience">Experience</label>
                <select
                  id="experience"
                  value={form.experience}
                  onChange={handleChange}
                >
                  <option value="0-2">0-2 years</option>
                  <option value="2-5">2-5 years</option>
                  <option value="5-10">5-10 years</option>
                  <option value="10+">10+ years</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                placeholder="Tell us about your event organizing experience..."
                value={form.bio}
                onChange={handleChange}
                rows="3"
                maxLength="500"
              />
            </div>

            <div className="form-group">
              <label htmlFor="website">Website</label>
              <input
                id="website"
                type="url"
                placeholder="https://yourwebsite.com"
                value={form.website}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="licenseNumber">License Number</label>
              <input
                id="licenseNumber"
                type="text"
                placeholder="Business license number"
                value={form.licenseNumber}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Services</label>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <input
                  type="text"
                  placeholder="Add a service"
                  value={serviceInput}
                  onChange={(e) => setServiceInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleServiceAdd())}
                />
                <button type="button" onClick={handleServiceAdd} style={{ padding: '8px 16px' }}>
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

            <div className="form-group form-row">
              <div>
                <label htmlFor="password">Password *</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repeat password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <AlphanumericCaptcha 
              onCaptchaChange={setCaptchaValid}
              reset={captchaReset}
            />

            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Organizer Account'}
            </button>
          </form>

          <div className="auth-divider">
            <span>or continue with</span>
          </div>

          <div className="social-buttons">
            <div className="google-login-wrapper">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google signup was cancelled or failed.')}
                useOneTap={false}
                prompt="select_account"
                theme="filled_blue"
                size="large"
                text="signup_with"
              />
            </div>
          </div>

          <p className="auth-footer-text">
            Already have an organizer account? <a href="/organizer/login">Log in</a>
          </p>
          
          <p className="auth-footer-text">
            <a href="/register">Client Registration</a> | <a href="/login">Client Login</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default OrganizerRegister;
