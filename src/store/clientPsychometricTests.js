import { defineStore } from 'pinia';
import api from '@/services/api';

export const useClientPsychometricTestsStore = defineStore('clientPsychometricTests', {
  state: () => ({
    tests: [],
    loading: false,
  }),

  actions: {
    async fetchTests() {
      this.loading = true;
      try {
        const res = await api.get('/portal/psychometric-tests');
        this.tests = res.data?.data || [];
      } catch (error) {
        console.error('Error cargando pruebas para el cliente:', error);
      } finally {
        this.loading = false;
      }
    },
  },
});
