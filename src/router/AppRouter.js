import { BrowserRouter, Routes, Route } from "react-router-dom";
// User routes
import Home from "../pages/Home";
import LoginPage from "../pages/LoginPage";
import RegistrationPage from "../pages/RegistrationPage";
import BookPrivateEventAppointment from "../pages/BookPrivateEventAppointment";
import Gallery from "../pages/Gallery";
import Contact from "../pages/Contact";
import Reviews from "../pages/Review";

// Admin routes
import AdminLogin from "../pages/AdminLogin";
import AdminLayout from "../component/admin/AdminLayout";
import AdminDashboard from "../pages/AdminDashboard";
import AdminCategories from "../pages/AdminCategories";
import AdminPackages from "../pages/AdminPackages";
import AdminGallery from "../pages/AdminGallery";
import AdminReview from "../pages/AdminReview";
import AdminAppointments from "../pages/AdminAppointments";
import AdminInquiries from "../pages/AdminInquiries";
import AdminPrivateEvents from "../pages/AdminPrivateEvents";
import AdminClients from "../pages/AdminClients";
import AdminOrganizers from "../pages/AdminOrganizers";
import ClientDashboard from "../pages/ClientDashboard";

// Organizer routes
import OrganizerLogin from "../pages/OrganizerLogin";
import OrganizerRegister from "../pages/OrganizerRegister";
import OrganizerProfile from "../pages/OrganizerProfile";
import OrganizerDashboard from "../pages/OrganizerDashboard";

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
                    <Route path="/reviews" element={<Reviews />} />

                    // Admin route
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin" element={<AdminLayout />}>
                         <Route path="dashboard" element={<AdminDashboard />} />
                         <Route path="categories" element={<AdminCategories />} />
                         <Route path="packages" element={<AdminPackages />} />
                         <Route path="gallery" element={<AdminGallery />} />
                         <Route path="review" element={<AdminReview />} />
                         <Route path="appointments" element={<AdminAppointments />} />
                         <Route path="private-events" element={<AdminPrivateEvents />} />
                         <Route path="inquiries" element={<AdminInquiries />} />
                         <Route path="clients" element={<AdminClients />} />
                         <Route path="organizers" element={<AdminOrganizers />} />
                    </Route>
                    
                    // Client route
                    <Route path="/client/dashboard" element={<ClientDashboard />} />
                    
                    // Organizer routes
                    <Route path="/organizer/login" element={<OrganizerLogin />} />
                    <Route path="/organizer/register" element={<OrganizerRegister />} />
                    <Route path="/organizer/profile" element={<OrganizerProfile />} />
                    <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
               </Routes>
          </BrowserRouter>
     );
};

export default AppRouter;
