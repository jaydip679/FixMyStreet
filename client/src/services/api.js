import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle 401 unauthenticated
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data) => api.post('/v1/auth/register', data),
  login: (data) => api.post('/v1/auth/login', data),
  getMe: () => api.get('/v1/auth/me')
};

export const reportsApi = {
  create: (data) => api.post('/v1/reports', data),
  list: (params) => api.get('/v1/reports', { params }),
  getById: (id) => api.get(`/v1/reports/${id}`),
  updateStatus: (id, data) => api.patch(`/v1/reports/${id}/status`, data),
  assignDepartment: (id, data) => api.patch(`/v1/reports/${id}/assign`, data)
};

export const departmentsApi = {
  list: () => api.get('/v1/departments'),
  create: (data) => api.post('/v1/departments', data)
};

export const notificationsApi = {
  list: () => api.get('/v1/notifications'),
  markAsRead: (id) => api.patch(`/v1/notifications/${id}/read`)
};

export const analyticsApi = {
  getSummary: () => api.get('/v1/analytics/summary')
};

export default api;
