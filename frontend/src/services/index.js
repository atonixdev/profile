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

// Research Lab
export const labService = {
  getExperiments: (params) => api.get('/research-lab/experiments/', params ? { params } : undefined),
  runExperiment: (experimentId, params) => api.post(`/research-lab/experiments/${experimentId}/run/`, { params }),
  getRuns: (params) => api.get('/research-lab/runs/', params ? { params } : undefined),
  getRun: (runId) => api.get(`/research-lab/runs/${runId}/`),
  getRunLogs: (runId, limit = 200) => api.get(`/research-lab/runs/${runId}/logs/`, { params: { limit } }),
};

// Space Lab (backend-proxied space APIs)
export const spaceService = {
  getApod: (params) => api.get('/research-lab/space/apod/', { params }),
  getIssNow: () => api.get('/research-lab/space/iss/'),
  getNeoSummary: (params) => api.get('/research-lab/space/neo/', { params }),
  getDonkiSummary: (params) => api.get('/research-lab/space/donki/', { params }),

  // Additional NASA/space sources
  getEonetEvents: (params) => api.get('/research-lab/space/eonet/', { params }),
  getEpicLatest: () => api.get('/research-lab/space/epic/'),
  getExoplanetSample: (params) => api.get('/research-lab/space/exoplanet/', { params }),
  searchNasaImages: (params) => api.get('/research-lab/space/images/', { params }),
  getTechportProjects: (params) => api.get('/research-lab/space/techport/', { params }),
  searchTechtransferPatents: (params) => api.get('/research-lab/space/techtransfer/', { params }),
  getSsdCneosCad: (params) => api.get('/research-lab/space/ssd-cneos/', { params }),
  getTle: (params) => api.get('/research-lab/space/tle/', { params }),

  // Info endpoints
  getGibsInfo: () => api.get('/research-lab/space/gibs/'),
  getTrekWmtsInfo: () => api.get('/research-lab/space/trek-wmts/'),
  getInsightInfo: () => api.get('/research-lab/space/insight/'),
  getOsdrInfo: () => api.get('/research-lab/space/osdr/'),
  getSscInfo: () => api.get('/research-lab/space/ssc/'),
};

// AI Lab
export const aiLabService = {
  listDatasets: () => api.get('/ai-lab/datasets/'),
  createDataset: (formData) => api.post('/ai-lab/datasets/', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  listModels: () => api.get('/ai-lab/models/'),
  createModel: (formData) => api.post('/ai-lab/models/', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// IoT Lab
export const iotLabService = {
  listDevices: (params) => api.get('/iot-lab/devices/', params ? { params } : undefined),
  createDevice: (data) => api.post('/iot-lab/devices/', data),
  updateDevice: (id, data) => api.patch(`/iot-lab/devices/${id}/`, data),

  listTelemetry: (params) => api.get('/iot-lab/telemetry/', params ? { params } : undefined),
  createTelemetry: (data) => api.post('/iot-lab/telemetry/', data),

  listAutomations: () => api.get('/iot-lab/automations/'),
  createAutomation: (data) => api.post('/iot-lab/automations/', data),
  updateAutomation: (id, data) => api.patch(`/iot-lab/automations/${id}/`, data),
  runAutomation: (id) => api.post(`/iot-lab/automations/${id}/run/`),

  getNetworkSummary: () => api.get('/iot-lab/network/summary/'),
};

// Self Lab
export const selfLabService = {
  getSummary: () => api.get('/self-lab/overview/summary/'),

  listBiometrics: (params) => api.get('/self-lab/biometrics/', params ? { params } : undefined),
  createBiometric: (data) => api.post('/self-lab/biometrics/', data),
  deleteBiometric: (id) => api.delete(`/self-lab/biometrics/${id}/`),

  listCognitiveTests: (params) => api.get('/self-lab/cognitive-tests/', params ? { params } : undefined),
  createCognitiveTest: (data) => api.post('/self-lab/cognitive-tests/', data),
  deleteCognitiveTest: (id) => api.delete(`/self-lab/cognitive-tests/${id}/`),

  listEvolutionMetrics: (params) => api.get('/self-lab/evolution-metrics/', params ? { params } : undefined),
  createEvolutionMetric: (data) => api.post('/self-lab/evolution-metrics/', data),
  deleteEvolutionMetric: (id) => api.delete(`/self-lab/evolution-metrics/${id}/`),

  listJournals: (params) => api.get('/self-lab/journals/', params ? { params } : undefined),
  createJournal: (data) => api.post('/self-lab/journals/', data),
  deleteJournal: (id) => api.delete(`/self-lab/journals/${id}/`),
};
