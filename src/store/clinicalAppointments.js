import { defineStore } from 'pinia';
import api from '@/services/api';

export const useClinicalAppointmentsStore = defineStore('clinicalAppointments', {
  state: () => ({
    appointments: [],
    selectedAppointment: null,
    drawerOpen: false,
    activeTimeframe: 'today', // 'today', 'week', 'all'
    loading: false,
    updating: false,
  }),

  getters: {
    totalCount: (state) => state.appointments.length,
    scheduledCount: (state) => state.appointments.filter((item) => item.status === 'scheduled').length,
    attendedCount: (state) => state.appointments.filter((item) => item.status === 'attended').length,
  },

  actions: {
    async fetchAppointments(timeframe = null) {
      if (timeframe) {
        this.activeTimeframe = timeframe;
      }

      this.loading = true;
      try {
        const response = await api.get('/clinical/appointments/list', {
          params: { timeframe: this.activeTimeframe },
        });
        this.appointments = response.data || [];
        return this.appointments;
      } catch (error) {
        console.error('Error fetching clinical appointments:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    openDrawer(appointment) {
      this.selectedAppointment = appointment;
      this.drawerOpen = true;
    },

    closeDrawer() {
      this.drawerOpen = false;
      this.selectedAppointment = null;
    },

    async updateSession(id, payload) {
      this.updating = true;
      try {
        const response = await api.patch(`/clinical/appointments/${id}/session`, payload);
        const updated = response.data.appointment;

        const index = this.appointments.findIndex((item) => item.id === id);
        if (index !== -1 && updated) {
          this.appointments[index] = updated;
          if (this.selectedAppointment?.id === id) {
            this.selectedAppointment = updated;
          }
        }

        return { success: true, message: response.data.message };
      } catch (error) {
        const message = error.response?.data?.message || 'Error updating appointment session.';
        return { success: false, message };
      } finally {
        this.updating = false;
      }
    },
  },
});
