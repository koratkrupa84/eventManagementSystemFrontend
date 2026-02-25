import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaFolder,
  FaUsers,
  FaCalendar,
  FaStar,
  FaSignOutAlt,
  FaBox,
  FaImages,
  FaNewspaper
} from "react-icons/fa";
import "./AdminSidebar.css";

function AdminSidebar() {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState("blogs");

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? "" : menu);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/admin/login");
  };

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <h2>Admin Panel</h2>
        <p>Event Management</p>
      </div>

      <nav className="sidebar-menu">
        {/* Dashboard */}
        <NavLink to="/admin/dashboard" className="menu-item">
          <FaTachometerAlt className="icon" />
          Dashboard
        </NavLink>

        {/* MANAGEMENT */}
        <div className="menu">
          <div className="section" onClick={() => toggleMenu("management")}>
            <span>— MANAGEMENT</span>
          </div>

          {openMenu === "management" && (
            <div className="submenu">
              <NavLink to="/admin/categories" className="menu-item">
                <FaFolder className="icon" />
                Manage Categories
              </NavLink>

              <NavLink to="/admin/packages" className="menu-item">
                <FaBox className="icon" />
                Manage Packages
              </NavLink>

              <NavLink to="/admin/gallery" className="menu-item">
                <FaImages className="icon" />
                Manage Gallery
              </NavLink>

              <NavLink to="/admin/blogs" className="menu-item">
                <FaNewspaper className="icon" />
                Manage Blogs
              </NavLink>
            </div>
          )}
        </div>


        {/* USERS */}
        <div className="menu">
          <div className="section" onClick={() => toggleMenu("users")}>
            <span>— USERS</span>
          </div>

          {openMenu === "users" && (
            <div className="submenu">
              <NavLink to="/admin/clients" className="menu-item">
                <FaUsers className="icon" />
                Manage Clients
              </NavLink>

              <NavLink to="/admin/organizers" className="menu-item">
                <FaUsers className="icon" />
                Manage Organizers
              </NavLink>
            </div>
          )}
        </div>

        {/* BOOKINGS */}
        <div className="menu">
          <div className="section" onClick={() => toggleMenu("bookings")}>
            <span>— BOOKINGS</span>
          </div>

          {openMenu === "bookings" && (
            <div className="submenu">
              <NavLink to="/admin/appointments" className="menu-item">
                <FaCalendar className="icon" />
                Manage Appointments
              </NavLink>

              <NavLink to="/admin/private-events" className="menu-item">
                <FaCalendar className="icon" />
                Private Events
              </NavLink>

              <NavLink to="/admin/inquiries" className="menu-item">
                <FaCalendar className="icon" />
                Manage Inquiries
              </NavLink>
            </div>
          )}
        </div>

        {/* FEEDBACK */}
        <div className="menu">
          <div className="section" onClick={() => toggleMenu("feedback")}>
            <span>— FEEDBACK</span>
          </div>

          {openMenu === "feedback" && (
            <div className="submenu">
              <NavLink to="/admin/review" className="menu-item">
                <FaStar className="icon" />
                Manage Review
              </NavLink>
            </div>
          )}
        </div>
      </nav>

      <button className="logout-btn" onClick={handleLogout}>
        <FaSignOutAlt /> Logout
      </button>
    </aside>
  );
}

export default AdminSidebar;