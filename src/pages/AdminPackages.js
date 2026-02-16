import React, { useEffect, useState } from "react";
import "../css/AdminDecorations.css";
import { API } from "../services/apiConfig";
import AddPackage from "../component/admin/AddPackage";

const AdminPackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState("");
  const [editPackage, setEditPackage] = useState(null);


  // ---------- FETCH PACKAGES ----------
  const fetchPackages = async () => {
    try {
      const res = await fetch(API.GET_PACKAGES);
      const data = await res.json();

      if (!res.ok) throw new Error("Failed to load packages");

      setPackages(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  // ---------- AFTER ADD SUCCESS ----------
  const handlePackageAdded = () => {
    setShowAddForm(false);
    fetchPackages(); // refresh list
  };

  return (
    <div>
      {/* ---------- HEADER ---------- */}
      <div className="decor-header">
        <div>
          <h2>Manage Decorations Packages</h2>
          <p className="sub-title">All Decoration Packages</p>
        </div>

        <button
          className="add-btn"
          onClick={() => setShowAddForm(true)}
        >
          + Add New Package
        </button>
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
        {packages.map((item) => (
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
                <button className="btn edit" onClick={() => setEditPackage(item)}>Edit</button>
                <button className="btn delete">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPackages;
