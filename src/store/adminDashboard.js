import { defineStore } from 'pinia';
import api from '@/services/api';

export const useAdminDashboardStore = defineStore('adminDashboard', {
  state: () => ({
    stats: {
      total_clients: 0,
      total_examinees: 0,
      scheduled_appointments: 0,
      today_appointments: 0,
      pending_orders: 0,
    },
    upcomingAppointments: [],
    loading: false,
  }),

  actions: {
    async fetchDashboardStats() {
      this.loading = true;
      try {
        const res = await api.get('/admin/dashboard/stats');
        this.stats = res.data.stats || this.stats;
        this.upcomingAppointments = res.data.upcoming_appointments || [];
      } catch (error) {
        console.error('Error cargando estadísticas del dashboard:', error);
      } finally {
        this.loading = false;
      }
    },
  },
});
