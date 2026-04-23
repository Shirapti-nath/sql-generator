import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.message || err.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const resumeAPI = {
  upload: (formData) => api.post('/resumes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  create: (data) => api.post('/resumes/build', data),
  update: (id, data) => api.put(`/resumes/${id}`, data),
  getAll: () => api.get('/resumes'),
  getOne: (id) => api.get(`/resumes/${id}`),
  delete: (id) => api.delete(`/resumes/${id}`),
};

export const analysisAPI = {
  analyze: (data) => api.post('/analysis/analyze', data),
  getHistory: () => api.get('/analysis/history'),
  getOne: (id) => api.get(`/analysis/${id}`),
  improveBullets: (data) => api.post('/analysis/improve-bullets', data),
};

export const templateAPI = {
  getAll: (category) => api.get('/templates', { params: { category } }),
  getOne: (id) => api.get(`/templates/${id}`),
  save: (templateId) => api.post('/templates/save', { templateId }),
};

export default api;
