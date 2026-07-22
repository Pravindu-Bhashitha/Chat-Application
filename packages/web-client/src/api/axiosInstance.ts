// import axios from 'axios';

// const api = axios.create({
//   baseURL: 'http://localhost:4001/api', 
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token && config.headers) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// export default api;
import axios, { InternalAxiosRequestConfig } from 'axios';

// Service Ports
const AUTH_SERVICE_URL = 'http://localhost:4001/api';
const MESSAGE_SERVICE_URL = 'http://localhost:4003/api';

// Helper function to attach the Auth token interceptor
const attachAuthToken = (config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

// 1. Auth Service Axios Instance (Port 4001)
export const authApi = axios.create({
  baseURL: AUTH_SERVICE_URL,
  headers: { 'Content-Type': 'application/json' },
});

authApi.interceptors.request.use(attachAuthToken, (error) => Promise.reject(error));

// 2. Message Service Axios Instance (Port 4003)
export const messageApi = axios.create({
  baseURL: MESSAGE_SERVICE_URL,
  headers: { 'Content-Type': 'application/json' },
});

messageApi.interceptors.request.use(attachAuthToken, (error) => Promise.reject(error));