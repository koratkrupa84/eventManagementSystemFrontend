import React, { useState, useEffect } from "react";
import { API } from "../../services/apiConfig.js";
import "./AddPackage.css";

function AddPackage({ onSuccess = () => { }, onClose = () => { }, editData = null }) {

     const [form, setForm] = useState({
          package_name: "",
          price: "",
          services: "",
     });

     const [loading, setLoading] = useState(false);
     const [message, setMessage] = useState("");
     const [error, setError] = useState("");
     const [images, setImages] = useState([]);
     const [removedImages, setRemovedImages] = useState([]);


     // -------- USE EFFECT FOR EDIT DATA --------
     useEffect(() => {
          if (editData) {
               console.log("Edit data:", editData);
               setForm({
                    package_name: editData.package_name || "",
                    price: editData.price || "",
                    services: editData.services || "",
               });
          }
     }, [editData]);

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


     const handleRemoveExistingImage = (imgPath) => {
          setRemovedImages((prev) => [...prev, imgPath]);
     };


     // -------- SUBMIT FORM --------
     const handleSubmit = async (e) => {
          e.preventDefault();
          setError("");
          setMessage("");

          if (!form.package_name || !form.price || !form.services) {
               setError("Package name, price, and services are required");
               return;
          }

          try {
               setLoading(true);

               const token = localStorage.getItem("token");

               const formData = new FormData();
               formData.append("package_name", form.package_name);
               formData.append("price", form.price);
               formData.append("services", form.services);
               
               // Debug: Log form data
               console.log("Form data being submitted:", {
                    package_name: form.package_name,
                    price: form.price,
                    services: form.services
               });

               // 🔥 NEW IMAGES
               images.forEach((img) => {
                    formData.append("images", img);
               });

               // 🔥 REMOVED IMAGES (IMPORTANT)
               if (removedImages.length > 0) {
                    formData.append("removedImages", JSON.stringify(removedImages));
               }

               let res;

               if (editData) {
                    console.log("UPDATE URL:", `${API.UPDATE_PACKAGE}/${editData._id}`);
                    res = await fetch(`${API.UPDATE_PACKAGE}/${editData._id}`, {
                         method: "PUT",
                         headers: {
                              Authorization: `Bearer ${token}`
                         },
                         body: formData
                    });
               } else {
                    res = await fetch(API.ADD_PACKAGE, {
                         method: "POST",
                         headers: {
                              Authorization: `Bearer ${token}`
                         },
                         body: formData
                    });
               }

               const data = await res.json();
               if (!res.ok) throw new Error(data.message || "Failed");
           
               setMessage(editData
                    ? "✅ Package updated successfully"
                    : "✅ Package added successfully"
               );

               // 🔥 RESET ALL STATES
               setForm({
                    package_name: "",
                    price: "",
                    services: ""
               });
               setImages([]);
               setRemovedImages([]);   // 👈 ye bhi reset karo

               onSuccess();

          } catch (err) {
               setError(err.message);
          } finally {
               setLoading(false);
          }
     };

     
     return (
          <div className="add-package-wrapper">
               <div className="add-package-card">
                    <button
                         type="button"
                         className="add-package-back-btn"
                         onClick={onClose}
                         aria-label="Back"
                    >
                         ←
                    </button>
                    <h2>{editData ? "Edit Package" : "Add Package"}</h2>

                    {error && <p className="error-text">{error}</p>}
                    {message && <p className="success-text">{message}</p>}

                    <form onSubmit={handleSubmit}>
                         <div className="package-form-group">
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

                         <div className="package-form-group">
                              <label htmlFor="packagePrice">Price</label>
                              <input
                                   id="packagePrice"
                                   type="number"
                                   value={form.price}
                                   onChange={handleChange}
                                   placeholder="Enter price"
                              />
                         </div>

                         <div className="package-form-group">
                              <label htmlFor="packageServices">Services</label>
                              <textarea
                                   id="packageServices"
                                   value={form.services}
                                   onChange={handleChange}
                                   placeholder="Enter services"
                              />
                         </div>

                         <div className="package-form-group">
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

                              {editData && editData.images && editData.images.length > 0 && (
                                   <>
                                        <h4>Existing Images</h4>
                                        <div className="preview-grid">
                                             {editData.images
                                                  .filter((img) => !removedImages.includes(img))
                                                  .map((img, index) => (
                                                       <div key={index} className="image-wrapper">
                                                            <img
                                                                 src={`http://localhost:5000/${img}`}
                                                                 alt="existing"
                                                                 className="preview-img"
                                                            />
                                                            <button
                                                                 type="button"
                                                                 className="remove-btn"
                                                                 onClick={() => handleRemoveExistingImage(img)}
                                                            >
                                                                 ❌
                                                            </button>
                                                       </div>
                                                  ))}
                                        </div>
                                   </>
                              )}

                         </div>

                         <button type="submit" className="primary-btn">
                              {loading
                                   ? (editData ? "Updating..." : "Adding...")
                                   : (editData ? "Update Package" : "Add Package")
                              }
                         </button>
                    </form>
               </div >
          </div >
     );
}

export default AddPackage;
