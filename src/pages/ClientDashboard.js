import React, { useState, useEffect } from "react";
import "../css/ClientDashboard.css";
import Header from "../component/Header";
import Footer from "../component/Footer";
import { API } from "../services/apiConfig";

const ClientDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userData, setUserData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [publicEvents, setPublicEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [, setShowAppointmentForm] = useState(false);
  const [showAppointmentViewModal, setShowAppointmentViewModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showPublicEventModal, setShowPublicEventModal] = useState(false);
  const [selectedPublicEvent, setSelectedPublicEvent] = useState(null);
  const [formData, setFormData] = useState({
    event_type: "",
    event_date: "",
    location: "",
    guests: "",
    budget: "",
    special_requirements: ""
  });

  const handleViewAppointment = (appointment) => {
    console.log("=== VIEW APPOINTMENT DEBUG ===");
    console.log("Selected appointment:", appointment);
    console.log("Appointment status:", appointment.status);
    console.log("Has organizer:", !!appointment.organizer);
    console.log("Organizer data:", appointment.organizer);
    setSelectedAppointment(appointment);
    setShowAppointmentViewModal(true);
  };

  // ===============================
  // PUBLIC EVENT HANDLERS
  // ===============================
  const handleViewPublicEvent = (event) => {
    setSelectedPublicEvent(event);
    setShowPublicEventModal(true);
  };

  // handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    // Get user ID from token
    let userId = null;
    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      userId = tokenPayload.id;
    } catch (error) {
      console.log("Token decode error:", error);
    }

    if (!userId) {
      alert("User ID not found in token");
      return;
    }

    try {
      const res = await fetch(`${API.UPDATE_CLIENT_PROFILE}/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editData)
      });

      const data = await res.json();
      if (data.success) {
        alert("Profile updated successfully!");
        setUserData({ ...userData, ...editData });
        setIsEditing(false);
      } else {
        alert(data.message || "Update failed");
      }
    } catch (err) {
      console.log("Profile update error:", err);
    }
  };

  // ===============================
  // LOAD DATA (NO PROTECTION)
  // ===============================
  useEffect(() => {
    fetchUserData();
    fetchAppointments();
    fetchPublicEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  // ===============================
  // FETCH USER DATA
  // ===============================
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(API.GET_CLIENT_PROFILE, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      const result = await response.json().catch(() => null);

      if (response.ok && result?.success) {
        setUserData(result.data);
      }
    } catch (error) {
      console.log("User fetch error:", error);
    }
  };

  // ===============================
  // DATA DEBUGGING
  // ===============================
  const debugEventData = (events) => {
    console.log("=== DEBUGGING EVENT DATA ===");
    if (events && events.length > 0) {
      events.forEach((event, index) => {
        console.log(`Event ${index + 1}:`, {
          id: event._id,
          event_type: event.event_type,
          event_date: event.event_date,
          event_date_type: typeof event.event_date,
          location: event.location,
          title: event.title,
          status: event.status,
          price: event.price,
          organizer: event.organizer ? 'Yes' : 'No',
          createdAt: event.createdAt,
          createdAt_type: typeof event.createdAt,
          // Check if this is registration data with event_id
          event_id: event.event_id ? 'Yes' : 'No',
          registration_date: event.registration_date,
          user_id: event.user_id
        });

        // If this is registration data, debug the populated event
        if (event.event_id) {
          console.log(`  - Event data for registration ${index + 1}:`, {
            event_title: event.event_id?.title,
            event_location: event.event_id?.location,
            event_price: event.event_id?.price,
            event_date: event.event_id?.event_date
          });
        }
      });
    } else {
      console.log("No events to debug");
    }
    console.log("=== END DEBUGGING ===");
  };

  // ===============================
  // API CONNECTION TEST
  // ===============================
  const testAPIConnection = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("Testing API connection...");

      // Test basic connection to backend
      const testResponse = await fetch(`${API.BASE_URL}/`, {
        method: 'GET',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      console.log("Basic API test status:", testResponse.status);

      // Test registrations endpoint specifically
      const regTestResponse = await fetch(`${API.BASE_URL}/registrations`, {
        method: 'GET',
        headers: token ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        } : {}
      });

      console.log("Registrations API test status:", regTestResponse.status);
      const regTestResult = await regTestResponse.json().catch(() => null);
      console.log("Registrations API test result:", regTestResult);

    } catch (error) {
      console.log("API connection test failed:", error);
    }
  };

  // Call test function on component mount
  useEffect(() => {
    testAPIConnection();
  }, []);

  // ===============================
  // FETCH PUBLIC EVENTS (CLIENT'S BOOKINGS)
  // ===============================
  const fetchPublicEvents = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.log("No token found, user not logged in");
        setPublicEvents([]);
        return;
      }

      console.log("Fetching public events with token:", token.substring(0, 20) + "...");

      // Try the main endpoint first
      const mainEndpoint = API.GET_MY_REGISTRATIONS;
      console.log(`Trying main endpoint: ${mainEndpoint}`);

      try {
        const response = await fetch(mainEndpoint, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });

        console.log(`Response status: ${response.status}`);
        console.log(`Response ok: ${response.ok}`);

        const result = await response.json();
        console.log("API response:", result);

        if (response.ok && result?.success) {
          const data = result.data || [];
          console.log(`Success! Fetched ${data.length} registrations`);

          // Debug the data structure
          if (data.length > 0) {
            console.log("Sample registration data:", data[0]);
            console.log("Registration data keys:", Object.keys(data[0]));

            // Check if event_id is populated
            if (data[0].event_id) {
              console.log("Event data found:", data[0].event_id);
              console.log("Event data keys:", Object.keys(data[0].event_id));
            }
          }

          debugEventData(data);
          setPublicEvents(data);
          return;
        } else {
          console.log(`API failed: ${result?.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.log(`Error with main endpoint:`, error.message);
      }

      // If main endpoint fails, try alternative endpoints
      const alternativeEndpoints = [
        `${API.BASE_URL}/registrations/user`,
        `${API.BASE_URL}/registrations/user/my-registrations`,
        `${API.BASE_URL}/my-registrations`
      ];

      for (const endpoint of alternativeEndpoints) {
        try {
          console.log(`Trying alternative endpoint: ${endpoint}`);

          const response = await fetch(endpoint, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            }
          });

          const result = await response.json();
          console.log(`Response from ${endpoint}:`, result);

          if (response.ok && result?.success) {
            const data = result.data || [];
            console.log(`Success with ${endpoint}: ${data.length} items`);
            debugEventData(data);
            setPublicEvents(data);
            return;
          }
        } catch (error) {
          console.log(`Error with ${endpoint}:`, error.message);
        }
      }

      // If all endpoints fail, use mock data for testing
      console.log("All endpoints failed, using mock data for testing");
      const mockData = [
        {
          _id: "mock1",
          event_type: "Birthday Party",
          event_date: "2024-05-15T00:00:00.000Z",
          location: "Community Hall, Delhi",
          max_attendees: 50,
          price: 500,
          title: "Summer Birthday Celebration",
          description: "Join us for a fun-filled birthday party with games, music, and delicious food!",
          status: "confirmed",
          paymentStatus: "paid",
          organizer: {
            name: "John Doe",
            email: "john@example.com",
            phone: "+91 9876543210",
            company: "Party Planners Inc",
            specialization: "Birthday Events"
          },
          createdAt: "2024-04-01T10:00:00.000Z",
          updatedAt: "2024-04-01T10:00:00.000Z"
        },
        {
          _id: "mock2",
          event_type: "Corporate Event",
          event_date: "2024-06-20T00:00:00.000Z",
          location: "Business Center, Mumbai",
          max_attendees: 100,
          price: 1000,
          title: "Annual Corporate Meet",
          description: "Professional networking event with industry leaders and experts.",
          status: "pending",
          paymentStatus: "pending",
          organizer: {
            name: "Jane Smith",
            email: "jane@example.com",
            phone: "+91 9876543211",
            company: "Corporate Events Ltd",
            specialization: "Corporate Events"
          },
          createdAt: "2024-04-05T14:30:00.000Z",
          updatedAt: "2024-04-05T14:30:00.000Z"
        }
      ];

      debugEventData(mockData);
      setPublicEvents(mockData);
      console.log("Using mock data for UI testing");

    } catch (error) {
      console.error("Error in fetchPublicEvents:", error);
      setPublicEvents([]);
    }
  };

  // ===============================
  // PRINT BOOKING TICKET
  // ===============================
  const handlePrintBooking = (bookingData) => {
    const eventData = bookingData.event_id || bookingData;
    const registrationData = bookingData.event_id ? bookingData : null;

    // Create print content
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Event Booking Ticket</title>
        <style>
          @page {
            margin: 15mm;
            size: A4;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background: white;
            color: #333;
            font-size: 12px;
            line-height: 1.4;
          }
          
          .ticket-container {
            max-width: 100%;
            margin: 0 auto;
            border: 2px solid #7F5539;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(127, 85, 57, 0.15);
            background: white;
          }
          
          .ticket-header {
            background: linear-gradient(135deg, #7F5539, #9C6644);
            color: white;
            text-align: center;
            padding: 20px 15px;
            position: relative;
          }
          
          .ticket-title {
            font-size: 20px;
            font-weight: 800;
            margin: 0 0 5px 0;
            text-transform: uppercase;
            letter-spacing: 1px;
            position: relative;
            z-index: 1;
            color: #7F5539;
          }
          
          .ticket-subtitle {
            font-size: 11px;
            margin: 0;
            opacity: 0.9;
            position: relative;
            z-index: 1;
            color: #7F5539;
          }
          
          .ticket-body {
            padding: 20px;
            background: #f8f9fa;
          }
          
          .section {
            margin-bottom: 20px;
            padding: 15px;
            border-radius: 8px;
            border-left: 3px solid #7F5539;
            background: white;
            box-shadow: 0 1px 4px rgba(127, 85, 57, 0.08);
          }
          
          .event-section {
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
            border-left-color: #7F5539;
          }
          
          .booking-section {
            background: linear-gradient(135deg, #fff5e6, #ffe0b2);
            border-left-color: #7F5539;
          }
          
          .section-title {
            font-size: 14px;
            font-weight: 700;
            margin: 0 0 12px 0;
            color: #7F5539;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .section-title::before {
            content: "";
            width: 6px;
            height: 6px;
            background: #7F5539;
            border-radius: 50%;
          }
          
          .event-title {
            font-size: 16px;
            font-weight: 700;
            color: #7F5539;
            margin: 0 0 12px 0;
            text-align: center;
            padding: 10px;
            background: white;
            border-radius: 6px;
            box-shadow: 0 1px 4px rgba(127, 85, 57, 0.1);
            border: 1px solid rgba(127, 85, 57, 0.1);
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin-bottom: 12px;
          }
          
          .info-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 12px;
            background: white;
            border-radius: 4px;
            box-shadow: 0 1px 2px rgba(127, 85, 57, 0.1);
            border: 1px solid rgba(127, 85, 57, 0.05);
          }
          
          .info-label {
            font-weight: 600;
            color: #7F5539;
            font-size: 11px;
          }
          
          .info-value {
            font-weight: 500;
            color: #333;
            font-size: 11px;
            text-align: right;
          }
          
          .price-info {
            grid-column: 1 / -1;
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 10px;
            margin-top: 12px;
          }
          
          .price-item {
            text-align: center;
            padding: 12px 8px;
            background: linear-gradient(135deg, #fff5e6, #ffe0b2);
            border-radius: 6px;
            box-shadow: 0 1px 4px rgba(127, 85, 57, 0.15);
            border: 1px solid rgba(127, 85, 57, 0.2);
          }
          
          .price-label {
            font-size: 9px;
            color: #7F5539;
            margin-bottom: 4px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            font-weight: 600;
          }
          
          .price-value {
            font-size: 14px;
            font-weight: 700;
            color: #7F5539;
          }
          
          .total-price {
            background: linear-gradient(135deg, #7F5539, #9C6644);
            border: 1px solid #7F5539;
          }
          
          .total-price .price-label {
            color: white;
          }
          
          .total-price .price-value {
            color: white;
            font-size: 16px;
          }
          
          .status-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 12px;
            gap: 10px;
          }
          
          .status-badge {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 9px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            color: white;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          }
          
          .status-confirmed {
            background: linear-gradient(135deg, #4CAF50, #45a049);
          }
          
          .status-pending {
            background: linear-gradient(135deg, #FF9800, #F57C00);
          }
          
          .status-paid {
            background: linear-gradient(135deg, #4CAF50, #45a049);
          }
          
          .status-unpaid {
            background: linear-gradient(135deg, #f44336, #d32f2f);
          }
          
          .ticket-footer {
            text-align: center;
            padding: 15px;
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
            border-top: 2px solid #7F5539;
            font-size: 10px;
            color: #7F5539;
          }
          
          .barcode {
            margin: 15px 0;
            text-align: center;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            letter-spacing: 2px;
            border: 2px dashed #7F5539;
            padding: 10px;
            background: white;
            color: #7F5539;
            font-weight: 600;
          }
          
          @media print {
            body { 
              margin: 0; 
              padding: 0;
              font-size: 10px;
            }
            
            .ticket-container { 
              box-shadow: none;
              margin: 0;
            }
            
            .ticket-header {
              padding: 15px 10px;
            }
            
            .section {
              margin-bottom: 15px;
              padding: 12px;
            }
            
            .price-item {
              padding: 10px 6px;
            }
            
            .price-value {
              font-size: 12px;
            }
            
            .total-price .price-value {
              font-size: 14px;
            }
            
            .barcode {
              margin: 10px 0;
              padding: 8px;
              font-size: 10px;
            }
            
            .ticket-footer {
              padding: 10px;
              font-size: 8px;
            }
          }
        </style>
      </head>
      <body>
        <div class="ticket-container">
          <div class="ticket-header">
            <h1 class="ticket-title">Event Booking Ticket</h1>
            <p class="ticket-subtitle">Please present this ticket at the event venue</p>
          </div>
          
          <div class="ticket-body">
            <div class="section event-section">
              <h2 class="section-title">Event Information</h2>
              <div class="event-title">${eventData.title || eventData.event_type || 'Event Title'}</div>
              
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Date</span>
                  <span class="info-value">${formatDate(eventData.event_date)}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Location</span>
                  <span class="info-value">${eventData.location || 'Location not specified'}</span>
                </div>
              </div>
              
              ${eventData.description ? `
                <div style="padding: 10px; background: white; border-radius: 4px; margin-top: 10px; border: 1px solid rgba(127, 85, 57, 0.1);">
                  <div style="font-weight: 600; margin-bottom: 5px; color: #7F5539; font-size: 11px;">Description</div>
                  <div style="color: #333; line-height: 1.3; font-size: 10px;">${eventData.description}</div>
                </div>
              ` : ''}
            </div>
            
            <div class="section booking-section">
              <h2 class="section-title">Booking Information</h2>
              
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Booking ID</span>
                  <span class="info-value">${bookingData._id}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Booking Date</span>
                  <span class="info-value">${formatDate(bookingData.createdAt)}</span>
                </div>
                ${registrationData?.registration_date ? `
                  <div class="info-item">
                    <span class="info-label">Registration Date</span>
                    <span class="info-value">${formatDate(registrationData.registration_date)}</span>
                  </div>
                ` : ''}
              </div>
              
              <div class="price-info">
                <div class="price-item">
                  <div class="price-label">Price per Person</div>
                  <div class="price-value">Rs. ${eventData.price || 0}</div>
                </div>
                <div class="price-item">
                  <div class="price-label">Total Persons</div>
                  <div class="info-value">${registrationData?.total_persons || 1}</div>
                </div>
                <div class="price-item total-price">
                  <div class="price-label">Total Price</div>
                  <div class="price-value">Rs. ${(eventData.price || 0) * (registrationData?.total_persons || 1)}</div>
                </div>
              </div>
              
              <div class="status-container">
                ${bookingData.status ? `
                  <div class="info-item">
                    <span class="info-label">Status</span>
                    <span class="status-badge status-${bookingData.status}">${bookingData.status}</span>
                  </div>
                ` : ''}
                ${bookingData.paymentStatus ? `
                  <div class="info-item">
                    <span class="info-label">Payment</span>
                    <span class="status-badge status-${bookingData.paymentStatus}">${bookingData.paymentStatus}</span>
                  </div>
                ` : ''}
              </div>
            </div>
            
            <div class="barcode">
              ${bookingData._id}
            </div>
          </div>
          
          <div class="ticket-footer">
            <p><strong>This is an automatically generated booking ticket</strong></p>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Create print window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();

    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };
  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("Token exists:", !!token);

      const response = await fetch(API.GET_CLIENT_APPOINTMENTS, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      const result = await response.json().catch(() => null);
      console.log("API result:", result);

      if (response.ok && result?.success) {
        console.log("Appointments data:", result.data); // Debug log
        setAppointments(result.data || []);
      } else {
        console.log("API response error:", result); // Debug log
        setError(result?.message || "Failed to fetch appointments");
      }
    } catch (error) {
      console.log("Appointment fetch error:", error);
      setError("Failed to fetch appointments");
    } finally {
      setLoading(false);
      console.log("=== FRONTEND FETCH APPOINTMENTS END ===");
    }
  };

  // ===============================
  // FORM FUNCTIONS
  // ===============================
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Login required to book appointment");
      return;
    }

    try {
      const response = await fetch(API.BOOK_PRIVATE_EVENT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        alert("Appointment booked successfully!");
        setShowAppointmentForm(false);
        setFormData({
          event_type: "",
          event_date: "",
          location: "",
          guests: "",
          budget: "",
          special_requirements: ""
        });
        fetchAppointments();
      } else {
        alert(result.message || "Booking failed");
      }
    } catch (error) {
      console.log("Booking error:", error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return "Date not available";
    }

    try {
      // Handle different date formats
      let date;

      // If it's already a Date object
      if (dateString instanceof Date) {
        date = dateString;
      }
      // If it's a string, try to parse it
      else if (typeof dateString === 'string') {
        // Try to create Date object
        date = new Date(dateString);

        // If invalid date, try alternative formats
        if (isNaN(date.getTime())) {
          // Try ISO format
          const isoMatch = dateString.match(/\d{4}-\d{2}-\d{2}/);
          if (isoMatch) {
            date = new Date(isoMatch[0]);
          }
          // Try timestamp
          else if (!isNaN(dateString)) {
            date = new Date(parseInt(dateString));
          }
          // Try other formats
          else {
            // Remove any non-digit characters and try
            const cleanDate = dateString.replace(/[^\d-]/g, '');
            date = new Date(cleanDate);
          }
        }
      } else {
        return "Invalid date format";
      }

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.log("Invalid date detected:", dateString);
        return "Invalid Date";
      }

      // Format the date
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

    } catch (error) {
      console.log("Date formatting error:", error, "for date:", dateString);
      return "Date Error";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "#FFA500";
      case "approved": return "#4CAF50";
      case "rejected": return "#F44336";
      case "completed": return "#5dec88";
      case "confirmed": return "#126d2e";
      default: return "#666";
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="client-dashboard">
          <div className="loading">Loading dashboard...</div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="client-dashboard">
        <div className="dashboard-container">
          {/* Sidebar Navigation */}
          <div className="sidebar">
            <div className="user-profile">
              <div className="avatar">
                {userData?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <h3>{userData?.name || "Guest User"}</h3>
              <p>{userData?.email || "Not Logged In"}</p>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>

            <nav className="sidebar-nav">
              <button
                className={`nav-btn ${activeTab === "dashboard" ? "active" : ""}`}
                onClick={() => setActiveTab("dashboard")}
              >
                <i className="fas fa-tachometer-alt"></i> Dashboard
              </button>
              <button
                className={`nav-btn ${activeTab === "appointments" ? "active" : ""}`}
                onClick={() => setActiveTab("appointments")}
              >
                <i className="fas fa-calendar"></i> My Appointments
              </button>
              <button
                className={`nav-btn ${activeTab === "book" ? "active" : ""}`}
                onClick={() => setActiveTab("book")}
              >
                <i className="fas fa-calendar-plus"></i> Book Event
              </button>
              <button
                className={`nav-btn ${activeTab === "public-events" ? "active" : ""}`}
                onClick={() => setActiveTab("public-events")}
              >
                <i className="fas fa-calendar-alt"></i> Public Events
              </button>
              <button
                className={`nav-btn ${activeTab === "profile" ? "active" : ""}`}
                onClick={() => setActiveTab("profile")}
              >
                <i className="fas fa-user"></i> Profile
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="main-content">
            {activeTab === "dashboard" && (
              <div className="dashboard-content">
                <h2>Welcome back, {userData?.name}!</h2>

                <div className="stats-grid">
                  <div className="statCard">
                    <h3>Total Appointments</h3>
                    <p className="stat-number">{appointments.length}</p>
                  </div>
                  <div className="statCard">
                    <h3>Pending</h3>
                    <p className="stat-number">
                      {appointments.filter(apt => apt.status === "pending").length}
                    </p>
                  </div>
                  <div className="statCard">
                    <h3>Approved</h3>
                    <p className="stat-number">
                      {appointments.filter(apt => apt.status === "approved").length}
                    </p>
                  </div>
                  <div className="statCard">
                    <h3>Completed</h3>
                    <p className="stat-number">
                      {appointments.filter(apt => apt.status === "completed").length}
                    </p>
                  </div>
                </div>

                <div className="recent-appointments">
                  <h3>Recent Appointments</h3>
                  <div className="appointments-table-container">
                    <table className="appointments-table">
                      <thead>
                        <tr>
                          <th>Event Type</th>
                          <th>Date</th>
                          <th>Location</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.slice(0, 3).map((appointment) => (
                          <tr key={appointment._id}>
                            <td>{appointment.event_type}</td>
                            <td>{formatDate(appointment.event_date)}</td>
                            <td>{appointment.location}</td>
                            <td>
                              <span
                                className="status-badge"
                                style={{ backgroundColor: getStatusColor(appointment.status) }}
                              >
                                {appointment.status}
                              </span>
                            </td>
                            <td>
                              <button
                                className="view-btn"
                                onClick={() => handleViewAppointment(appointment)}
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "appointments" && (
              <div className="appointments-content">
                <h2>My Appointments</h2>

                {loading ? (
                  <div className="loading-state">
                    <p>Loading appointments...</p>
                  </div>
                ) : error ? (
                  <div className="error-state">
                    <p>{error}</p>
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="empty-state">
                    <p>No appointments found</p>
                  </div>
                ) : (
                  <div className="appointments-table-container">
                    <table className="appointments-table">
                      <thead>
                        <tr>
                          <th>Event Type</th>
                          <th>Date</th>
                          <th>Location</th>
                          <th>Guests</th>
                          <th>Budget</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.map((appointment) => {
                          return (
                            <tr key={appointment._id}>
                              <td>{appointment.event_type}</td>
                              <td>{formatDate(appointment.event_date)}</td>
                              <td>{appointment.location}</td>
                              <td>{appointment.guests || "N/A"}</td>
                              <td>₹{appointment.budget || "N/A"}</td>
                              <td>
                                <span
                                  className="status-badge"
                                  style={{ backgroundColor: getStatusColor(appointment.status) }}
                                >
                                  {appointment.status}
                                </span>
                              </td>
                              <td>
                                <button
                                  className="view-btn"
                                  onClick={() => handleViewAppointment(appointment)}
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === "book" && (
              <div className="book-content">
                <h2>Book New Event</h2>
                <form className="appointment-form" onSubmit={handleAppointmentSubmit}>
                  <div className="form-group">
                    <label>Event Type *</label>
                    <select
                      name="event_type"
                      value={formData.event_type}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Event Type</option>
                      <option value="Birthday">Birthday Party</option>
                      <option value="Wedding">Wedding</option>
                      <option value="Corporate">Corporate Event</option>
                      <option value="Anniversary">Anniversary</option>
                      <option value="Baby Shower">Baby Shower</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Event Date *</label>
                    <input
                      type="date"
                      name="event_date"
                      value={formData.event_date}
                      onChange={handleInputChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div className="form-group">
                    <label>Location *</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Event location"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Number of Guests</label>
                      <input
                        type="number"
                        name="guests"
                        value={formData.guests}
                        onChange={handleInputChange}
                        placeholder="Expected guests"
                        min="1"
                      />
                    </div>

                    <div className="form-group">
                      <label>Budget (₹)</label>
                      <input
                        type="number"
                        name="budget"
                        value={formData.budget}
                        onChange={handleInputChange}
                        placeholder="Your budget"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Special Requirements</label>
                    <textarea
                      name="special_requirements"
                      value={formData.special_requirements}
                      onChange={handleInputChange}
                      placeholder="Any special requirements or preferences..."
                      rows="4"
                    />
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="submitBtn">
                      Book Appointment
                    </button>
                    <button
                      type="button"
                      className="cancelBtn"
                      onClick={() => setFormData({
                        event_type: "",
                        event_date: "",
                        location: "",
                        guests: "",
                        budget: "",
                        special_requirements: ""
                      })}
                    >
                      Clear Form
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "profile" && (
              <div className="client-profile-content">
                <h2>My Profile</h2>
                <div className="client-profile-card">
                  <div className="client-profile-header">
                    <div className="client-profile-avatar">
                      {userData?.name?.charAt(0).toUpperCase()}
                    </div>
                    <h3>{userData?.name}</h3>
                    <p>{userData?.email}</p>
                    <button
                      className="edit-btn"
                      onClick={() => {
                        setIsEditing(true);
                        setEditData({
                          name: userData?.name || "",
                          phone: userData?.phone || "",
                          address: userData?.address || ""
                        });
                      }}
                    >
                      Edit Profile
                    </button>
                  </div>

                  <div className="client-profile-details">
                    {isEditing ? (
                      <form onSubmit={handleProfileUpdate}>
                        <div className="detailItem">
                          <label>Full Name:</label>
                          <input
                            type="text"
                            name="name"
                            value={editData.name}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="detailItem">
                          <label>Phone:</label>
                          <input
                            type="text"
                            name="phone"
                            value={editData.phone}
                            onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                          />
                        </div>
                        <div className="detailItem">
                          <label>Address:</label>
                          <input
                            type="text"
                            name="address"
                            value={editData.address}
                            onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                          />
                        </div>
                        <div className="form-actions">
                          <button type="submit" className="submitBtn">Save</button>
                          <button type="button" className="cancelBtn" onClick={() => setIsEditing(false)}>Cancel</button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="detailItem">
                          <label>Full Name:</label>
                          <p>{userData?.name}</p>
                        </div>
                        <div className="detailItem">
                          <label>Email:</label>
                          <p>{userData?.email}</p>
                        </div>
                        <div className="detailItem">
                          <label>Phone:</label>
                          <p>{userData?.phone || "Not provided"}</p>
                        </div>
                        <div className="detailItem">
                          <label>Address:</label>
                          <p>{userData?.address || "Not provided"}</p>
                        </div>
                        <div className="detailItem">
                          <label>Member Since:</label>
                          <p>{userData?.createdAt ? formatDate(userData.createdAt) : "N/A"}</p>
                        </div>
                        <div className="detailItem">
                          <label>User ID:</label>
                          <p>{userData?._id || "N/A"}</p>
                        </div>
                        <div className="detailItem">
                          <label>Account Status:</label>
                          <p className="status-active">Active</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "public-events" && (
              <div className="public-events-content">
                <div className="section-header">
                  <h2>My Event Bookings</h2>
                  <button
                    className="refresh-btn"
                    onClick={() => {
                      console.log("Manual refresh triggered");
                      fetchPublicEvents();
                    }}
                    title="Refresh bookings"
                  >
                    <i className="fas fa-sync-alt"></i>
                  </button>
                </div>
                <p className="section-description">
                  View your registered public events and booking details
                </p>

                {publicEvents.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">🎫</div>
                    <h3>No Event Bookings</h3>
                    <p>You haven't booked any public events yet. Browse available events and join them!</p>
                  </div>
                ) : (
                  <div className="public-events-grid">
                    {publicEvents.map((event) => {
                      // Handle both registration data and direct event data
                      const eventData = event.event_id || event;
                      const registrationData = event.event_id ? event : null;

                      return (
                        <div key={event._id} className="public-event-card">
                          <div className="event-header">
                            <div className="event-type-badge">
                              {eventData.event_type || eventData.title || 'Event'}
                            </div>
                            <div className="event-status" style={{
                              backgroundColor: getStatusColor(registrationData?.status || eventData?.status),
                              color: 'white'
                            }}>
                              {registrationData?.status || eventData?.status || 'Unknown'}
                            </div>
                          </div>

                          <div className="event-content">
                            <h3 className="event-title">{eventData.title || eventData.event_type || 'Event Title'}</h3>

                            <div className="event-details">
                              <div className="event-detail-item">
                                <i className="fas fa-calendar"></i>
                                <span>{formatDate(eventData.event_date)}</span>
                              </div>
                              <div className="event-detail-item">
                                <i className="fas fa-map-marker-alt"></i>
                                <span>{eventData.location || 'Location not specified'}</span>
                              </div>
                              <div className="event-detail-item">
                                <i className="fas fa-users"></i>
                                <span>Total Persons: {registrationData?.total_persons || 1}</span>
                              </div>
                              <div className="event-detail-item">
                                <i className="fas fa-rupee-sign"></i>
                                <span>Rs. {(eventData.price || 0) * (registrationData?.total_persons || 1)}</span>
                              </div>
                            </div>

                            {eventData.description && (
                              <div className="event-description">
                                <p>{eventData.description}</p>
                              </div>
                            )}

                            <div className="event-actions">
                              <div className="booking-info">
                                <span className="booking-id">Booking ID: {event._id}</span>
                                <span className="booking-date">Booked on: {formatDate(registrationData?.createdAt || event.createdAt)}</span>
                                {registrationData?.registration_date && (
                                  <span className="registration-date">Registration Date: {formatDate(registrationData.registration_date)}</span>
                                )}
                              </div>
                              <button
                                className="view-event-btn"
                                onClick={() => handleViewPublicEvent(event)}
                              >
                                <i className="fas fa-eye"></i>
                                View Booking Details
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Appointment View Modal */}
        {showAppointmentViewModal && selectedAppointment && (
          <div className="client-modal-overlay" onClick={() => setShowAppointmentViewModal(false)}>
            <div className="client-modal-content appointment-view-modal" onClick={(e) => e.stopPropagation()}>
              <span className="close-btn" onClick={() => setShowAppointmentViewModal(false)}>×</span>
              <h3>Appointment Details</h3>

              <div className="appointment-view-details">
                <div className="detail-section">
                  <h4>Event Information</h4>
                  <p><strong>Event Type:</strong> {selectedAppointment.event_type}</p>
                  <p><strong>Date:</strong> {formatDate(selectedAppointment.event_date)}</p>
                  <p><strong>Location:</strong> {selectedAppointment.location}</p>
                  <p><strong>Guests:</strong> {selectedAppointment.guests || "N/A"}</p>
                  <p><strong>Budget:</strong> ₹{selectedAppointment.budget || "N/A"}</p>
                  {selectedAppointment.special_requirements && (
                    <p><strong>Special Requirements:</strong> {selectedAppointment.special_requirements}</p>
                  )}
                  <p><strong>Status:</strong>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(selectedAppointment.status) }}
                    >
                      {selectedAppointment.status}
                    </span>
                  </p>
                </div>

                {/* Show organizer details only for confirmed appointments */}
                {selectedAppointment.status === "approved" && (
                  <div className="detail-section">
                    <h4>Organizer Information</h4>
                    {selectedAppointment.organizer ? (
                      <>
                        <p><strong>Name:</strong> {selectedAppointment.organizer.name || "N/A"}</p>
                        <p><strong>Email:</strong> {selectedAppointment.organizer.email || "N/A"}</p>
                        <p><strong>Phone:</strong> {selectedAppointment.organizer.phone || "N/A"}</p>
                        {selectedAppointment.organizer.company && (
                          <p><strong>Company:</strong> {selectedAppointment.organizer.company}</p>
                        )}
                        {selectedAppointment.organizer.specialization && (
                          <p><strong>Specialization:</strong> {selectedAppointment.organizer.specialization}</p>
                        )}
                        {selectedAppointment.organizer.experience && (
                          <p><strong>Experience:</strong> {selectedAppointment.organizer.experience}</p>
                        )}
                      </>
                    ) : (
                      <p><strong>Organizer information not available</strong></p>
                    )}
                  </div>
                )}

                <div className="detail-section">
                  <h4>Booking Information</h4>
                  <p><strong>Booking ID:</strong> {selectedAppointment._id}</p>
                  <p><strong>Booked on:</strong> {formatDate(selectedAppointment.createdAt)}</p>
                </div>
              </div>

              <div className="client-modal-actions">
                <button
                  className="close-modal-btn"
                  onClick={() => setShowAppointmentViewModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Public Event View Modal */}
        {showPublicEventModal && selectedPublicEvent && (
          <div className="client-modal-overlay" onClick={() => setShowPublicEventModal(false)}>
            <div className="client-modal-content public-event-view-modal" onClick={(e) => e.stopPropagation()}>
              <span className="close-btn" onClick={() => setShowPublicEventModal(false)}>×</span>
              <h3 className="event-detail-header">Public Event Details</h3>

              <div className="public-event-view-details">
                {/* Handle both registration data and event data */}
                {(() => {
                  const eventData = selectedPublicEvent.event_id || selectedPublicEvent;
                  const registrationData = selectedPublicEvent.event_id ? selectedPublicEvent : null;

                  return (
                    <>
                      <div className="event-header-section">
                        <div className="event-title-section">
                          <h2>{eventData.title || eventData.event_type || 'Event Title'}</h2>
                          <div className="event-badges">
                            <span className="event-type-badge-large">
                              {eventData.event_type || eventData.title || 'Event'}
                            </span>
                            <span
                              className="event-status-badge-large"
                              style={{
                                backgroundColor: getStatusColor(registrationData?.status || eventData?.status),
                                color: 'white'
                              }}
                            >
                              {registrationData?.status || eventData?.status || 'Unknown'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="event-info-grid">
                        <div className="info-section">
                          <h4>Event Information</h4>
                          <div className="info-item">
                            <i className="fas fa-calendar"></i>
                            <div>
                              <strong>Date:</strong>
                              <p>{formatDate(eventData.event_date)}</p>
                            </div>
                          </div>
                          <div className="info-item">
                            <i className="fas fa-map-marker-alt"></i>
                            <div>
                              <strong>Location:</strong>
                              <p>{eventData.location || 'Location not specified'}</p>
                            </div>
                          </div>
                          <div className="info-item">
                            <i className="fas fa-users"></i>
                            <div>
                              <strong>Total Persons:</strong>
                              <p>{registrationData?.total_persons || 1}</p>
                            </div>
                          </div>
                          <div className="info-item">
                            <i className="fas fa-rupee-sign"></i>
                            <div>
                              <strong>Total Price:</strong>
                              <p>Rs. {(eventData.price || 0) * (registrationData?.total_persons || 1)}</p>
                            </div>
                          </div>
                        </div>

                        {eventData.description && (
                          <div className="info-section full-width">
                            <h4>Description</h4>
                            <p>{eventData.description}</p>
                          </div>
                        )}

                        {/* Registration specific information */}
                        {registrationData && (
                          <div className="info-section full-width">
                            <h4>Registration Information</h4>
                            <div className="registration-details">
                              <p><strong>Event Name:</strong> {eventData.title || eventData.event_type || 'Event'}</p>
                              <p><strong>Registration ID:</strong> {registrationData._id}</p>
                              <p><strong>Registration Date:</strong> {formatDate(registrationData.createdAt)}</p>
                              {registrationData.registration_date && (
                                <p><strong>Registration Submitted:</strong> {formatDate(registrationData.registration_date)}</p>
                              )}
                              <p><strong>Total Persons:</strong> {registrationData.total_persons || 1}</p>
                              <p><strong>Price per Person:</strong> Rs. {eventData.price || 0}</p>
                              <p><strong>Total Price:</strong> Rs. {(eventData.price || 0) * (registrationData.total_persons || 1)}</p>
                              <p><strong>Registration Status:</strong>
                                <span
                                  className="status-badge"
                                  style={{
                                    backgroundColor: getStatusColor(registrationData.status),
                                    color: 'white',
                                    marginLeft: '10px',
                                    padding: '4px 8px',
                                    borderRadius: '12px',
                                    fontSize: '12px'
                                  }}
                                >
                                  {registrationData.status}
                                </span>
                              </p>
                              {registrationData.paymentStatus && (
                                <p><strong>Payment Status:</strong>
                                  <span
                                    className="payment-status-badge"
                                    style={{
                                      backgroundColor: registrationData.paymentStatus === 'paid' ? '#4CAF50' : '#FF9800',
                                      color: 'white',
                                      marginLeft: '10px',
                                      padding: '4px 8px',
                                      borderRadius: '12px',
                                      fontSize: '12px'
                                    }}
                                  >
                                    {registrationData.paymentStatus}
                                  </span>
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="client-modal-actions">
                <div className="booking-summary">
                  <h4>Booking Summary</h4>
                  <div className="booking-details">
                    <p><strong>Booking ID:</strong> {selectedPublicEvent._id}</p>
                    <p><strong>Booking Date:</strong> {formatDate(selectedPublicEvent.createdAt)}</p>
                    {(() => {
                      const eventData = selectedPublicEvent.event_id || selectedPublicEvent;
                      const registrationData = selectedPublicEvent.event_id ? selectedPublicEvent : null;
                      const totalPersons = registrationData?.total_persons || 1;
                      const pricePerPerson = eventData?.price || 0;
                      const totalPrice = pricePerPerson * totalPersons;

                      return (
                        <>
                          <p><strong>Event Name:</strong> {eventData.title || eventData.event_type || 'Event'}</p>
                          <p><strong>Total Persons:</strong> {totalPersons}</p>
                          <p><strong>Price per Person:</strong> Rs. {pricePerPerson}</p>
                          <p><strong>Total Price:</strong> <span style={{ color: 'var(--brown)', fontWeight: '700' }}>Rs. {totalPrice}</span></p>
                        </>
                      );
                    })()}
                    {selectedPublicEvent.status && (
                      <p><strong>Booking Status:</strong>
                        <span
                          className="status-badge"
                          style={{
                            backgroundColor: getStatusColor(selectedPublicEvent.status),
                            color: 'white',
                            marginLeft: '10px',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '12px'
                          }}
                        >
                          {selectedPublicEvent.status}
                        </span>
                      </p>
                    )}
                    {selectedPublicEvent.paymentStatus && (
                      <p><strong>Payment Status:</strong>
                        <span
                          className="payment-status-badge"
                          style={{
                            backgroundColor: selectedPublicEvent.paymentStatus === 'paid' ? '#4CAF50' : '#FF9800',
                            color: 'white',
                            marginLeft: '10px',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '12px'
                          }}
                        >
                          {selectedPublicEvent.paymentStatus}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
                <div className="client-modal-buttons">
                  <button
                    className="print-modal-btn"
                    onClick={() => handlePrintBooking(selectedPublicEvent)}
                  >
                    <i className="fas fa-print"></i>
                    Print Ticket
                  </button>
                  <button
                    className="close-modal-btn"
                    onClick={() => setShowPublicEventModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default ClientDashboard;