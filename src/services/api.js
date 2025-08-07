import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Axios instance oluştur
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - token ekle
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - 401 durumunda logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

// User Services
export const userService = {
  getCurrentUser: () => api.get('/users/me'),
  updateUser: (userData) => api.put('/users/me', userData),
  deleteUser: () => api.delete('/users/me'),
  getUserBalances: () => api.get('/users/me/balances'),
};

// Group Services
export const groupService = {
  getGroups: () => api.get('/groups'),
  createGroup: (groupData) => api.post('/groups', groupData),
  updateGroup: (groupId, groupData) => api.put(`/groups/${groupId}`, groupData),
  deleteGroup: (groupId) => api.delete(`/groups/${groupId}`),
  getGroupMembers: (groupId) => api.get(`/groups/${groupId}/members`),
  inviteMember: (groupId, userCode) => api.post(`/groups/${groupId}/invite`, { userCode }),
  acceptInvitation: (groupId) => api.post(`/groups/${groupId}/accept`),
  removeMember: (groupId, userCode) => api.delete(`/groups/${groupId}/members/${userCode}`),
};

// Expense Services
export const expenseService = {
  getExpenses: (groupId) => api.get(`/groups/${groupId}/expenses`),
  createExpense: (groupId, expenseData) => api.post(`/groups/${groupId}/expenses`, expenseData),
  getBalances: (groupId) => api.get(`/groups/${groupId}/expenses/balances`),
};

// Payment Services
export const paymentService = {
  getPayments: (groupId) => api.get(`/groups/${groupId}/payments`),
  createPayment: (groupId, paymentData) => api.post(`/groups/${groupId}/payments`, paymentData),
};

// Invitation Services
export const invitationService = {
  getInvitations: () => api.get('/invitations'),
  acceptInvitation: (invitationId) => api.post(`/invitations/${invitationId}/accept`),
};

export default api; 