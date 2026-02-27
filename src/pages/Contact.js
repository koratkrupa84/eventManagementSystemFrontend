import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/Contact.css";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaFacebookF, FaInstagram, FaTwitter, FaPinterestP } from "react-icons/fa";
import { API } from "../services/apiConfig";
import AlphanumericCaptcha from "../component/AlphanumericCaptcha";

import Header from "../component/Header";
import Footer from "../component/Footer";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [inquiries, setInquiries] = useState([]);
  const [showInquiries, setShowInquiries] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [captchaValid, setCaptchaValid] = useState(false);
  const [captchaReset, setCaptchaReset] = useState(false);

  // Fetch all inquiries
  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(API.GET_INQUIRIES, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInquiries(res.data.data || []);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate captcha
    if (!captchaValid) {
      setMessage("Please complete the CAPTCHA verification");
      setMessageType("error");
      return;
    }
    
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(API.CREATE_INQUIRY, formData);
      setMessage("Your message has been sent successfully!");
      setMessageType("success");
      setFormData({ name: "", email: "", message: "" });
      setCaptchaValid(false);
      setCaptchaReset(true);
      setTimeout(() => setCaptchaReset(false), 100);
      
      // Refresh inquiries list if showing
      if (showInquiries) {
        fetchInquiries();
      }
    } catch (error) {
      setMessage("Failed to send message. Please try again.");
      setMessageType("error");
      console.error("Error sending inquiry:", error);
      
      // Show more specific error message if available
      if (error.response?.data?.message) {
        setMessage(error.response.data.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInquiry = async (id) => {
    if (!window.confirm("Are you sure you want to delete this inquiry?")) return;
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API.GET_INQUIRIES}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInquiries(inquiries.filter(inquiry => inquiry._id !== id));
      setMessage("Inquiry deleted successfully!");
      setMessageType("success");
    } catch (error) {
      setMessage("Failed to delete inquiry.");
      setMessageType("error");
      console.error("Error deleting inquiry:", error);
    }
  };

  return (
    <>
      <Header />
      <div className="contact-page">
        <div className="contact-card">
          {/* Left Side */}
          <div className="contact-info">
            <h2>Contact Us</h2>
            <p>Get in touch with us for any inquiries or questions</p>

            <h4>Contact Information</h4>

            <p><FaMapMarkerAlt /> 123 Event Street, City, State 12345</p>
            <p><FaPhoneAlt /> +1 (234) 567-890</p>
            <p><FaEnvelope /> info@eventdecorpro.com</p>

            <div className="social-icons">
              <span><FaFacebookF /></span>
              <span><FaInstagram /></span>
              <span><FaTwitter /></span>
              <span><FaPinterestP /></span>
            </div>
          </div>

          {/* Right Side */}
          <div className="contact-form">
            <h4>Get in Touch</h4>
            <p>Fill out the form below and we'll get back to you as soon as possible.</p>

            <form onSubmit={handleSubmit} className="contact-form-inner">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Your Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Your Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="message">Your Message *</label>
                <textarea
                  id="message"
                  name="message"
                  placeholder="Tell us about your event needs, questions, or any special requirements..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="form-textarea"
                ></textarea>
              </div>

              <AlphanumericCaptcha 
                onCaptchaChange={setCaptchaValid} 
                reset={captchaReset}
              />

              <div className="form-footer">
                <button type="submit" disabled={loading || !captchaValid} className="submit-btn">
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">📨</span>
                      Send Message
                    </>
                  )}
                </button>
                <p className="form-note">
                  We'll respond within 24 hours. Your information is kept confidential.
                </p>
              </div>
            </form>

            {message && (
              <div className={`message ${messageType}`}>
                <span className="message-icon">
                  {messageType === 'success' ? '✓' : '⚠'}
                </span>
                {message}
              </div>
            )}
          </div>
        </div>

        {/* Admin: Show Inquiries Toggle */}
        {localStorage.getItem("token") && (
          <div className="admin-section">
            <button 
              className="toggle-inquiries"
              onClick={() => setShowInquiries(!showInquiries)}
            >
              {showInquiries ? "Hide Inquiries" : "Show Inquiries"}
            </button>

            {showInquiries && (
              <div className="inquiries-list">
                <h3>Recent Inquiries</h3>
                {inquiries.length === 0 ? (
                  <p>No inquiries yet.</p>
                ) : (
                  <div className="inquiries-grid">
                    {inquiries.map((inquiry) => (
                      <div key={inquiry._id} className="inquiry-card">
                        <div className="inquiry-header">
                          <h4>{inquiry.name}</h4>
                          <span className="inquiry-date">
                            {new Date(inquiry.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="inquiry-email">{inquiry.email}</p>
                        <p className="inquiry-message">{inquiry.message}</p>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDeleteInquiry(inquiry._id)}
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Map */}
        <div className="map-box">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3719.123456789!2d72.839920!3d21.212790!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e5b5b5b5b5b5b%3A0x5b5b5b5b5b5b5b5b!2sS+V+Patel!5e0!3m2!1sen!2sin!4v1234567890"
            width="100%" 
            height="450" 
            style={{border:0}} 
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Event Management Location"
          ></iframe>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Contact;
