import React, { useState, useEffect } from 'react';
import '../css/Services.css';
import Header from '../component/Header';
import Footer from '../component/Footer';
import { API } from '../services/apiConfig';

const Services = () => {
  const [categories, setCategories] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('services'); // 'services' or 'packages'

  useEffect(() => {
    fetchCategories();
    fetchPackages();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API.GET_CATEGORIES, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      const result = await res.json();
      
      if (res.ok && result?.success) {
        console.log("Categories fetched:", result.data);
        setCategories(result.data || []);
      } else {
        console.log("API response:", result);
        setError(result?.message || "Failed to fetch categories");
      }
    } catch (error) {
      console.log("Fetch categories error:", error);
      setError("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const fetchPackages = async () => {
    try {
      const res = await fetch(API.GET_PACKAGES);
      const result = await res.json();
      
      if (res.ok && result?.success) {
        console.log("Packages fetched:", result.data);
        setPackages(result.data || []);
      } else {
        console.log("API response:", result);
        setError(result?.message || "Failed to fetch packages");
      }
    } catch (error) {
      console.log("Fetch packages error:", error);
      setError("Failed to fetch packages");
    }
  };

  const getCategoryIcon = (categoryName) => {
    const icons = {
      'wedding': '💑',
      'corporate': '💼',
      'birthday': '🎂',
      'social': '🎉',
      'cultural': '🎭',
      'exhibition': '🏪',
      'conference': '🏢',
      'seminar': '🎓',
      'party': '🎊',
      'festival': '🎪',
      'meeting': '🤝',
      'workshop': '🛠️'
    };
    
    const name = categoryName?.toLowerCase() || '';
    for (const [key, icon] of Object.entries(icons)) {
      if (name.includes(key)) return icon;
    }
    return '📋'; // Default icon
  };

  const getPackageIcon = (packageName) => {
    const icons = {
      'basic': '📦',
      'premium': '💎',
      'gold': '🏆',
      'silver': '🥈',
      'bronze': '🥉',
      'platinum': '⭐',
      'deluxe': '🌟',
      'standard': '📋',
      'economy': '💰',
      'luxury': '👑'
    };
    
    const name = packageName?.toLowerCase() || '';
    for (const [key, icon] of Object.entries(icons)) {
      if (name.includes(key)) return icon;
    }
    return '📦'; // Default icon
  };

  const handleViewDetails = (item) => {
    setSelectedService(item);
    setShowDetailsModal(true);
  };

  const closeModal = () => {
    setShowDetailsModal(false);
    setSelectedService(null);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="services-page">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading services...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="services-page">
          <div className="error-container">
            <h3>Error loading services</h3>
            <p>{error}</p>
            <button onClick={fetchCategories} className="retry-btn">Retry</button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="services-page">
        {/* Hero Section */}
        <div className="services-hero">
          <div className="hero-content">
            <h1>{activeTab === 'services' ? 'Our Services' : 'Our Packages'}</h1>
            <p>{activeTab === 'services' ? 'Complete Event Management Solutions for Every Occasion' : 'Choose from our carefully curated event packages'}</p>
            
          </div>
        </div>
         {/* Toggle Buttons */}
            <div className="toggle-buttons">
              <button 
                className={`toggle-btn ${activeTab === 'services' ? 'active' : ''}`}
                onClick={() => setActiveTab('services')}
              >
                Services
              </button>
              <button 
                className={`toggle-btn ${activeTab === 'packages' ? 'active' : ''}`}
                onClick={() => setActiveTab('packages')}
              >
                Packages
              </button>
            </div>
        {/* Services/Packages Grid */}
        <div className="services-container">
          <div className="services-grid">
            {activeTab === 'services' ? (
              // Services Cards
              categories.length > 0 ? (
                categories.map((category) => (
                  <div key={category._id} className="service-card" onClick={() => handleViewDetails(category)}>
                    <div className="service-image">
                      {category.image ? (
                        <img 
                          src={category.image} 
                          alt={category.title}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                      ) : null}
                      <div className="service-icon" style={{ display: category.image ? 'none' : 'block' }}>
                        {getCategoryIcon(category.title)}
                      </div>
                    </div>
                    <h3>{category.title}</h3>
                    <p>{category.description ? category.description.substring(0, 100) + (category.description.length > 100 ? '...' : '') : 'Professional event management services for your special occasion.'}</p>
                    
                    {/* Price Range */}
                    {category.priceRange && (category.priceRange.min > 0 || category.priceRange.max > 0) && (
                      <div className="price-range">
                        <strong>Price:</strong> 
                        {category.priceRange.min > 0 && category.priceRange.max > 0 
                          ? ` ₹${category.priceRange.min} - ₹${category.priceRange.max}`
                          : category.priceRange.min > 0 
                          ? ` From ₹${category.priceRange.min}`
                          : category.priceRange.max > 0 
                          ? ` Up to ₹${category.priceRange.max}`
                          : ' Contact for pricing'
                        }
                      </div>
                    )}

                    {/* Duration */}
                    {category.duration && (
                      <div className="duration">
                        <strong>Duration:</strong> {category.duration}
                      </div>
                    )}

                    {/* Capacity */}
                    {category.capacity && (category.capacity.min > 0 || category.capacity.max > 0) && (
                      <div className="capacity">
                        <strong>Capacity:</strong> 
                        {category.capacity.min > 0 && category.capacity.max > 0 
                          ? ` ${category.capacity.min} - ${category.capacity.max} guests`
                          : category.capacity.min > 0 
                          ? ` Min ${category.capacity.min} guests`
                          : category.capacity.max > 0 
                          ? ` Max ${category.capacity.max} guests`
                          : ' Flexible capacity'
                        }
                      </div>
                    )}

                    <div className="view-details-hint">
                      <span>Click for details →</span>
                    </div>

                    <div className="service-actions">
                      <button className="book-service-btn" onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = '/book-private-event';
                      }}>
                        Book Now
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-services">
                  <h3>No Services Available</h3>
                  <p>Please check back later or contact us for custom event planning.</p>
                </div>
              )
            ) : (
              // Packages Cards
              packages.length > 0 ? (
                packages.map((pkg) => (
                  <div key={pkg._id} className="service-card" onClick={() => handleViewDetails(pkg)}>
                    <div className="service-image">
                      {pkg.images && pkg.images.length > 0 ? (
                        <img 
                          src={pkg.images[0]} 
                          alt={pkg.package_name}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                      ) : null}
                      <div className="service-icon" style={{ display: (pkg.images && pkg.images.length > 0) ? 'none' : 'block' }}>
                        {getPackageIcon(pkg.package_name)}
                      </div>
                    </div>
                    <h3>{pkg.package_name}</h3>
                    <div className="package-price">
                      <strong>Price:</strong> ₹{pkg.price}
                    </div>
                    
                    <div className="package-services">
                      <strong>Services:</strong>
                      <p>{pkg.services ? pkg.services.substring(0, 100) + (pkg.services.length > 100 ? '...' : '') : 'Complete event management services'}</p>
                    </div>

                    <div className="view-details-hint">
                      <span>Click for details →</span>
                    </div>

                    <div className="service-actions">
                      <button className="book-service-btn" onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = '/book-private-event';
                      }}>
                        Book Now
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-services">
                  <h3>No Packages Available</h3>
                  <p>Please check back later or contact us for custom packages.</p>
                </div>
              )
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="features-section">
          <div className="features-container">
            <h2>Why Choose EventSphere?</h2>
            <div className="features-grid">
              <div className="feature-item">
                <div className="feature-icon">✨</div>
                <h4>Expert Planning</h4>
                <p>Professional event planners with years of experience</p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">💰</div>
                <h4>Best Prices</h4>
                <p>Competitive pricing with no hidden charges</p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🎯</div>
                <h4>Custom Solutions</h4>
                <p>Tailored events to match your vision and budget</p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">📞</div>
                <h4>24/7 Support</h4>
                <p>Round-the-clock assistance for your events</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="cta-section">
          <div className="cta-content">
            <h2>Ready to Plan Your Perfect Event?</h2>
            <p>Get in touch with our event experts and turn your vision into reality</p>
            <div className="cta-buttons">
              <button className="cta-primary" onClick={() => window.location.href = '/contact'}>
                Contact Us
              </button>
              <button className="cta-secondary" onClick={() => window.location.href = '/gallery'}>
                View Gallery
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Service Details Modal */}
      {showDetailsModal && selectedService && (
        <div className="service-details-modal-overlay" onClick={closeModal}>
          <div className="service-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedService.title}</h2>
              <button className="close-modal-btn" onClick={closeModal}>×</button>
            </div>
            
            <div className="modal-content">
              {/* Service Image */}
              <div className="modal-image">
                {selectedService.image ? (
                  <img 
                    src={selectedService.image} 
                    alt={selectedService.title}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                ) : null}
                <div className="modal-icon" style={{ display: selectedService.image ? 'none' : 'block' }}>
                  {getCategoryIcon(selectedService.title)}
                </div>
              </div>

              {/* Description */}
              <div className="modal-section">
                <h3>About This Service</h3>
                <p>{selectedService.description || 'Professional event management services for your special occasion.'}</p>
              </div>

              {/* Pricing Information */}
              {selectedService.priceRange && (selectedService.priceRange.min > 0 || selectedService.priceRange.max > 0) && (
                <div className="modal-section">
                  <h3>Pricing Information</h3>
                  <div className="modal-price">
                    {selectedService.priceRange.min > 0 && selectedService.priceRange.max > 0 
                      ? `₹${selectedService.priceRange.min} - ₹${selectedService.priceRange.max}`
                      : selectedService.priceRange.min > 0 
                      ? `Starting from ₹${selectedService.priceRange.min}`
                      : selectedService.priceRange.max > 0 
                      ? `Up to ₹${selectedService.priceRange.max}`
                      : 'Contact for pricing'
                    }
                  </div>
                </div>
              )}

              {/* Event Details */}
              {(selectedService.duration || (selectedService.capacity && (selectedService.capacity.min > 0 || selectedService.capacity.max > 0))) && (
                <div className="modal-section">
                  <h3>Event Details</h3>
                  {selectedService.duration && (
                    <div className="modal-detail-item">
                      <strong>Duration:</strong> {selectedService.duration}
                    </div>
                  )}
                  {selectedService.capacity && (selectedService.capacity.min > 0 || selectedService.capacity.max > 0) && (
                    <div className="modal-detail-item">
                      <strong>Capacity:</strong> 
                      {selectedService.capacity.min > 0 && selectedService.capacity.max > 0 
                        ? `${selectedService.capacity.min} - ${selectedService.capacity.max} guests`
                        : selectedService.capacity.min > 0 
                        ? `Minimum ${selectedService.capacity.min} guests`
                        : selectedService.capacity.max > 0 
                        ? `Maximum ${selectedService.capacity.max} guests`
                        : 'Flexible capacity'
                      }
                    </div>
                  )}
                </div>
              )}

              {/* Features */}
              {selectedService.features && selectedService.features.length > 0 && (
                <div className="modal-section">
                  <h3>Features</h3>
                  <ul className="modal-features">
                    {selectedService.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Included Services */}
              {selectedService.includedServices && selectedService.includedServices.length > 0 && (
                <div className="modal-section">
                  <h3>Included Services</h3>
                  <ul className="modal-services">
                    {selectedService.includedServices.map((service, index) => (
                      <li key={index}>{service}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Additional Information */}
              {selectedService.additionalInfo && (
                <div className="modal-section">
                  <h3>Additional Information</h3>
                  <p>{selectedService.additionalInfo}</p>
                </div>
              )}

              {/* Call to Action */}
              <div className="modal-actions">
                <button className="modal-quote-btn" onClick={() => window.location.href = '/contact'}>
                  Get Quote
                </button>
                <button className="modal-close-btn" onClick={closeModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </>
  );
};

export default Services;
