import React, { useState, useEffect } from "react";
import "../css/AdminDashboard.css";
import "../css/AdminCommon.css";
import { API } from "../services/apiConfig";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalAppointments: 0,
    totalPackages: 0,
    totalCategories: 0,
    totalReviews: 0,
    totalOrganizers: 0,
    activeOrganizers: 0
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API.DASHBOARD_STATS, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to load dashboard data");

      setStats(data.data.stats);
      setRecentAppointments(data.data.recentAppointments);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div>
      <h2 className="dashboard-title">Admin Dashboard</h2>

      {error && <div className="error-text">{error}</div>}

      {/* 🔢 Stats Cards */}
      <div className="stats-grid">
        <StatCard count={stats.totalAppointments} label="Total Appointments" />
        <StatCard count={stats.totalCategories} label="Decoration Categories" />
        <StatCard count={stats.totalPackages} label="Decoration Packages" />
        <StatCard count={stats.totalReviews} label="Customer Testimonials" />
        <StatCard count={stats.totalOrganizers} label="Total Organizers" />
        <StatCard count={stats.activeOrganizers} label="Active Organizers" />
      </div>

      {/* 📋 Recent Appointments */}
      <h3 className="section-title">Recent Appointments</h3>

      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Client Name</th>
              <th>Event Type</th>
              <th>Date</th>
              <th>Decoration</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {recentAppointments.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  No appointments found
                </td>
              </tr>
            ) : (
              recentAppointments.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.client}</td>
                  <td>{item.event}</td>
                  <td>{formatDate(item.date)}</td>
                  <td>{item.decoration}</td>
                  <td>
                    <span className={`status ${item.status}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const StatCard = ({ count, label }) => (
  <div className="stat-card">
    <h3>{count}</h3>
    <p>{label}</p>
  </div>
);
export default AdminDashboard;
