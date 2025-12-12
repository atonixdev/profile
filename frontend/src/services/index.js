import api from './api';

// Authentication
export const authService = {
  login: (credentials) => api.post('/token/', credentials),
  refresh: (refreshToken) => api.post('/token/refresh/', { refresh: refreshToken }),
};

// Profile
export const profileService = {
  getPublicProfile: () => api.get('/accounts/profiles/public/'),
  getProfile: (id) => api.get(`/accounts/profiles/${id}/`),
  updateProfile: (id, data) => api.put(`/accounts/profiles/${id}/`, data),
};

// Projects
export const projectService = {
  getAll: (params) => api.get('/portfolio/projects/', { params }),
  getOne: (id) => api.get(`/portfolio/projects/${id}/`),
  getFeatured: () => api.get('/portfolio/projects/featured/'),
  create: (data) => api.post('/portfolio/projects/', data),
  update: (id, data) => api.put(`/portfolio/projects/${id}/`, data),
  delete: (id) => api.delete(`/portfolio/projects/${id}/`),
};

// Services
export const serviceService = {
  getAll: () => api.get('/services/'),
  getOne: (id) => api.get(`/services/${id}/`),
  create: (data) => api.post('/services/', data),
  update: (id, data) => api.put(`/services/${id}/`, data),
  delete: (id) => api.delete(`/services/${id}/`),
};

// Testimonials
export const testimonialService = {
  getAll: (params) => api.get('/testimonials/', { params }),
  getOne: (id) => api.get(`/testimonials/${id}/`),
  getFeatured: () => api.get('/testimonials/featured/'),
  create: (data) => api.post('/testimonials/', data),
  update: (id, data) => api.put(`/testimonials/${id}/`, data),
  delete: (id) => api.delete(`/testimonials/${id}/`),
};

// Contact/Inquiries
export const inquiryService = {
  getAll: () => api.get('/contact/inquiries/'),
  getOne: (id) => api.get(`/contact/inquiries/${id}/`),
  create: (data) => api.post('/contact/inquiries/', data),
  updateStatus: (id, status) => api.patch(`/contact/inquiries/${id}/update_status/`, { status }),
};

// Blog
export const blogService = {
  getAll: (params) => api.get('/blog/posts/', { params }),
  getOne: (slug) => api.get(`/blog/posts/${slug}/`),
  incrementViews: (slug) => api.post(`/blog/posts/${slug}/increment_views/`),
  addComment: (slug, data) => api.post(`/blog/posts/${slug}/add_comment/`, data),
};
