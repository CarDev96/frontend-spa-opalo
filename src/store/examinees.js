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
        // Soporta tanto /portal/examinees/list como /portal/examinees
        let response;
        try {
          response = await api.get('/portal/examinees/list');
        } catch (err) {
          if (err.response?.status === 404) {
            response = await api.get('/portal/examinees');
          } else {
            throw err;
          }
        }

        const data = response.data?.data || response.data || [];
        this.examinees = Array.isArray(data) ? data : [];
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
        let response;
        try {
          response = await api.post('/portal/examinees/store', payload);
        } catch (err) {
          if (err.response?.status === 404) {
            response = await api.post('/portal/examinees', payload);
          } else {
            throw err;
          }
        }

        const newExaminee = response.data?.examinee || response.data?.data;

        if (newExaminee) {
          // Asignar status por defecto si no viene del back para mantener consistencia reactiva
          if (!newExaminee.status) {
            newExaminee.status = 'registered';
          }
          // Crear un nuevo array para garantizar que Vuetify detecte la mutación reactiva
          this.examinees = [newExaminee, ...this.examinees];
        } else {
          await this.fetchExaminees();
        }

        return {
          success: true,
          message: response.data?.message || 'Evaluado registrado exitosamente.',
          examinee: newExaminee,
        };
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
        return { success: true, message: response.data?.message || 'Evaluado eliminado exitosamente.' };
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
