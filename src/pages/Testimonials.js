import React from "react";
import "../css/Testimonials.css";
import Header from "../component/Header";
import Footer from "../component/Footer";

const testimonials = [
     {
          name: "Sarah Johnson",
          date: "2023-08-15",
          rating: 5,
          message:
               "EventDecor Pro transformed my daughter's birthday into a magical princess party. The attention to detail was incredible!",
     },
     {
          name: "Michael Chen",
          date: "2023-07-22",
          rating: 5,
          message:
               "Our wedding decorations were absolutely stunning. The team was professional and delivered beyond our expectations.",
     },
     {
          name: "Priya Patel",
          date: "2023-09-05",
          rating: 4,
          message:
               "The baby shower decorations were adorable and exactly what we wanted. Highly recommended for any event!",
     },
     {
          name: "David Wilson",
          date: "2023-08-30",
          rating: 5,
          message:
               "Corporate event decoration was top-notch. Our clients were impressed with the setup and theme execution.",
     },
];

const Testimonials = () => {
     return (
          <>
               <Header />
               <div className="testimonial-section">
                    <h2>Customer Testimonials</h2>
                    <p className="subtitle">
                         Read what our clients have to say about our services
                    </p>

                    <div className="testimonial-grid">
                         {testimonials.map((item, index) => (
                              <div key={index} className="testimonial-card">
                                   <div className="stars">
                                        {"★".repeat(item.rating)}
                                        {"☆".repeat(5 - item.rating)}
                                   </div>

                                   <p className="message">"{item.message}"</p>

                                   <div className="client-info">
                                        <span className="name">- {item.name}</span>
                                        <span className="date">{item.date}</span>
                                   </div>
                              </div>
                         ))}
                    </div>
               </div>
               <Footer />
          </>
     );
};

export default Testimonials;
