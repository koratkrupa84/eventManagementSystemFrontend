import React from "react";
import "./Footer.css";
import { FaFacebookF, FaInstagram, FaTwitter, FaPinterestP } from "react-icons/fa";
import { MdLocationOn, MdEmail, MdAccessTime } from "react-icons/md";
import { FiPhoneCall } from "react-icons/fi";

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
            <a href="#"><FaFacebookF /></a>
            <a href="#"><FaInstagram /></a>
            <a href="#"><FaTwitter /></a>
            <a href="#"><FaPinterestP /></a>
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

          <p><MdLocationOn /> 123 Event Street, City, State 12345</p>
          <p><FiPhoneCall /> +1 (234) 567-890</p>
          <p><MdEmail /> info@eventdecorpro.com</p>
          <p><MdAccessTime /> Mon-Sun: 9:00 AM - 8:00 PM</p>
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
