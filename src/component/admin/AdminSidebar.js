import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./AdminSidebar.css";

function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/admin/login");
  };

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <h2>Admin Panel</h2>
      </div>

      <nav className="sidebar-menu">
        <NavLink to="/admin/dashboard" className="menu-item">
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/admin/categories" className="menu-item">
          <span>Manage Categories</span>
        </NavLink>

        <NavLink to="/admin/packages" className="menu-item">
          <span>Manage Packages</span>
        </NavLink>

        <NavLink to="/admin/gallery" className="menu-item">
          <span>Manage Gallery</span>
        </NavLink>

        <NavLink to="/admin/review" className="menu-item">
          <span>Manage Review</span>
        </NavLink>

        <NavLink to="/admin/appointments" className="menu-item">
          <span>Manage Appointments</span>
        </NavLink>

        <NavLink to="/admin/clients" className="menu-item">
          <span>Manage Clients</span>
        </NavLink>

        <NavLink to="/admin/organizers" className="menu-item">
          <span>Manage Organizers</span>
        </NavLink>

        <NavLink to="/admin/private-events" className="menu-item">
          <span>Private Events</span>
        </NavLink>

        <NavLink to="/admin/inquiries" className="menu-item">
          <span>Manage Inquiries</span>
        </NavLink>
      </nav>

      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </aside>
  );
}

export default AdminSidebar;
