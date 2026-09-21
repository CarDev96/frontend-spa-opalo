import { defineStore } from 'pinia';
import api from '@/services/api';

export const useExamineesStore = defineStore('examinees', {
  state: () => ({
    examinees: [],
    loading: false,
    saving: false,
  }),

  getters: {
    totalExaminees: (state) => state.examinees.length,
    registeredCount: (state) => state.examinees.filter((e) => e.status === 'registered').length,
    scheduledCount: (state) => state.examinees.filter((e) => e.status === 'scheduled').length,
  },

  actions: {
    async fetchExaminees() {
      this.loading = true;
      try {
        const response = await api.get('/portal/examinees/list');
        this.examinees = response.data || [];
        return this.examinees;
      } catch (error) {
        console.error('Error al cargar evaluados:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async addExaminee(payload) {
      this.saving = true;
      try {
        const response = await api.post('/portal/examinees/store', payload);
        if (response.data?.examinee) {
          this.examinees.unshift(response.data.examinee);
        } else {
          await this.fetchExaminees();
        }
        return { success: true, message: response.data.message };
      } catch (error) {
        const message = error.response?.data?.message || 'Error al registrar evaluado.';
        return { success: false, message, errors: error.response?.data?.errors };
      } finally {
        this.saving = false;
      }
    },

    async removeExaminee(id) {
      try {
        const response = await api.delete(`/portal/examinees/${id}`);
        this.examinees = this.examinees.filter((e) => e.id !== id);
        return { success: true, message: response.data.message };
      } catch (error) {
        const message = error.response?.data?.message || 'Error al eliminar evaluado.';
        return { success: false, message };
      }
    },

    async reloadList() {
      return this.fetchExaminees();
    },
  },
});
