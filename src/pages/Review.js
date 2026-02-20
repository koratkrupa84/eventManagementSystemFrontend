import React, { useState, useEffect } from "react";
import "../css/Testimonials.css";
import Header from "../component/Header";
import Footer from "../component/Footer";
import { API } from "../services/apiConfig";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          rating: review.rating || 5,
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

  const renderStars = (rating) => {
    return (
      <div className="stars">
        {"★".repeat(rating)}
        {"☆".repeat(5 - rating)}
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
        <h2>Customer Testimonials</h2>
        <p className="subtitle">
          Read what our clients have to say about our services
        </p>

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
      </div>
      <Footer />
    </>
  );
};

export default Reviews;
