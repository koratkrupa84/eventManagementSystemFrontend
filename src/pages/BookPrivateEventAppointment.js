import { useState, useEffect } from "react";
import axios from "axios";
import "../css/BookPrivateEventAppointment.css";
import { API } from "../services/apiConfig";
import Header from "../component/Header";
import Footer from "../component/Footer";

const BookPrivateEventAppointment = () => {
  const [formData, setFormData] = useState({
    eventType: "",
    packageId: "",
    eventDate: "",
    location: "",
    guests: "",
    budget: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState([]);
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    fetchCategories();
    fetchPackages();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(API.GET_CATEGORIES);
      const result = await res.json();
      
      if (res.ok && result?.success) {
        setCategories(result.data || []);
      }
    } catch (error) {
      console.log("Failed to fetch categories:", error);
    }
  };

  const fetchPackages = async () => {
    try {
      const res = await fetch(API.GET_PACKAGES);
      const result = await res.json();
      
      if (res.ok && result?.success) {
        setPackages(result.data || []);
      }
    } catch (error) {
      console.log("Failed to fetch packages:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    try {
      setLoading(true);
      
      // Get token from localStorage
      const token = localStorage.getItem("authToken");
      
      if (!token) {
        setError("Please login to book an appointment");
        return;
      }

      const res = await axios.post(
        API.PRIVATE_EVENT_BOOKING, 
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (res.data.success) {
        setSuccess(true);
        setFormData({
          eventType: "",
          packageId: "",
          eventDate: "",
          location: "",
          guests: "",
          budget: "",
          message: ""
        });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Error submitting request";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="booking-wrapper">
      <h2>Book Your Appointment</h2>
      <p>Fill out the form below and we'll get back to you within 24 hours</p>

      {error && <div className="booking-alert booking-alert-error">{error}</div>}
      {success && <div className="booking-alert booking-alert-success">Booking request submitted successfully! We'll contact you soon.</div>}

      <form onSubmit={handleSubmit}>
        <label>Event Type</label>
        <select name="eventType" required onChange={handleChange}>
          <option value="">Select Event Type</option>
          {categories.map((category) => (
            <option key={category._id} value={category.title}>
              {category.title}
            </option>
          ))}
        </select>

        <label>Package (Optional)</label>
        <select name="packageId" onChange={handleChange}>
          <option value="">Select a Package (Optional)</option>
          {packages.map((pkg) => (
            <option key={pkg._id} value={pkg._id}>
              {pkg.package_name} - ₹{pkg.price}
            </option>
          ))}
        </select>

        <label>Event Date</label>
        <input type="date" name="eventDate" required onChange={handleChange} />

        <label>Event Location</label>
        <input name="location" placeholder="Event Location" required onChange={handleChange} />

        <label>Number of Guests</label>
        <input type="number" name="guests" placeholder="Number of Guests" onChange={handleChange} />

        <label>Budget (Optional)</label>
        <input type="number" name="budget" placeholder="Budget" onChange={handleChange} />

        <label>Additional Details</label>
        <textarea
          name="message"
          placeholder="Any specific requirements or details about your event..."
          onChange={handleChange}
        ></textarea>

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Booking Request"}
        </button>
      </form>
    </div>
      <Footer />
    </>
  );
};

export default BookPrivateEventAppointment;
