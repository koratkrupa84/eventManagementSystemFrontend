import React from "react";
import "../css/Home.css";
import Header from "../component/Header";
import Footer from "../component/Footer";

const Home = () => {
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
                              stunning decor.
                         </p>
                         <button className="primary-btn hero-cta">Book Appointment Now</button>
                    </section>

                    {/* CATEGORIES */}
                    <section className="section section-categories">
                         <h2 className="section-title">Our Decoration Categories</h2>
                         <p className="subtitle">
                              Choose from our wide range of decoration services tailored for every occasion
                         </p>

                         <div className="card-grid">
                              {[
                                   "Birthday Decorations",
                                   "Wedding Decorations",
                                   "Baby Shower Decorations",
                                   "Corporate Events"
                              ].map((item, index) => (
                                   <div className="card" key={index}>
                                        <div className="card-img"></div>
                                        <h3>{item}</h3>
                                        <p>Beautiful and professional decoration service.</p>
                                        <button className="secondary-btn"><a href="/book-private-event">Book Now</a></button>
                                   </div>
                              ))}
                         </div>
                    </section>

                    {/* POPULAR */}
                    <section className="section section-popular gray">
                         <h2 className="section-title">Popular Decorations</h2>
                         <p className="subtitle">
                              Most loved decoration packages by our customers
                         </p>

                         <div className="card-grid">
                              {[
                                   { title: "Princess Birthday Theme", price: "$299" },
                                   { title: "Superhero Birthday Theme", price: "$279" },
                                   { title: "Classic Wedding Decor", price: "$1,499" },
                                   { title: "Rustic Wedding Theme", price: "$1,299" }
                              ].map((item, index) => (
                                   <div className="card" key={index}>
                                        <div className="card-img"></div>
                                        <h3>{item.title}</h3>
                                        <p className="price">{item.price}</p>
                                        <button className="secondary-btn">Book Now</button>
                                   </div>
                              ))}
                         </div>
                    </section>

                    {/* TESTIMONIALS */}
                    <section className="section section-testimonials">
                         <h2 className="section-title">What Our Clients Say</h2>
                         <p className="subtitle">
                              Hear from our satisfied customers about their experience
                         </p>

                         <div className="testimonial-grid">
                              {[
                                   "EventDecor Pro transformed my daughter's birthday!",
                                   "Our wedding decorations were absolutely stunning.",
                                   "Corporate event decoration was top-notch."
                              ].map((text, index) => (
                                   <div className="testimonial" key={index}>
                                        <span className="testimonial-stars">⭐⭐⭐⭐⭐</span>
                                        <p>"{text}"</p>
                                   </div>
                              ))}
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

               </div>
               <Footer />
          </>
     );
};

export default Home;
