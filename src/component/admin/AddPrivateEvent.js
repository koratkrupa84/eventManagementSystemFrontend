import React, { useState } from "react";
import axios from "axios";
import { API } from "../../services/apiConfig.js";   // ✅ API import
import "./AddPrivateEvent.css";

const AddPrivateEvent = () => {

     const [formData, setFormData] = useState({
          fullName: "",
          mobile: "",
          eventType: "",
          eventDate: "",
          eventTime: "",
          location: "",
          guests: "",
          budget: "",
          message: "",
          packageId: ""
     });

     const handleChange = (e) => {
          setFormData({
               ...formData,
               [e.target.name]: e.target.value
          });
     };

     const handleSubmit = async (e) => {
     e.preventDefault();

     try {
          const token = localStorage.getItem("authToken");

          const { data } = await axios.post(
               API.ADMIN_ADD_PRIVATE_EVENT,
               formData,
               {
                    headers: {
                         Authorization: `Bearer ${token}`
                    }
               }
          );

          alert(data.message);

          setFormData({
               fullName: "",
               mobile: "",
               eventType: "",
               eventDate: "",
               eventTime: "",
               location: "",
               guests: "",
               budget: "",
               message: "",
               packageId: ""
          });

     } catch (error) {
          alert(error.response?.data?.message || "Something went wrong");
     }
};


     return (
          <div className="admin-form-container">
               <h2 className="form-title">Add Private Event (Admin)</h2>

               <form onSubmit={handleSubmit} className="admin-form">

                    <div className="form-group">
                         <label>Full Name *</label>
                         <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                         <label>Mobile Number *</label>
                         <input type="text" name="mobile" value={formData.mobile} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                         <label>Event Type *</label>
                         <select name="eventType" value={formData.eventType} onChange={handleChange} required>
                              <option value="">Select Event Type</option>
                              <option value="Wedding">Wedding</option>
                              <option value="Birthday">Birthday</option>
                              <option value="Baby Shower">Baby Shower</option>
                              <option value="Corporate">Corporate</option>
                         </select>
                    </div>

                    <div className="form-group">
                         <label>Event Date *</label>
                         <input type="date" name="eventDate" value={formData.eventDate} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                         <label>Event Time</label>
                         <input type="time" name="eventTime" value={formData.eventTime} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                         <label>Location *</label>
                         <input type="text" name="location" value={formData.location} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                         <label>Number of Guests</label>
                         <input type="number" name="guests" value={formData.guests} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                         <label>Budget (₹)</label>
                         <input type="number" name="budget" value={formData.budget} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                         <label>Special Requirements</label>
                         <textarea name="message" value={formData.message} onChange={handleChange}></textarea>
                    </div>

                    <button type="submit" className="submit-btn">
                         Add Event
                    </button>

               </form>
          </div>
     );
};

export default AddPrivateEvent;
