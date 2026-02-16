import React, { useState, useEffect } from "react";
import "../css/AdminGallery.css";
import { API } from "../services/apiConfig";

const AdminGallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const res = await fetch(API.GET_GALLERY);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to load gallery");

      setImages(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setError("");

    if (selectedImages.length === 0) {
      setError("Please select at least one image");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const formData = new FormData();
      selectedImages.forEach((img) => {
        formData.append("images", img);
      });

      const res = await fetch(API.ADD_GALLERY, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to upload images");

      setShowUploadForm(false);
      setSelectedImages([]);
      fetchGallery();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this image?")) {
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API.DELETE_GALLERY}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to delete image");

      fetchGallery();
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

        <button
          className="upload-btn"
          onClick={() => setShowUploadForm(true)}
        >
          + Upload Images
        </button>
      </div>

      {error && <div className="error-text">{error}</div>}

      {showUploadForm && (
        <div className="modal-overlay" onClick={() => setShowUploadForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-btn" onClick={() => setShowUploadForm(false)}>
              ×
            </span>
            <form onSubmit={handleUpload}>
              <h3>Upload Images</h3>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) =>
                  setSelectedImages(Array.from(e.target.files))
                }
                required
              />
              <button type="submit">Upload</button>
            </form>
          </div>
        </div>
      )}

      {/* Gallery Grid */}
      <div className="gallery-grid">
        {images.length === 0 ? (
          <p>No images found</p>
        ) : (
          images.map((img) => (
            <div className="gallery-card" key={img._id}>
              <img
                src={`http://localhost:5000/${img.image}`}
                alt={img.title || "Gallery"}
              />
              <button
                className="delete-btn"
                onClick={() => handleDelete(img._id)}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminGallery;
