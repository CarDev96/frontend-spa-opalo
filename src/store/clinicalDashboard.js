import { defineStore } from 'pinia';
import api from '@/services/api';

export const useClinicalDashboardStore = defineStore('clinicalDashboard', {
  state: () => ({
    metrics: {
      today_total: 0,
      today_pending: 0,
      week_total: 0,
      total_attended: 0,
      total_cancelled: 0,
      total_examinees: 0,
    },
    nextAppointment: null,
    todayAppointments: [],
    loading: false,
  }),

  actions: {
    async fetchDashboardData() {
      this.loading = true;
      try {
        const response = await api.get('/clinical/dashboard');
        const data = response.data || {};

        this.metrics = data.metrics || this.metrics;
        this.nextAppointment = data.next_appointment || null;
        this.todayAppointments = data.today_appointments || [];

        return data;
      } catch (error) {
        console.error('Error loading clinical dashboard data:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
