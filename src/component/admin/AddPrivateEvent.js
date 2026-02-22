import React, { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../../services/apiConfig.js";
import "./AddPrivateEvent.css";

const AddPrivateEvent = ({ onSuccess, onClose }) => {

  const [formData, setFormData] = useState({
    client_id: "",
    client_name: "",
    event_type: "",
    event_date: "",
    location: "",
    guests: "",
    budget: "",
    special_requirements: "",
    organizer_id: "",
    request_id: ""
  });

  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clientMode, setClientMode] = useState("select");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchRequests();
    fetchOrganizers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(API.GET_USERS, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.data || response.data || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(API.GET_REQUESTS, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(response.data.data || response.data || []);
    } catch (error) {
      console.error("Failed to fetch requests:", error);
    }
  };

  const fetchOrganizers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(API.GET_ORGANIZERS, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrganizers(response.data.data || response.data || []);
    } catch (error) {
      console.error("Failed to fetch organizers:", error);
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
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      let submissionData = {
        event_type: formData.event_type,
        event_date: formData.event_date,
        location: formData.location,
        guests: formData.guests,
        budget: formData.budget,
        special_requirements: formData.special_requirements,
        organizer_id: formData.organizer_id,
        request_id: formData.request_id
      };

      if (clientMode === "select") {
        submissionData.client_id = formData.client_id;
      }

      if (clientMode === "manual") {
        const clientName = formData.client_name.trim();
        const generatedEmail =
          clientName.toLowerCase().replace(/\s+/g, ".") +
          "@eventmanagement.com";

        const clientResponse = await axios.post(
          API.CREATE_USER,
          {
            name: clientName,
            email: generatedEmail,
            password: "default123"
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        submissionData.client_id = clientResponse.data.data._id;
      }

      if (clientMode === "backend") {
        submissionData.client_id = "backend_user_id";
      }

      await axios.post(API.CREATE_APPOINTMENT, submissionData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Appointment created successfully!");

      setFormData({
        client_id: "",
        client_name: "",
        event_type: "",
        event_date: "",
        location: "",
        guests: "",
        budget: "",
        special_requirements: "",
        organizer_id: "",
        request_id: ""
      });

      if (onSuccess) onSuccess();

    } catch (error) {
      setError(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-form-container">
      <h2 className="form-title">Add New Appointment</h2>

      <form onSubmit={handleSubmit} className="admin-form">

        {/* Client Selection */}
        <div className="form-group">
          <label>Client *</label>

          <select
            value={clientMode}
            onChange={(e) => setClientMode(e.target.value)}
          >
            <option value="select">Select Existing Client</option>
            <option value="manual">Enter New Client</option>
            <option value="backend">Backend Entry</option>
          </select>

          {clientMode === "select" && (
            <select
              name="client_id"
              value={formData.client_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Client</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>
          )}

          {clientMode === "manual" && (
            <input
              type="text"
              name="client_name"
              value={formData.client_name}
              onChange={handleChange}
              placeholder="Enter client name"
              required
            />
          )}
        </div>

        <div className="form-group">
          <label>Event Type *</label>
          <input
            type="text"
            name="event_type"
            value={formData.event_type}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Event Date *</label>
          <input
            type="date"
            name="event_date"
            value={formData.event_date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Location *</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Guests</label>
          <input
            type="number"
            name="guests"
            value={formData.guests}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Budget</label>
          <input
            type="number"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Organizer *</label>
          <select
            name="organizer_id"
            value={formData.organizer_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Organizer</option>
            {organizers.map((org) => (
              <option key={org._id} value={org._id}>
                {org.name}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Appointment"}
        </button>

        {error && <p className="error-text">{error}</p>}
      </form>
    </div>
  );
};

export default AddPrivateEvent;