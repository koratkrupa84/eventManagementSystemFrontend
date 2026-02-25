import React, { useState, useEffect } from "react";
import "../css/ClientDashboard.css";
import Header from "../component/Header";
import Footer from "../component/Footer";
import { API } from "../services/apiConfig";

const ClientDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userData, setUserData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [showAppointmentViewModal, setShowAppointmentViewModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [formData, setFormData] = useState({
    event_type: "",
    event_date: "",
    location: "",
    guests: "",
    budget: "",
    special_requirements: ""
  });

  const handleViewAppointment = (appointment) => {
    console.log("=== VIEW APPOINTMENT DEBUG ===");
    console.log("Selected appointment:", appointment);
    console.log("Appointment status:", appointment.status);
    console.log("Has organizer:", !!appointment.organizer);
    console.log("Organizer data:", appointment.organizer);
    setSelectedAppointment(appointment);
    setShowAppointmentViewModal(true);
  };

  // handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    
    // Get user ID from token
    let userId = null;
    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      userId = tokenPayload.id;
    } catch (error) {
      console.log("Token decode error:", error);
    }

    if (!userId) {
      alert("User ID not found in token");
      return;
    }

    try {
      const res = await fetch(`${API.UPDATE_CLIENT_PROFILE}/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editData)
      });

      const data = await res.json();
      if (data.success) {
        alert("Profile updated successfully!");
        setUserData({ ...userData, ...editData });
        setIsEditing(false);
      } else {
        alert(data.message || "Update failed");
      }
    } catch (err) {
      console.log("Profile update error:", err);
    }
  };

  // ===============================
  // LOAD DATA (NO PROTECTION)
  // ===============================
  useEffect(() => {
    fetchUserData();
    fetchAppointments();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  // ===============================
  // FETCH USER DATA
  // ===============================
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(API.GET_CLIENT_PROFILE, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      const result = await response.json().catch(() => null);

      if (response.ok && result?.success) {
        setUserData(result.data);
      }
    } catch (error) {
      console.log("User fetch error:", error);
    }
  };

  // ===============================
  // FETCH APPOINTMENTS
  // ===============================
  const fetchAppointments = async () => {
    try {
      console.log("=== FRONTEND FETCH APPOINTMENTS START ===");
      const token = localStorage.getItem("token");
      console.log("Token exists:", !!token);

      const response = await fetch(API.GET_CLIENT_APPOINTMENTS, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      const result = await response.json().catch(() => null);
      console.log("API result:", result);

      if (response.ok && result?.success) {
        console.log("Appointments data:", result.data); // Debug log
        setAppointments(result.data || []);
      } else {
        console.log("API response error:", result); // Debug log
        setError(result?.message || "Failed to fetch appointments");
      }
    } catch (error) {
      console.log("Appointment fetch error:", error);
      setError("Failed to fetch appointments");
    } finally {
      setLoading(false);
      console.log("=== FRONTEND FETCH APPOINTMENTS END ===");
    }
  };

  // ===============================
  // FORM FUNCTIONS
  // ===============================
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Login required to book appointment");
      return;
    }

    try {
      const response = await fetch(API.BOOK_PRIVATE_EVENT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        alert("Appointment booked successfully!");
        setShowAppointmentForm(false);
        setFormData({
          event_type: "",
          event_date: "",
          location: "",
          guests: "",
          budget: "",
          special_requirements: ""
        });
        fetchAppointments();
      } else {
        alert(result.message || "Booking failed");
      }
    } catch (error) {
      console.log("Booking error:", error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "#FFA500";
      case "approved": return "#4CAF50";
      case "rejected": return "#F44336";
      case "completed": return "#2196F3";
      default: return "#666";
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="client-dashboard">
          <div className="loading">Loading dashboard...</div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="client-dashboard">
        <div className="dashboard-container">
          {/* Sidebar Navigation */}
          <div className="sidebar">
            <div className="user-profile">
              <div className="avatar">
                {userData?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <h3>{userData?.name || "Guest User"}</h3>
              <p>{userData?.email || "Not Logged In"}</p>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>

            <nav className="sidebar-nav">
              <button
                className={`nav-btn ${activeTab === "dashboard" ? "active" : ""}`}
                onClick={() => setActiveTab("dashboard")}
              >
                📊 Dashboard
              </button>
              <button
                className={`nav-btn ${activeTab === "appointments" ? "active" : ""}`}
                onClick={() => setActiveTab("appointments")}
              >
                📅 My Appointments
              </button>
              <button
                className={`nav-btn ${activeTab === "book" ? "active" : ""}`}
                onClick={() => setActiveTab("book")}
              >
                📝 Book Event
              </button>
              <button
                className={`nav-btn ${activeTab === "profile" ? "active" : ""}`}
                onClick={() => setActiveTab("profile")}
              >
                👤 Profile
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="main-content">
            {activeTab === "dashboard" && (
              <div className="dashboard-content">
                <h2>Welcome back, {userData?.name}!</h2>

                <div className="stats-grid">
                  <div className="statCard">
                    <h3>Total Appointments</h3>
                    <p className="stat-number">{appointments.length}</p>
                  </div>
                  <div className="statCard">
                    <h3>Pending</h3>
                    <p className="stat-number">
                      {appointments.filter(apt => apt.status === "pending").length}
                    </p>
                  </div>
                  <div className="statCard">
                    <h3>Approved</h3>
                    <p className="stat-number">
                      {appointments.filter(apt => apt.status === "approved").length}
                    </p>
                  </div>
                  <div className="statCard">
                    <h3>Completed</h3>
                    <p className="stat-number">
                      {appointments.filter(apt => apt.status === "completed").length}
                    </p>
                  </div>
                </div>

                <div className="recent-appointments">
                  <h3>Recent Appointments</h3>
                  <div className="appointment-list">
                    {appointments.slice(0, 3).map((appointment) => (
                      <div key={appointment._id} className="appointment-card">
                        <div className="appointment-info">
                          <h4>{appointment.event_type}</h4>
                          <p>{formatDate(appointment.event_date)}</p>
                          <p>{appointment.location}</p>
                        </div>
                        <span
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(appointment.status) }}
                        >
                          {appointment.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "appointments" && (
              <div className="appointments-content">
                <h2>My Appointments</h2>

                {loading ? (
                  <div className="loading-state">
                    <p>Loading appointments...</p>
                  </div>
                ) : error ? (
                  <div className="error-state">
                    <p>{error}</p>
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="empty-state">
                    <p>No appointments found</p>
                  </div>
                ) : (
                  <div className="appointments-grid">
                    {appointments.map((appointment) => {
                      console.log("Appointment:", appointment); // Debug log
                      return (
                    <div key={appointment._id} className="appointment-card">
                      <div className="appointment-header">
                        <h3>{appointment.event_type}</h3>
                        <span
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(appointment.status) }}
                        >
                          {appointment.status}
                        </span>
                      </div>
                      <div className="appointment-details">
                        <p><strong>Date:</strong> {formatDate(appointment.event_date)}</p>
                        <p><strong>Location:</strong> {appointment.location}</p>
                        <p><strong>Guests:</strong> {appointment.guests || "N/A"}</p>
                        <p><strong>Budget:</strong> ₹{appointment.budget || "N/A"}</p>
                        {appointment.special_requirements && (
                          <p><strong>Requirements:</strong> {appointment.special_requirements}</p>
                        )}
                        
                        {/* Show organizer details only for confirmed appointments */}
                        {appointment.status === "approved" && (
                          <div className="organizer-details">
                            <h4>Organizer Details:</h4>
                            {appointment.organizer ? (
                              <>
                                <p><strong>Name:</strong> {appointment.organizer.name || "N/A"}</p>
                                <p><strong>Email:</strong> {appointment.organizer.email || "N/A"}</p>
                                <p><strong>Phone:</strong> {appointment.organizer.phone || "N/A"}</p>
                                {appointment.organizer.company && (
                                  <p><strong>Company:</strong> {appointment.organizer.company}</p>
                                )}
                              </>
                            ) : (
                              <p><strong>Organizer information not available</strong></p>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="appointment-actions">
                        <button 
                          className="view-btn"
                          onClick={() => handleViewAppointment(appointment)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                    );
                  })}
                </div>
                )}
              </div>
            )}

            {activeTab === "book" && (
              <div className="book-content">
                <h2>Book New Event</h2>
                <form className="appointment-form" onSubmit={handleAppointmentSubmit}>
                  <div className="form-group">
                    <label>Event Type *</label>
                    <select
                      name="event_type"
                      value={formData.event_type}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Event Type</option>
                      <option value="Birthday">Birthday Party</option>
                      <option value="Wedding">Wedding</option>
                      <option value="Corporate">Corporate Event</option>
                      <option value="Anniversary">Anniversary</option>
                      <option value="Baby Shower">Baby Shower</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Event Date *</label>
                    <input
                      type="date"
                      name="event_date"
                      value={formData.event_date}
                      onChange={handleInputChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div className="form-group">
                    <label>Location *</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Event location"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Number of Guests</label>
                      <input
                        type="number"
                        name="guests"
                        value={formData.guests}
                        onChange={handleInputChange}
                        placeholder="Expected guests"
                        min="1"
                      />
                    </div>

                    <div className="form-group">
                      <label>Budget (₹)</label>
                      <input
                        type="number"
                        name="budget"
                        value={formData.budget}
                        onChange={handleInputChange}
                        placeholder="Your budget"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Special Requirements</label>
                    <textarea
                      name="special_requirements"
                      value={formData.special_requirements}
                      onChange={handleInputChange}
                      placeholder="Any special requirements or preferences..."
                      rows="4"
                    />
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="submitBtn">
                      Book Appointment
                    </button>
                    <button
                      type="button"
                      className="cancelBtn"
                      onClick={() => setFormData({
                        event_type: "",
                        event_date: "",
                        location: "",
                        guests: "",
                        budget: "",
                        special_requirements: ""
                      })}
                    >
                      Clear Form
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "profile" && (
              <div className="profile-content">
                <h2>My Profile</h2>
                <div className="profile-card">
                  <div className="profile-header">
                    <div className="profile-avatar">
                      {userData?.name?.charAt(0).toUpperCase()}
                    </div>
                    <h3>{userData?.name}</h3>
                    <p>{userData?.email}</p>
                    <button
                      className="edit-btn"
                      onClick={() => {
                        setIsEditing(true);
                        setEditData({
                          name: userData?.name || "",
                          phone: userData?.phone || "",
                          address: userData?.address || ""
                        });
                      }}
                    >
                      Edit Profile
                    </button>
                  </div>

                  <div className="profile-details">
                    {isEditing ? (
                      <form onSubmit={handleProfileUpdate}>
                        <div className="detailItem">
                          <label>Full Name:</label>
                          <input
                            type="text"
                            name="name"
                            value={editData.name}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="detailItem">
                          <label>Phone:</label>
                          <input
                            type="text"
                            name="phone"
                            value={editData.phone}
                            onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                          />
                        </div>
                        <div className="detailItem">
                          <label>Address:</label>
                          <input
                            type="text"
                            name="address"
                            value={editData.address}
                            onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                          />
                        </div>
                        <div className="form-actions">
                          <button type="submit" className="submitBtn">Save</button>
                          <button type="button" className="cancelBtn" onClick={() => setIsEditing(false)}>Cancel</button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="detailItem">
                          <label>Full Name:</label>
                          <p>{userData?.name}</p>
                        </div>
                        <div className="detailItem">
                          <label>Email:</label>
                          <p>{userData?.email}</p>
                        </div>
                        <div className="detailItem">
                          <label>Phone:</label>
                          <p>{userData?.phone || "Not provided"}</p>
                        </div>
                        <div className="detailItem">
                          <label>Address:</label>
                          <p>{userData?.address || "Not provided"}</p>
                        </div>
                        <div className="detailItem">
                          <label>Member Since:</label>
                          <p>{userData?.createdAt ? formatDate(userData.createdAt) : "N/A"}</p>
                        </div>
                        <div className="detailItem">
                          <label>User ID:</label>
                          <p>{userData?._id || "N/A"}</p>
                        </div>
                        <div className="detailItem">
                          <label>Account Status:</label>
                          <p className="status-active">Active</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Appointment View Modal */}
        {showAppointmentViewModal && selectedAppointment && (
          <div className="modal-overlay" onClick={() => setShowAppointmentViewModal(false)}>
            <div className="modal-content appointment-view-modal" onClick={(e) => e.stopPropagation()}>
              <span className="close-btn" onClick={() => setShowAppointmentViewModal(false)}>×</span>
              <h3>Appointment Details</h3>
              
              <div className="appointment-view-details">
                <div className="detail-section">
                  <h4>Event Information</h4>
                  <p><strong>Event Type:</strong> {selectedAppointment.event_type}</p>
                  <p><strong>Date:</strong> {formatDate(selectedAppointment.event_date)}</p>
                  <p><strong>Location:</strong> {selectedAppointment.location}</p>
                  <p><strong>Guests:</strong> {selectedAppointment.guests || "N/A"}</p>
                  <p><strong>Budget:</strong> ₹{selectedAppointment.budget || "N/A"}</p>
                  {selectedAppointment.special_requirements && (
                    <p><strong>Special Requirements:</strong> {selectedAppointment.special_requirements}</p>
                  )}
                  <p><strong>Status:</strong> 
                    <span 
                      className="status-badge" 
                      style={{ backgroundColor: getStatusColor(selectedAppointment.status) }}
                    >
                      {selectedAppointment.status}
                    </span>
                  </p>
                </div>

                {/* Show organizer details only for confirmed appointments */}
                {selectedAppointment.status === "approved" && (
                  <div className="detail-section">
                    <h4>Organizer Information</h4>
                    {selectedAppointment.organizer ? (
                      <>
                        <p><strong>Name:</strong> {selectedAppointment.organizer.name || "N/A"}</p>
                        <p><strong>Email:</strong> {selectedAppointment.organizer.email || "N/A"}</p>
                        <p><strong>Phone:</strong> {selectedAppointment.organizer.phone || "N/A"}</p>
                        {selectedAppointment.organizer.company && (
                          <p><strong>Company:</strong> {selectedAppointment.organizer.company}</p>
                        )}
                        {selectedAppointment.organizer.specialization && (
                          <p><strong>Specialization:</strong> {selectedAppointment.organizer.specialization}</p>
                        )}
                        {selectedAppointment.organizer.experience && (
                          <p><strong>Experience:</strong> {selectedAppointment.organizer.experience}</p>
                        )}
                      </>
                    ) : (
                      <p><strong>Organizer information not available</strong></p>
                    )}
                  </div>
                )}

                <div className="detail-section">
                  <h4>Booking Information</h4>
                  <p><strong>Booking ID:</strong> {selectedAppointment._id}</p>
                  <p><strong>Booked on:</strong> {formatDate(selectedAppointment.createdAt)}</p>
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  className="close-modal-btn"
                  onClick={() => setShowAppointmentViewModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default ClientDashboard;