import React, { useState } from "react";
import "../css/AdminAppointments.css";

const initialAppointments = [
  {
    id: 1,
    name: "John Smith",
    event: "Wedding",
    date: "2023-10-15",
    decor: "Classic Wedding Decor",
    status: "Confirmed",
  },
  {
    id: 2,
    name: "Emma Davis",
    event: "Birthday",
    date: "2023-10-10",
    decor: "Princess Birthday Theme",
    status: "Pending",
  },
  {
    id: 3,
    name: "Robert Brown",
    event: "Corporate",
    date: "2023-10-20",
    decor: "Corporate Gala Decor",
    status: "Completed",
  },
  {
    id: 4,
    name: "Lisa Wang",
    event: "Baby Shower",
    date: "2023-10-05",
    decor: "Gender Reveal Package",
    status: "Confirmed",
  },
  {
    id: 5,
    name: "Thomas Lee",
    event: "Anniversary",
    date: "2023-10-25",
    decor: "Custom Design",
    status: "Cancelled",
  },
];

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState(initialAppointments);

  const handleStatusChange = (id, newStatus) => {
    setAppointments(
      appointments.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item
      )
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="appointment-header">
        <div>
          <h2>Manage Appointments</h2>
          <p className="sub-title">All Appointments</p>
        </div>

        <button className="add-btn">+ Add New</button>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="appointment-table">
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
                <td>{item.name}</td>
                <td>{item.event}</td>
                <td>{item.date}</td>
                <td>{item.decor}</td>

                <td>
                  <select
                    value={item.status}
                    onChange={(e) =>
                      handleStatusChange(item.id, e.target.value)
                    }
                    className="status-select"
                  >
                    <option>Pending</option>
                    <option>Confirmed</option>
                    <option>Completed</option>
                    <option>Cancelled</option>
                  </select>
                </td>

                <td className="action-btns">
                  <button className="edit-btn">Edit</button>
                  <button className="delete-btn">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAppointments;
