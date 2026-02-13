// import React from "react";
// import "../css/AdminDecorations.css";

// const decorations = [
//   {
//     id: 1,
//     title: "Princess Birthday Theme",
//     desc: "Complete princess-themed decoration package for birthdays.",
//     price: 299,
//     image: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce",
//   },
//   {
//     id: 2,
//     title: "Superhero Birthday Theme",
//     desc: "Action-packed superhero decorations for exciting birthdays.",
//     price: 279,
//     image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
//   },
//   {
//     id: 3,
//     title: "Classic Wedding Decor",
//     desc: "Elegant classic wedding decoration with floral arrangements.",
//     price: 1499,
//     image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e",
//   },
//   {
//     id: 4,
//     title: "Rustic Wedding Theme",
//     desc: "Charming rustic wedding decor with natural elements.",
//     price: 1299,
//     image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
//   },
//   {
//     id: 5,
//     title: "Gender Reveal Package",
//     desc: "Exciting gender reveal decoration with all accessories.",
//     price: 399,
//     image: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70",
//   },
//   {
//     id: 6,
//     title: "Corporate Gala Decor",
//     desc: "Sophisticated decor for corporate galas and award nights.",
//     price: 2499,
//     image: "https://images.unsplash.com/photo-1515165562835-c4c5b49d3c40",
//   },
// ];

// const AdminDecorations = () => {
//   return (
//     <div>
//       <div className="decor-header">
//         <div>
//           <h2>Manage Decorations</h2>
//           <p className="sub-title">All Decoration Packages</p>
//         </div>

//         <button className="add-btn">+ Add New Package</button>
//       </div>

//       <div className="decor-grid">
//         {decorations.map((item) => (
//           <div className="decor-card" key={item.id}>
//             <img src={item.image} alt={item.title} />

//             <div className="decor-content">
//               <h3>{item.title}</h3>
//               <p>{item.desc}</p>
//               <span className="price">${item.price}</span>

//               <div className="decor-actions">
//                 <button className="btn edit">Edit</button>
//                 <button className="btn delete">Delete</button>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default AdminDecorations;


import React, { useEffect, useState } from "react";
import "../css/AdminDecorations.css";
import { API } from "../services/apiConfig";
import AddPackage from "../component/AddPackage";

const AdminDecorations = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState("");

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
          <h2>Manage Decorations</h2>
          <p className="sub-title">All Decoration Packages</p>
        </div>

        <button
          className="add-btn"
          onClick={() => setShowAddForm(true)}
        >
          + Add New Package
        </button>
      </div>

      {/* ---------- ADD PACKAGE FORM ---------- */}
      {showAddForm && (
        <AddPackage onSuccess={handlePackageAdded} />
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
                <button className="btn edit">Edit</button>
                <button className="btn delete">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDecorations;
