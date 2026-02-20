import React, { useEffect, useState } from "react";
import axios from "axios";
import { API } from "../services/apiConfig";
import "../css/AdminAppointments.css";
import "../css/AdminCommon.css";

const AdminOrganizers = () => {
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedOrganizer, setSelectedOrganizer] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "organizer",
    specialization: "",
    experience: ""
  });

  useEffect(() => {
    fetchOrganizers();
  }, []);

  const fetchOrganizers = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get(API.GET_USERS, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Filter only organizers
      const organizerList = (res.data.data || res.data || [])
        .filter(user => user.role === "organizer");
      
      setOrganizers(organizerList);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch organizers");
      setLoading(false);
    }
  };

  const handleViewOrganizer = (organizer) => {
    setSelectedOrganizer(organizer);
    setShowViewModal(true);
  };

  const handleDeleteOrganizer = async (organizerId) => {
    if (!window.confirm("Are you sure you want to delete this organizer?")) {
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      
      await axios.delete(`${API.DELETE_USER}/${organizerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Organizer deleted successfully!");
      fetchOrganizers();

    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete organizer");
    }
  };

  const handleAddOrganizer = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      setError("Name, email, and password are required");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      
      await axios.post(API.CREATE_USER, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Organizer added successfully!");
      setShowAddModal(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "organizer",
        specialization: "",
        experience: ""
      });
      fetchOrganizers();

    } catch (err) {
      setError(err.response?.data?.message || "Failed to add organizer");
    }
  };

  const filteredOrganizers = organizers.filter(organizer =>
    organizer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    organizer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (organizer.phone && organizer.phone.includes(searchTerm)) ||
    (organizer.specialization && organizer.specialization.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>Loading organizers...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>Organizers Management</h2>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            padding: "8px 14px",
            background: "#6C5CE7",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Add New Organizer
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search organizers by name, email, phone, or specialization..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "6px",
            fontSize: "14px"
          }}
        />
      </div>

      {error && (
        <div style={{ 
          padding: "10px", 
          background: "#fee", 
          border: "1px solid #fcc", 
          borderRadius: "6px", 
          marginBottom: "20px",
          color: "#c00"
        }}>
          {error}
        </div>
      )}

      <div className="table-wrapper">
        <table className="appointment-table">
          <thead>
            <tr>
              <th>Organizer ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Specialization</th>
              <th>Experience</th>
              <th>Registration Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredOrganizers.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: "center" }}>
                  {searchTerm ? "No organizers found matching your search." : "No organizers found."}
                </td>
              </tr>
            ) : (
              filteredOrganizers.map((organizer) => (
                <tr key={organizer._id}>
                  <td>{organizer._id.slice(-6)}</td>
                  <td>{organizer.name}</td>
                  <td>{organizer.email}</td>
                  <td>{organizer.phone || 'N/A'}</td>
                  <td>{organizer.specialization || 'N/A'}</td>
                  <td>{organizer.experience || 'N/A'}</td>
                  <td>{new Date(organizer.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`status ${organizer.isActive !== false ? 'approved' : 'rejected'}`}>
                      {organizer.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="action-btns">
                    <button 
                      className="view-btn"
                      onClick={() => handleViewOrganizer(organizer)}
                    >
                      View
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteOrganizer(organizer._id)}
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

      {/* View Organizer Modal */}
      {showViewModal && selectedOrganizer && (
        <div className="modal-overlay" onClick={() => {
          setShowViewModal(false);
          setSelectedOrganizer(null);
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-btn" onClick={() => {
              setShowViewModal(false);
              setSelectedOrganizer(null);
            }}>
              ×
            </span>
            <h3>Organizer Details</h3>
            
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ color: '#7F5539', marginBottom: '12px' }}>Personal Information</h4>
              <div style={{ 
                background: '#FDF7F2', 
                padding: '16px', 
                borderRadius: '12px',
                fontSize: '14px',
                color: '#7F5539'
              }}>
                <p><strong>Name:</strong> {selectedOrganizer.name}</p>
                <p style={{ marginTop: '10px' }}><strong>Email:</strong> {selectedOrganizer.email}</p>
                <p style={{ marginTop: '10px' }}><strong>Phone:</strong> {selectedOrganizer.phone || 'N/A'}</p>
                <p style={{ marginTop: '10px' }}><strong>Role:</strong> {selectedOrganizer.role}</p>
                <p style={{ marginTop: '10px' }}><strong>Status:</strong> 
                  <span className={`status ${selectedOrganizer.isActive !== false ? 'approved' : 'rejected'}`} style={{ marginLeft: '8px' }}>
                    {selectedOrganizer.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </p>
                <p style={{ marginTop: '10px' }}><strong>Registration Date:</strong> {new Date(selectedOrganizer.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ color: '#7F5539', marginBottom: '12px' }}>Professional Information</h4>
              <div style={{ 
                background: '#FDF7F2', 
                padding: '16px', 
                borderRadius: '12px',
                fontSize: '14px',
                color: '#7F5539'
              }}>
                <p><strong>Specialization:</strong> {selectedOrganizer.specialization || 'N/A'}</p>
                <p style={{ marginTop: '10px' }}><strong>Experience:</strong> {selectedOrganizer.experience || 'N/A'}</p>
              </div>
            </div>

            <div className="form-actions" style={{ marginTop: '24px' }}>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedOrganizer(null);
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
        </div>
      )}

      {/* Add Organizer Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => {
          setShowAddModal(false);
          setError("");
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-btn" onClick={() => {
              setShowAddModal(false);
              setError("");
            }}>
              ×
            </span>
            <h3>Add New Organizer</h3>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#7F5539' }}>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    background: '#fff'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#7F5539' }}>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    background: '#fff'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#7F5539' }}>Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    background: '#fff'
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#7F5539' }}>Password *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    background: '#fff'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#7F5539' }}>Specialization</label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                  placeholder="e.g., Wedding, Corporate, Birthday"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    background: '#fff'
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#7F5539' }}>Experience</label>
                <input
                  type="text"
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  placeholder="e.g., 5 years, 10+ years"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    background: '#fff'
                  }}
                />
              </div>
            </div>

            {error && (
              <p style={{ color: "red", fontSize: "14px", marginBottom: '15px' }}>{error}</p>
            )}

            <div className="form-actions" style={{ marginTop: '24px' }}>
              <button
                onClick={handleAddOrganizer}
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
                Add Organizer
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    password: "",
                    role: "organizer",
                    specialization: "",
                    experience: ""
                  });
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
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrganizers;
