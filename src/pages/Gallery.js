import React, { useState, useEffect } from "react";
import "../css/Gallery.css";
import Header from "../component/Header";
import Footer from "../component/Footer";
import { API } from "../services/apiConfig";

const Gallery = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [likedPhotos, setLikedPhotos] = useState(new Set());
  const [photoLikes, setPhotoLikes] = useState({});

  useEffect(() => {
    fetchGalleryData();
  }, []);

  useEffect(() => {
    // Initialize likes from localStorage
    const savedLikes = localStorage.getItem('photoLikes');
    if (savedLikes) {
      setPhotoLikes(JSON.parse(savedLikes));
    }
  }, []);

  const saveLikesToStorage = (likes) => {
    localStorage.setItem('photoLikes', JSON.stringify(likes));
  };

  const fetchGalleryData = async () => {
    try {
      const response = await fetch(API.GET_GALLERY);
      const data = await response.json();
      
      if (data.success) {
        setGalleryItems(data.data || []);
        // Initialize likes for new photos
        const initialLikes = {};
        data.data?.forEach(photo => {
          if (!photoLikes[photo._id]) {
            initialLikes[photo._id] = Math.floor(Math.random() * 50) + 10; // Random initial likes
          }
        });
        if (Object.keys(initialLikes).length > 0) {
          const updatedLikes = { ...photoLikes, ...initialLikes };
          setPhotoLikes(updatedLikes);
          saveLikesToStorage(updatedLikes);
        }
      } else {
        setGalleryItems(data.data || []);
        setError("Failed to load gallery images");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching gallery data:", error);
      setError("Failed to load gallery images");
      setLoading(false);
    }
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setShowImageModal(true);
  };

  const handleLike = (photoId) => {
    const newLikedPhotos = new Set(likedPhotos);
    const newPhotoLikes = { ...photoLikes };
    
    if (likedPhotos.has(photoId)) {
      newLikedPhotos.delete(photoId);
      newPhotoLikes[photoId] = Math.max(0, (newPhotoLikes[photoId] || 0) - 1);
    } else {
      newLikedPhotos.add(photoId);
      newPhotoLikes[photoId] = (newPhotoLikes[photoId] || 0) + 1;
    }
    
    setLikedPhotos(newLikedPhotos);
    setPhotoLikes(newPhotoLikes);
    saveLikesToStorage(newPhotoLikes);
  };

  const handleShare = async (photo) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${photo.event_type} Event Photo`,
          text: `Check out this beautiful photo from ${photo.event_id?.event_name || photo.event_type} event! ❤️ ${photoLikes[photo._id] || 0} likes`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback: Copy to clipboard
      const shareUrl = `${window.location.origin}/gallery#${photo._id}`;
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('Photo link copied to clipboard!');
      } catch (error) {
        alert('Could not copy link. Please copy the URL manually.');
      }
    }
  };

  const getFilteredImages = () => {
    let filtered = galleryItems;
    
    // Apply filter
    if (filter !== "all") {
      filtered = filtered.filter(item => item.event_type === filter);
    }
    
    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.event_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.event_id?.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const getEventTypes = () => {
    const types = [...new Set(galleryItems.map(item => item.event_type).filter(Boolean))];
    return types;
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="gallery-page">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <h2>Loading Gallery...</h2>
            <p>Please wait while we load beautiful event photos</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const filteredImages = getFilteredImages();
  const eventTypes = getEventTypes();

  return (
    <>
      <Header />
      <div className="gallery-page">

        {/* Hero Banner */}
        <div className="gallery-hero">
          <div className="hero-content">
            <h1>Event Gallery</h1>
            <p>Discover beautiful moments from our amazing events</p>
          </div>
          <div className="hero-bg"></div>
        </div>

        {/* Filter Section */}
        <div className="gallery-controls">
          <div className="filter-section">
            <h3>Filter by Event Type</h3>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${filter === "all" ? "active" : ""}`}
                onClick={() => setFilter("all")}
              >
                All Events
              </button>
              {eventTypes.map(type => (
                <button
                  key={type}
                  className={`filter-btn ${filter === type ? "active" : ""}`}
                  onClick={() => setFilter(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="results-info">
          <p>
            Showing <span className="highlight">{filteredImages.length}</span> photos
            {filter !== "all" && <span> in <span className="highlight">{filter}</span> events</span>}
            {searchTerm && <span> for "<span className="highlight">{searchTerm}</span>"</span>}
          </p>
        </div>

        {/* Photos Grid */}
        <div className="photos-grid">
          {filteredImages.length === 0 ? (
            <div className="no-photos-container">
              <div className="no-photos-content">
                <div className="no-photos-icon">📷</div>
                <h3>No Photos Found</h3>
                <p>
                  {searchTerm || filter !== "all" 
                    ? "No photos match your search criteria. Try adjusting your filters."
                    : "No photos have been uploaded to the gallery yet."}
                </p>
                {(searchTerm || filter !== "all") && (
                  <button 
                    className="reset-btn"
                    onClick={() => {
                      setSearchTerm("");
                      setFilter("all");
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          ) : (
            filteredImages.map((photo, index) => (
              <div className="photo-card" key={`photo-${photo._id || index}`} onClick={() => handleImageClick(photo)}>
                <div className="photo-image-container">
                  <img 
                    src={photo.image_path ? `http://localhost:5000/${photo.image_path}` : "https://via.placeholder.com/300x200"} 
                    alt={`${photo.event_type || 'Event'} photo ${index + 1}`}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/300x200";
                    }}
                    loading="lazy"
                  />
                  <div className="photo-overlay">
                    <div className="overlay-content">
                      <span className="view-icon">👁️</span>
                      <span className="view-text">View Photo</span>
                    </div>
                    <div className="photo-stats">
                      <span className="likes-stat">
                        <span className="likes-icon">{likedPhotos.has(photo._id) ? '❤️' : '🤍'}</span>
                        <span className="likes-count">{photoLikes[photo._id] || 0}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

      </div>

      {/* Image Details Modal */}
      {showImageModal && selectedImage && (
        <div className="modal-overlay" onClick={() => setShowImageModal(false)}>
          <div className="modal-content image-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowImageModal(false)}>
              <span>×</span>
            </button>
            
            <div className="image-details">
              <div className="image-header">
                <h3>Photo Details</h3>
                <div className="image-actions">
                  <button 
                    className={`action-btn ${likedPhotos.has(selectedImage._id) ? 'liked' : ''}`}
                    onClick={() => handleLike(selectedImage._id)}
                  >
                    <span>{likedPhotos.has(selectedImage._id) ? '❤️' : '🤍'}</span>
                    {likedPhotos.has(selectedImage._id) ? 'Liked' : 'Like'}
                    <span className="like-count">({photoLikes[selectedImage._id] || 0})</span>
                  </button>
                  <button 
                    className="action-btn"
                    onClick={() => handleShare(selectedImage)}
                  >
                    <span>🔗</span>
                    Share
                  </button>
                </div>
              </div>
              
              <div className="image-display">
                <img 
                  src={selectedImage.image_path ? `http://localhost:5000/${selectedImage.image_path}` : "https://via.placeholder.com/400x300"} 
                  alt={`${selectedImage.event_type} event photo`}
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/400x300";
                  }}
                />
              </div>
              
              <div className="image-info">
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Event Type</span>
                    <span className="info-value">{selectedImage.event_type || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Event Name</span>
                    <span className="info-value">
                      {selectedImage.event_id?.event_name || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Related Photos Section */}
              <div className="related-photos-section">
                <h4>Related Photos</h4>
                <div className="related-photos-grid">
                  {galleryItems
                    .filter(photo => 
                      photo._id !== selectedImage._id && 
                      photo.event_type === selectedImage.event_type
                    )
                    .slice(0, 6)
                    .map((photo, index) => (
                      <div 
                        className="related-photo-item" 
                        key={`related-${photo._id || index}`}
                        onClick={() => setSelectedImage(photo)}
                      >
                        <img 
                          src={photo.image_path ? `http://localhost:5000/${photo.image_path}` : "https://via.placeholder.com/100x100"} 
                          alt={`Related photo ${index + 1}`}
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/100x100";
                          }}
                        />
                        <div className="related-photo-overlay">
                          <span>View</span>
                        </div>
                      </div>
                    ))}
                </div>
                {galleryItems.filter(photo => 
                  photo._id !== selectedImage._id && 
                  photo.event_type === selectedImage.event_type
                ).length === 0 && (
                  <div className="no-related-photos">
                    <p>No related photos found</p>
                  </div>
                )}
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