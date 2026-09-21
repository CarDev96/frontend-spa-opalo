import { defineStore } from 'pinia';
import api from '@/services/api';

export const usePsychologistSchedulesStore = defineStore('psychologistSchedules', {
  state: () => ({
    psychologists: [],
    selectedPsychologistId: null,
    loading: false,
    saving: false,
  }),

  getters: {
    selectedPsychologist: (state) => {
      return state.psychologists.find((p) => p.id === state.selectedPsychologistId) || null;
    },

    totalPsychologists: (state) => state.psychologists.length,
  },

  actions: {
    async fetchPsychologists() {
      this.loading = true;
      try {
        const response = await api.get('/admin/psychologists-schedules');
        this.psychologists = response.data || [];

        // Preselecciona el primero si no hay ninguno seleccionado
        if (!this.selectedPsychologistId && this.psychologists.length > 0) {
          this.selectedPsychologistId = this.psychologists[0].id;
        }

        return this.psychologists;
      } catch (error) {
        console.error('Error al cargar psicólogos:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    selectPsychologist(id) {
      this.selectedPsychologistId = id;
    },

    async saveSchedule(userId, schedules) {
      this.saving = true;
      try {
        const response = await api.post(`/admin/psychologists-schedules/${userId}/sync`, {
          schedules,
        });

        // Actualiza reactivamente los horarios del psicólogo en el state local
        const index = this.psychologists.findIndex((p) => p.id === userId);
        if (index !== -1 && response.data?.schedules) {
          this.psychologists[index].psychologist_schedules = response.data.schedules;
        }

        return { success: true, message: response.data.message };
      } catch (error) {
        const message = error.response?.data?.message || 'Error al guardar horarios.';
        return { success: false, message, errors: error.response?.data?.errors };
      } finally {
        this.saving = false;
      }
    },
  },
});
