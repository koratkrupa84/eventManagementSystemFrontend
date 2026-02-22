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
  const [formData, setFormData] = useState({ title: "", description: "" });
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
      setFormData({ title: "", description: "" });
      setSelectedImage(null);
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
      title: category.title,
      description: category.description
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
      setFormData({ title: "", description: "" });
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
          <p className="sub-title">All Categories</p>
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
              <div className="modal-actions">
                <button type="submit" className="btn update">
                  Update Category
                </button>
                <button 
                  type="button" 
                  className="btn cancel"
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
