import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'sonner';

// API base URL - uses VITE_API_URL env var for production, relative path for dev
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle token expiration
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const response = await axios.post(`${API_URL}/auth/refresh`, {}, {
          withCredentials: true,
        });

        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/auth';
        toast.error('Session expired. Please login again.');
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    let errorMessage = 'An unexpected error occurred';
    
    if (error.response) {
      const errorData = error.response.data as Record<string, unknown>;
      errorMessage = (errorData?.error as string) || 'An error occurred';
      
      // Skip toast for auth endpoints — Auth.tsx handles those with detailed messages
      const isAuthEndpoint = originalRequest.url?.includes('/auth/');
      
      if (!isAuthEndpoint) {
        // Show toast for client errors
        if (error.response.status >= 400 && error.response.status < 500) {
          toast.error(errorMessage);
        } else if (error.response.status >= 500) {
          toast.error('Server error. Please try again later.');
        }
      }
    } else if (error.request) {
      toast.error('Network error. Please check your connection.');
    } else {
      toast.error(errorMessage);
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (data: { email: string; password: string; fullName: string; role?: string }) =>
    api.post('/auth/signup', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  googleLogin: (credential: string, role?: string) =>
    api.post('/auth/google', { credential, role }),

  logout: () =>
    api.post('/auth/logout'),
  
  refreshToken: () =>
    api.post('/auth/refresh'),
};

// Patients API
export const patientsAPI = {
  getRecord: () =>
    api.get('/patients/record'),
  
  saveRecord: (data: Record<string, unknown>) =>
    api.post('/patients/record', data),
  
  getAllPatients: (page = 1, limit = 20) =>
    api.get(`/patients?page=${page}&limit=${limit}`),
};

// Doctors API
export const doctorsAPI = {
  getVerified: () =>
    api.get('/doctors/verified'),
  
  getStatus: () =>
    api.get('/doctors/status'),
  
  submitVerification: (data: Record<string, unknown>) =>
    api.post('/doctors/verify', data),
};

// Messages API
export const messagesAPI = {
  getConversation: (userId: string) =>
    api.get(`/messages/${userId}`),
  
  sendMessage: (data: { receiver: string; content: string }) =>
    api.post('/messages', data),
};

// Diet Plans API
export const dietPlansAPI = {
  getPlan: () =>
    api.get('/diet-plans'),
  
  getCurrentPlan: () =>
    api.get('/diet-plans/current'),
  
  generatePlan: () =>
    api.post('/diet-plans/generate'),
};

// Health Logs API
export const logsAPI = {
  getLogs: () =>
    api.get('/logs'),
  
  getPatientLogs: (patientId: string) =>
    api.get(`/logs/patient/${patientId}`),
  
  saveLog: (data: Record<string, unknown>) =>
    api.post('/logs', data),
  
  aiParse: (text: string) =>
    api.post('/logs/ai-parse', { text }),
  
  logMeal: (data: Record<string, unknown>) =>
    api.post('/logs', data),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: () =>
    api.get('/notifications'),
  
  markAsRead: (id: string) =>
    api.patch(`/notifications/${id}/read`),
};

// Admin API
export const adminAPI = {
  getDashboard: () =>
    api.get('/admin/dashboard'),
  
  getVerifications: () =>
    api.get('/admin/verifications'),
  
  handleVerification: (id: string, action: 'approve' | 'reject') =>
    api.put(`/admin/verifications/${id}/${action}`),
};

// Foods API
export const foodsAPI = {
  searchFoods: (query: string) =>
    api.get(`/foods/search?q=${query}`),
};

export default api;
