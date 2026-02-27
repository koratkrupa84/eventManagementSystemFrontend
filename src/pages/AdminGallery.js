import React, { useState, useEffect } from "react";
import "../css/AdminGallery.css";
import "../css/AdminCommon.css";
import { API } from "../services/apiConfig";

const AdminGallery = () => {
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("all"); // "all" or "events"
  const [publicEvents, setPublicEvents] = useState([]);
  const [privateEvents, setPrivateEvents] = useState([]);
  const [formData, setFormData] = useState({
    event_type: "public",
    event_id: ""
  });
  const [editFormData, setEditFormData] = useState({
    event_type: "",
    event_id: ""
  });

  useEffect(() => {
    fetchGallery();
    fetchEvents();
  }, []);

  useEffect(() => {
    const filtered = images.filter((img) => {
      const eventTitle = img.event_id?.title || '';
      const eventType = img.event_type || '';
      const searchLower = searchTerm.toLowerCase();
      return eventTitle.toLowerCase().includes(searchLower) || 
             eventType.toLowerCase().includes(searchLower);
    });
    setFilteredImages(filtered);
  }, [images, searchTerm]);

  // Group images by events
  const getImagesByEvents = () => {
    const grouped = {};
    
    filteredImages.forEach(img => {
      const eventKey = img.event_type === 'public' 
        ? `public_${img.event_id?._id}` 
        : `private_${img.event_id?._id}`;
      
      if (!grouped[eventKey]) {
        grouped[eventKey] = {
          event_type: img.event_type,
          event_id: img.event_id,
          images: []
        };
      }
      
      grouped[eventKey].images.push(img);
    });
    
    return Object.values(grouped);
  };

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Fetch public events
      const publicRes = await fetch(API.GET_PUBLIC_EVENTS, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const publicData = await publicRes.json();
      if (publicRes.ok) {
        setPublicEvents(publicData.data || []);
      }

      // Fetch private events
      const privateRes = await fetch(API.GET_PRIVATE_EVENTS, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const privateData = await privateRes.json();
      if (privateRes.ok) {
        setPrivateEvents(privateData.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch events:", err);
    }
  };

  const fetchGallery = async () => {
    try {
      const res = await fetch(API.GET_GALLERY);
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to load gallery");
      }
      
      const data = await res.json();
      setImages(data.data);
      setFilteredImages(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setError("");
    setUploading(true);

    if (selectedImages.length === 0) {
      setError("Please select at least one image");
      setUploading(false);
      return;
    }

    if (!formData.event_type || !formData.event_id) {
      setError("Please select event type and event");
      setUploading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const uploadFormData = new FormData();
      
      // Add images
      selectedImages.forEach((img) => {
        uploadFormData.append("images", img);
      });
      
      // Add event_type and event_id
      uploadFormData.append("event_type", formData.event_type);
      uploadFormData.append("event_id", formData.event_id);

      const res = await fetch(API.ADD_GALLERY, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: uploadFormData
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to upload images");
      }
      
      const data = await res.json();

      setShowUploadForm(false);
      setSelectedImages([]);
      setFormData({ event_type: "public", event_id: "" });
      fetchGallery();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this image?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API.DELETE_GALLERY}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to delete image");
      }
      
      const data = await res.json();

      fetchGallery();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleView = (img) => {
    setSelectedImage(img);
    setShowViewModal(true);
  };

  const handleEdit = (img) => {
    setSelectedImage(img);
    setEditFormData({
      event_type: img.event_type || "public",
      event_id: img.event_id?._id || ""
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");

    if (!editFormData.event_type || !editFormData.event_id) {
      setError("Please select event type and event");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      
      const res = await fetch(`${API.UPDATE_GALLERY}/${selectedImage._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          event_type: editFormData.event_type,
          event_id: editFormData.event_id
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to update image");
      }
      
      try {
        const data = await res.json();
        setShowEditModal(false);
        setSelectedImage(null);
        setEditFormData({ event_type: "", event_id: "" });
        fetchGallery();
      } catch (err) {
        setError("Failed to parse JSON response");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div>Loading gallery...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="gallery-header">
        <div>
          <h2>Manage Gallery</h2>
          <p className="sub-title">Gallery Images</p>
        </div>

        <div className="header-actions">
          <div className="view-toggle">
            <button
              className={`toggle-btn ${viewMode === "all" ? "active" : ""}`}
              onClick={() => setViewMode("all")}
            >
              All Images
            </button>
            <button
              className={`toggle-btn ${viewMode === "events" ? "active" : ""}`}
              onClick={() => setViewMode("events")}
            >
              By Events
            </button>
          </div>
          
          <div className="search-container">
            <input
              type="text"
              placeholder={viewMode === "events" ? "Search events..." : "Search by event..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button
            className="upload-btn"
            onClick={() => setShowUploadForm(true)}
          >
            + Upload Images
          </button>
        </div>
      </div>

      {error && <div className="error-text">{error}</div>}

      {showUploadForm && (
        <div className="modal-overlay" onClick={() => {
          setShowUploadForm(false);
          setSelectedImages([]);
        }}>
          <div className="modal-content gallery-upload-modal" onClick={(e) => e.stopPropagation()}>
            <span className="close-btn" onClick={() => {
              setShowUploadForm(false);
              setSelectedImages([]);
            }}>
              ×
            </span>
            <form onSubmit={handleUpload}>
              <h3>Upload Images</h3>
              <p style={{ color: '#9c6644', fontSize: '14px', marginBottom: '20px' }}>
                Select event and images to upload to the gallery
              </p>
              
              {error && <div className="error-text">{error}</div>}
              
              <div className="form-group">
                <label htmlFor="event_type">Event Type</label>
                <select
                  id="event_type"
                  value={formData.event_type}
                  onChange={(e) => {
                    setFormData({ ...formData, event_type: e.target.value, event_id: "" });
                  }}
                  required
                >
                  <option value="public">Public Event</option>
                  <option value="private">Private Event</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="event_id">
                  {formData.event_type === "public" ? "Public Event" : "Private Event"}
                </label>
                <select
                  id="event_id"
                  value={formData.event_id}
                  onChange={(e) => {
                    setFormData({ ...formData, event_id: e.target.value });
                  }}
                  required
                >
                  <option value="">Select Event</option>
                  {formData.event_type === "public"
                    ? publicEvents.map((event) => (
                        <option key={event._id} value={event._id}>
                          {event.title} - {new Date(event.event_date).toLocaleDateString()}
                        </option>
                      ))
                    : privateEvents.map((event) => (
                        <option key={event._id} value={event._id}>
                          Event #{event._id.slice(-6)} - {new Date(event.createdAt).toLocaleDateString()}
                        </option>
                      ))}
                </select>
                {formData.event_type === "public" && publicEvents.length === 0 && (
                  <p style={{ color: '#9c6644', fontSize: '12px', marginTop: '4px' }}>
                    No public events available. Create a public event first.
                  </p>
                )}
                {formData.event_type === "private" && privateEvents.length === 0 && (
                  <p style={{ color: '#9c6644', fontSize: '12px', marginTop: '4px' }}>
                    No private events available. Create a private event first.
                  </p>
                )}
              </div>
              
              <div className="file-input-wrapper">
                <label htmlFor="gallery-images" className="file-input-label">
                  <span className="file-input-icon">📷</span>
                  <span className="file-input-text">
                    {selectedImages.length > 0 
                      ? `${selectedImages.length} image(s) selected` 
                      : 'Choose Images'}
                  </span>
                  <input
                    id="gallery-images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) =>
                      setSelectedImages(Array.from(e.target.files))
                    }
                    required
                    className="file-input"
                  />
                </label>
              </div>

              {selectedImages.length > 0 && (
                <div className="image-preview-grid">
                  {selectedImages.map((img, index) => (
                    <div key={index} className="preview-image-wrapper">
                      <img
                        src={URL.createObjectURL(img)}
                        alt={`Preview ${index + 1}`}
                        className="preview-image"
                      />
                      <span className="preview-image-name">{img.name}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setShowUploadForm(false);
                    setSelectedImages([]);
                    setFormData({ event_type: "public", event_id: "" });
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="upload-submit-btn" 
                  disabled={selectedImages.length === 0 || uploading || !formData.event_id}
                >
                  {uploading 
                    ? 'Uploading...' 
                    : selectedImages.length > 0 
                      ? `Upload ${selectedImages.length} Image(s)` 
                      : 'Upload Images'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Image Modal */}
      {showViewModal && selectedImage && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content gallery-view-modal" onClick={(e) => e.stopPropagation()}>
            <span className="close-btn" onClick={() => setShowViewModal(false)}>
              ×
            </span>
            <div className="gallery-view-content">
              <h3>Image Details</h3>
              
              <div className="view-image-container">
                <img
                  src={`http://localhost:5000/${selectedImage.image_path}`}
                  alt="Gallery"
                  className="view-image"
                />
              </div>
              
              <div className="image-info">
                <p><strong>Event Type:</strong> {selectedImage.event_type}</p>
                <p><strong>Event:</strong> {selectedImage.event_id?.title || 'Unknown Event'}</p>
                <p><strong>Uploaded:</strong> {new Date(selectedImage.createdAt).toLocaleDateString()}</p>
              </div>
              
              <div className="modal-actions">
                <button 
                  className="edit-btn"
                  onClick={() => {
                    setShowViewModal(false);
                    handleEdit(selectedImage);
                  }}
                >
                  Edit
                </button>
                <button 
                  className="cancel-btn"
                  onClick={() => setShowViewModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Image Modal */}
      {showEditModal && selectedImage && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content gallery-edit-modal" onClick={(e) => e.stopPropagation()}>
            <span className="close-btn" onClick={() => setShowEditModal(false)}>
              ×
            </span>
            <form onSubmit={handleUpdate}>
              <h3>Edit Image</h3>
              
              <div className="edit-image-preview">
                <img
                  src={`http://localhost:5000/${selectedImage.image_path}`}
                  alt="Gallery"
                  className="edit-preview-image"
                />
              </div>
              
              {error && <div className="error-text">{error}</div>}
              
              <div className="form-group">
                <label htmlFor="edit_event_type">Event Type</label>
                <select
                  id="edit_event_type"
                  value={editFormData.event_type}
                  onChange={(e) => {
                    setEditFormData({ ...editFormData, event_type: e.target.value, event_id: "" });
                  }}
                  required
                >
                  <option value="public">Public Event</option>
                  <option value="private">Private Event</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="edit_event_id">
                  {editFormData.event_type === "public" ? "Public Event" : "Private Event"}
                </label>
                <select
                  id="edit_event_id"
                  value={editFormData.event_id}
                  onChange={(e) => {
                    setEditFormData({ ...editFormData, event_id: e.target.value });
                  }}
                  required
                >
                  <option value="">Select Event</option>
                  {editFormData.event_type === "public"
                    ? publicEvents.map((event) => (
                        <option key={event._id} value={event._id}>
                          {event.title} - {new Date(event.event_date).toLocaleDateString()}
                        </option>
                      ))
                    : privateEvents.map((event) => (
                        <option key={event._id} value={event._id}>
                          Event #{event._id.slice(-6)} - {new Date(event.createdAt).toLocaleDateString()}
                        </option>
                      ))}
                </select>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedImage(null);
                    setEditFormData({ event_type: "", event_id: "" });
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="upload-submit-btn"
                >
                  Update Image
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gallery Grid */}
      {viewMode === "all" ? (
        <div className="gallery-grid">
          {filteredImages.length === 0 ? (
            <p>{searchTerm ? "No images found matching your search" : "No images found"}</p>
          ) : (
            filteredImages.map((img) => (
              <div className="gallery-card" key={img._id}>
                <img
                  src={`http://localhost:5000/${img.image_path}`}
                  alt="Gallery"
                />
                <div className="gallery-card-actions">
                  <button
                    className="view-btn"
                    onClick={() => handleView(img)}
                  >
                    View
                  </button>
                  <button
                    className="edit-btn"
                    onClick={() => handleEdit(img)}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(img._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="events-gallery">
          {getImagesByEvents().length === 0 ? (
            <p>{searchTerm ? "No events found matching your search" : "No events found"}</p>
          ) : (
            getImagesByEvents().map((eventGroup, index) => (
              <div key={index} className="event-group">
                <div className="event-header">
                  <h3>
                    {eventGroup.event_type === "public" 
                      ? eventGroup.event_id?.title || "Unknown Public Event"
                      : eventGroup.event_id?.event_name || eventGroup.event_id?.event_type || `Private Event #${eventGroup.event_id?._id?.slice(-6) || "Unknown"}`
                    }
                  </h3>
                  <span className="event-badge">
                    {eventGroup.event_type === "public" ? "Public" : "Private"}
                  </span>
                  <span className="image-count">
                    {eventGroup.images.length} image{eventGroup.images.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="event-images-grid">
                  {eventGroup.images.map((img) => (
                    <div className="gallery-card" key={img._id}>
                      <img
                        src={`http://localhost:5000/${img.image_path}`}
                        alt="Gallery"
                      />
                      <div className="gallery-card-actions">
                        <button
                          className="view-btn"
                          onClick={() => handleView(img)}
                        >
                          View
                        </button>
                        <button
                          className="edit-btn"
                          onClick={() => handleEdit(img)}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(img._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AdminGallery;