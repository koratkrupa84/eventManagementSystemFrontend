import React, { useState, useEffect } from "react";
import "../css/PublicEvents.css";
import "../css/variables.css";
import { API } from "../services/apiConfig";

const PublicEvents = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("upcoming");
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [appointmentData, setAppointmentData] = useState({
    total_persons: 1,
    registration_date: ""
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    const filtered = events.filter((event) => {
      const matchesSearch = 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !statusFilter || event.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
    setFilteredEvents(filtered);
  }, [events, searchTerm, statusFilter]);

  const fetchEvents = async () => {
    try {
      const res = await fetch(API.GET_PUBLIC_EVENTS);
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

  const handleRegister = async (event) => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      alert("Please login to register for events");
      return;
    }

    setSelectedEvent(event);
    setShowRegistrationModal(true);
  };

  const handleAppointmentChange = (e) => {
    const { name, value } = e.target;
    setAppointmentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const bookAppointment = async (e) => {
    e.preventDefault();
    
    if (!selectedEvent) return;

    // Validate form
    if (appointmentData.total_persons < 1 || appointmentData.total_persons > 10) {
      alert("Number of persons must be between 1 and 10");
      return;
    }

    setRegistrationLoading(true);
    
    try {
      const token = localStorage.getItem("token");
      
      // Register for the event with only database fields
      const registrationPayload = {
        total_persons: appointmentData.total_persons,
        registration_date: appointmentData.registration_date || new Date()
      };

      const registrationRes = await fetch(`${API.REGISTER_FOR_EVENT}/${selectedEvent._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(registrationPayload),
      });

      if (!registrationRes.ok) {
        const data = await registrationRes.json();
        throw new Error(data.message || "Failed to register for event");
      }

      const registrationData = await registrationRes.json();

      alert(`🎉 Registration successful! Registration ID: ${registrationData.data._id}. Status: ${registrationData.data.status}`);
      setShowRegistrationModal(false);
      setSelectedEvent(null);
      
      // Reset form
      setAppointmentData({
        total_persons: 1,
        registration_date: ""
      });
      
      // Refresh events
      fetchEvents();
      
    } catch (err) {
      alert(err.message);
    } finally {
      setRegistrationLoading(false);
    }
  };

  const checkRegistrationStatus = async (eventId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(API.GET_MY_REGISTRATIONS, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        const isEventRegistered = data.data?.some(reg => reg.event_id === eventId);
        setIsRegistered(isEventRegistered);
      }
    } catch (err) {
      console.error("Failed to check registration status:", err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isEventPast = (eventDate) => {
    return new Date(eventDate) < new Date();
  };

  if (loading) return <div className="loading">Loading events...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="public-events">
      <div className="page-header">
        <div className="header-content">
          <h1>Public Events</h1>
          <p>Discover and join amazing events in your area</p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="upcoming">Upcoming Events</option>
            <option value="completed">Past Events</option>
            <option value="">All Events</option>
          </select>
        </div>
      </div>

      {/* Events Grid */}
      <div className="events-grid">
        {filteredEvents.map((event) => {
          const isPast = isEventPast(event.event_date);
          return (
            <div key={event._id} className={`event-card ${isPast ? 'past-event' : ''}`}>
              {event.image && (
                <div className="event-image">
                  <img src={event.image} alt={event.title} />
                  <div className="event-status-badge">
                    <span className={`status ${event.status}`}>
                      {event.status}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="event-content">
                <h3 className="event-title">{event.title}</h3>
                <p className="event-description">{event.description}</p>
                
                <div className="event-details">
                  <div className="detail-item">
                    <span className="icon">📅</span>
                    <span>{formatDate(event.event_date)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="icon">📍</span>
                    <span>{event.location}</span>
                  </div>
                </div>

                <div className="event-actions">
                  {!isPast && (
                    <button 
                      className="btn btn-register"
                      onClick={() => handleRegister(event)}
                    >
                      Register Now
                    </button>
                  )}
                  {isPast && (
                    <button className="btn btn-disabled" disabled>
                      Event Completed
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredEvents.length === 0 && (
        <div className="no-events">
          <div className="no-events-icon">🎉</div>
          <h3>No Events Found</h3>
          <p>Try adjusting your filters or check back later for amazing events! 🎊</p>
        </div>
      )}

      {/* Registration Modal */}
      {showRegistrationModal && selectedEvent && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>🎉 Book Event Appointment</h2>
              <button 
                className="close-btn" 
                onClick={() => setShowRegistrationModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <div className="event-summary">
                {selectedEvent.image && (
                  <img src={selectedEvent.image} alt={selectedEvent.title} />
                )}
                <div className="event-info">
                  <h3>{selectedEvent.title}</h3>
                  <p className="event-date">{formatDate(selectedEvent.event_date)}</p>
                  <p className="event-location">📍 {selectedEvent.location}</p>
                </div>
              </div>
              
              <form onSubmit={bookAppointment} className="appointment-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Number of Persons *</label>
                    <input
                      type="number"
                      name="total_persons"
                      value={appointmentData.total_persons}
                      onChange={handleAppointmentChange}
                      required
                      min="1"
                      max="10"
                      placeholder="1"
                    />
                  </div>
                  <div className="form-group">
                    <label>Registration Date</label>
                    <input
                      type="date"
                      name="registration_date"
                      value={appointmentData.registration_date}
                      onChange={handleAppointmentChange}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div className="appointment-note">
                  <h4>🎊 Registration Details</h4>
                  <ul>
                    <li>Registration will be created with pending status</li>
                    <li>Admin will review and approve your registration</li>
                    <li>You'll receive confirmation details</li>
                    <li>Registration ID will be provided for tracking</li>
                    <li>Maximum 10 persons per registration allowed</li>
                  </ul>
                </div>
                
                <div className="modal-actions">
                  <button 
                    type="button"
                    className="btn btn-cancel"
                    onClick={() => setShowRegistrationModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="btn btn-confirm"
                    disabled={registrationLoading}
                  >
                    {registrationLoading ? '🎉 Registering...' : '🎉 Register Now'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicEvents;
