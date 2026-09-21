import { defineStore } from 'pinia';
import api from '@/services/api';

export const useClientStore = defineStore('clients', {
  state: () => ({
    clients: [],
    loading: false,
    error: null,
  }),

  getters: {
    totalClients: (state) => state.clients.length,
    activeClients: (state) => state.clients.filter(c => !c.deleted_at && c.is_active !== false).length,
  },

  actions: {
    async fetchClients() {
      this.loading = true;
      try {
        const response = await api.get('/clients');
        this.clients = response.data;
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al cargar clientes';
      } finally {
        this.loading = false;
      }
    },

    // Agrega el nuevo cliente arriba de la lista en tiempo real
    addClient(newClient) {
      this.clients.unshift(newClient);
    },

    // Eliminar / baja lógica
    async deleteClient(id) {
      try {
        await api.delete(`/clients/${id}`);
        this.clients = this.clients.filter(c => c.id !== id);
        return { success: true, message: 'Cliente eliminado correctamente.' };
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || 'Error al eliminar el cliente.'
        };
      }
    },

    // Bloquear / Desbloquear usuario del cliente
    async toggleBlockClient(client) {
      try {
        const response = await api.post(`/clients/${client.id}/toggle-status`);
        const index = this.clients.findIndex(c => c.id === client.id);
        if (index !== -1) {
          this.clients[index] = { ...this.clients[index], ...response.data.client };
        }
        return { success: true, message: response.data.message };
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || 'Error al cambiar estatus.'
        };
      }
    },
  },
});
