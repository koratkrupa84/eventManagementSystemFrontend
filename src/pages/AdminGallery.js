import React from "react";
import "../css/AdminGallery.css";

const galleryImages = [
  "https://images.unsplash.com/photo-1527529482837-4698179dc6ce",
  "https://images.unsplash.com/photo-1515165562835-c4c5b49d3c40",
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
  "https://images.unsplash.com/photo-1519710164239-da123dc03ef4",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
  "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70",
  "https://images.unsplash.com/photo-1514516870926-205c1f0b2f8a",
];

const AdminGallery = () => {
  return (
    <div>
      {/* Header */}
      <div className="gallery-header">
        <div>
          <h2>Manage Gallery</h2>
          <p className="sub-title">Gallery Images</p>
        </div>

        <button className="upload-btn">+ Upload Images</button>
      </div>

      {/* Gallery Grid */}
      <div className="gallery-grid">
        {galleryImages.map((img, index) => (
          <div className="gallery-card" key={index}>
            <img src={img} alt={`Gallery ${index}`} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminGallery;
