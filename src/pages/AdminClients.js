import React, { useEffect, useState } from "react";
import axios from "axios";
import { API } from "../services/apiConfig";
import "../css/AdminAppointments.css";
import "../css/AdminCommon.css";

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
      const token = localStorage.getItem("authToken");
      const res = await axios.get(API.GET_USERS, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Filter only clients
      const clientList = (res.data.data || res.data || [])
        .filter(user => user.role === "client");
      
      setClients(clientList);
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
      const token = localStorage.getItem("authToken");
      
      await axios.delete(`${API.DELETE_USER}/${clientId}`, {
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
      const token = localStorage.getItem("authToken");
      
      await axios.post(API.CREATE_USER, formData, {
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
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>Loading clients...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>Clients Management</h2>
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
          Add New Client
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search clients by name, email, or phone..."
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
              <th>Client ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Registration Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredClients.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  {searchTerm ? "No clients found matching your search." : "No clients found."}
                </td>
              </tr>
            ) : (
              filteredClients.map((client) => (
                <tr key={client._id}>
                  <td>{client._id.slice(-6)}</td>
                  <td>{client.name}</td>
                  <td>{client.email}</td>
                  <td>{client.phone || 'N/A'}</td>
                  <td>{new Date(client.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`status ${client.isActive !== false ? 'approved' : 'rejected'}`}>
                      {client.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
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
        <div className="modal-overlay" onClick={() => {
          setShowViewModal(false);
          setSelectedClient(null);
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-btn" onClick={() => {
              setShowViewModal(false);
              setSelectedClient(null);
            }}>
              ×
            </span>
            <h3>Client Details</h3>
            
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ color: '#7F5539', marginBottom: '12px' }}>Personal Information</h4>
              <div style={{ 
                background: '#FDF7F2', 
                padding: '16px', 
                borderRadius: '12px',
                fontSize: '14px',
                color: '#7F5539'
              }}>
                <p><strong>Name:</strong> {selectedClient.name}</p>
                <p style={{ marginTop: '10px' }}><strong>Email:</strong> {selectedClient.email}</p>
                <p style={{ marginTop: '10px' }}><strong>Phone:</strong> {selectedClient.phone || 'N/A'}</p>
                <p style={{ marginTop: '10px' }}><strong>Role:</strong> {selectedClient.role}</p>
                <p style={{ marginTop: '10px' }}><strong>Status:</strong> 
                  <span className={`status ${selectedClient.isActive !== false ? 'approved' : 'rejected'}`} style={{ marginLeft: '8px' }}>
                    {selectedClient.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </p>
                <p style={{ marginTop: '10px' }}><strong>Registration Date:</strong> {new Date(selectedClient.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="form-actions" style={{ marginTop: '24px' }}>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedClient(null);
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

      {/* Add Client Modal */}
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
            <h3>Add New Client</h3>
            
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
            </div>

            {error && (
              <p style={{ color: "red", fontSize: "14px", marginBottom: '15px' }}>{error}</p>
            )}

            <div className="form-actions" style={{ marginTop: '24px' }}>
              <button
                onClick={handleAddClient}
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

export default AdminClients;
