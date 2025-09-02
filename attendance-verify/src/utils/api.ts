import axios from 'axios';
import { auth } from './auth';
import type { AuthResponse, AttendanceResponse, ScanQRResponse } from '../types';

const API_BASE = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth header to requests
api.interceptors.request.use((config) => {
  const authHeaders = auth.getAuthHeader();
  if (config.headers) {
    Object.assign(config.headers, authHeaders);
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      auth.removeToken();
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (credential: string): Promise<AuthResponse> => {
    const response = await api.post('/api/login', { credential });
    return response.data;
  },
};

export const attendanceAPI = {
  updateAttendance: async (userId: string): Promise<AttendanceResponse> => {
    const response = await api.post('/api/update-attendance', { userId });
    return response.data;
  },
  
  scanQR: async (qrData: string): Promise<ScanQRResponse> => {
    const response = await api.post('/api/scan-qr', { qrData });
    return response.data;
  },
};

export default api;
