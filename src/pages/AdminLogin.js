import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../services/apiConfig";
import "../css/AdminLogin.css";

function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('')
  
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
  
        const res = await fetch(API.ADMIN_LOGIN, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
  
        const data = await res.json();
  
        if (!res.ok) throw new Error(data.message || 'Login failed');
  
        // ✅ Store ONLY your app JWT
        if (data.token) {
          localStorage.setItem('token', data.token);
        }

        setMessage('Login successful!');
        navigate('/admin/dashboard');
      } catch (err) {
        setError(err.message || 'Something went wrong.');
      } finally {
        setLoading(false);
      }
    };
  

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        <h2 className="admin-title">Admin Login</h2>
        <p className="admin-subtitle">
          Enter your credentials to access the admin panel
        </p>

        <form onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label htmlFor="loginEmail">Email</label>
              <input
                id="loginEmail"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
              />
          </div>

          <div className="admin-form-group">
            <label htmlFor="loginPassword">Password</label>
              <input
                id="loginPassword"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
              />
          </div>

          <button type="submit" className="primary-btn" >
              {loading ? 'Logging in...' : 'Log in'}
            </button>
        </form>

      </div>
    </div>
  );
}

export default AdminLogin;
