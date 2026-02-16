// Central place to store all backend API URLs

export const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const API = {
  REGISTER: `${BASE_URL}/auth/register`,
  LOGIN: `${BASE_URL}/auth/login`,
  GOOGLE_AUTH: `${BASE_URL}/auth/google`,
  PRIVATE_EVENT_BOOKING: `${BASE_URL}/privateEvents`,
  ADD_PRIVATE_EVENT: `${BASE_URL}/privateEvents`,
  ADMIN_ADD_PRIVATE_EVENT: `${BASE_URL}/privateEvents/admin/add`,

  // Admin-specific endpoints
  ADMIN_LOGIN: `${BASE_URL}/auth/admin/login`,
  
  // Dashboard
  DASHBOARD_STATS: `${BASE_URL}/admin/dashboard/stats`,
  
  // Packages
  ADD_PACKAGE: `${BASE_URL}/package`,
  GET_PACKAGES: `${BASE_URL}/package/get-packages`,
  UPDATE_PACKAGE: `${BASE_URL}/package/update-package`,
  
  // Appointments
  GET_APPOINTMENTS: `${BASE_URL}/admin/appointments`,
  UPDATE_APPOINTMENT_STATUS: `${BASE_URL}/admin/appointments`,
  DELETE_APPOINTMENT: `${BASE_URL}/admin/appointments`,
  
  // Categories
  GET_CATEGORIES: `${BASE_URL}/admin/categories`,
  ADD_CATEGORY: `${BASE_URL}/admin/categories`,
  UPDATE_CATEGORY: `${BASE_URL}/admin/categories`,
  DELETE_CATEGORY: `${BASE_URL}/admin/categories`,
  
  // Gallery
  GET_GALLERY: `${BASE_URL}/admin/gallery`,
  ADD_GALLERY: `${BASE_URL}/admin/gallery`,
  DELETE_GALLERY: `${BASE_URL}/admin/gallery`,
  
  // Reviews
  GET_REVIEWS: `${BASE_URL}/admin/reviews`,
  ADD_REVIEW: `${BASE_URL}/admin/reviews`,
  UPDATE_REVIEW: `${BASE_URL}/admin/reviews`,
  DELETE_REVIEW: `${BASE_URL}/admin/reviews`,
  
  // Inquiries
  GET_INQUIRIES: `${BASE_URL}/admin/inquiries`,
  GET_INQUIRY: `${BASE_URL}/admin/inquiries`,
  UPDATE_INQUIRY_STATUS: `${BASE_URL}/admin/inquiries`,
  DELETE_INQUIRY: `${BASE_URL}/admin/inquiries`
};

