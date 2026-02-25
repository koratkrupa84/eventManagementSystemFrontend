import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/AdminBlog.css";
import { API } from "../services/apiConfig";

const AdminBlog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    author: "",
    category: "Event Planning",
    tags: [],
    featuredImage: "",
    status: "draft",
    readTime: 5
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      console.log("=== FETCHING BLOGS ===");
      console.log("API Endpoint:", API.GET_BLOGS);
      console.log("Full API URL:", API.GET_BLOGS);
      
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found, skipping blog fetch");
        setBlogs([]);
        return;
      }
      
      console.log("Fetching blogs with token...");
      console.log("Token exists:", token ? "YES" : "NO");
      
      // Simple direct API call
      console.log("=== SIMPLE API CALL ===");
      const res = await axios.get(API.GET_BLOGS, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log("API Response Status:", res.status);
      console.log("API Response Data:", res.data);
      
      if (res.data && res.data.success) {
        const blogData = res.data.data || [];
        console.log("Setting blogs state:", blogData);
        console.log("Total blogs found:", blogData.length);
        setBlogs(blogData);
      } else {
        console.log("API returned unsuccessful response");
        setBlogs([]);
      }
    } catch (error) {
      console.error("=== FETCH BLOGS ERROR ===");
      console.error("Error:", error);
      console.error("Error Response:", error.response);
      console.error("Error Status:", error.response?.status);
      console.error("Error Data:", error.response?.data);
      console.error("Error Code:", error.code);
      console.error("Error Message:", error.message);
      
      if (error.response?.status === 401) {
        console.log("Authentication error - clearing token");
        localStorage.removeItem("token");
        window.location.href = "/admin/login";
        return;
      } else if (error.response?.status === 403) {
        setError("Access denied. Admin privileges required.");
      } else if (error.response?.status >= 500) {
        setError("Server error. Please try again later.");
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        setError("Network error. Please check your internet connection.");
      } else {
        setError("Failed to load blogs. Please check your connection.");
      }
      
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagsChange = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({
      ...prev,
      tags
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage('Please select an image file');
      setMessageType('error');
      return;
    }

    // Validate file size (max 1MB for 413 error)
    if (file.size > 1 * 1024 * 1024) {
      setMessage('Image size should be less than 1MB');
      setMessageType('error');
      return;
    }

    try {
      // Compress image
      const compressedImage = await compressImage(file);
      setFormData(prev => ({
        ...prev,
        featuredImage: compressedImage
      }));
    } catch (error) {
      console.error('Error processing image:', error);
      setMessage('Failed to process image file');
      setMessageType('error');
    }
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Resize to max width 800px
          let width = img.width;
          let height = img.height;
          const maxWidth = 800;
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with lower quality
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(compressedDataUrl);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    console.log("=== SUBMIT DEBUG ===");
    console.log("Form Data:", formData);
    console.log("Editing Blog:", editingBlog);
    console.log("Token:", localStorage.getItem("token"));

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("Please login to save blog");
        setMessageType("error");
        return;
      }

      let res;
      
      if (editingBlog) {
        console.log("Updating blog with ID:", editingBlog._id);
        res = await axios.put(`${API.UPDATE_BLOG}/${editingBlog._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        console.log("Creating new blog");
        res = await axios.post(API.CREATE_BLOG, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      console.log("Response:", res.data);
      setMessage(editingBlog ? "Blog updated successfully!" : "Blog created successfully!");
      setMessageType("success");
      resetForm();
      setShowForm(false);
      
      // Immediate refresh to show new blog
      console.log("Refreshing blogs list...");
      await fetchBlogs();
      
      // Force re-render with timeout
      setTimeout(() => {
        console.log("Forcing re-render...");
        fetchBlogs();
      }, 500);
    } catch (error) {
      console.error("=== ERROR DEBUG ===");
      console.error("Error:", error);
      console.error("Error Response:", error.response);
      console.error("Error Message:", error.message);
      
      let errorMessage = "Failed to save blog. Please try again.";
      
      if (error.response) {
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = "Network error. Please check your connection.";
      }
      
      setMessage(errorMessage);
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      content: blog.content,
      excerpt: blog.excerpt,
      author: blog.author,
      category: blog.category,
      tags: blog.tags,
      featuredImage: blog.featuredImage,
      status: blog.status,
      readTime: blog.readTime
    });
    setShowForm(true);
  };

  const handleViewBlog = (blog) => {
    // Open blog in new tab
    window.open(`/admin/blogs/${blog._id}`, '_blank');
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API.DELETE_BLOG}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setBlogs(blogs.filter(blog => blog._id !== id));
      setMessage("Blog deleted successfully!");
      setMessageType("success");
    } catch (error) {
      console.error("Error deleting blog:", error);
      setMessage("Failed to delete blog. Please try again.");
      setMessageType("error");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      excerpt: "",
      author: "",
      category: "Event Planning",
      tags: [],
      featuredImage: "",
      status: "draft",
      readTime: 5
    });
    setEditingBlog(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <div className="loading">Loading blogs...</div>;
  }

  return (
    <div className="admin-blog-container">
      <div className="admin-blog-header">
        <h2>Blog Management</h2>
        <button 
          className="add-blog-btn"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          <span className="btn-icon">+</span>
          Add New Blog
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      
      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingBlog ? "Edit Blog" : "Create New Blog"}</h3>
              <button className="close-btn" onClick={() => setShowForm(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="blog-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="title">Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter blog title"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="author">Author *</label>
                  <input
                    type="text"
                    id="author"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    required
                    placeholder="Author name"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Category *</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Event Planning">Event Planning</option>
                    <option value="Decorations">Decorations</option>
                    <option value="Photography">Photography</option>
                    <option value="Catering">Catering</option>
                    <option value="Venues">Venues</option>
                    <option value="Tips & Tricks">Tips & Tricks</option>
                    <option value="Success Stories">Success Stories</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="excerpt">Excerpt</label>
                <input
                  type="text"
                  id="excerpt"
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  placeholder="Brief description (max 300 characters)"
                  maxLength="300"
                />
              </div>

              <div className="form-group">
                <label htmlFor="tags">Tags (comma separated)</label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags.join(', ')}
                  onChange={handleTagsChange}
                  placeholder="event, planning, tips"
                />
              </div>

              <div className="form-group">
                <label htmlFor="featuredImage">Featured Image</label>
                <div className="image-upload-container">
                  <input
                    type="text"
                    id="featuredImage"
                    name="featuredImage"
                    value={formData.featuredImage}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                    className="image-url-input"
                  />
                  <div className="image-upload-options">
                    <button
                      type="button"
                      className="upload-btn"
                      onClick={() => document.getElementById('imageFileInput').click()}
                    >
                      <span className="upload-icon">📁</span>
                      Upload Image
                    </button>
                    <input
                      type="file"
                      id="imageFileInput"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>
                {formData.featuredImage && (
                  <div className="image-preview">
                    <img 
                      src={formData.featuredImage} 
                      alt="Featured" 
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={() => setFormData(prev => ({ ...prev, featuredImage: '' }))}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="readTime">Read Time (minutes)</label>
                <input
                  type="number"
                  id="readTime"
                  name="readTime"
                  value={formData.readTime}
                  onChange={handleInputChange}
                  min="1"
                  max="60"
                />
              </div>

              <div className="form-group">
                <label htmlFor="content">Content *</label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                  placeholder="Write your blog content here..."
                  rows="10"
                ></textarea>
              </div>

              <div className="form-actions">
                <button type="submit" disabled={submitting} className="submit-btn">
                  {submitting ? "Saving..." : (editingBlog ? "Update Blog" : "Create Blog")}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="cancel-btn">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="blog-list">
        {blogs.length === 0 ? (
          <div className="empty-state">
            <h3>No blogs found</h3>
            <p>Start by creating your first blog post!</p>
          </div>
        ) : (
          blogs.map((blog) => (
            <div key={blog._id} className="blog-card">
              <div className="blog-header">
                <h3>{blog.title}</h3>
                <div className="blog-actions">
                  <button onClick={() => handleEdit(blog)} className="edit-btn">
                    Edit
                  </button>
                  <button onClick={() => handleViewBlog(blog)} className="view-btn">
                    View Page
                  </button>
                  <button onClick={() => handleDelete(blog._id)} className="delete-btn">
                    Delete
                  </button>
                </div>
              </div>
              
              <div className="blog-meta">
                <span className="category">{blog.category}</span>
                <span className="author">By {blog.author}</span>
                <span className="date">{formatDate(blog.createdAt)}</span>
                <span className={`status ${blog.status}`}>{blog.status}</span>
              </div>
              
              <div className="blog-excerpt">
                {blog.excerpt || blog.content.substring(0, 150) + '...'}
              </div>
              
              <div className="blog-stats">
                <span className="views">👁 {blog.views} views</span>
                <span className="read-time">⏱ {blog.readTime} min read</span>
                {blog.tags.length > 0 && (
                  <div className="tags">
                    {blog.tags.map((tag, index) => (
                      <span key={index} className="tag">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminBlog;
