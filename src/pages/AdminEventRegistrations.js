import React, { useState, useEffect } from "react";
import "../css/AdminEventRegistrations.css";
import "../css/AdminCommon.css";
import { API } from "../services/apiConfig";

const AdminEventRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [eventFilter, setEventFilter] = useState("");

  useEffect(() => {
    fetchRegistrations();
    fetchEvents();
  }, []);

  useEffect(() => {
    const filtered = registrations.filter((registration) => {
      const matchesSearch = 
        registration.user_id?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        registration.user_id?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        registration.event_id?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        registration.event_id?.location?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !statusFilter || registration.event_id?.status === statusFilter;
      const matchesEvent = !eventFilter || registration.event_id?._id === eventFilter;
      
      return matchesSearch && matchesStatus && matchesEvent;
    });
    setFilteredRegistrations(filtered);
  }, [registrations, searchTerm, statusFilter, eventFilter]);

  const fetchRegistrations = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API.GET_ALL_EVENT_REGISTRATIONS, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to load registrations");

      setRegistrations(data.data || []);
      setFilteredRegistrations(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API.GET_PUBLIC_EVENTS, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (res.ok) {
        setEvents(data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch events:", err);
    }
  };

  const handleDeleteRegistration = async (registrationId) => {
    if (!window.confirm('Are you sure you want to delete this registration?')) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API.DELETE_EVENT_REGISTRATION}/${registrationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete registration");

      await fetchRegistrations();
      alert("Registration deleted successfully");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleStatusChange = async (registrationId, newStatus) => {
    try {
      console.log("Updating status:", { registrationId, newStatus });
      
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const apiUrl = `${API.UPDATE_REGISTRATION_STATUS.replace('{id}', registrationId)}/status`;
      console.log("API URL:", apiUrl);
      
      const res = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      console.log("Response status:", res.status);
      
      const responseData = await res.json();
      console.log("Response data:", responseData);

      if (!res.ok) {
        throw new Error(responseData.message || `Failed to update status (${res.status})`);
      }

      await fetchRegistrations();
      alert(`Registration status updated to ${newStatus}`);
    } catch (err) {
      console.error("Status update error:", err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleView = (registration) => {
    setSelectedRegistration(registration);
    setShowViewModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getRegistrationStats = () => {
    const total = registrations.length;
    const upcoming = registrations.filter(reg => reg.event_id?.status === 'upcoming').length;
    const completed = registrations.filter(reg => reg.event_id?.status === 'completed').length;
    
    return { total, upcoming, completed };
  };

  if (loading) return <div className="loading">Loading registrations...</div>;
  if (error) return <div className="error">{error}</div>;

  const stats = getRegistrationStats();

  return (
    <div className="admin-event-registrations">
      <div className="page-header">
        <h1>Event Registrations</h1>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>Total Registrations</h3>
            <p className="stat-number">{stats.total}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <h3>Upcoming Events</h3>
            <p className="stat-number">{stats.upcoming}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>Completed Events</h3>
            <p className="stat-number">{stats.completed}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search by user, event, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div className="filter-group">
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Events</option>
            {events.map((event) => (
              <option key={event._id} value={event._id}>
                {event.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Registrations Table */}
      <div className="registrations-table-container">
        <table className="registrations-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Event</th>
              <th>Date & Time</th>
              <th>Location</th>
              <th>Persons</th>
              <th>Registration Status</th>
              <th>Registered On</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRegistrations.map((registration) => (
              <tr key={registration._id}>
                <td>
                  <div className="user-info">
                    <div className="user-name">{registration.user_id?.name || 'N/A'}</div>
                    <div className="user-email">{registration.user_id?.email || 'N/A'}</div>
                  </div>
                </td>
                <td>
                  <div className="event-info">
                    <div className="event-title">{registration.event_id?.title || 'N/A'}</div>
                  </div>
                </td>
                <td>
                  {registration.event_id?.event_date 
                    ? formatDate(registration.event_id.event_date)
                    : 'N/A'
                  }
                </td>
                <td>{registration.event_id?.location || 'N/A'}</td>
                <td>
                  <span className="persons-count">
                    {registration.total_Parson || 1} {registration.total_Parson > 1 ? 'Persons' : 'Person'}
                  </span>
                </td>
                <td>
                  <select
                    value={registration.status || 'pending'}
                    onChange={(e) => handleStatusChange(registration._id, e.target.value)}
                    className="status-select"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>
                <td>{formatDate(registration.createdAt)}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn btn-view" 
                      onClick={() => handleView(registration)}
                    >
                      View
                    </button>
                    <button 
                      className="btn btn-delete" 
                      onClick={() => handleDeleteRegistration(registration._id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredRegistrations.length === 0 && (
        <div className="no-registrations">
          <p>No registrations found</p>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedRegistration && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Registration Details</h2>
              <button className="close-btn" onClick={() => setShowViewModal(false)}>
                ×
              </button>
            </div>
            <div className="registration-view">
              <div className="registration-section">
                <h3>User Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Name:</label>
                    <span>{selectedRegistration.user_id?.name || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <label>Email:</label>
                    <span>{selectedRegistration.user_id?.email || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <label>Phone:</label>
                    <span>{selectedRegistration.user_id?.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="registration-section">
                <h3>Event Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Event Title:</label>
                    <span>{selectedRegistration.event_id?.title || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <label>Date & Time:</label>
                    <span>
                      {selectedRegistration.event_id?.event_date 
                        ? formatDate(selectedRegistration.event_id.event_date)
                        : 'N/A'
                      }
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Location:</label>
                    <span>{selectedRegistration.event_id?.location || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <label>Status:</label>
                    <span className={`status ${selectedRegistration.event_id?.status || 'unknown'}`}>
                      {selectedRegistration.event_id?.status || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="registration-section">
                <h3>Registration Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Registration ID:</label>
                    <span>{selectedRegistration._id}</span>
                  </div>
                  <div className="info-item">
                    <label>Number of Persons:</label>
                    <span>{selectedRegistration.total_Parson || 1} Person(s)</span>
                  </div>
                  <div className="info-item">
                    <label>Registration Status:</label>
                    <span className={`status ${selectedRegistration.status || 'unknown'}`}>
                      {selectedRegistration.status || 'Unknown'}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Registration Date:</label>
                    <span>
                      {selectedRegistration.registration_date 
                        ? formatDate(selectedRegistration.registration_date)
                        : formatDate(selectedRegistration.createdAt)
                      }
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Registered On:</label>
                    <span>{formatDate(selectedRegistration.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEventRegistrations;
