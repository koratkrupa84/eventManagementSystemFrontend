import React from 'react';
import './Header.css';
import colors from '../css/themeColors';

function Header() {
  return (
    <header
      className="main-header"
      style={{ background: `linear-gradient(90deg, ${colors.creamLight}, ${colors.cream})` }}
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
          <div className="nav-link nav-dropdown">
            <span>Services</span>
            <div className="dropdown-menu">
              <span className="dropdown-title">Event Services</span>
              <ul>
                <li>Birthday Decorations</li>
                <li>Wedding Planning</li>
                <li>Corporate Events</li>
                <li>Baby Shower</li>
                <li>Festive Theme Parties</li>
              </ul>
            </div>
          </div>
          <a href="/gallery" className="nav-link">
            Gallery
          </a>
          <a href="/testimonials" className="nav-link">
            Testimonials
          </a>
          <a href="/contact" className="nav-link">
            Contact
          </a>
        </nav>

        <div className="header-actions">
          <button
            type="button"
            className="login-btn"
            onClick={() => {
              window.location.href = '/login';
            }}
          >
            Login
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;

