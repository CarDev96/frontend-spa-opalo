import { defineStore } from 'pinia';
import api from '@/services/api';

export const useAppointmentsStore = defineStore('appointments', {
  state: () => ({
    appointments: [],
    evaluationTypes: [],
    psychologists: [],
    availableSlots: [],
    loading: false,
    loadingSlots: false,
    booking: false,
  }),

  actions: {
    async fetchFormData() {
      try {
        const response = await api.get('/portal/appointments/form-data');
        this.evaluationTypes = response.data.evaluation_types || [];
        this.psychologists = response.data.psychologists || [];
      } catch (error) {
        console.error('Error cargando catálogos de citas:', error);
      }
    },

    async fetchSlots(psychologistId, date) {
      if (!psychologistId || !date) {
        this.availableSlots = [];
        return;
      }

      this.loadingSlots = true;
      try {
        const response = await api.get('/portal/appointments/slots', {
          params: { psychologist_id: psychologistId, date },
        });
        this.availableSlots = response.data || [];
      } catch (error) {
        console.error('Error cargando horarios disponibles:', error);
        this.availableSlots = [];
      } finally {
        this.loadingSlots = false;
      }
    },

    async fetchAppointments() {
      this.loading = true;
      try {
        const response = await api.get('/portal/appointments/list');
        this.appointments = response.data || [];
        return this.appointments;
      } catch (error) {
        console.error('Error cargando citas del cliente:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async bookAppointment(payload) {
      this.booking = true;
      try {
        const response = await api.post('/portal/appointments/book', payload);
        await this.fetchAppointments();
        return { success: true, message: response.data.message };
      } catch (error) {
        const message = error.response?.data?.message || 'Error al agendar cita.';
        return { success: false, message, errors: error.response?.data?.errors };
      } finally {
        this.booking = false;
      }
    },
  },
});
