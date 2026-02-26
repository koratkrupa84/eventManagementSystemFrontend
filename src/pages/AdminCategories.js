import React, { useState, useEffect } from "react";
import "../css/AdminCategories.css";
import "../css/AdminCommon.css";
import { API } from "../services/apiConfig";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({ 
    title: "", 
    description: "", 
    features: [], 
    priceRange: { min: 0, max: 0 }, 
    duration: "", 
    capacity: { min: 0, max: 0 }, 
    includedServices: [], 
    additionalInfo: "",
    isActive: true 
  });
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const filtered = categories.filter((category) =>
      category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCategories(filtered);
  }, [categories, searchTerm]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(API.GET_CATEGORIES);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to load categories");

      setCategories(data.data);
      setFilteredCategories(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const token = localStorage.getItem("token");
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("features", JSON.stringify(formData.features));
      formDataToSend.append("priceRange", JSON.stringify(formData.priceRange));
      formDataToSend.append("duration", formData.duration);
      formDataToSend.append("capacity", JSON.stringify(formData.capacity));
      formDataToSend.append("includedServices", JSON.stringify(formData.includedServices));
      formDataToSend.append("additionalInfo", formData.additionalInfo);
      formDataToSend.append("isActive", formData.isActive);
      
      if (selectedImage) {
        formDataToSend.append("image", selectedImage);
      }

      const res = await fetch(API.ADD_CATEGORY, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to add category");

      setShowAddForm(false);
      setSelectedImage(null);
      setFormData({ 
        title: "", 
        description: "", 
        features: [], 
        priceRange: { min: 0, max: 0 }, 
        duration: "", 
        capacity: { min: 0, max: 0 }, 
        includedServices: [], 
        additionalInfo: "",
        isActive: true 
      });
      fetchCategories();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API.DELETE_CATEGORY}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to delete category");

      fetchCategories();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleView = (category) => {
    setSelectedCategory(category);
    setFormData({
      title: category.title || '',
      description: category.description || '',
      features: category.features || [],
      priceRange: category.priceRange || { min: 0, max: 0 },
      duration: category.duration || '',
      capacity: category.capacity || { min: 0, max: 0 },
      includedServices: category.includedServices || [],
      additionalInfo: category.additionalInfo || '',
      isActive: category.isActive !== undefined ? category.isActive : true
    });
    setSelectedImage(null);
    setShowViewModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const token = localStorage.getItem("token");
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("features", JSON.stringify(formData.features));
      formDataToSend.append("priceRange", JSON.stringify(formData.priceRange));
      formDataToSend.append("duration", formData.duration);
      formDataToSend.append("capacity", JSON.stringify(formData.capacity));
      formDataToSend.append("includedServices", JSON.stringify(formData.includedServices));
      formDataToSend.append("additionalInfo", formData.additionalInfo);
      formDataToSend.append("isActive", formData.isActive);
      
      if (selectedImage) {
        formDataToSend.append("image", selectedImage);
      }

      const res = await fetch(`${API.UPDATE_CATEGORY}/${selectedCategory._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to update category");

      setShowViewModal(false);
      setSelectedCategory(null);
      setFormData({ 
        title: "", 
        description: "", 
        features: [], 
        priceRange: { min: 0, max: 0 }, 
        duration: "", 
        capacity: { min: 0, max: 0 }, 
        includedServices: [], 
        additionalInfo: "",
        isActive: true 
      });
      setSelectedImage(null);
      fetchCategories();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div>Loading categories...</div>;
  }

  return (
    <div>
      <div className="category-header">
        <div>
          <h2>Manage Categories</h2>
          <p className="category-sub-title">All Categories</p>
        </div>

        <div className="header-actions">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button className="add-btn" onClick={() => setShowAddForm(true)}>
            + Add New Category
          </button>
        </div>
      </div>

      {error && <div className="error-text">{error}</div>}

      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-btn" onClick={() => setShowAddForm(false)}>
              ×
            </span>
            <form onSubmit={handleSubmit}>
              <h3>Add Category</h3>
              
              {/* Basic Information */}
              <div className="category-form-section">
                <h4>Basic Information</h4>
                <input
                  type="text"
                  placeholder="Category Title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
                <textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedImage(e.target.files[0])}
                />
              </div>

              {/* Pricing Information */}
              <div className="category-form-section">
                <h4>Pricing Information</h4>
                <div className="price-inputs">
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={formData.priceRange.min}
                    onChange={(e) =>
                      setFormData({ 
                        ...formData, 
                        priceRange: { ...formData.priceRange, min: parseInt(e.target.value) || 0 }
                      })
                    }
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={formData.priceRange.max}
                    onChange={(e) =>
                      setFormData({ 
                        ...formData, 
                        priceRange: { ...formData.priceRange, max: parseInt(e.target.value) || 0 }
                      })
                    }
                  />
                </div>
              </div>

              {/* Event Details */}
              <div className="category-form-section">
                <h4>Event Details</h4>
                <input
                  type="text"
                  placeholder="Duration (e.g., 4-6 hours, Full day)"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                />
                <div className="capacity-inputs">
                  <input
                    type="number"
                    placeholder="Min Guests"
                    value={formData.capacity.min}
                    onChange={(e) =>
                      setFormData({ 
                        ...formData, 
                        capacity: { ...formData.capacity, min: parseInt(e.target.value) || 0 }
                      })
                    }
                  />
                  <input
                    type="number"
                    placeholder="Max Guests"
                    value={formData.capacity.max}
                    onChange={(e) =>
                      setFormData({ 
                        ...formData, 
                        capacity: { ...formData.capacity, max: parseInt(e.target.value) || 0 }
                      })
                    }
                  />
                </div>
              </div>

              {/* Features */}
              <div className="category-form-section">
                <h4>Features</h4>
                <div className="array-input">
                  <input
                    type="text"
                    placeholder="Add feature and press Enter"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        e.preventDefault();
                        setFormData({
                          ...formData,
                          features: [...formData.features, e.target.value.trim()]
                        });
                        e.target.value = '';
                      }
                    }}
                  />
                  <div className="array-items">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="array-item">
                        <span>{feature}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              features: formData.features.filter((_, i) => i !== index)
                            })
                          }
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Included Services */}
              <div className="category-form-section">
                <h4>Included Services</h4>
                <div className="array-input">
                  <input
                    type="text"
                    placeholder="Add service and press Enter"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        e.preventDefault();
                        setFormData({
                          ...formData,
                          includedServices: [...formData.includedServices, e.target.value.trim()]
                        });
                        e.target.value = '';
                      }
                    }}
                  />
                  <div className="array-items">
                    {formData.includedServices.map((service, index) => (
                      <div key={index} className="array-item">
                        <span>{service}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              includedServices: formData.includedServices.filter((_, i) => i !== index)
                            })
                          }
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="category-form-section">
                <h4>Additional Information</h4>
                <textarea
                  placeholder="Additional details about this category"
                  value={formData.additionalInfo}
                  onChange={(e) =>
                    setFormData({ ...formData, additionalInfo: e.target.value })
                  }
                />
              </div>

              {/* Status */}
              <div className="category-form-section">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                  />
                  Active Category
                </label>
              </div>

              <button type="submit">Add Category</button>
            </form>
          </div>
        </div>
      )}

      {showViewModal && selectedCategory && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-btn" onClick={() => setShowViewModal(false)}>
              ×
            </span>
            <form onSubmit={handleUpdate}>
              <h3>View & Update Category</h3>
              
              {selectedCategory.image && (
                <div className="current-image">
                  <img
                    src={`http://localhost:5000/${selectedCategory.image}`}
                    alt={selectedCategory.title}
                    style={{ width: "100%", maxHeight: "200px", objectFit: "cover", marginBottom: "15px" }}
                  />
                </div>
              )}
              
              {/* Basic Information */}
              <div className="category-form-section">
                <h4>Basic Information</h4>
                <input
                  type="text"
                  placeholder="Category Title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
                <textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedImage(e.target.files[0])}
                />
                {selectedImage && (
                  <p style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
                    New image selected: {selectedImage.name}
                  </p>
                )}
              </div>

              {/* Pricing Information */}
              <div className="category-form-section">
                <h4>Pricing Information</h4>
                <div className="price-inputs">
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={formData.priceRange.min}
                    onChange={(e) =>
                      setFormData({ 
                        ...formData, 
                        priceRange: { ...formData.priceRange, min: parseInt(e.target.value) || 0 }
                      })
                    }
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={formData.priceRange.max}
                    onChange={(e) =>
                      setFormData({ 
                        ...formData, 
                        priceRange: { ...formData.priceRange, max: parseInt(e.target.value) || 0 }
                      })
                    }
                  />
                </div>
              </div>

              {/* Event Details */}
              <div className="category-form-section">
                <h4>Event Details</h4>
                <input
                  type="text"
                  placeholder="Duration (e.g., 4-6 hours, Full day)"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                />
                <div className="capacity-inputs">
                  <input
                    type="number"
                    placeholder="Min Guests"
                    value={formData.capacity.min}
                    onChange={(e) =>
                      setFormData({ 
                        ...formData, 
                        capacity: { ...formData.capacity, min: parseInt(e.target.value) || 0 }
                      })
                    }
                  />
                  <input
                    type="number"
                    placeholder="Max Guests"
                    value={formData.capacity.max}
                    onChange={(e) =>
                      setFormData({ 
                        ...formData, 
                        capacity: { ...formData.capacity, max: parseInt(e.target.value) || 0 }
                      })
                    }
                  />
                </div>
              </div>

              {/* Features */}
              <div className="category-form-section">
                <h4>Features</h4>
                <div className="array-input">
                  <input
                    type="text"
                    placeholder="Add feature and press Enter"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        e.preventDefault();
                        setFormData({
                          ...formData,
                          features: [...formData.features, e.target.value.trim()]
                        });
                        e.target.value = '';
                      }
                    }}
                  />
                  <div className="array-items">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="array-item">
                        <span>{feature}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              features: formData.features.filter((_, i) => i !== index)
                            })
                          }
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Included Services */}
              <div className="category-form-section">
                <h4>Included Services</h4>
                <div className="array-input">
                  <input
                    type="text"
                    placeholder="Add service and press Enter"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        e.preventDefault();
                        setFormData({
                          ...formData,
                          includedServices: [...formData.includedServices, e.target.value.trim()]
                        });
                        e.target.value = '';
                      }
                    }}
                  />
                  <div className="array-items">
                    {formData.includedServices.map((service, index) => (
                      <div key={index} className="array-item">
                        <span>{service}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              includedServices: formData.includedServices.filter((_, i) => i !== index)
                            })
                          }
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="category-form-section">
                <h4>Additional Information</h4>
                <textarea
                  placeholder="Additional details about this category"
                  value={formData.additionalInfo}
                  onChange={(e) =>
                    setFormData({ ...formData, additionalInfo: e.target.value })
                  }
                />
              </div>

              {/* Status */}
              <div className="category-form-section">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                  />
                  Active Category
                </label>
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn update">
                  Update Category
                </button>
                <button 
                  type="button" 
                  className="btn category-cancel"
                  onClick={() => setShowViewModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="category-grid">
        {filteredCategories.length === 0 ? (
          <p>{searchTerm ? "No categories found matching your search" : "No categories found"}</p>
        ) : (
          filteredCategories.map((cat) => (
            <div className="category-card" key={cat._id}>
              <img
                src={
                  cat.image
                    ? `http://localhost:5000/${cat.image}`
                    : "https://via.placeholder.com/300"
                }
                alt={cat.title}
              />

              <div className="category-content">
                <h3>{cat.title}</h3>
                <p>{cat.description}</p>

                <div className="category-actions">
                  <button
                    className="btn view"
                    onClick={() => handleView(cat)}
                  >
                    View
                  </button>
                  <button
                    className="btn delete"
                    onClick={() => handleDelete(cat._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminCategories;
