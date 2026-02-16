import React, { useState, useEffect } from "react";
import "../css/AdminCategories.css";
import { API } from "../services/apiConfig";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(API.GET_CATEGORIES);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to load categories");

      setCategories(data.data);
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
      const token = localStorage.getItem("authToken");
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
      const token = localStorage.getItem("authToken");
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

        <button className="add-btn" onClick={() => setShowAddForm(true)}>
          + Add New Category
        </button>
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

      <div className="category-grid">
        {categories.length === 0 ? (
          <p>No categories found</p>
        ) : (
          categories.map((cat) => (
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
