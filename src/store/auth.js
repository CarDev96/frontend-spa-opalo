import { defineStore } from 'pinia';
import api from '@/services/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('auth_token') || null,
    user: JSON.parse(localStorage.getItem('auth_user') || 'null'),
    menu: [],
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
  },

  actions: {
    async login(credentials) {
      const response = await api.post('/login', credentials);
      this.token = response.data.token;
      this.user = response.data.user;

      localStorage.setItem('auth_token', this.token);
      localStorage.setItem('auth_user', JSON.stringify(this.user));

      // Precarga el menú del usuario autenticado
      await this.fetchNavigation();

      return this.user;
    },

    async fetchNavigation() {
      if (!this.token) return;
      try {
        const response = await api.get('/navigation');
        this.menu = response.data;
        return this.menu;
      } catch (error) {
        console.error('Error al obtener la navegación:', error);
      }
    },

    async logout() {
      try {
        await api.post('/logout');
      } catch (e) {
        // En caso de que el token ya haya expirado en Laravel
      } finally {
        this.token = null;
        this.user = null;
        this.menu = [];
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    },
  },
});
