import React from "react";
import "../css/AdminCategories.css";

const categories = [
  {
    id: 1,
    title: "Birthday Decorations",
    desc: "Make birthdays extra special with our themed decorations.",
    image:
      "https://images.unsplash.com/photo-1527529482837-4698179dc6ce",
  },
  {
    id: 2,
    title: "Wedding Decorations",
    desc: "Elegant and romantic decor for your dream wedding.",
    image:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e",
  },
  {
    id: 3,
    title: "Baby Shower Decorations",
    desc: "Adorable themes for welcoming the new baby.",
    image:
      "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70",
  },
  {
    id: 4,
    title: "Corporate Events",
    desc: "Professional decor for corporate gatherings and meetings.",
    image:
      "https://images.unsplash.com/photo-1515165562835-c4c5b49d3c40",
  },
  {
    id: 5,
    title: "Anniversary Decorations",
    desc: "Celebrate milestones with beautiful anniversary decor.",
    image:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d",
  },
  {
    id: 6,
    title: "Themed Parties",
    desc: "Custom themed parties for any occasion.",
    image:
      "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2",
  },
];

const AdminCategories = () => {
  return (
    <div>
      <div className="category-header">
        <div>
          <h2>Manage Categories</h2>
          <p className="sub-title">All Categories</p>
        </div>

        <button className="add-btn">+ Add New Category</button>
      </div>

      <div className="category-grid">
        {categories.map((cat) => (
          <div className="category-card" key={cat.id}>
            <img src={cat.image} alt={cat.title} />

            <div className="category-content">
              <h3>{cat.title}</h3>
              <p>{cat.desc}</p>

              <div className="category-actions">
                <button className="btn edit">Edit</button>
                <button className="btn delete">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCategories;
