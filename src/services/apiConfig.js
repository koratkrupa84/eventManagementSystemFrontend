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
  
  // Home page endpoints
  HOME_REVIEWS: `${BASE_URL}/reviews`,
  HOME_CATEGORIES: `${BASE_URL}/home/categories`,
  HOME_PACKAGES: `${BASE_URL}/home/packages`,
  HOME_EVENTS: `${BASE_URL}/home/events`,
  HOME_STATS: `${BASE_URL}/home/stats`,
  
  // Dashboard
  DASHBOARD_STATS: `${BASE_URL}/admin/dashboard/stats`,
  
  // Packages
  ADD_PACKAGE: `${BASE_URL}/package`,
  GET_PACKAGES: `${BASE_URL}/package/get-packages`,
  UPDATE_PACKAGE: `${BASE_URL}/package/update-package`,
  
  // Appointments
  GET_APPOINTMENTS: `${BASE_URL}/admin/appointments`,
  CREATE_APPOINTMENT: `${BASE_URL}/admin/appointments`,
  UPDATE_APPOINTMENT: `${BASE_URL}/admin/appointments`,
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
  UPDATE_GALLERY: `${BASE_URL}/admin/gallery`,
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
  DELETE_INQUIRY: `${BASE_URL}/admin/inquiries`,
  
  // Client Profile
  GET_CLIENT_PROFILE: `${BASE_URL}/profile`,
  GET_CLIENT_APPOINTMENTS: `${BASE_URL}/profile/appointments`,
  BOOK_PRIVATE_EVENT: `${BASE_URL}/profile/private-event-booking`,
  UPDATE_CLIENT_PROFILE: `${BASE_URL}/profile/update`,
  UPDATE_PROFILE: `${BASE_URL}/profile`,
  GET_USERS: `${BASE_URL}/auth/users`,
  CREATE_USER: `${BASE_URL}/auth/users`,
  DELETE_USER: `${BASE_URL}/auth/users`,
  
  // Requests
  GET_REQUESTS: `${BASE_URL}/admin/requests`,
  UPDATE_APPOINTMENT: `${BASE_URL}/admin/appointments`,
  
  // Public Events
  GET_PUBLIC_EVENTS: `${BASE_URL}/publicEvents`,
  GET_PUBLIC_EVENT: `${BASE_URL}/publicEvents`,
  CREATE_PUBLIC_EVENT: `${BASE_URL}/publicEvents`,
  UPDATE_PUBLIC_EVENT: `${BASE_URL}/publicEvents`,
  DELETE_PUBLIC_EVENT: `${BASE_URL}/publicEvents`,
  
  // Event Registrations
  REGISTER_FOR_EVENT: `${BASE_URL}/registrations`,
  GET_MY_REGISTRATIONS: `${BASE_URL}/registrations/user/my-registrations`,
  CANCEL_REGISTRATION: `${BASE_URL}/registrations`,
  GET_EVENT_REGISTRATIONS: `${BASE_URL}/registrations/event`,
  
  // Private Events
  CREATE_PRIVATE_EVENT: `${BASE_URL}/privateEvents/create-event`,
  GET_PRIVATE_EVENTS: `${BASE_URL}/privateEvents/events`,
  GET_PRIVATE_EVENT: `${BASE_URL}/privateEvents/events`,
  UPDATE_PRIVATE_EVENT: `${BASE_URL}/privateEvents/events`,
  DELETE_PRIVATE_EVENT: `${BASE_URL}/privateEvents/events`,
  
  // Organizer endpoints
  ORGANIZER_REGISTER: `${BASE_URL}/organizer/register`,
  ORGANIZER_LOGIN: `${BASE_URL}/organizer/login`,
  ORGANIZER_GOOGLE_AUTH: `${BASE_URL}/organizer/google`,
  ORGANIZER_PROFILE: `${BASE_URL}/organizer/profile`,
  ORGANIZER_UPLOAD_PHOTO: `${BASE_URL}/organizer/upload-photo`,
  
  // Admin Organizer endpoints
  ADMIN_GET_ORGANIZERS: `${BASE_URL}/admin/organizers`,
  ADMIN_DELETE_ORGANIZER: `${BASE_URL}/admin/organizers`,
  ADMIN_UPDATE_ORGANIZER_STATUS: `${BASE_URL}/admin/organizers`,
  
  // Admin Client endpoints
  ADMIN_GET_CLIENTS: `${BASE_URL}/admin/clients`,
  ADMIN_DELETE_CLIENT: `${BASE_URL}/admin/clients`,
  ADMIN_UPDATE_CLIENT_STATUS: `${BASE_URL}/admin/clients`
};

