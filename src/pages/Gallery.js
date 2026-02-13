import "../css/Gallery.css";
import Header from "../component/Header";
import Footer from "../component/Footer";

const galleryData = [
     { title: "Birthday Decoration", img: "https://via.placeholder.com/400x300" },
     { title: "Anniversary", img: "https://via.placeholder.com/400x300" },
     { title: "Cartoon Theme", img: "https://via.placeholder.com/400x300" },
     { title: "New Born Baby", img: "https://via.placeholder.com/400x300" },
     { title: "Baby Shower", img: "https://via.placeholder.com/400x300" },
     { title: "Birthday Car Decoration", img: "https://via.placeholder.com/400x300" },
     { title: "Birthday Garland Decoration", img: "https://via.placeholder.com/400x300" },
     { title: "Baby Shower Combo", img: "https://via.placeholder.com/400x300" },
     { title: "Grand Birthday Decoration", img: "https://via.placeholder.com/400x300" },
     { title: "Basic Birthday Decoration", img: "https://via.placeholder.com/400x300" },
     { title: "Office Inauguration", img: "https://via.placeholder.com/400x300" },
     { title: "25th Anniversary Decoration", img: "https://via.placeholder.com/400x300" }
];

const Gallery = () => {
     return (
          <>
               <Header />
               <div className="gallery-page">

                    {/* Banner */}
                    <div className="gallery-banner">
                         <h1>Gallery</h1>
                    </div>

                    {/* Gallery Grid */}
                    <div className="gallery-grid">
                         {galleryData.map((item, index) => (
                              <div className="gallery-card" key={index}>
                                   <img src={item.img} alt={item.title} />
                                   <div className="gallery-title">{item.title}</div>
                              </div>
                         ))}
                    </div>

               </div>
               <Footer />
          </>
     );
};

export default Gallery;
