import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../css/Blog.css";
import { API, BASE_URL } from "../services/apiConfig";

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const categories = [
    "all",
    "Event Planning",
    "Decorations", 
    "Photography",
    "Catering",
    "Venues",
    "Tips & Tricks",
    "Success Stories"
  ];

  useEffect(() => {
    fetchBlogs();
  }, [selectedCategory, currentPage, searchTerm]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError("");
      
      const params = {
        status: 'published',
        page: currentPage,
        limit: 6
      };
      
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      
      if (searchTerm) {
        params.search = searchTerm;
      }

      console.log("Fetching blogs with params:", params);
      const response = await axios.get(API.GET_BLOGS, { params });
      
      if (response.data && response.data.success) {
        const blogData = response.data.data || [];
        console.log("Blogs fetched successfully:", blogData);
        console.log("Sample blog image:", blogData[0]?.featuredImage);
        
        setBlogs(blogData);
        setTotalPages(response.data.pagination?.pages || 1);
      } else {
        setBlogs([]);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
      console.error("Error response:", error.response?.data);
      setError("Failed to load blogs. Please try again later.");
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateContent = (content, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // If it's already a full URL (starts with http), return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // If it starts with /uploads, it's already relative to backend
    if (imagePath.startsWith('/uploads')) {
      return `${BASE_URL}${imagePath}`;
    }
    
    // Otherwise, assume it's a filename in uploads directory
    return `${BASE_URL}/uploads/${imagePath}`;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBlogs();
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="blog-loading">
        <div className="loading-spinner"></div>
        <p>Loading amazing blog posts...</p>
      </div>
    );
  }

  return (
    <div className="blog-container">
      {/* Header Section */}
      <div className="blog-header">
        <div className="blog-hero">
          <h1>Our Blog</h1>
          <p>Discover amazing event planning tips, inspiration, and success stories</p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="blog-filters">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search blog posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn">Search</button>
        </form>

        <div className="category-filters">
          <h3>Categories</h3>
          <div className="category-buttons">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              >
                {category === 'all' ? 'All Posts' : category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="blog-error">
          <p>{error}</p>
          <button onClick={fetchBlogs} className="retry-btn">Try Again</button>
        </div>
      )}

      {/* Blog Grid */}
      <div className="blog-grid">
        {blogs.length === 0 ? (
          <div className="blog-empty">
            <h3>No blog posts found</h3>
            <p>Try adjusting your filters or check back later for new content.</p>
          </div>
        ) : (
          blogs.map((blog) => {
            const imageUrl = getImageUrl(blog.featuredImage);
            console.log("Blog:", blog.title, "Image URL:", imageUrl);
            
            return (
            <article key={blog._id} className="blog-card">
              <div className="blog-image">
                {imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt={blog.title}
                    loading="lazy"
                    onLoad={(e) => {
                      console.log("Image loaded successfully:", imageUrl);
                    }}
                    onError={(e) => {
                      console.log("Image failed to load:", imageUrl);
                      e.target.style.display = 'none';
                      // Create placeholder element
                      const placeholder = document.createElement('div');
                      placeholder.className = 'blog-image-placeholder';
                      placeholder.innerHTML = `
                        <div class="placeholder-icon">📷</div>
                        <div class="placeholder-text">${blog.category}</div>
                      `;
                      e.target.parentElement.appendChild(placeholder);
                    }}
                  />
                ) : (
                  <div className="blog-image-placeholder">
                    <div className="placeholder-icon">📷</div>
                    <div className="placeholder-text">{blog.category}</div>
                  </div>
                )}
                <div className="blog-category">{blog.category}</div>
              </div>
              
              <div className="blog-content">
                <div className="blog-meta">
                  <span className="blog-author">By {blog.author}</span>
                  <span className="blog-date">{formatDate(blog.createdAt)}</span>
                  <span className="blog-read-time">{blog.readTime} min read</span>
                </div>

                <h2 className="blog-title">
                  <Link to={`/blog/${blog.slug || blog._id}`}>{blog.title}</Link>
                </h2>

                <p className="blog-excerpt">
                  {blog.excerpt || truncateContent(blog.content)}
                </p>

                <div className="blog-footer">
                  <div className="blog-stats">
                    <span className="blog-views">👁 {blog.views || 0} views</span>
                  </div>
                  
                  {blog.tags && blog.tags.length > 0 && (
                    <div className="blog-tags">
                      {blog.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="blog-tag">#{tag}</span>
                      ))}
                      {blog.tags.length > 3 && (
                        <span className="blog-tag-more">+{blog.tags.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>

                <Link to={`/blog/${blog.slug || blog._id}`} className="read-more-btn">
                  Read More →
                </Link>
              </div>
            </article>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="blog-pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn prev-btn"
          >
            ← Previous
          </button>

          <div className="pagination-numbers">
            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;
              const showPage = page === 1 || page === totalPages || 
                             (page >= currentPage - 1 && page <= currentPage + 1);
              
              if (!showPage) {
                if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="pagination-ellipsis">...</span>;
                }
                return null;
              }

              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-btn next-btn"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default Blog;
