// Central place to store all backend API URLs

export const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const API = {
  REGISTER: `${BASE_URL}/auth/register`,
  LOGIN: `${BASE_URL}/auth/login`,
  GOOGLE_AUTH: `${BASE_URL}/auth/google`,
  PRIVATE_EVENT_BOOKING: `${BASE_URL}/privateEvents`,
  ADD_PACKAGE: `${BASE_URL}/package`,
  GET_PACKAGES: `${BASE_URL}/package/get-packages`,

  // Admin-specific endpoints
  ADMIN_LOGIN: `${BASE_URL}/auth/admin/login`,
};

