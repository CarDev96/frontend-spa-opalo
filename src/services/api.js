import axios from 'axios';
import router from '@/router';

const api = axios.create({
  // En Vite se usa import.meta.env en vez de process.env
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8010/api',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// Interceptor de Peticiones: inyecta el token Bearer si existe en localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de Respuestas: si el token expiró o es inválido (401), expulsa al login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');

      if (router.currentRoute.value.name !== 'Login') {
        router.push({
          path: '/login',
          query: { expired: 'true' },
        });
      }
    }
    return Promise.reject(error);
  }
);

export default api;
