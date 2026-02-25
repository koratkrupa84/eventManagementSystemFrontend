import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/Testimonials.css";
import Header from "../component/Header";
import Footer from "../component/Footer";
import { API } from "../services/apiConfig";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rating: 5,
    message: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitMessageType, setSubmitMessageType] = useState("");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(API.HOME_REVIEWS);
      const result = await response.json();
      
      console.log('API Response:', result); // Debug log
      
      if (result.success) {
        // Transform database reviews to match our format
        const transformedReviews = result.data.map(review => ({
          name: review.name || "Anonymous",
          date: review.date ? new Date(review.date).toLocaleDateString() : new Date(review.createdAt).toLocaleDateString(),
          rating: parseInt(review.rating) || 5,
          message: review.message || review.review_text || "Great service!"
        }));
        
        console.log('Transformed Reviews:', transformedReviews); // Debug log
        setReviews(transformedReviews);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setError("Failed to load reviews from database");
      // Set empty array on error - no static fallback
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingChange = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMessage("");

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(API.ADD_REVIEW, formData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      setSubmitMessage("Your review has been submitted successfully!");
      setSubmitMessageType("success");
      setFormData({ name: "", email: "", rating: 5, message: "" });
      setShowForm(false);
      
      // Refresh reviews list
      fetchReviews();
    } catch (error) {
      console.error("Error submitting review:", error);
      setSubmitMessage("Failed to submit review. Please try again.");
      setSubmitMessageType("error");
      
      if (error.response?.data?.message) {
        setSubmitMessage(error.response.data.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating, interactive = false) => {
    return (
      <div className={`stars ${interactive ? 'interactive-stars' : ''}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= rating ? 'star filled' : 'star empty'}
            onClick={interactive ? () => handleRatingChange(star) : undefined}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="testimonial-section">
          <h2>Customer Testimonials</h2>
          <p className="subtitle">Loading reviews...</p>
          <div className="testimonial-grid">
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="testimonial-card loading-card">
                <div className="loading-stars">★★★★★</div>
                <div className="loading-message">Loading review...</div>
                <div className="loading-client-info">
                  <span className="loading-name">Loading...</span>
                  <span className="loading-date">Loading...</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="testimonial-section">
        <div className="testimonial-header">
          <h2>Customer Testimonials</h2>
          <p className="subtitle">
            Read what our clients have to say about our services
          </p>
          <button 
            className="add-review-btn"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Cancel" : "Write a Review"}
          </button>
        </div>

        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Share Your Experience</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowForm(false)}
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleSubmitReview} className="review-form">
                <div className="form-group">
                  <label htmlFor="name">Your Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                    placeholder="John Doe"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Your Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    required
                    placeholder="john@example.com"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Rating *</label>
                  {renderStars(formData.rating, true)}
                </div>

                <div className="form-group">
                  <label htmlFor="message">Your Review *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleFormChange}
                    required
                    placeholder="Tell us about your experience with our event services..."
                    rows="4"
                    className="form-textarea"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={submitting}
                  className="submit-review-btn"
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>

                {submitMessage && (
                  <div className={`submit-message ${submitMessageType}`}>
                    {submitMessage}
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {error && (
          <div className="error-message" style={{ 
            textAlign: 'center', 
            padding: '20px', 
            color: '#dc2626',
            background: '#fee',
            margin: '20px auto',
            borderRadius: '8px',
            maxWidth: '600px',
            border: '1px solid #dc2626'
          }}>
            {error}
          </div>
        )}

        <div className="testimonial-grid">
          {reviews.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              gridColumn: '1 / -1'
            }}>
              <h3 style={{ color: '#7F5539', marginBottom: '20px' }}>
                No Reviews Available
              </h3>
              <p style={{ color: '#5C4033', fontSize: '1.1rem' }}>
                Be the first to share your experience with us!
              </p>
            </div>
          ) : (
            reviews.map((item, index) => (
              <div key={`review-${index}`} className="testimonial-card">
                {renderStars(item.rating)}
                
                <p className="message">"{item.message}"</p>
                
                <div className="client-info">
                  <span className="name">- {item.name}</span>
                  <span className="date">{item.date}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Review Link at Bottom */}
        <div className="add-review-section">
          <p className="review-invitation">
            Have you used our services? Share your experience with others!
          </p>
          <button 
            className="add-review-btn"
            onClick={() => setShowForm(true)}
          >
            <span className="btn-icon">✍</span>
            Write Your Review
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Reviews;
