import React, { useEffect, useState } from "react";
import axios from "axios";
import { API } from "../services/apiConfig";
import "../css/AdminOrganizers.css";
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
    confirmPassword: "",
    company: "",
    specialization: "",
    experience: "",
    bio: "",
    website: "",
    licenseNumber: "",
    services: []
  });

  useEffect(() => {
    fetchOrganizers();
  }, []);

  const fetchOrganizers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(API.ADMIN_GET_ORGANIZERS, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setOrganizers(res.data.data || []);
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
      const token = localStorage.getItem("token");
      
      await axios.delete(`${API.ADMIN_DELETE_ORGANIZER}/${organizerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Organizer deleted successfully!");
      fetchOrganizers();

    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete organizer");
    }
  };

  const handleAddOrganizer = async () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Name, email, password, and confirm password are required");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      
      await axios.post(API.ORGANIZER_REGISTER, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Organizer added successfully!");
      setShowAddModal(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        company: "",
        specialization: "",
        experience: "",
        bio: "",
        website: "",
        licenseNumber: "",
        services: []
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
                <p style={{ marginTop: '10px' }}><strong>Company:</strong> {selectedOrganizer.company || 'N/A'}</p>
                <p style={{ marginTop: '10px' }}><strong>Website:</strong> {selectedOrganizer.website ? (
                  <a href={selectedOrganizer.website} target="_blank" rel="noopener noreferrer" style={{ color: '#6C5CE7' }}>
                    {selectedOrganizer.website}
                  </a>
                ) : 'N/A'}</p>
                <p style={{ marginTop: '10px' }}><strong>Status:</strong> 
                  <span className={`status ${selectedOrganizer.isActive !== false ? 'approved' : 'rejected'}`} style={{ marginLeft: '8px' }}>
                    {selectedOrganizer.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </p>
                <p style={{ marginTop: '10px' }}><strong>Verified:</strong> 
                  <span className={`status ${selectedOrganizer.isVerified ? 'approved' : 'rejected'}`} style={{ marginLeft: '8px' }}>
                    {selectedOrganizer.isVerified ? 'Verified' : 'Not Verified'}
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
                <p style={{ marginTop: '10px' }}><strong>Rating:</strong> {selectedOrganizer.rating ? `${selectedOrganizer.rating}⭐` : 'N/A'}</p>
                <p style={{ marginTop: '10px' }}><strong>Total Events:</strong> {selectedOrganizer.totalEvents || 0}</p>
                <p style={{ marginTop: '10px' }}><strong>License Number:</strong> {selectedOrganizer.licenseNumber || 'N/A'}</p>
                <p style={{ marginTop: '10px' }}><strong>Services:</strong> {selectedOrganizer.services && selectedOrganizer.services.length > 0 ? selectedOrganizer.services.join(', ') : 'N/A'}</p>
              </div>
            </div>

            {selectedOrganizer.bio && (
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ color: '#7F5539', marginBottom: '12px' }}>Bio</h4>
                <div style={{ 
                  background: '#FDF7F2', 
                  padding: '16px', 
                  borderRadius: '12px',
                  fontSize: '14px',
                  color: '#7F5539'
                }}>
                  <p>{selectedOrganizer.bio}</p>
                </div>
              </div>
            )}

            {selectedOrganizer.address && Object.keys(selectedOrganizer.address).length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ color: '#7F5539', marginBottom: '12px' }}>Address</h4>
                <div style={{ 
                  background: '#FDF7F2', 
                  padding: '16px', 
                  borderRadius: '12px',
                  fontSize: '14px',
                  color: '#7F5539'
                }}>
                  <p><strong>Street:</strong> {selectedOrganizer.address.street || 'N/A'}</p>
                  <p style={{ marginTop: '10px' }}><strong>City:</strong> {selectedOrganizer.address.city || 'N/A'}</p>
                  <p style={{ marginTop: '10px' }}><strong>State:</strong> {selectedOrganizer.address.state || 'N/A'}</p>
                  <p style={{ marginTop: '10px' }}><strong>Zip Code:</strong> {selectedOrganizer.address.zipCode || 'N/A'}</p>
                  <p style={{ marginTop: '10px' }}><strong>Country:</strong> {selectedOrganizer.address.country || 'N/A'}</p>
                </div>
              </div>
            )}

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
                <label style={{ display: 'block', marginBottom: '5px', color: '#7F5539' }}>Confirm Password *</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
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
                <label style={{ display: 'block', marginBottom: '5px', color: '#7F5539' }}>Company</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
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
                <label style={{ display: 'block', marginBottom: '5px', color: '#7F5539' }}>Specialization</label>
                <select
                  value={formData.specialization}
                  onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    background: '#fff'
                  }}
                >
                  <option value="">Select Specialization</option>
                  <option value="wedding">Wedding</option>
                  <option value="corporate">Corporate</option>
                  <option value="birthday">Birthday</option>
                  <option value="concert">Concert</option>
                  <option value="conference">Conference</option>
                  <option value="sports">Sports</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#7F5539' }}>Experience</label>
                <select
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    background: '#fff'
                  }}
                >
                  <option value="">Select Experience</option>
                  <option value="0-2">0-2 years</option>
                  <option value="2-5">2-5 years</option>
                  <option value="5-10">5-10 years</option>
                  <option value="10+">10+ years</option>
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#7F5539' }}>Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  placeholder="Brief description about the organizer..."
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    background: '#fff',
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#7F5539' }}>Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  placeholder="https://example.com"
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
                <label style={{ display: 'block', marginBottom: '5px', color: '#7F5539' }}>License Number</label>
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
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
                    confirmPassword: "",
                    company: "",
                    specialization: "",
                    experience: "",
                    bio: "",
                    website: "",
                    licenseNumber: "",
                    services: []
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
