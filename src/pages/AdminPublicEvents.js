import React, { useState, useEffect } from "react";
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

  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API.DELETE_PUBLIC_EVENT}/${eventId}`, {
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
    try {
      const token = localStorage.getItem("token");
      const formPayload = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (formData[key] !== "" && key !== 'image') {
          formPayload.append(key, formData[key]);
        }
      });

      if (selectedImage) {
        formPayload.append("image", selectedImage);
      }

      const res = await fetch(`${API.UPDATE_PUBLIC_EVENT}/${selectedEvent._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formPayload,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to update event");

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
      setError(err.message);
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
    <div className="admin-public-events">
      <div className="page-header">
        <h1>Manage Public Events</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddForm(true)}
        >
          Create New Event
        </button>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="events-grid">
        {filteredEvents.map((event) => (
          <div key={event._id} className="event-card">
            {event.image && (
              <div className="event-image">
                <img src={event.image} alt={event.title} />
              </div>
            )}
            <div className="event-details">
              <h3>{event.title}</h3>
              <p className="event-description">{event.description}</p>
              <div className="event-info">
                <p><strong>Date:</strong> {new Date(event.event_date).toLocaleDateString()}</p>
                <p><strong>Location:</strong> {event.location}</p>
                <p><strong>Status:</strong> <span className={`status ${event.status}`}>{event.status}</span></p>
              </div>
              <div className="event-actions">
                <button className="btn btn-view" onClick={() => handleView(event)}>
                  View
                </button>
                <button className="btn btn-secondary" onClick={() => handleEdit(event)}>
                  Edit
                </button>
                <button className="btn btn-delete" onClick={() => handleDelete(event._id)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="no-events">
          <p>No events found</p>
        </div>
      )}

      {/* Add Event Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Create New Event</h2>
              <button className="close-btn" onClick={() => setShowAddForm(false)}>
                ×
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
                <label>Event Image *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  required
                />
                {selectedImage && (
                  <div className="image-preview">
                    <img src={URL.createObjectURL(selectedImage)} alt="Preview" />
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Create Event
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Event Modal */}
      {showViewModal && selectedEvent && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Event Details</h2>
              <button className="close-btn" onClick={() => setShowViewModal(false)}>
                ×
              </button>
            </div>
            <div className="event-view">
              {selectedEvent.image && (
                <div className="event-image">
                  <img src={selectedEvent.image} alt={selectedEvent.title} />
                </div>
              )}
              <div className="event-details">
                <p><strong>Title:</strong> {selectedEvent.title}</p>
                <p><strong>Description:</strong> {selectedEvent.description}</p>
                <p><strong>Date:</strong> {new Date(selectedEvent.event_date).toLocaleString()}</p>
                <p><strong>Location:</strong> {selectedEvent.location}</p>
                <p><strong>Status:</strong> <span className={`status ${selectedEvent.status}`}>{selectedEvent.status}</span></p>
                <p><strong>Created:</strong> {new Date(selectedEvent.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {showEditForm && selectedEvent && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
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
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {selectedImage && (
                  <div className="image-preview">
                    <img src={URL.createObjectURL(selectedImage)} alt="Preview" />
                  </div>
                )}
                {!selectedImage && formData.image && (
                  <div className="current-image">
                    <p>Current image:</p>
                    <img src={formData.image} alt="Current" style={{maxWidth: '200px', borderRadius: '8px'}} />
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
