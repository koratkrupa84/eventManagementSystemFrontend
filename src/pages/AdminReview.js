import React, { useState, useEffect } from "react";
import "../css/AdminTestimonials.css";
import { API } from "../services/apiConfig";

const AdminReview = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    rating: 5,
    message: "",
    date: new Date().toISOString().split("T")[0]
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch(API.GET_REVIEWS);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to load reviews");

      setReviews(data.data);
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
      const res = await fetch(API.ADD_REVIEW, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to add review");

      setShowAddForm(false);
      setFormData({
        name: "",
        rating: 5,
        message: "",
        date: new Date().toISOString().split("T")[0]
      });
      fetchReviews();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API.DELETE_REVIEW}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to delete review");

      fetchReviews();
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return <div>Loading reviews...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="testimonial-header">
        <div>
          <h2>Manage Review</h2>
          <p className="sub-title">All Reviews</p>
        </div>

        <button className="add-btn" onClick={() => setShowAddForm(true)}>
          + Add New Review
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
              <h3>Add Review</h3>
              <input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
              <input
                type="number"
                placeholder="Rating (1-5)"
                min="1"
                max="5"
                value={formData.rating}
                onChange={(e) =>
                  setFormData({ ...formData, rating: e.target.value })
                }
                required
              />
              <textarea
                placeholder="Review Message"
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                required
              />
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
              <button type="submit">Add Review</button>
            </form>
          </div>
        </div>
      )}

      {/* Testimonials Grid */}
      <div className="testimonial-grid">
        {reviews.length === 0 ? (
          <p>No reviews found</p>
        ) : (
          reviews.map((item) => (
            <div className="testimonial-card" key={item._id}>
              <div className="rating">{"★".repeat(item.rating)}</div>

              <p className="message">"{item.message}"</p>

              <p className="name">- {item.name}</p>
              <p className="date">{formatDate(item.date)}</p>

              <div className="actions">
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(item._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminReview;
