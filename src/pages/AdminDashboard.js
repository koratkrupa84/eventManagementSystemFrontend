import React from "react";
import "../css/AdminDashboard.css";

const AdminDashboard = () => {
  return (
    <div>
      <h2 className="dashboard-title">Admin Dashboard</h2>

      {/* 🔢 Stats Cards */}
      <div className="stats-grid">
        <StatCard count="5" label="Total Appointments" />
        <StatCard count="6" label="Decoration Categories" />
        <StatCard count="6" label="Decoration Packages" />
        <StatCard count="4" label="Customer Testimonials" />
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
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {appointments.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.client}</td>
                <td>{item.event}</td>
                <td>{item.date}</td>
                <td>{item.decoration}</td>
                <td>
                  <span className={`status ${item.status}`}>
                    {item.status}
                  </span>
                </td>
                <td>
                  <button className="btn edit">Edit</button>
                  <button className="btn delete">Delete</button>
                </td>
              </tr>
            ))}
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

const appointments = [
  {
    id: 1,
    client: "John Smith",
    event: "Wedding",
    date: "2023-10-15",
    decoration: "Classic Wedding Decor",
    status: "confirmed",
  },
  {
    id: 2,
    client: "Emma Davis",
    event: "Birthday",
    date: "2023-10-10",
    decoration: "Princess Birthday Theme",
    status: "pending",
  },
  {
    id: 3,
    client: "Robert Brown",
    event: "Corporate",
    date: "2023-10-20",
    decoration: "Corporate Gala Decor",
    status: "completed",
  },
  {
    id: 4,
    client: "Lisa Wang",
    event: "Baby Shower",
    date: "2023-10-05",
    decoration: "Gender Reveal Package",
    status: "confirmed",
  },
  {
    id: 5,
    client: "Thomas Lee",
    event: "Anniversary",
    date: "2023-10-25",
    decoration: "Custom Design",
    status: "cancelled",
  },
];

export default AdminDashboard;
