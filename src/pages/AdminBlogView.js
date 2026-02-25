import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../css/AdminBlogView.css";
import { API } from "../services/apiConfig";


const AdminBlogView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please login to view blog");
          setLoading(false);
          return;
        }

        const res = await axios.get(`${API.GET_BLOG}/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data && res.data.success) {
          setBlog(res.data.data);
        } else {
          setError("Blog not found");
        }
      } catch (error) {
        console.error("Error fetching blog:", error);
        setError("Failed to load blog");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBlog();
    }
  }, [id]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <div className="loading">Loading blog...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!blog) {
    return <div className="error-message">Blog not found</div>;
  }

  return (
    <div className="admin-blog-container">
      <div className="admin-blog-header">
        <button 
          className="back-btn"
          onClick={() => navigate('/admin/blogs')}
        >
          ← Back to Blogs
        </button>
        <h2>Blog Details</h2>
      </div>

      <div className="blog-detail-card">
        <div className="blog-detail-header">
          <h1>{blog.title}</h1>
          <div className="blog-detail-meta">
            <span className="category">{blog.category}</span>
            <span className="author">By {blog.author}</span>
            <span className="date">{formatDate(blog.createdAt)}</span>
            <span className={`status ${blog.status}`}>{blog.status}</span>
          </div>
        </div>

        {blog.featuredImage && (
          <div className="blog-detail-image">
            <img 
              src={blog.featuredImage} 
              alt={blog.title}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}

        <div className="blog-detail-content">
          <div className="blog-detail-excerpt">
            <h3>Excerpt</h3>
            <p>{blog.excerpt || 'No excerpt available'}</p>
          </div>

          <div className="blog-detail-body">
            <h3>Content</h3>
            <div 
              className="blog-content"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>
        </div>

        <div className="blog-detail-meta-footer">
          <div className="blog-detail-stats">
            <span className="views">👁 {blog.views || 0} views</span>
            <span className="read-time">⏱ {blog.readTime || 5} min read</span>
          </div>
          
          {blog.tags && blog.tags.length > 0 && (
            <div className="blog-detail-tags">
              <h3>Tags</h3>
              <div className="tags-container">
                {blog.tags.map((tag, index) => (
                  <span key={index} className="tag">#{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBlogView;
