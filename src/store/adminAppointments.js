import { defineStore } from 'pinia';
import api from '@/services/api';

export const useAdminAppointmentsStore = defineStore('adminAppointments', {
  state: () => ({
    clients: [],
    evaluationTypes: [],
    psychologists: [],
    availableSlots: [],
    loadingSlots: false,
    booking: false,
  }),

  actions: {
    async fetchFormData() {
      try {
        const res = await api.get('/admin/appointments/form-data');
        this.clients = res.data.clients || [];
        this.evaluationTypes = res.data.evaluation_types || [];
        this.psychologists = res.data.psychologists || [];
      } catch (e) {
        console.error('Error cargando catálogos de agendamiento admin:', e);
      }
    },

    async fetchSlots(psychologistId, date) {
      this.loadingSlots = true;
      this.availableSlots = [];
      try {
        const res = await api.get('/admin/appointments/slots', {
          params: { psychologist_id: psychologistId, date },
        });
        this.availableSlots = res.data || [];
      } catch (e) {
        console.error('Error consultando slots:', e);
      } finally {
        this.loadingSlots = false;
      }
    },

    async bookAppointment(payload) {
      this.booking = true;
      try {
        const res = await api.post('/admin/appointments/book', payload);
        return { success: true, message: res.data.message };
      } catch (e) {
        const msg = e.response?.data?.message || 'Error al agendar la cita.';
        return { success: false, message: msg };
      } finally {
        this.booking = false;
      }
    },
  },
});
