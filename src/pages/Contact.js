import "../css/Contact.css";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaFacebookF, FaInstagram, FaTwitter, FaPinterestP } from "react-icons/fa";

import Header from "../component/Header";
import Footer from "../component/Footer";

const Contact = () => {
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
                              <h4>Quick Contact Form</h4>

                              <input type="text" placeholder="Your Name" />
                              <input type="email" placeholder="Your Email" />
                              <input type="text" placeholder="Subject" />
                              <textarea placeholder="Your Message"></textarea>

                              <button>Send Message</button>
                         </div>

                    </div>

                    {/* Map */}
                    <div className="map-box">
                         <p>Google Map Embed Here</p>
                    </div>
               </div>
               <Footer />
          </>
     );
};

export default Contact;
