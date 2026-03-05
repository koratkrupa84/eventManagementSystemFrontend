import React, { useEffect, useState } from "react";
import axios from "axios";
import { API } from "../services/apiConfig";
import "../css/AdminAppointments.css";
import "../css/AdminCommon.css";
import "../css/AdminClients.css";

const AdminClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "client"
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // First, try to fix existing client profiles
      try {
        await axios.post(API.ADMIN_CREATE_CLIENT + '/fix', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (fixErr) {
        console.log('Fix attempt:', fixErr.response?.data?.message || 'Already fixed or not needed');
      }
      
      // Then fetch clients
      const res = await axios.get(API.ADMIN_GET_CLIENTS, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Fetched clients:', res.data.data);
      console.log('Sample client data:', res.data.data[0]);

      setClients(res.data.data || []);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch clients");
      setLoading(false);
    }
  };

  const handleViewClient = (client) => {
    setSelectedClient(client);
    setShowViewModal(true);
  };

  const handleDeleteClient = async (clientId) => {
    if (!window.confirm("Are you sure you want to delete this client?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      
      await axios.delete(`${API.ADMIN_DELETE_CLIENT}/${clientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Client deleted successfully!");
      fetchClients();

    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete client");
    }
  };

  const handleAddClient = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      setError("Name, email, and password are required");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      
      const clientData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: "client",
        UserProfile: {
          phone: formData.phone || "",
          address: "",
          city: "",
          state: "",
          zipCode: ""
        }
      };
      
      console.log("Sending client data:", clientData);
      
      await axios.post(API.ADMIN_CREATE_CLIENT, clientData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Client added successfully!");
      setShowAddModal(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "client"
      });
      fetchClients();

    } catch (err) {
      console.error("Add client error:", err.response?.data);
      setError(err.response?.data?.message || "Failed to add client");
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.phone && client.phone.includes(searchTerm))
  );

  if (loading) {
    return (
      <div className="loading">
        <p>Loading clients...</p>
      </div>
    );
  }

  return (
    <div className="admin-clients-container">
      <div className="clients-header">
        <h2>Clients Management</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="add-btn"
        >
          Add New Client
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <i className="fas fa-search search-icon"></i>
        <input
          type="text"
          placeholder="Search clients by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input search-input-with-icon"
        />
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="table-wrapper">
        <table className="clients-table">
          <thead>
            <tr>
              <th>Client ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Registration Date</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredClients.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-state">
                  {searchTerm ? "No clients found matching your search." : "No clients found."}
                </td>
              </tr>
            ) : (
              filteredClients.map((client) => (
                <tr key={client._id}>
                  <td>{client._id.slice(-6)}</td>
                  <td>{client.name}</td>
                  <td>{client.email}</td>
                  <td>
                    {client.clientProfile?.phone || client.phone || 'N/A'}
                  </td>
                  <td>{new Date(client.createdAt).toLocaleDateString()}</td>
                  <td className="action-btns">
                    <button 
                      className="view-btn"
                      onClick={() => handleViewClient(client)}
                    >
                      View
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteClient(client._id)}
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

      {/* View Client Modal */}
      {showViewModal && selectedClient && (
        <div className="admin-client-modal-overlay" onClick={() => {
          setShowViewModal(false);
          setSelectedClient(null);
        }}>
          <div className="admin-client-modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-btn" onClick={() => {
              setShowViewModal(false);
              setSelectedClient(null);
            }}>
              ×
            </span>
            <h3>Client Details</h3>
            
            <div className="client-details-section">
              <h4>Personal Information</h4>
              <div className="client-info-card">
                <p><strong>Name:</strong> {selectedClient.name}</p>
                <p><strong>Email:</strong> {selectedClient.email}</p>
                <p><strong>Phone:</strong> {selectedClient.clientProfile?.phone || 'N/A'}</p>
                <p><strong>Role:</strong> {selectedClient.role}</p>
                <p><strong>Status:</strong> 
                  <span className={`status ${selectedClient.isActive !== false ? 'approved' : 'rejected'}`} style={{ marginLeft: '8px' }}>
                    {selectedClient.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </p>
                <p><strong>Registration Date:</strong> {new Date(selectedClient.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {selectedClient.clientProfile?.address && (
              <div className="client-details-section">
                <h4>Address Information</h4>
                <div className="client-info-card">
                  <p><strong>Address:</strong> {selectedClient.clientProfile.address}</p>
                </div>
              </div>
            )}

            <div className="form-actions">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedClient(null);
                }}
                className="btn-danger"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="admin-client-modal-overlay" onClick={() => {
          setShowAddModal(false);
          setError("");
        }}>
          <div className="admin-client-modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-btn" onClick={() => {
              setShowAddModal(false);
              setError("");
            }}>
              ×
            </span>
            <h3>Add New Client</h3>
            
            <div>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="form-input"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="form-error">{error}</p>
            )}

            <div className="form-actions">
              <button
                onClick={handleAddClient}
                className="btn-primary"
              >
                Add Client
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    password: "",
                    role: "client"
                  });
                  setError("");
                }}
                className="btn-secondary"
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

export default AdminClients;
