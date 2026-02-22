import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/AdminPrivateEvents.css";
import { API } from "../services/apiConfig";

const AdminPrivateEvents = () => {
  const [requests, setRequests] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    organizer_id: "",
    details: "",
    guests: "",
    budget: "",
    location: "",
    event_date: "",
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [error, setError] = useState("");

  // Local storage to track only added events
  const [addedEvents, setAddedEvents] = useState([]);

  useEffect(() => {
    fetchRequests();
    fetchEvents();
  }, []);

  // Fetch approved requests only
  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("=== FETCH REQUESTS DEBUG START ===");
      console.log("Token:", token);
      
      const res = await axios.get(API.GET_REQUESTS, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log("API Response:", res.data);
      console.log("All requests:", res.data.data || []);
      
      // Show all requests first to debug
      const allRequests = res.data.data || [];
      console.log("All requests before filter:", allRequests);
      
      // Filter for approved requests
      const approvedRequests = allRequests.filter(
        (r) => r.status === "approved"
      );
      
      console.log("Approved requests:", approvedRequests);
      console.log("=== FETCH REQUESTS DEBUG END ===");
      
      // Show only approved requests in dropdown
      setRequests(approvedRequests);
    } catch (err) {
      console.error("Error fetching requests:", err);
      console.error("Error response:", err.response?.data);
    }
  };

  // Fetch all events (requests + private events)
  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(API.GET_APPOINTMENTS, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Filter only private events (type: 'private_event')
      const privateEvents = (res.data.data || res.data || [])
        .filter(event => event.type === 'private_event');

      setEvents(privateEvents);
      setAddedEvents(privateEvents);
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString();

  const handleSelectRequest = (req) => {
    setSelectedRequest(req);
    setFormData({
      organizer_id: req.client_id?._id || "",
      details: `Event: ${req.event_type} on ${formatDate(
        req.event_date
      )} at ${req.location}`,
      guests: req.guests || "",
      budget: req.budget || "",
      location: req.location || "",
      event_date: req.event_date || "",
    });
    setShowAddForm(true);
    setError("");
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddEvent = async () => {
    if (!selectedRequest) {
      setError("Please select a request");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        API.CREATE_APPOINTMENT,
        {
          request_id: selectedRequest._id,
          organizer_id: formData.organizer_id,
          details: formData.details,
          guests: formData.guests,
          budget: formData.budget,
          location: formData.location,
          event_date: formData.event_date,
          status: "confirmed",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update request status to confirmed
      await axios.put(
        `${API.UPDATE_APPOINTMENT}/${selectedRequest._id}`,
        { status: "confirmed" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Add the created event to local addedEvents state
      setAddedEvents((prev) => [...prev, res.data.data || res.data]);

      // Reset form
      setShowAddForm(false);
      setSelectedRequest(null);
      setFormData({
        organizer_id: "",
        details: "",
        guests: "",
        budget: "",
        location: "",
        event_date: "",
      });
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleViewEvent = (event) => {
    setSelectedEvent(event);
    setShowViewModal(true);
    setFormData({
      organizer_id: event.organizer_id?._id || event.client_id?._id || "",
      details: event.details || "",
      guests: event.guests || "",
      budget: event.budget || "",
      location: event.location || "",
      event_date: event.event_date || "",
      status: event.status || "confirmed",
    });
  };

  const handleUpdateEvent = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${API.UPDATE_APPOINTMENT}/${selectedEvent._id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local addedEvents
      setAddedEvents((prev) =>
        prev.map((e) => (e._id === selectedEvent._id ? res.data.data || res.data : e))
      );

      setShowViewModal(false);
      setSelectedEvent(null);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API.DELETE_APPOINTMENT}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAddedEvents((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="private-events-container">
      <h2 className="private-events-header">Private Events Management</h2>

      {/* Add Event Button */}
      <button
        onClick={() => setShowAddForm(!showAddForm)}
        className="primary-btn"
      >
        Create Event from Approved Request
      </button>

      {/* Add Event Form */}
      {showAddForm && (
        <div className="form-container">
          <h3 className="form-header">Select Approved Request</h3>
          
          <select
            value={selectedRequest?._id || ""}
            onChange={(e) =>
              handleSelectRequest(
                requests.find((r) => r._id === e.target.value)
              )
            }
            className="form-select"
          >
            <option value="">Select Approved Request</option>
            {requests.map((r) => (
              <option key={r._id} value={r._id}>
                {r.event_type} - {formatDate(r.event_date)}
              </option>
            ))}
          </select>

          {selectedRequest && (
            <div>
              <div className="request-preview">
                <p><strong>Event Type:</strong> {selectedRequest.event_type}</p>
                <p><strong>Date:</strong> {formatDate(selectedRequest.event_date)}</p>
                <p><strong>Location:</strong> {selectedRequest.location}</p>
                {selectedRequest.guests && (
                  <p><strong>Guests:</strong> {selectedRequest.guests}</p>
                )}
                {selectedRequest.budget && (
                  <p><strong>Budget:</strong> ₹{selectedRequest.budget}</p>
                )}
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Organizer ID:</label>
                  <input
                    type="text"
                    name="organizer_id"
                    value={formData.organizer_id}
                    onChange={handleFormChange}
                    placeholder="Organizer ID"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Event Date:</label>
                  <input
                    type="date"
                    name="event_date"
                    value={formData.event_date?.slice(0, 10)}
                    onChange={handleFormChange}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Event Details:</label>
                <input
                  type="text"
                  name="details"
                  value={formData.details}
                  onChange={handleFormChange}
                  placeholder="Event Details"
                  className="form-input"
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Number of Guests:</label>
                  <input
                    type="text"
                    name="guests"
                    value={formData.guests}
                    onChange={handleFormChange}
                    placeholder="Number of Guests"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Budget (₹):</label>
                  <input
                    type="text"
                    name="budget"
                    value={formData.budget}
                    onChange={handleFormChange}
                    placeholder="Budget (₹)"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Event Location:</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleFormChange}
                  placeholder="Event Location"
                  className="form-input"
                />
              </div>

              {error && (
                <div className="error-message">{error}</div>
              )}

              <div className="btn-group">
                <button
                  onClick={handleAddEvent}
                  className="success-btn"
                >
                  Create Event
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setSelectedRequest(null);
                    setError("");
                  }}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Events Table */}
      <div className="table-wrapper">
        <table className="appointment-table">
          <thead>
            <tr>
              <th>Event ID</th>
              <th>Event Type</th>
              <th>Date</th>
              <th>Location</th>
              <th>Client</th>
              <th>Guests</th>
              <th>Budget</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {addedEvents.length === 0 ? (
              <tr>
                <td colSpan="9" className="empty-state">
                  No events created yet. Create events from approved requests.
                </td>
              </tr>
            ) : (
              addedEvents.map((e) => (
                <tr key={e._id}>
                  <td>{e._id.slice(-6)}</td>
                  <td>{e.event_type || "Private Event"}</td>
                  <td>{formatDate(e.event_date)}</td>
                  <td>{e.location}</td>
                  <td>{e.client_id?.name || e.full_name || "N/A"}</td>
                  <td>{e.guests || "N/A"}</td>
                  <td>{e.budget ? `₹${e.budget}` : "N/A"}</td>
                  <td>
                    <span className={`status ${e.status || "confirmed"}`}>
                      {e.status || "confirmed"}
                    </span>
                  </td>
                  <td className="action-btns">
                    <button 
                      className="view-btn"
                      onClick={() => handleViewEvent(e)}
                    >
                      View/Edit
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteEvent(e._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* View/Edit Modal */}
      {showViewModal && selectedEvent && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-header">Edit Event</h3>
            
            <div className="form-group">
              <label className="form-label">Organizer ID:</label>
              <input
                type="text"
                name="organizer_id"
                value={formData.organizer_id}
                onChange={handleFormChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Event Details:</label>
              <input
                type="text"
                name="details"
                value={formData.details}
                onChange={handleFormChange}
                className="form-input"
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Guests:</label>
                <input
                  type="text"
                  name="guests"
                  value={formData.guests}
                  onChange={handleFormChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Budget:</label>
                <input
                  type="text"
                  name="budget"
                  value={formData.budget}
                  onChange={handleFormChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Location:</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleFormChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Event Date:</label>
              <input
                type="date"
                name="event_date"
                value={formData.event_date?.slice(0, 10)}
                onChange={handleFormChange}
                className="form-input"
              />
            </div>

            <div className="btn-group">
              <button
                onClick={handleUpdateEvent}
                className="success-btn"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedEvent(null);
                  setError("");
                }}
                className="cancel-btn"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPrivateEvents;