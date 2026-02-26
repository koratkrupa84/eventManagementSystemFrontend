import React, { useEffect, useState } from "react";
import "../css/AdminPackages.css";
import { API } from "../services/apiConfig";
import AddPackage from "../component/admin/AddPackage";

const AdminPackages = () => {
  const [packages, setPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editPackage, setEditPackage] = useState(null);


  // ---------- FETCH PACKAGES ----------
  const fetchPackages = async () => {
    try {
      const res = await fetch(API.GET_PACKAGES);
      const data = await res.json();

      if (!res.ok) throw new Error("Failed to load packages");

      setPackages(data.data);
      setFilteredPackages(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  useEffect(() => {
    const filtered = packages.filter((pkg) =>
      pkg.package_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.services.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPackages(filtered);
  }, [packages, searchTerm]);

  // ---------- AFTER ADD SUCCESS ----------
  const handlePackageAdded = () => {
    setShowAddForm(false);
    fetchPackages(); // refresh list
  };

  // ---------- VIEW PACKAGE ----------
  const handleView = (pkg) => {
    console.log("Package data:", pkg); // Debug: Log package data
    setSelectedPackage(pkg);
    setShowViewModal(true);
  };

  return (
    <div>
      {/* ---------- HEADER ---------- */}
      <div className="decor-header">
        <div>
          <h2>Manage Decorations Packages</h2>
          <p className="package-sub-title">All Decoration Packages</p>
        </div>

        <div className="header-actions">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search packages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button
            className="add-btn"
            onClick={() => setShowAddForm(true)}
          >
            + Add New Package
          </button>
        </div>
      </div>

      {/* ---------- ADD PACKAGE FORM (POPUP) ---------- */}
      {(showAddForm || editPackage) && (
        <div
          className="add-package-modal-overlay"
          onClick={() => {
            setShowAddForm(false);
            setEditPackage(null);
          }}
        >
          <div
            className="add-package-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <AddPackage
              editData={editPackage}   // 🔥 ye add karna hai
              onSuccess={() => {
                setShowAddForm(false);
                setEditPackage(null);
                fetchPackages();
              }}
              onClose={() => {
                setShowAddForm(false);
                setEditPackage(null);
              }}
            />
          </div>
        </div>
      )}


      {/* ---------- DATA STATE ---------- */}
      {loading && <p>Loading packages...</p>}
      {error && <p className="error-text">{error}</p>}

      {/* ---------- PACKAGE GRID ---------- */}
      <div className="decor-grid">
        {filteredPackages.length === 0 ? (
          <p>{searchTerm ? "No packages found matching your search" : "No packages found"}</p>
        ) : (
          filteredPackages.map((item) => (
          <div className="decor-card" key={item._id}>
            <img
              src={
                item.images && item.images.length > 0
                  ? `http://localhost:5000/${item.images[0]}`
                  : "https://via.placeholder.com/300"
              }
              alt={item.package_name}
            />

            <div className="decor-content">
              <h3>{item.package_name}</h3>
              <p>{item.services}</p>
              <span className="price">₹{item.price}</span>

              <div className="decor-actions">
                <button className="btn view" onClick={() => handleView(item)}>View</button>
                <button className="btn delete">Delete</button>
              </div>
            </div>
          </div>
        ))
        )}
      </div>

      {/* ---------- VIEW PACKAGE MODAL ---------- */}
      {showViewModal && selectedPackage && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-btn" onClick={() => setShowViewModal(false)}>
              ×
            </span>
            <div className="package-details">
              <h3>Package Details</h3>
              
              {selectedPackage.images && selectedPackage.images.length > 0 && (
                <div className="package-images">
                  {selectedPackage.images.map((image, index) => (
                    <img
                      key={index}
                      src={`http://localhost:5000/${image}`}
                      alt={`${selectedPackage.package_name} ${index + 1}`}
                      style={{ 
                        width: "100%", 
                        maxHeight: "200px", 
                        objectFit: "cover", 
                        marginBottom: "15px" 
                      }}
                    />
                  ))}
                </div>
              )}
              
              <div className="package-info">
                <h4>{selectedPackage.package_name}</h4>
                <p><strong>Services:</strong> {selectedPackage.services}</p>
                <p><strong>Price:</strong> ₹{selectedPackage.price}</p>
                <div className="description-section">
                  <strong>Description:</strong>
                  <p className="description-text">
                    {selectedPackage.description 
                      ? selectedPackage.description 
                      : `This ${selectedPackage.package_name} package includes: ${selectedPackage.services}`
                    }
                  </p>
                </div>
              </div>
              
              <div className="modal-actions">
                <button 
                  className="btn update"
                  onClick={() => {
                    setEditPackage(selectedPackage);
                    setShowViewModal(false);
                  }}
                >
                  Edit Package
                </button>
                <button 
                  className="btn cancel"
                  onClick={() => setShowViewModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPackages;
