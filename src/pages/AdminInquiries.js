import React, { useState } from "react";
import "../css/AdminInquiries.css";

const initialInquiries = [
  {
    id: 1,
    name: "Jennifer Lee",
    email: "jennifer@email.com",
    subject: "Wedding Decoration Quote",
    date: "2023-10-01",
    status: "Pending",
  },
  {
    id: 2,
    name: "Mark Taylor",
    email: "mark@email.com",
    subject: "Corporate Event Inquiry",
    date: "2023-09-28",
    status: "Replied",
  },
];

const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState(initialInquiries);

  const handleDelete = (id) => {
    setInquiries(inquiries.filter((item) => item.id !== id));
  };

  return (
    <div>
      {/* Header */}
      <div className="inquiry-header">
        <div>
          <h2>Manage Inquiries</h2>
          <p className="sub-title">Contact Form Submissions</p>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="inquiry-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Subject</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {inquiries.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.email}</td>
                <td>{item.subject}</td>
                <td>{item.date}</td>

                <td>
                  <span
                    className={`status-badge ${
                      item.status === "Pending"
                        ? "pending"
                        : "replied"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>

                <td className="action-btns">
                  <button className="view-btn">View</button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(item.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminInquiries;
