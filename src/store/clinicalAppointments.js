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

		// En tu método updateSession en clinicalAppointments.js:
		async updateSession(appointmentId, payload) {
			this.updating = true;
			try {
				const response = await api.patch(`/clinical/appointments/${appointmentId}/session`, payload);

				// Actualizar el objeto localmente en memoria
				const updated = response.data?.appointment || response.data?.data;
				if (updated) {
					this.selectedAppointment = { ...this.selectedAppointment, ...updated };
				}

				return { success: true, message: 'Sesión actualizada correctamente.' };
			} catch (error) {
				console.error('Error al actualizar sesión:', error);
				return { success: false, message: error.response?.data?.message || 'Error al guardar.' };
			} finally {
				this.updating = false;
			}
		}
	},
});
