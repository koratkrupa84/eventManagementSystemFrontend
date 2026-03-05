import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* Left Section */}
        <div className="footer-box">
          <h2 className="footer-title">EventSphere</h2>
          <p className="footer-text">
            Professional event decoration services for all occasions.
            We transform ordinary spaces into extraordinary experiences.
          </p>

          <div className="social-icons">
            <a href="#"><i className="fab fa-facebook-f"></i></a>
            <a href="#"><i className="fab fa-instagram"></i></a>
            <a href="#"><i className="fab fa-twitter"></i></a>
            <a href="#"><i className="fab fa-pinterest-p"></i></a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-box">
          <h3 className="footer-heading">Quick Links</h3>
          <ul>
            <li>Home</li>
            <li>Services</li>
            <li>Gallery</li>
            <li>Testimonials</li>
            <li>Contact</li>
            <li>Blog</li>
          </ul>
        </div>

        {/* Services */}
        <div className="footer-box">
          <h3 className="footer-heading">Our Services</h3>
          <ul>
            <li>Birthday Decorations</li>
            <li>Wedding Decorations</li>
            <li>Baby Shower Decorations</li>
            <li>Corporate Events</li>
            <li>Book Appointment</li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer-box">
          <h3 className="footer-heading">Contact Info</h3>

          <p><i className="fas fa-map-marker-alt"></i> 123 Event Street, City, State 12345</p>
          <p><i className="fas fa-phone"></i> +1 (234) 567-890</p>
          <p><i className="fas fa-envelope"></i> info@eventdecorpro.com</p>
          <p><i className="fas fa-clock"></i> Mon-Sun: 9:00 AM - 8:00 PM</p>
        </div>

      </div>

      <div className="footer-bottom">
        © 2023 EventDecor Pro. All Rights Reserved.
        <span> | Privacy Policy | Terms & Conditions</span>
      </div>
    </footer>
  );
};

export default Footer;
