import React from "react";
import "../css/AdminTestimonials.css";

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    date: "2023-08-15",
    rating: 5,
    message:
      "EventDecor Pro transformed my daughter's birthday into a magical princess party. The attention to detail was incredible!",
  },
  {
    id: 2,
    name: "Michael Chen",
    date: "2023-07-22",
    rating: 5,
    message:
      "Our wedding decorations were absolutely stunning. The team was professional and delivered beyond our expectations.",
  },
  {
    id: 3,
    name: "Priya Patel",
    date: "2023-09-05",
    rating: 4,
    message:
      "The baby shower decorations were adorable and exactly what we wanted. Highly recommended for any event!",
  },
  {
    id: 4,
    name: "David Wilson",
    date: "2023-08-30",
    rating: 5,
    message:
      "Corporate event decoration was top-notch. Our clients were impressed with the setup and theme execution.",
  },
];

const AdminTestimonials = () => {
  return (
    <div>
      {/* Header */}
      <div className="testimonial-header">
        <div>
          <h2>Manage Testimonials</h2>
          <p className="sub-title">All Testimonials</p>
        </div>

        <button className="add-btn">+ Add New Testimonial</button>
      </div>

      {/* Testimonials Grid */}
      <div className="testimonial-grid">
        {testimonials.map((item) => (
          <div className="testimonial-card" key={item.id}>
            <div className="rating">
              {"★".repeat(item.rating)}
            </div>

            <p className="message">"{item.message}"</p>

            <p className="name">- {item.name}</p>
            <p className="date">{item.date}</p>

            <div className="actions">
              <button className="edit-btn">Edit</button>
              <button className="delete-btn">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminTestimonials;
