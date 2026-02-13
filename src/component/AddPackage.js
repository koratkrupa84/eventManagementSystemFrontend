import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../services/apiConfig";
import "./AddPackage.css";

function AddPackage({ onSuccess = () => { } }) {
     const navigate = useNavigate();

     const [form, setForm] = useState({
          package_name: "",
          price: "",
          services: "",
     });

     const [loading, setLoading] = useState(false);
     const [message, setMessage] = useState("");
     const [error, setError] = useState("");
     const [images, setImages] = useState([]);

     // -------- HANDLE INPUT CHANGE --------
     const handleChange = (e) => {
          const { id, value } = e.target;

          if (id === "packageName") {
               setForm((prev) => ({ ...prev, package_name: value }));
          }
          if (id === "packagePrice") {
               setForm((prev) => ({ ...prev, price: value }));
          }
          if (id === "packageServices") {
               setForm((prev) => ({ ...prev, services: value }));
          }

     };

     // -------- SUBMIT FORM --------
     const handleSubmit = async (e) => {
          e.preventDefault();
          setError("");
          setMessage("");

          if (!form.package_name || !form.price || !form.services) {
               setError("All fields are required");
               return;
          }

          try {
               setLoading(true);

               const token = localStorage.getItem("authToken");

               const formData = new FormData();
               formData.append("package_name", form.package_name);
               formData.append("price", form.price);
               formData.append("services", form.services);

               images.forEach((img) => {
                    formData.append("images", img); // 👈 multer field name
               });

               const res = await fetch(API.ADD_PACKAGE, {
                    method: "POST",
                    headers: {
                         Authorization: `Bearer ${token}` // ❌ Content-Type mat do
                    },
                    body: formData
               });

               const data = await res.json();
               if (!res.ok) throw new Error(data.message || "Failed to add package");

               setMessage("✅ Package added successfully");

               setForm({
                    package_name: "",
                    price: "",
                    services: ""
               });
               setImages([]);

               navigate("/admin/decorations");
               onSuccess();
          } catch (err) {
               setError(err.message || "Only admin can add package");
          } finally {
               setLoading(false);
          }
     };


     return (
          <div className="add-package-wrapper">
               <div className="add-package-card">
                    <h2>Add Package</h2>

                    {error && <p className="error-text">{error}</p>}
                    {message && <p className="success-text">{message}</p>}

                    <form onSubmit={handleSubmit}>
                         <div className="form-group">
                              <label htmlFor="packageName">Package Name</label>
                              <select
                                   id="packageName"
                                   value={form.package_name}
                                   onChange={handleChange}
                              >
                                   <option value="">Select Package</option>
                                   <option value="Silver">Silver</option>
                                   <option value="Gold">Gold</option>
                                   <option value="Platinum">Platinum</option>
                              </select>
                         </div>

                         <div className="form-group">
                              <label htmlFor="packagePrice">Price</label>
                              <input
                                   id="packagePrice"
                                   type="number"
                                   value={form.price}
                                   onChange={handleChange}
                                   placeholder="Enter price"
                              />
                         </div>

                         <div className="form-group">
                              <label htmlFor="packageServices">Services</label>
                              <textarea
                                   id="packageServices"
                                   value={form.services}
                                   onChange={handleChange}
                                   placeholder="Enter services"
                              />
                         </div>

                         <div className="form-group">
                              <label>Package Images</label>
                              <input
                                   type="file"
                                   multiple
                                   accept="image/*"
                                   onChange={(e) => setImages(Array.from(e.target.files))}
                              />
                         </div>

               <div className="preview-grid">
                    {images.map((img, index) => (
                         <img
                              key={index}
                              src={URL.createObjectURL(img)}
                              alt="preview"
                              className="preview-img"
                         />
                    ))}
               </div>

               <button type="submit" className="primary-btn">
                    {loading ? "Adding..." : "Add Package"}
               </button>
          </form>
               </div >
          </div >
     );
}

export default AddPackage;
