import React, { useState, useEffect } from 'react';
import './Header.css';

function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');  // Changed from 'authToken' to 'token'
    const role = localStorage.getItem('userRole');
    const userName = localStorage.getItem('userName');
    
    if (token) {
      setIsLoggedIn(true);
      setUserRole(role || 'client');
      console.log("Header: User logged in as", role, userName);
    } else {
      console.log("Header: No token found, user not logged in");
    }
  }, []);

  const handleLoginClick = () => {
    if (isLoggedIn && userRole === 'client') {
      // Client dashboard removed - redirect to home
      window.location.href = '/';
    } else {
      // Redirect to login page
      window.location.href = '/login';
    }
  };

  return (
    <header
      className="main-header"
      style={{ background: `linear-gradient(90deg, var(--creamLight), var(--cream))` }}
    >
      <div className="header-inner">
        <div className="brand">
          <div className="brand-logo">E</div>
          <div className="brand-text">
            <span className="brand-name">EventSphere</span>
            <span className="brand-tagline">Event Management System</span>
          </div>
        </div>

        <nav className="nav-links">
          <a href="/" className="nav-link">
            Home
          </a>
          <a href="/services" className="nav-link">
            Services
          </a>
          <a href="/gallery" className="nav-link">
            Gallery
          </a>
          <a href="/reviews" className="nav-link">
            Reviews
          </a>
          <a href="/contact" className="nav-link">
            Contact
          </a>
        </nav>

        <div className="header-actions">
          <button
            type="button"
            className="login-btn"
            onClick={handleLoginClick}
          >
            {isLoggedIn && userRole === 'client' ? (
              <>
                <a href="/client/dashboard">
                  <span className="dashboard-icon">👤</span>
                  <span>Dashboard</span>
                </a>
              </>
            ) : (
              <span>Login</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;

