import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
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
import "../../css/variables.css";

function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(() => {
    // Get initial menu state from localStorage or default to "management"
    const savedState = localStorage.getItem('adminSidebarMenuState');
    return savedState || "management";
  });

  // Save menu state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('adminSidebarMenuState', openMenu);
  }, [openMenu]);

  // Auto-expand menu based on current URL
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Auto-expand the menu section that contains the current page
    if (currentPath.includes('/admin/categories') || currentPath.includes('/admin/packages') || 
        currentPath.includes('/admin/gallery') || currentPath.includes('/admin/blogs')) {
      setOpenMenu("management");
    } else if (currentPath.includes('/admin/clients') || currentPath.includes('/admin/organizers')) {
      setOpenMenu("users");
    } else if (currentPath.includes('/admin/appointments') || currentPath.includes('/admin/private-events') || 
              currentPath.includes('/admin/inquiries')) {
      setOpenMenu("bookings");
    } else if (currentPath.includes('/admin/review')) {
      setOpenMenu("feedback");
    }
  }, [location.pathname]);

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