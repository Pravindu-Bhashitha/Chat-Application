import axios, { InternalAxiosRequestConfig } from 'axios';

const AUTH_SERVICE_URL = import.meta.env.VITE_AUTH_SERVICE_URL || '';
const MESSAGE_SERVICE_URL = import.meta.env.VITE_MESSAGE_SERVICE_URL || '';
const USER_SERVICE_URL = import.meta.env.VITE_USER_SERVICE_URL || '';

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

// 2. Message Service Axios Instance (Port 4002)
export const messageApi = axios.create({
  baseURL: MESSAGE_SERVICE_URL,
  headers: { 'Content-Type': 'application/json' },
});

messageApi.interceptors.request.use(attachAuthToken, (error) => Promise.reject(error));

export const userApi = axios.create({
  baseURL: USER_SERVICE_URL,
  headers: { 'Content-Type': 'application/json' },
});

userApi.interceptors.request.use(attachAuthToken, (error) => Promise.reject(error));

