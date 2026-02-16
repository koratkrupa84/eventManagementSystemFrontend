import React, { useState, useEffect } from "react";
import "../css/AdminAppointments.css";
import AddPrivateEvent from "../component/admin/AddPrivateEvent.js";
import { API } from "../services/apiConfig";

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAppointments();
  }, []);

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
    } catch (err) {
      setError(err.message);
    }
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

        <button
          className="add-btn"
          onClick={() => setShowModal(true)}
        >
          + Add New
        </button>
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
            {appointments.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  No appointments found
                </td>
              </tr>
            ) : (
              appointments.map((item) => (
                <tr key={item._id}>
                  <td>{item._id.slice(-6)}</td>
                  <td>{item.full_name}</td>
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
              <AddPrivateEvent />

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAppointments;
