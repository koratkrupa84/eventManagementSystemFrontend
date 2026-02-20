import React, { useState, useEffect } from "react";
import "../css/Gallery.css";
import Header from "../component/Header";
import Footer from "../component/Footer";
import { API } from "../services/apiConfig";

const Gallery = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    fetchGalleryData();
  }, []);

  const fetchGalleryData = async () => {
    try {
      const response = await fetch(API.GET_GALLERY);
      const data = await response.json();
      
      if (data.success) {
        setGalleryItems(data.data || []);
      } else {
        setError("Failed to load gallery images");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching gallery data:", error);
      setError("Failed to load gallery images");
      setLoading(false);
    }
  };

  // Group gallery items by event type
  const groupedByEvent = galleryItems.reduce((groups, item) => {
    const eventType = item.event_type || 'General';
    if (!groups[eventType]) {
      groups[eventType] = [];
    }
    groups[eventType].push(item);
    return groups;
  }, {});

  const handleEventClick = (eventType, eventItems) => {
    setSelectedEvent({
      type: eventType,
      items: eventItems,
      organizer: eventItems[0]?.uploaded_by?.name || 'Unknown'
    });
    setShowEventModal(true);
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setShowImageModal(true);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="gallery-page" style={{ textAlign: 'center', padding: '50px' }}>
          <h2>Loading Gallery...</h2>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="gallery-page">

        {/* Banner */}
        <div className="gallery-banner">
          <h1>Event Gallery</h1>
          <p>Browse our beautiful event decorations organized by event type</p>
        </div>

        {/* Events Grid */}
        <div className="events-grid">
          {Object.keys(groupedByEvent).length === 0 ? (
            // Fallback events if database is empty
            ['Birthday', 'Wedding', 'Corporate', 'Baby Shower', 'Anniversary'].map((eventType, index) => (
              <div className="event-card" key={`event-${index}`} onClick={() => handleEventClick(eventType, [])}>
                <div className="event-header">
                  <h3>{eventType} Events</h3>
                  <span className="photo-count">0 Photos</span>
                </div>
                <div className="event-preview">
                  <img src="https://via.placeholder.com/400x250" alt={eventType} />
                  <div className="event-overlay">
                    <span>View Photos</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            Object.entries(groupedByEvent).map(([eventType, eventItems]) => (
              <div className="event-card" key={`event-${eventType}`} onClick={() => handleEventClick(eventType, eventItems)}>
                <div className="event-header">
                  <h3>{eventType} Events</h3>
                  <span className="photo-count">{eventItems.length} Photos</span>
                </div>
                <div className="event-preview">
                  <img 
                    src={eventItems[0]?.image_path || "https://via.placeholder.com/400x250"} 
                    alt={eventType} 
                  />
                  <div className="event-overlay">
                    <span>View Photos</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {error && (
          <div className="error-message" style={{ 
            textAlign: 'center', 
            padding: '20px', 
            color: 'red',
            background: '#fee',
            margin: '20px',
            borderRadius: '8px'
          }}>
            {error}
          </div>
        )}

      </div>

      {/* Event Details Modal */}
      {showEventModal && selectedEvent && (
        <div className="modal-overlay" onClick={() => setShowEventModal(false)}>
          <div className="modal-content event-modal" onClick={(e) => e.stopPropagation()}>
            <span className="close-btn" onClick={() => setShowEventModal(false)}>×</span>
            
            <div className="event-details">
              <h2>{selectedEvent.type} Events</h2>
              <p className="organizer-info">
                <strong>Organizer:</strong> {selectedEvent.organizer}
              </p>
              <p className="photo-info">
                <strong>Total Photos:</strong> {selectedEvent.items.length}
              </p>
            </div>

            <div className="event-photos-grid">
              {selectedEvent.items.length === 0 ? (
                <div className="no-photos">
                  <p>No photos available for this event type.</p>
                  <img src="https://via.placeholder.com/400x300" alt="No photos" />
                </div>
              ) : (
                selectedEvent.items.map((photo, index) => (
                  <div className="photo-item" key={`photo-${photo._id || index}`} onClick={() => handleImageClick(photo)}>
                    <img 
                      src={photo.image_path} 
                      alt={`${selectedEvent.type} ${index + 1}`}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/180x180";
                        console.error("Photo failed to load:", e);
                      }}
                    />
                    <div className="photo-overlay">
                      <span>View Details</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Details Modal */}
      {showImageModal && selectedImage && (
        <div className="modal-overlay" onClick={() => setShowImageModal(false)}>
          <div className="modal-content image-modal" onClick={(e) => e.stopPropagation()}>
            <span className="close-btn" onClick={() => setShowImageModal(false)}>×</span>
            
            <div className="image-details">
              <h3>Photo Details</h3>
              
              <div className="image-display">
                <img 
                  src={selectedImage.image_path} 
                  alt={`${selectedImage.event_type} event photo`}
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/400x300";
                  console.error("Image failed to load:", e);
                  }}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "400px",
                    borderRadius: "8px",
                    boxShadow: "0 4px 20px rgba(127, 85, 57, 0.1)"
                  }}
                />
              </div>
              
              <div className="image-info">
                <p><strong>Event Type:</strong> {selectedImage.event_type}</p>
                <p><strong>Event ID:</strong> {selectedImage.event_id || 'N/A'}</p>
                <p><strong>Uploaded By:</strong> {selectedImage.uploaded_by?.name || 'Unknown'}</p>
                <p><strong>Upload Date:</strong> {new Date(selectedImage.uploaded_at).toLocaleDateString()}</p>
                <p><strong>Upload Time:</strong> {new Date(selectedImage.uploaded_at).toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default Gallery;
