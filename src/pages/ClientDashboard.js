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
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [formData, setFormData] = useState({
    event_type: "",
    event_date: "",
    location: "",
    guests: "",
    budget: "",
    special_requirements: ""
  });

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
    window.location.reload();
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
      const token = localStorage.getItem("token");

      const response = await fetch(API.GET_CLIENT_APPOINTMENTS, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      const result = await response.json().catch(() => null);

      if (response.ok && result?.success) {
        setAppointments(result.data || []);
      }
    } catch (error) {
      console.log("Appointment fetch error:", error);
    } finally {
      setLoading(false);
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
                  <div className="stat-card">
                    <h3>Total Appointments</h3>
                    <p className="stat-number">{appointments.length}</p>
                  </div>
                  <div className="stat-card">
                    <h3>Pending</h3>
                    <p className="stat-number">
                      {appointments.filter(apt => apt.status === "pending").length}
                    </p>
                  </div>
                  <div className="stat-card">
                    <h3>Approved</h3>
                    <p className="stat-number">
                      {appointments.filter(apt => apt.status === "approved").length}
                    </p>
                  </div>
                  <div className="stat-card">
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
                <button
                  className="book-btn"
                  onClick={() => setShowAppointmentForm(true)}
                >
                  + Book New Appointment
                </button>

                <div className="appointments-grid">
                  {appointments.map((appointment) => (
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
                      </div>
                    </div>
                  ))}
                </div>
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
                    <button type="submit" className="submit-btn">
                      Book Appointment
                    </button>
                    <button
                      type="button"
                      className="cancel-btn"
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
                        <div className="detail-item">
                          <label>Full Name:</label>
                          <input
                            type="text"
                            name="name"
                            value={editData.name}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="detail-item">
                          <label>Phone:</label>
                          <input
                            type="text"
                            name="phone"
                            value={editData.phone}
                            onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                          />
                        </div>
                        <div className="detail-item">
                          <label>Address:</label>
                          <input
                            type="text"
                            name="address"
                            value={editData.address}
                            onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                          />
                        </div>
                        <div className="form-actions">
                          <button type="submit" className="submit-btn">Save</button>
                          <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="detail-item">
                          <label>Full Name:</label>
                          <p>{userData?.name}</p>
                        </div>
                        <div className="detail-item">
                          <label>Email:</label>
                          <p>{userData?.email}</p>
                        </div>
                        <div className="detail-item">
                          <label>Phone:</label>
                          <p>{userData?.phone || "Not provided"}</p>
                        </div>
                        <div className="detail-item">
                          <label>Address:</label>
                          <p>{userData?.address || "Not provided"}</p>
                        </div>
                        <div className="detail-item">
                          <label>Member Since:</label>
                          <p>{userData?.createdAt ? formatDate(userData.createdAt) : "N/A"}</p>
                        </div>
                        <div className="detail-item">
                          <label>User ID:</label>
                          <p>{userData?._id || "N/A"}</p>
                        </div>
                        <div className="detail-item">
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
      </div>
      <Footer />
    </>
  );
};

export default ClientDashboard;