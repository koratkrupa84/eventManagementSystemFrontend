import React, { useState, useEffect } from "react";
import "../css/AdminInquiries.css";
import "../css/AdminCommon.css";
import { API } from "../services/apiConfig";

const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(API.GET_INQUIRIES, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to load inquiries");

      setInquiries(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API.UPDATE_INQUIRY_STATUS}/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to update status");

      setInquiries(
        inquiries.map((item) =>
          item._id === id ? { ...item, status: newStatus } : item
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this inquiry?")) {
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API.DELETE_INQUIRY}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to delete inquiry");

      setInquiries(inquiries.filter((item) => item._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleView = async (id) => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API.GET_INQUIRY}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to load inquiry");

      setSelectedInquiry(data.data);
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return <div>Loading inquiries...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="inquiry-header">
        <div>
          <h2>Manage Inquiries</h2>
          <p className="sub-title">Contact Form Submissions</p>
        </div>
      </div>

      {error && <div className="error-text">{error}</div>}

      {/* Table */}
      <div className="table-wrapper">
        <table className="inquiry-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Subject</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {inquiries.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  No inquiries found
                </td>
              </tr>
            ) : (
              inquiries.map((item) => (
                <tr key={item._id}>
                  <td>{item._id.slice(-6)}</td>
                  <td>{item.name}</td>
                  <td>{item.email}</td>
                  <td>{item.subject}</td>
                  <td>{formatDate(item.createdAt)}</td>

                  <td>
                    <select
                      value={item.status}
                      onChange={(e) =>
                        handleStatusChange(item._id, e.target.value)
                      }
                      className="status-select"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Replied">Replied</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </td>

                  <td className="action-btns">
                    <button
                      className="view-btn"
                      onClick={() => handleView(item._id)}
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
      </div>

      {selectedInquiry && (
        <div className="modal-overlay" onClick={() => setSelectedInquiry(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-btn" onClick={() => setSelectedInquiry(null)}>
              ×
            </span>
            <h3>Inquiry Details</h3>
            <p><strong>Name:</strong> {selectedInquiry.name}</p>
            <p><strong>Email:</strong> {selectedInquiry.email}</p>
            <p><strong>Subject:</strong> {selectedInquiry.subject}</p>
            <p><strong>Message:</strong> {selectedInquiry.message}</p>
            <p><strong>Status:</strong> {selectedInquiry.status}</p>
            <p><strong>Date:</strong> {formatDate(selectedInquiry.createdAt)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInquiries;
