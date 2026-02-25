import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/Blog.css";
import { API, BASE_URL } from "../services/apiConfig";

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    fetchBlog();
  }, [id]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      setError("");

      // Try to fetch by slug first, then by ID
      let response;
      try {
        response = await axios.get(`${API.GET_BLOG_BY_SLUG}/${id}`);
      } catch (slugError) {
        console.log("Slug fetch failed, trying ID:", slugError.message);
        // If slug fails, try with ID
        response = await axios.get(`${API.GET_BLOG}/${id}`);
      }

      if (response.data && response.data.success) {
        const blogData = response.data.data;
        console.log("Blog data fetched:", blogData);
        console.log("Featured image URL:", blogData.featuredImage);
        
        setBlog(blogData);
        
        // Fetch related blogs
        fetchRelatedBlogs(blogData.category, blogData._id);
      } else {
        setError("Blog post not found");
      }
    } catch (error) {
      console.error("Error fetching blog:", error);
      console.error("Error response:", error.response?.data);
      
      if (error.response?.status === 404) {
        setError("Blog post not found");
      } else {
        setError("Failed to load blog post. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedBlogs = async (category, currentBlogId) => {
    try {
      const response = await axios.get(API.GET_BLOGS, {
        params: {
          status: 'published',
          category: category,
          limit: 3
        }
      });

      if (response.data && response.data.success) {
        const related = response.data.data.filter(b => b._id !== currentBlogId).slice(0, 3);
        setRelatedBlogs(related);
      }
    } catch (error) {
      console.error("Error fetching related blogs:", error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatContent = (content) => {
    // If content is HTML, render it with proper sanitization
    if (content && (content.includes('<h1>') || content.includes('<h2>') || content.includes('<p>'))) {
      return <div className="blog-html-content" dangerouslySetInnerHTML={{ __html: content }} />;
    }
    
    // Enhanced markdown-like formatting with image support
    const lines = content.split('\n');
    const elements = [];
    let currentList = [];
    let inList = false;
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Handle empty lines
      if (!trimmed) {
        if (inList) {
          // End current list
          elements.push(
            <ul key={`list-${index}`} className="blog-list">
              {currentList}
            </ul>
          );
          currentList = [];
          inList = false;
        } else {
          elements.push(<br key={`br-${index}`} />);
        }
        return;
      }
      
      // Handle images with markdown syntax: ![alt text](url)
      if (trimmed.startsWith('![') && trimmed.includes('](')) {
        if (inList) {
          elements.push(
            <ul key={`list-${index}`} className="blog-list">
              {currentList}
            </ul>
          );
          currentList = [];
          inList = false;
        }
        
        // Extract image alt text and URL
        const altTextMatch = trimmed.match(/\[([^\]]+)\]/);
        const urlMatch = trimmed.match(/\(([^)]+)\)/);
        
        if (altTextMatch && urlMatch) {
          const altText = altTextMatch[1];
          const imageUrl = getImageUrl(urlMatch[1]);
          
          elements.push(
            <div key={index} className="blog-content-image">
              <img 
                src={imageUrl || ''} 
                alt={altText}
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `
                    <div class="blog-image-placeholder">
                      <div class="placeholder-icon">🖼️</div>
                      <div class="placeholder-text">Image not available</div>
                    </div>
                  `;
                }}
              />
              {altText && (
                <div className="image-caption">
                  <em>{altText}</em>
                </div>
              )}
            </div>
          );
        }
      }
      // Handle headings
      else if (trimmed.startsWith('# ')) {
        if (inList) {
          elements.push(
            <ul key={`list-${index}`} className="blog-list">
              {currentList}
            </ul>
          );
          currentList = [];
          inList = false;
        }
        elements.push(<h2 key={index} className="blog-heading">{trimmed.substring(2).trim()}</h2>);
      } else if (trimmed.startsWith('## ')) {
        if (inList) {
          elements.push(
            <ul key={`list-${index}`} className="blog-list">
              {currentList}
            </ul>
          );
          currentList = [];
          inList = false;
        }
        elements.push(<h3 key={index} className="blog-subheading">{trimmed.substring(3).trim()}</h3>);
      } else if (trimmed.startsWith('### ')) {
        if (inList) {
          elements.push(
            <ul key={`list-${index}`} className="blog-list">
              {currentList}
            </ul>
          );
          currentList = [];
          inList = false;
        }
        elements.push(<h4 key={index} className="blog-sub-subheading">{trimmed.substring(4).trim()}</h4>);
      }
      // Handle list items
      else if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.match(/^\d+\.\s/)) {
        const listContent = trimmed.replace(/^[-*]\s/, '').replace(/^\d+\.\s/, '');
        currentList.push(
          <li key={index} className="blog-list-item">
            {listContent}
          </li>
        );
        inList = true;
      }
      // Handle bold text
      else if (trimmed.includes('**')) {
        if (inList) {
          elements.push(
            <ul key={`list-${index}`} className="blog-list">
              {currentList}
            </ul>
          );
          currentList = [];
          inList = false;
        }
        const parts = trimmed.split('**');
        const formatted = parts.map((part, i) => 
          i % 2 === 1 ? <strong key={i}>{part}</strong> : part
        );
        elements.push(<p key={index} className="blog-paragraph">{formatted}</p>);
      }
      // Handle italic text
      else if (trimmed.includes('*') && !trimmed.startsWith('*')) {
        if (inList) {
          elements.push(
            <ul key={`list-${index}`} className="blog-list">
              {currentList}
            </ul>
          );
          currentList = [];
          inList = false;
        }
        const parts = trimmed.split('*');
        const formatted = parts.map((part, i) => 
          i % 2 === 1 ? <em key={i}>{part}</em> : part
        );
        elements.push(<p key={index} className="blog-paragraph">{formatted}</p>);
      }
      // Regular paragraph
      else {
        if (inList) {
          elements.push(
            <ul key={`list-${index}`} className="blog-list">
              {currentList}
            </ul>
          );
          currentList = [];
          inList = false;
        }
        elements.push(<p key={index} className="blog-paragraph">{trimmed}</p>);
      }
    });
    
    // Add any remaining list
    if (inList && currentList.length > 0) {
      elements.push(
        <ul key="final-list" className="blog-list">
          {currentList}
        </ul>
      );
    }
    
    return <>{elements}</>;
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

  const generateTableOfContents = (content) => {
    if (!content) return [];
    
    const lines = content.split('\n');
    const headings = [];
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('# ')) {
        headings.push({
          level: 1,
          title: trimmed.substring(2).trim(),
          id: `heading-${index}`
        });
      } else if (trimmed.startsWith('## ')) {
        headings.push({
          level: 2,
          title: trimmed.substring(3).trim(),
          id: `heading-${index}`
        });
      } else if (trimmed.startsWith('### ')) {
        headings.push({
          level: 3,
          title: trimmed.substring(4).trim(),
          id: `heading-${index}`
        });
      }
    });
    
    return headings;
  };

  const handleScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / scrollHeight) * 100;
    setReadingProgress(Math.min(progress, 100));
  };

  useEffect(() => {
    if (blog) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [blog]);

  const handleShare = async (platform) => {
    const url = window.location.href;
    const title = blog?.title;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  if (loading) {
    return (
      <div className="blog-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading amazing blog content...</p>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="blog-detail-error">
        <h2>Blog Post Not Found</h2>
        <p>{error || "The blog post you're looking for doesn't exist or has been removed."}</p>
        <div className="error-actions">
          <button onClick={() => navigate('/blog')} className="back-to-blog-btn">
            ← Back to Blog
          </button>
          <button onClick={fetchBlog} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const tableOfContents = generateTableOfContents(blog.content);

  return (
    <div className="blog-detail-container">
      {/* Reading Progress Bar */}
      <div className="blog-reading-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${readingProgress}%` }}
          ></div>
        </div>
        <span className="progress-text">{Math.round(readingProgress)}% Complete</span>
      </div>

      {/* Breadcrumb */}
      <nav className="blog-breadcrumb">
        <Link to="/">Home</Link>
        <span className="separator">/</span>
        <Link to="/blog">Blog</Link>
        <span className="separator">/</span>
        <span className="current">{blog.title}</span>
      </nav>

      {/* Blog Header */}
      <header className="blog-detail-header">
        <div className="blog-detail-category">{blog.category}</div>
        <h1 className="blog-detail-title">{blog.title}</h1>
        
        <div className="blog-detail-meta">
          <div className="meta-left">
            <span className="blog-detail-author">By {blog.author}</span>
            <span className="blog-detail-date">{formatDate(blog.createdAt)}</span>
            <span className="blog-detail-read-time">{blog.readTime} min read</span>
          </div>
          <div className="meta-right">
            <span className="blog-detail-views">👁 {blog.views || 0} views</span>
          </div>
        </div>

        {blog.tags && blog.tags.length > 0 && (
          <div className="blog-detail-tags">
            {blog.tags.map((tag, index) => (
              <span key={index} className="blog-detail-tag">#{tag}</span>
            ))}
          </div>
        )}
      </header>

      {/* Featured Image */}
      <div className="blog-detail-image">
        {(() => {
          const imageUrl = getImageUrl(blog.featuredImage);
          console.log("BlogDetail - Image URL:", imageUrl);
          
          return imageUrl ? (
            <img 
              src={imageUrl} 
              alt={blog.title}
              loading="lazy"
              onLoad={(e) => {
                console.log("Detail image loaded successfully:", imageUrl);
              }}
              onError={(e) => {
                console.log("Detail image failed to load:", imageUrl);
                e.target.style.display = 'none';
                // Create placeholder element
                const placeholder = document.createElement('div');
                placeholder.className = 'blog-detail-image-placeholder';
                placeholder.innerHTML = `
                  <div class="placeholder-icon">📷</div>
                  <div class="placeholder-text">${blog.category}</div>
                `;
                e.target.parentElement.appendChild(placeholder);
              }}
            />
          ) : (
            <div className="blog-detail-image-placeholder">
              <div className="placeholder-icon">📷</div>
              <div className="placeholder-text">{blog.category}</div>
            </div>
          );
        })()}
      </div>

      {/* Blog Content */}
      <div className="blog-detail-wrapper">
        {/* Table of Contents */}
        {tableOfContents.length > 0 && (
          <aside className="blog-toc">
            <h4>Table of Contents</h4>
            <ul className="toc-list">
              {tableOfContents.map((heading, index) => (
                <li key={index} className={`toc-item toc-level-${heading.level}`}>
                  <a href={`#${heading.id}`} className="toc-link">
                    {heading.title}
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        )}

        <div className="blog-detail-content">
          {blog.excerpt && (
            <div className="blog-detail-intro">
              <p>{blog.excerpt}</p>
            </div>
          )}
          
          <div className="blog-detail-body">
            {formatContent(blog.content)}
          </div>
        </div>
      </div>

      {/* Share Section */}
      <div className="blog-detail-share">
        <h3>Share this post</h3>
        <div className="share-buttons">
          <button 
            onClick={() => handleShare('facebook')} 
            className="share-btn facebook"
            aria-label="Share on Facebook"
          >
            <span className="share-icon">f</span>
          </button>
          <button 
            onClick={() => handleShare('twitter')} 
            className="share-btn twitter"
            aria-label="Share on Twitter"
          >
            <span className="share-icon">𝕏</span>
          </button>
          <button 
            onClick={() => handleShare('linkedin')} 
            className="share-btn linkedin"
            aria-label="Share on LinkedIn"
          >
            <span className="share-icon">in</span>
          </button>
          <button 
            onClick={() => handleShare('whatsapp')} 
            className="share-btn whatsapp"
            aria-label="Share on WhatsApp"
          >
            <span className="share-icon">📱</span>
          </button>
          <button 
            onClick={handleCopyLink} 
            className="share-btn copy"
            aria-label="Copy link"
          >
            <span className="share-icon">🔗</span>
          </button>
        </div>
      </div>

      {/* Related Posts */}
      {relatedBlogs.length > 0 && (
        <section className="blog-related-posts">
          <h3>You may also like</h3>
          <div className="related-posts-grid">
            {relatedBlogs.map((relatedBlog) => {
              const imageUrl = getImageUrl(relatedBlog.featuredImage);
              return (
              <article key={relatedBlog._id} className="related-post-card">
                {imageUrl && (
                  <div className="related-post-image">
                    <img 
                      src={imageUrl} 
                      alt={relatedBlog.title}
                      loading="lazy"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                <div className="related-post-content">
                  <div className="related-post-category">{relatedBlog.category}</div>
                  <h4 className="related-post-title">
                    <Link to={`/blog/${relatedBlog.slug || relatedBlog._id}`}>
                      {relatedBlog.title}
                    </Link>
                  </h4>
                  <div className="related-post-meta">
                    <span className="related-post-author">{relatedBlog.author}</span>
                    <span className="related-post-date">{formatDate(relatedBlog.createdAt)}</span>
                  </div>
                </div>
              </article>
            )})}
          </div>
        </section>
      )}

      {/* Back to Blog */}
      <div className="blog-detail-footer">
        <button onClick={() => navigate('/blog')} className="back-to-blog-btn">
          ← Back to Blog
        </button>
      </div>
    </div>
  );
};

export default BlogDetail;
