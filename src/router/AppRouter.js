import { BrowserRouter, Routes, Route } from "react-router-dom";
// User routes
import Home from "../pages/Home";
import LoginPage from "../pages/LoginPage";
import RegistrationPage from "../pages/RegistrationPage";
import BookPrivateEventAppointment from "../pages/BookPrivateEventAppointment";
import Gallery from "../pages/Gallery";
import Contact from "../pages/Contact";
import Testimonials from "../pages/Testimonials";

// Admin routes
import AdminLogin from "../pages/AdminLogin";
import AdminLayout from "../component/AdminLayout";
import AdminDashboard from "../pages/AdminDashboard";
import AdminCategories from "../pages/AdminCategories";
import AdminDecorations from "../pages/AdminDecorations";
import AdminGallery from "../pages/AdminGallery";
import AdminTestimonials from "../pages/AdminTestimonials";
import AdminAppointments from "../pages/AdminAppointments";
import AdminInquiries from "../pages/AdminInquiries";

const AppRouter = () => {
     return (
          <BrowserRouter>
               <Routes>
                    // User routes
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegistrationPage />} />
                    <Route path="/book-private-event" element={<BookPrivateEventAppointment />} />
                    <Route path="/gallery" element={<Gallery />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/testimonials" element={<Testimonials />} />

                    // Admin route
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin" element={<AdminLayout />}>
                         <Route path="dashboard" element={<AdminDashboard />} />
                         <Route path="categories" element={<AdminCategories />} />
                         <Route path="decorations" element={<AdminDecorations />} />
                         <Route path="gallery" element={<AdminGallery />} />
                         <Route path="testimonials" element={<AdminTestimonials />} />
                         <Route path="appointments" element={<AdminAppointments />} />
                         <Route path="inquiries" element={<AdminInquiries />} />
                    </Route>
               </Routes>
          </BrowserRouter>
     );
};

export default AppRouter;
