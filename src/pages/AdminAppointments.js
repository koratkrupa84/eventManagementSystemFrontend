import React, { useState, useEffect } from "react";
import "../css/AdminAppointments.css";
import "../css/AdminCommon.css";
import AddPrivateEvent from "../component/admin/AddPrivateEvent.js";
import { API } from "../services/apiConfig";

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    const filtered = appointments.filter((appointment) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        appointment.full_name?.toLowerCase().includes(searchLower) ||
        appointment.event_type?.toLowerCase().includes(searchLower) ||
        appointment.location?.toLowerCase().includes(searchLower) ||
        appointment.status?.toLowerCase().includes(searchLower)
      );
    });
    setFilteredAppointments(filtered);
  }, [appointments, searchTerm]);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(API.GET_APPOINTMENTS, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to load appointments");

      setAppointments(data.data);
      setFilteredAppointments(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API.UPDATE_APPOINTMENT_STATUS}/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus.toLowerCase() })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to update status");

      // Update local state
      setAppointments(
        appointments.map((item) =>
          item._id === id ? { ...item, status: newStatus.toLowerCase() } : item
        )
      );
      setFilteredAppointments(
        filteredAppointments.map((item) =>
          item._id === id ? { ...item, status: newStatus.toLowerCase() } : item
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this appointment?")) {
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API.DELETE_APPOINTMENT}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to delete appointment");

      setAppointments(appointments.filter((item) => item._id !== id));
      setFilteredAppointments(filteredAppointments.filter((item) => item._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleView = (appointment) => {
    setSelectedAppointment(appointment);
    setShowViewModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const capitalizeStatus = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return <div>Loading appointments...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="appointment-header">
        <div>
          <h2>Manage Appointments</h2>
          <p className="sub-title">All Appointments</p>
        </div>

        <div className="header-actions">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button
            className="add-btn"
            onClick={() => setShowModal(true)}
          >
            + Add New
          </button>
        </div>
      </div>

      {error && <div className="error-text">{error}</div>}

      {/* Table */}
      <div className="table-wrapper">
        <table className="appointment-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Client Name</th>
              <th>Event Type</th>
              <th>Date</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredAppointments.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  No appointments found
                </td>
              </tr>
            ) : (
              filteredAppointments.map((item) => (
                <tr key={item._id}>
                  <td>{item._id.slice(-6)}</td>
                  <td>{item.client_id?.name || 'Backend Entry'}</td>
                  <td>{item.event_type}</td>
                  <td>{formatDate(item.event_date)}</td>
                  <td>{item.location}</td>

                  <td>
                    <select
                      value={capitalizeStatus(item.status)}
                      onChange={(e) =>
                        handleStatusChange(item._id, e.target.value)
                      }
                      className="status-select"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Completed">Completed</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>

                  <td className="action-btns">
                    <button
                      className="view-btn"
                      onClick={() => handleView(item)}
                    >
                      View
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(item._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              {/* Close Button */}
              <span
                className="close-btn"
                onClick={() => {
                  setShowModal(false);
                  fetchAppointments();
                }}
              >
                ×
              </span>

              {/* 🔥 Your Existing Form Component */}
              <AddPrivateEvent 
                onSuccess={() => {
                  setShowModal(false);
                  fetchAppointments();
                }}
              />

            </div>
          </div>
        )}
      </div>

      {/* View Appointment Modal */}
      {showViewModal && selectedAppointment && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content appointment-view-modal" onClick={(e) => e.stopPropagation()}>
            <span className="close-btn" onClick={() => setShowViewModal(false)}>
              ×
            </span>
            <div className="appointment-details">
              <h3>Appointment Details</h3>
              
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Client Name:</label>
                  <p>{selectedAppointment.full_name}</p>
                </div>
                
                <div className="detail-item">
                  <label>Event Type:</label>
                  <p>{selectedAppointment.event_type}</p>
                </div>
                
                <div className="detail-item">
                  <label>Event Date:</label>
                  <p>{formatDate(selectedAppointment.event_date)}</p>
                </div>
                
                <div className="detail-item">
                  <label>Location:</label>
                  <p>{selectedAppointment.location}</p>
                </div>
                
                <div className="detail-item">
                  <label>Guests:</label>
                  <p>{selectedAppointment.guests || 'N/A'}</p>
                </div>
                
                <div className="detail-item">
                  <label>Budget:</label>
                  <p>₹{selectedAppointment.budget || 'N/A'}</p>
                </div>
                
                <div className="detail-item">
                  <label>Special Requirements:</label>
                  <p>{selectedAppointment.special_requirements || 'None'}</p>
                </div>
                
                <div className="detail-item">
                  <label>Status:</label>
                  <span className={`status-badge ${selectedAppointment.status}`}>
                    {capitalizeStatus(selectedAppointment.status)}
                  </span>
                </div>
              </div>
              
              <div className="modal-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => setShowViewModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAppointments;
