import React, { useEffect, useState } from "react";
import axios from "axios";
import { API } from "../services/apiConfig";
import "../css/AdminAppointments.css";
import "../css/AdminCommon.css";

const AdminPrivateEvents = () => {
  const [requests, setRequests] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRequests();
    fetchEvents();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get(API.GET_REQUESTS, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const approvedRequests = (res.data.data || res.data || [])
        .filter(r => r.status === "approved");

      setRequests(approvedRequests);
    } catch (err) {
      console.error("Error fetching requests:", err);
    }
  };

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get(API.GET_APPOINTMENTS, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setEvents(res.data.data || res.data || []);
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const handleCreateEvent = async () => {
    if (!selectedRequest) {
      setError("Please select a request");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");

      await axios.post(
        API.CREATE_APPOINTMENT,
        {
          request_id: selectedRequest._id,
          client_id: selectedRequest.client_id,
          event_type: selectedRequest.event_type,
          event_date: selectedRequest.event_date,
          location: selectedRequest.location,
          guests: selectedRequest.guests,
          budget: selectedRequest.budget
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert("Event created successfully!");
      setShowModal(false);
      setSelectedRequest(null);
      fetchEvents();

    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleViewEvent = (event) => {
    setSelectedEvent(event);
    setShowViewModal(true);
  };

  const handleUpdateEvent = async () => {
    try {
      const token = localStorage.getItem("authToken");
      
      await axios.put(
        `${API.UPDATE_APPOINTMENT}/${selectedEvent._id}`,
        {
          event_type: selectedEvent.event_type,
          event_date: selectedEvent.event_date,
          location: selectedEvent.location,
          guests: selectedEvent.guests,
          budget: selectedEvent.budget,
          status: selectedEvent.status
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert("Event updated successfully!");
      setShowViewModal(false);
      setSelectedEvent(null);
      fetchEvents();

    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      
      await axios.delete(`${API.DELETE_APPOINTMENT}/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Event deleted successfully!");
      fetchEvents();

    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Private Events Management</h2>

      <button
        onClick={() => setShowModal(true)}
        style={{
          padding: "8px 14px",
          background: "#6C5CE7",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          marginBottom: "20px"
        }}
      >
        Create Event from Approved Request
      </button>

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
            {events.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: "center" }}>
                  No events found. Create events from approved requests.
                </td>
              </tr>
            ) : (
              events.map((event) => (
                <tr key={event._id}>
                  <td>{event._id.slice(-6)}</td>
                  <td>{event.event_type}</td>
                  <td>{formatDate(event.event_date)}</td>
                  <td>{event.location}</td>
                  <td>{event.client_id?.name || 'N/A'}</td>
                  <td>{event.guests || 'N/A'}</td>
                  <td>{event.budget ? `₹${event.budget}` : 'N/A'}</td>
                  <td>
                    <span className={`status ${event.status || 'pending'}`}>
                      {event.status || 'pending'}
                    </span>
                  </td>
                  <td className="action-btns">
                    <button 
                      className="view-btn"
                      onClick={() => handleViewEvent(event)}
                    >
                      View
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteEvent(event._id)}
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

      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "20px",
              width: "400px",
              borderRadius: "8px"
            }}
          >
            <h3>Select Approved Request</h3>

            <select
              value={selectedRequest?._id || ""}
              onChange={(e) => {
                const req = requests.find(r => r._id === e.target.value);
                setSelectedRequest(req);
              }}
              style={{
                width: "100%",
                padding: "8px",
                marginBottom: "15px"
              }}
            >
              <option value="">Select Request</option>
              {requests.map(req => (
                <option key={req._id} value={req._id}>
                  {req.event_type} - {formatDate(req.event_date)}
                </option>
              ))}
            </select>

            {selectedRequest && (
              <div
                style={{
                  background: "#F3F4F6",
                  padding: "10px",
                  borderRadius: "6px",
                  marginBottom: "15px"
                }}
              >
                <p><strong>Type:</strong> {selectedRequest.event_type}</p>
                <p><strong>Date:</strong> {formatDate(selectedRequest.event_date)}</p>
                <p><strong>Location:</strong> {selectedRequest.location}</p>

                {selectedRequest.guests && (
                  <p><strong>Guests:</strong> {selectedRequest.guests}</p>
                )}

                {selectedRequest.budget && (
                  <p><strong>Budget:</strong> ₹{selectedRequest.budget}</p>
                )}
              </div>
            )}

            {error && (
              <p style={{ color: "red", fontSize: "14px" }}>{error}</p>
            )}

            <button
              onClick={handleCreateEvent}
              style={{
                padding: "8px 14px",
                background: "#00B894",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                marginRight: "10px"
              }}
            >
              Create Event
            </button>

            <button
              onClick={() => {
                setShowModal(false);
                setSelectedRequest(null);
                setError("");
              }}
              style={{
                padding: "8px 14px",
                background: "#d63031",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPrivateEvents;