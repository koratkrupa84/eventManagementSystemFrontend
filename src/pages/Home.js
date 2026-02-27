import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Home.css";
import Header from "../component/Header";
import Footer from "../component/Footer";
import { API } from "../services/apiConfig";

const Home = () => {
     const navigate = useNavigate();
     const [reviews, setReviews] = useState([]);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
          fetchHomeReviews();
     }, []);

     const fetchHomeReviews = async () => {
          try {
               const response = await fetch(API.HOME_REVIEWS, {
                    method: 'GET',
                    headers: {
                         'Content-Type': 'application/json',
                    }
               });
               
               if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
               }
               
               const data = await response.json();
               
               // Try different possible data structures based on your database format
               let reviewsData = [];
               if (data && data.data) {
                    reviewsData = data.data;
               } else if (data && Array.isArray(data)) {
                    reviewsData = data;
               } else if (data && data.reviews) {
                    reviewsData = data.reviews;
               } else if (data && data.success && data.data) {
                    reviewsData = data.data;
               } else if (data && data.success && data.reviews) {
                    reviewsData = data.reviews;
               } else if (data && typeof data === 'object' && !Array.isArray(data)) {
                    // Convert prototype objects to array
                    reviewsData = Object.values(data).filter(item => 
                         item && typeof item === 'object' && item.name && item.rating && item.message
                    ).map(item => ({
                         _id: item._id || Math.random().toString(36).substr(2, 9),
                         name: item.name,
                         rating: item.rating || 5,
                         comment: item.message || item.review_text || item.comment || "Great service!",
                         eventType: item.eventType || "Event",
                         createdAt: item.createdAt || item.date || new Date()
                    }));
               }
               
               // Always set reviews - prioritize database over empty
               if (reviewsData && reviewsData.length > 0) {
                    setReviews(reviewsData.slice(0, 3));
               } else {
                    setReviews([]);
               }
          } catch (error) {
               setReviews([]);
          } finally {
               setLoading(false);
          }
     };

     const handleBookAppointment = () => {
          navigate("/book-private-event");
     };

     const handleViewGallery = () => {
          // Navigate to gallery page or create one
          navigate("/gallery");
     };

     const handleGetStarted = () => {
          navigate("/register");
     };

     const handleViewWork = () => {
          navigate("/gallery");
     };

     const handleBookNow = (category) => {
          navigate("/book-private-event", { state: { category } });
     };

     return (
          <>
               <Header />
               <div className="home">

                    {/* HERO SECTION */}
                    <section className="hero">
                         <h1 className="hero-title">Transform Your Events Into Unforgettable Experiences</h1>
                         <p className="hero-description">
                              Professional decoration services for birthdays, weddings,
                              corporate events and more. We create magical moments with
                              stunning decor that exceeds your expectations.
                         </p>
                         <div className="hero-buttons">
                              <button className="primary-btn hero-cta" onClick={handleBookAppointment}>Book Appointment Now</button>
                              <button className="secondary-btn hero-secondary" onClick={handleViewGallery}>View Gallery</button>
                         </div>
                    </section>

                    {/* CATEGORIES */}
                    <section className="section section-categories">
                         <h2 className="section-title">Our Decoration Categories</h2>
                         <p className="subtitle">
                              Choose from our wide range of decoration services tailored for every occasion
                         </p>

                         <div className="card-grid">
                              {[
                                   { name: "Birthday Decorations", desc: "Make birthdays special with themed decorations, balloons, and custom setups", icon: "🎂" },
                                   { name: "Wedding Decorations", desc: "Elegant wedding decorations with flowers, lighting, and romantic setups", icon: "💒" },
                                   { name: "Baby Shower Decorations", desc: "Cute and adorable baby shower themes with pastel colors and sweet details", icon: "👶" },
                                   { name: "Corporate Events", desc: "Professional corporate event decorations for meetings, conferences, and celebrations", icon: "💼" },
                                   { name: "Anniversary Parties", desc: "Celebrate your special day with romantic and personalized decorations", icon: "💕" },
                                   { name: "Festive Celebrations", desc: "Festival-themed decorations for Diwali, Christmas, and other celebrations", icon: "🎉" }
                              ].map((item, index) => (
                                   <div className="card" key={index}>
                                        <div className="card-icon">{item.icon}</div>
                                        <h3>{item.name}</h3>
                                        <p>{item.desc}</p>
                                        <button className="secondary-btn" onClick={() => handleBookNow(item.name)}>Book Now</button>
                                   </div>
                              ))}
                         </div>
                    </section>

                    
                    {/* REVIEWS FROM DATABASE */}
                    <section className="section section-reviews">
                         <h2 className="section-title">What Our Clients Say</h2>
                         <p className="subtitle">
                              Real reviews from our satisfied customers
                         </p>

                         {loading ? (
                              <div className="reviews-loading">Loading reviews...</div>
                         ) : reviews.length > 0 ? (
                              <div className="reviews-grid">
                                   {reviews.map((review, index) => (
                                        <div className="review-card" key={review._id || index}>
                                             <div className="review-header">
                                                  <div className="review-rating">
                                                       {[...Array(5)].map((_, i) => (
                                                            <span key={i} className={i < review.rating ? "star-filled" : "star-empty"}>
                                                                 ★
                                                            </span>
                                                       ))}
                                                  </div>
                                                  <div className="review-date">
                                                       {new Date(review.createdAt).toLocaleDateString('en-US', { 
                                                            year: 'numeric', 
                                                            month: 'short', 
                                                            day: 'numeric' 
                                                       })}
                                                  </div>
                                             </div>
                                             <div className="review-content">
                                                  <p className="review-text">
                                                                 {review.message || "Great service! The team was professional and the decorations were absolutely beautiful. Highly recommend!"}
                                                  </p>
                                             </div>
                                             <div className="review-author">
                                                  <div className="review-avatar">
                                                                 {review.name ? review.name.charAt(0).toUpperCase() : "U"}
                                                  </div>
                                                  <div className="review-info">
                                                                 <strong>{review.name || "Anonymous"}</strong>
                                                                 <span>{review.eventType || 'Event'}</span>
                                                  </div>
                                             </div>
                                        </div>
                                   ))}
                              </div>
                         ) : (
                              <div className="no-reviews">
                                   <p>No reviews available yet.</p>
                                   <p>Be the first to share your experience!</p>
                              </div>
                         )}
                         
                         <div className="reviews-footer">
                              <button className="secondary-btn" onClick={() => navigate('/reviews')}>
                                   View All Reviews
                              </button>
                         </div>
                    </section>

                    {/* STATS - Why Choose Us */}
                    <section className="section section-stats">
                         <h2 className="section-title stats-title">Why Choose EventSphere?</h2>
                         <p className="stats-description">
                              Experience the best in event decoration with our professional team and premium services. We are a team of experienced event decorators and event planners who are dedicated to making your event a success.
                         </p>

                         <div className="stats-grid">
                              <div className="stat-item">
                                   <h3>500+</h3>
                                   <p>Events Decorated</p>
                              </div>
                              <div className="stat-item">
                                   <h3>50+</h3>
                                   <p>Decoration Themes</p>
                              </div>
                              <div className="stat-item">
                                   <h3>98%</h3>
                                   <p>Client Satisfaction</p>
                              </div>
                              <div className="stat-item">
                                   <h3>24/7</h3>
                                   <p>Customer Support</p>
                              </div>
                         </div>
                    </section>

                    {/* PROCESS - How It Works */}
                    <section className="section section-process gray">
                         <h2 className="section-title">How It Works</h2>
                         <p className="subtitle">
                              Simple 4-step process to get your event decorated perfectly
                         </p>

                         <div className="process-grid">
                              {[
                                   { step: "1", title: "Book Appointment", desc: "Schedule a consultation with our event decoration experts" },
                                   { step: "2", title: "Discuss Requirements", desc: "Share your vision, preferences, and budget with our team" },
                                   { step: "3", title: "Custom Planning", desc: "We create a personalized decoration plan tailored to your event" },
                                   { step: "4", title: "Execute & Enjoy", desc: "Our team sets up everything perfectly for your special day" }
                              ].map((item, index) => (
                                   <div className="process-item" key={index}>
                                        <div className="process-step">{item.step}</div>
                                        <h3>{item.title}</h3>
                                        <p>{item.desc}</p>
                                   </div>
                              ))}
                         </div>
                    </section>

                    {/* CTA - Final Call to Action */}
                    <section className="section section-cta">
                         <h2 className="cta-title">Ready to Make Your Event Unforgettable?</h2>
                         <p className="cta-description">
                              Join hundreds of satisfied customers who have transformed their events with our professional decoration services.
                         </p>
                         <div className="cta-buttons">
                              <button className="primary-btn cta-primary" onClick={handleGetStarted}>Get Started Now</button>
                              <button className="secondary-btn cta-secondary" onClick={handleViewWork}>View Our Work</button>
                         </div>
                    </section>

               </div>
               <Footer />
          </>
     );
};

export default Home;
