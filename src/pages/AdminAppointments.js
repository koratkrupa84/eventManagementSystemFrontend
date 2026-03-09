import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/AdminAppointments.css";
import "../css/AdminCommon.css";
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
  const [clients, setClients] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    event_type: "",
    event_date: "",
    location: "",
    guests: "",
    budget: "",
    special_requirements: "",
    client_name: "",
    client_email: "",
    client_phone: "",
    client_id: ""
  });

  useEffect(() => {
    fetchAppointments();
    fetchClients();
    fetchCategories();
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
      const token = localStorage.getItem("token");
      console.log("=== FETCH APPOINTMENTS DEBUG START ===");
      console.log("Token:", token);
      
      const res = await axios.get(API.GET_APPOINTMENTS, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log("API Response:", res.data);
      console.log("Appointments data:", res.data.data);

      setAppointments(res.data.data);
      setFilteredAppointments(res.data.data);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("=== FETCH CLIENTS DEBUG START ===");
      console.log("Token:", token);
      
      const res = await axios.get(API.ADMIN_GET_CLIENTS, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("Clients API Response:", res.data);
      console.log("Clients data:", res.data.data);
      console.log("=== FETCH CLIENTS DEBUG END ===");
      
      setClients(res.data.data || []);
    } catch (err) {
      console.error("Error fetching clients:", err);
      console.error("Error response:", err.response?.data);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("=== FETCH CATEGORIES DEBUG START ===");
      console.log("Token:", token);
      
      const res = await axios.get(API.GET_CATEGORIES, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("Categories API Response:", res.data);
      console.log("Categories data:", res.data.data);
      console.log("=== FETCH CATEGORIES DEBUG END ===");
      
      setCategories(res.data.data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      console.error("Error response:", err.response?.data);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      console.log("=== STATUS CHANGE DEBUG START ===");
      console.log("Appointment ID:", id);
      console.log("New Status:", newStatus);
      
      const res = await axios.put(`${API.UPDATE_APPOINTMENT}/${id}`, 
        { status: newStatus.toLowerCase() },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log("Status update response:", res.data);

      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to update status");
      }

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
      
      console.log("=== STATUS CHANGE DEBUG END ===");
    } catch (err) {
      console.error("Error updating status:", err);
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this appointment?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      console.log("=== DELETE APPOINTMENT DEBUG START ===");
      console.log("Appointment ID:", id);
      
      const res = await axios.delete(`${API.DELETE_APPOINTMENT}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log("Delete response:", res.data);

      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to delete appointment");
      }

      // Update local state
      setAppointments(appointments.filter((item) => item._id !== id));
      setFilteredAppointments(filteredAppointments.filter((item) => item._id !== id));
      
      console.log("=== DELETE APPOINTMENT DEBUG END ===");
    } catch (err) {
      console.error("Error deleting appointment:", err);
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClientChange = (clientId) => {
    const selectedClient = clients.find(client => client._id === clientId);
    if (selectedClient) {
      setFormData(prev => ({
        ...prev,
        client_id: clientId,
        client_name: selectedClient.name,
        client_email: selectedClient.email,
        client_phone: selectedClient.phone || ""
      }));
    }
  };

  const handleAddAppointment = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Validate required fields - updated for dropdown structure
      if (!formData.event_type || !formData.event_date || !formData.location || !formData.client_id) {
        setError("Please select a client and fill all required fields");
        return;
      }

      // Use correct field names for admin endpoint
      const requestData = {
        eventType: formData.event_type,
        eventDate: formData.event_date,
        location: formData.location,
        guests: formData.guests || null,
        budget: formData.budget || null,
        message: formData.special_requirements || "",
        clientId: formData.client_id,
        packageId: null
      };

      console.log("=== CREATE APPOINTMENT DEBUG ===");
      console.log("Request data:", requestData);

      // Use admin endpoint for creating requests
      const res = await axios.post(API.ADMIN_ADD_PRIVATE_EVENT, requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (res.data.success || res.data) {
        // Add new appointment to state
        const newAppointment = res.data.data || res.data;
        setAppointments(prev => [newAppointment, ...prev]);
        setFilteredAppointments(prev => [newAppointment, ...prev]);
        
        // Reset form and close modal
        setFormData({
          event_type: "",
          event_date: "",
          location: "",
          guests: "",
          budget: "",
          special_requirements: "",
          client_name: "",
          client_email: "",
          client_phone: "",
          client_id: ""
        });
        setShowModal(false);
        setError("");
      }
    } catch (err) {
      console.error("Error creating appointment:", err);
      setError(err.response?.data?.message || "Failed to create appointment");
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
                      <option value="Confirmed">Confirmed</option>
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
          <div className="admin-modal-overlay">
            <div className="admin-modal-content">
              {/* Close Button */}
              <span
                className="close-btn"
                onClick={() => {
                  setShowModal(false);
                  setError("");
                }}
              >
                ×
              </span>

              {/* Add Appointment Form */}
              <div className="appointment-form">
                <h3>Add New Private Request</h3>
                
                {error && (
                  <div className="error-message">
                    <span className="error-icon">⚠️</span>
                    {error}
                  </div>
                )}

                <div className="form-grid">
                  <div className="form-group">
                    <label>Select Client *</label>
                    <select
                      name="client_id"
                      value={formData.client_id}
                      onChange={(e) => handleClientChange(e.target.value)}
                      className="form-input"
                      required
                    >
                      <option value="">Choose a client...</option>
                      {clients.map((client) => (
                        <option key={client._id} value={client._id}>
                          {client.name} - {client.email}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Event Type *</label>
                    <select
                      name="event_type"
                      value={formData.event_type}
                      onChange={handleFormChange}
                      className="form-input"
                      required
                    >
                      <option value="">Select event type...</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category.title}>
                          {category.title}
                        </option>
                      ))}
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Client Email</label>
                    <input
                      type="email"
                      name="client_email"
                      value={formData.client_email}
                      onChange={handleFormChange}
                      placeholder="Client email (auto-filled)"
                      className="form-input"
                      readOnly
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Client Phone</label>
                    <input
                      type="tel"
                      name="client_phone"
                      value={formData.client_phone}
                      onChange={handleFormChange}
                      placeholder="Client phone (auto-filled)"
                      className="form-input"
                      readOnly
                    />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Event Date *</label>
                    <input
                      type="date"
                      name="event_date"
                      value={formData.event_date}
                      onChange={handleFormChange}
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Location *</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleFormChange}
                      placeholder="Event location"
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Number of Guests</label>
                    <input
                      type="number"
                      name="guests"
                      value={formData.guests}
                      onChange={handleFormChange}
                      placeholder="Expected number of guests"
                      className="form-input"
                      min="1"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Budget (₹)</label>
                    <input
                      type="number"
                      name="budget"
                      value={formData.budget}
                      onChange={handleFormChange}
                      placeholder="Event budget"
                      className="form-input"
                      min="0"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Special Requirements</label>
                  <textarea
                    name="special_requirements"
                    value={formData.special_requirements}
                    onChange={handleFormChange}
                    placeholder="Any special requirements or preferences"
                    className="form-textarea"
                    rows="3"
                  />
                </div>

                <div className="form-actions">
                  <button
                    onClick={handleAddAppointment}
                    className="submit-btn"
                  >
                    Create Request
                  </button>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setError("");
                    }}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Appointment Modal */}
      {showViewModal && selectedAppointment && (
        <div className="admin-modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="admin-modal-content appointment-view-modal" onClick={(e) => e.stopPropagation()}>
            <span className="close-btn" onClick={() => setShowViewModal(false)}>
              ×
            </span>
            <div className="appointment-details">
              <h3>Appointment Details</h3>
              
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Client Name:</label>
                  <p>{selectedAppointment.client_id?.name || selectedAppointment.full_name || 'N/A'}</p>
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
              
              <div className="admin-modal-actions">
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
