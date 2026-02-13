import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./AdminSidebar.css";

function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <span className="crown">👑</span>
        <h2>Admin Panel</h2>
      </div>

      <nav className="sidebar-menu">
        <NavLink to="/admin/dashboard" className="menu-item">
          📊 <span>Dashboard</span>
        </NavLink>

        <NavLink to="/admin/categories" className="menu-item">
          🗂 <span>Manage Categories</span>
        </NavLink>

        <NavLink to="/admin/decorations" className="menu-item">
          🎨 <span>Manage Decorations</span>
        </NavLink>

        <NavLink to="/admin/gallery" className="menu-item">
          🖼 <span>Manage Gallery</span>
        </NavLink>

        <NavLink to="/admin/testimonials" className="menu-item">
          💬 <span>Manage Testimonials</span>
        </NavLink>

        <NavLink to="/admin/appointments" className="menu-item">
          📅 <span>Manage Appointments</span>
        </NavLink>

        <NavLink to="/admin/inquiries" className="menu-item">
          ❓ <span>Manage Inquiries</span>
        </NavLink>
      </nav>

      <button className="logout-btn" onClick={handleLogout}>
        🚪 Logout
      </button>
    </aside>
  );
}

export default AdminSidebar;
