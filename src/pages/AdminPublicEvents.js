import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/AdminPublicEvents.css";
import "../css/AdminCommon.css";
import { API } from "../services/apiConfig";

const AdminPublicEvents = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_date: "",
    location: "",
    status: "upcoming",
    image: ""
  });
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    const filtered = events.filter((event) =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEvents(filtered);
  }, [events, searchTerm]);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API.GET_PUBLIC_EVENTS, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to load events");

      setEvents(data.data || []);
      setFilteredEvents(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const formPayload = new FormData();

      Object.keys(formData).forEach(key => {
        if (formData[key] !== "") {
          formPayload.append(key, formData[key]);
        }
      });

      if (selectedImage) {
        formPayload.append("image", selectedImage);
      }

      const res = await fetch(API.CREATE_PUBLIC_EVENT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formPayload,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to create event");

      setShowAddForm(false);
      setFormData({
        title: "",
        description: "",
        event_date: "",
        location: "",
        category: "",
        status: "upcoming",
        image: ""
      });
      setSelectedImage(null);
      fetchEvents();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API.DELETE_PUBLIC_EVENT}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to delete event");

      fetchEvents();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleView = (event) => {
    setSelectedEvent(event);
    setShowViewModal(true);
  };

  const handleEdit = (event) => {
    setFormData({
      title: event.title,
      description: event.description,
      event_date: new Date(event.event_date).toISOString().slice(0, 16),
      location: event.location,
      status: event.status,
      image: event.image || ""
    });
    setSelectedEvent(event);
    setShowEditForm(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    console.log('=== HANDLE UPDATE DEBUG ===');
    console.log('Selected Event:', selectedEvent);
    console.log('Form Data:', formData);
    console.log('Selected Image:', selectedImage);

    try {
      const token = localStorage.getItem("token");

      // Use axios for better error handling
      const updateData = {
        title: formData.title,
        description: formData.description,
        event_date: formData.event_date,
        location: formData.location,
        status: formData.status
      };

      // Add image if selected
      if (selectedImage) {
        updateData.image = selectedImage;
      }

      console.log('Update URL:', `${API.UPDATE_PUBLIC_EVENT}/${selectedEvent._id}`);
      console.log('Update Data:', updateData);

      // Try using CREATE_PUBLIC_EVENT endpoint with PUT method
      // Some APIs use PUT on create endpoint for updates
      const response = await axios.put(
        `${API.CREATE_PUBLIC_EVENT}/${selectedEvent._id}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Update Response Status:', response.status);
      console.log('Update Response Data:', response.data);

      if (response.status !== 200) {
        throw new Error(response.data?.message || 'Failed to update event');
      }

      setShowEditForm(false);
      setSelectedEvent(null);
      setFormData({
        title: "",
        description: "",
        event_date: "",
        location: "",
        category: "",
        status: "upcoming",
        image: ""
      });
      setSelectedImage(null);
      fetchEvents();
    } catch (err) {
      console.error('Update Error:', err);
      if (err.response) {
        setError(err.response.data?.message || err.message || 'Something went wrong');
      } else {
        setError(err.message || 'Something went wrong');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setFormData(prev => ({
        ...prev,
        image: file.name
      }));
    }
  };

  if (loading) return <div className="loading">Loading events...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Manage Public Events</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="admin-btn admin-btn-primary"
        >
          <i className="fas fa-plus"></i>
          Create New Event
        </button>
      </div>

      <div className="search-bar">
        <div className="search-bar-wrapper">
          <i className="fas fa-search search-icon"></i>
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Events Grid */}
      <div className="admin-events-grid">
        {filteredEvents.map((event) => (
          <div key={event._id} className="admin-event-card">
            <div className="admin-event-image">
              <img src={event.image} alt={event.title} />
            </div>
            <div className="admin-event-details">
              <h3>{event.title}</h3>
              <p className="event-description">{event.description}</p>
              <div className="event-info">
                <p><strong>Date:</strong> {new Date(event.event_date).toLocaleDateString()}</p>
                <p><strong>Location:</strong> {event.location}</p>
                <p><strong>Status:</strong> <span className={`status ${event.status}`}>{event.status}</span></p>
                <p><strong>Created:</strong> {new Date(event.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="admin-event-actions">
              <button
                className="admin-btn admin-btn-view"
                onClick={() => handleView(event)}
              >
                <i className="fas fa-eye"></i>
                View
              </button>
              <button
                className="admin-btn admin-btn-edit"
                onClick={() => handleEdit(event)}
              >
                <i className="fas fa-edit"></i>
                Edit
              </button>
              <button
                className="admin-btn admin-btn-delete"
                onClick={() => handleDelete(event._id)}
              >
                <i className="fas fa-trash"></i>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Event Modal */}
      {showAddForm && (
        <div className="private-modal-overlay">
          <div className="private-modal">
            <div className="private-modal-header">
              <h2>Create New Event</h2>
              <button className="close-btn" onClick={() => setShowAddForm(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="event-form">
              <div className="form-group">
                <label>Event Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  maxLength="150"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  className="form-textarea"
                />
              </div>
              <div className="form-group">
                <label>Event Date *</label>
                <input
                  type="datetime-local"
                  name="event_date"
                  value={formData.event_date}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  maxLength="150"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="form-group">
                <label>Event Image *</label>
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    required
                    className="form-input"
                    id="event-image"
                  />
                  <label htmlFor="event-image" className="file-input-label">
                    <i className="fas fa-cloud-upload-alt"></i>
                    <div className="file-input-text">
                      <span className="file-input-main">Choose Image File</span>
                      <span className="file-input-sub">JPG, PNG, GIF up to 10MB</span>
                    </div>
                  </label>
                </div>
                {selectedImage && (
                  <div className="image-preview">
                    <img src={URL.createObjectURL(selectedImage)} alt="Preview" />
                  </div>
                )}
              </div>
              <div className="form-actions">
                <button type="submit" className="admin-btn admin-btn-primary">
                  <i className="fas fa-save"></i>
                  Create Event
                </button>
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setShowAddForm(false)}>
                  <i className="fas fa-times"></i>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Event Modal */}
      {showViewModal && selectedEvent && (
        <div className="private-modal-overlay">
          <div className="private-modal">
            <div className="private-modal-header">
              <h2><i className="fas fa-eye"></i> Event Preview</h2>
              <button className="close-btn" onClick={() => setShowViewModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="event-view-container">
              {selectedEvent.image && (
                <div className="event-image-section">
                  <div className="event-image-wrapper">
                    <img src={selectedEvent.image} alt={selectedEvent.title} />
                    <div className="image-overlay">
                      <i className="fas fa-expand"></i>
                    </div>
                  </div>
                  <div className="event-title-section">
                    <h3>{selectedEvent.title}</h3>
                    <span className={`status-badge ${selectedEvent.status}`}>
                      <i className="fas fa-check-circle"></i>
                      {selectedEvent.status}
                    </span>
                  </div>
                </div>
              )}
              <div className="event-info-section">
                <div className="info-grid">
                  <div className="info-item">
                    <div className="info-icon-wrapper">
                      <i className="fas fa-align-left"></i>
                    </div>
                    <div className="info-content">
                      <h4>Description</h4>
                      <p>{selectedEvent.description}</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-icon-wrapper">
                      <i className="fas fa-clock"></i>
                    </div>
                    <div className="info-content">
                      <h4>Date & Time</h4>
                      <p>{new Date(selectedEvent.event_date).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-icon-wrapper">
                      <i className="fas fa-map-marker-alt"></i>
                    </div>
                    <div className="info-content">
                      <h4>Location</h4>
                      <p>{selectedEvent.location}</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-icon-wrapper">
                      <i className="fas fa-calendar-plus"></i>
                    </div>
                    <div className="info-content">
                      <h4>Created</h4>
                      <p>{new Date(selectedEvent.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="admin-btn admin-btn-edit" onClick={() => {
                setShowViewModal(false);
                handleEdit(selectedEvent);
              }}>
                <i className="fas fa-edit"></i>
                Edit Event
              </button>
              <button className="admin-btn admin-btn-delete" onClick={() => {
                setShowViewModal(false);
                handleDelete(selectedEvent._id);
              }}>
                <i className="fas fa-trash"></i>
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {showEditForm && selectedEvent && (
        <div className="private-modal-overlay">
          <div className="private-modal">
            <div className="private-modal-header">
              <h2>Edit Event</h2>
              <button className="close-btn" onClick={() => setShowEditForm(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleUpdate} className="event-form">
              <div className="form-group">
                <label>Event Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  maxLength="150"
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label>Event Date *</label>
                <input
                  type="datetime-local"
                  name="event_date"
                  value={formData.event_date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  maxLength="150"
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="form-group">
                <label>Event Image (Leave empty to keep current)</label>
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="form-input"
                    id="edit-event-image"
                  />
                  <label htmlFor="edit-event-image" className="file-input-label">
                    <i className="fas fa-image"></i>
                    <div className="file-input-text">
                      <span className="file-input-main">Choose New Image</span>
                      <span className="file-input-sub">Optional: JPG, PNG, GIF up to 10MB</span>
                    </div>
                  </label>
                </div>
                {selectedImage && (
                  <div className="image-preview">
                    <img src={URL.createObjectURL(selectedImage)} alt="Preview" />
                  </div>
                )}
                {!selectedImage && formData.image && (
                  <div className="current-image">
                    <p>Current image:</p>
                    <img src={formData.image} alt="Current" style={{ maxWidth: '200px', borderRadius: '8px' }} />
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Update Event
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPublicEvents;
