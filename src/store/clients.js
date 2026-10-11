import { defineStore } from 'pinia';
import api from '@/services/api';

export const useClientsStore = defineStore('clients', {
  state: () => ({
    clients: [],
    loading: false,
    saving: false,
    updating: false,
    deleting: false,
  }),

  actions: {
    async fetchClients() {
      this.loading = true;
      try {
        const response = await api.get('/clients');
        this.clients = response.data || [];
        return this.clients;
      } catch (error) {
        console.error('Error al cargar la lista de empresas clientes:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async registerClient(payload) {
      this.saving = true;
      try {
        const response = await api.post('/clients/store', payload);
        const newClient = response.data.data.client

        return {
          success: true,
          message: response.data.message,
          client: response.data.data.client,
        };
      } catch (error) {
        const message =
          error.response?.data?.message ||
          (error.response?.data?.errors
            ? Object.values(error.response.data.errors).flat().join(' ')
            : 'Ocurrió un error al registrar el cliente.');

        return {
          success: false,
          message,
          errors: error.response?.data?.errors || {},
        };
      } finally {
        this.saving = false;
      }
    },

    // 1. MÉTODO EDITAR / ACTUALIZAR
    async updateClient(id, payload) {
      this.updating = true;
      try {
        const response = await api.put(`/clients/${id}`, payload);
        const updated = response.data.client || response.data.data || response.data;

        const index = this.clients.findIndex((c) => c.id === id);
        if (index !== -1 && updated) {
          this.clients[index] = { ...this.clients[index], ...updated };
        }

        return {
          success: true,
          message: response.data.message || 'Empresa actualizada exitosamente.',
          client: updated,
        };
      } catch (error) {
        const message =
          error.response?.data?.message ||
          (error.response?.data?.errors
            ? Object.values(error.response.data.errors).flat().join(' ')
            : 'Ocurrió un error al actualizar los datos.');

        return { success: false, message };
      } finally {
        this.updating = false;
      }
    },

    // 2. MÉTODO DESACTIVAR / SUSPENDER (TOGGLE STATUS)
    async toggleClientStatus(id) {
      try {
        const response = await api.patch(`/clients/${id}/toggle-status`);
        const updated = response.data.client || response.data.data;

        const index = this.clients.findIndex((c) => c.id === id);
        if (index !== -1) {
          if (updated && updated.is_active !== undefined) {
            this.clients[index].is_active = updated.is_active;
          } else {
            this.clients[index].is_active = !this.clients[index].is_active;
          }
        }

        return {
          success: true,
          message: response.data.message || 'Estatus de la empresa actualizado.',
        };
      } catch (error) {
        const message = error.response?.data?.message || 'Error al cambiar el estatus.';
        return { success: false, message };
      }
    },

    // 3. MÉTODO DESTROY / ELIMINAR
    async destroyClient(id) {
      this.deleting = true;
      try {
        const response = await api.delete(`/clients/${id}`);

        const index = this.clients.findIndex((c) => c.id === id);
        if (index !== -1) {
          this.clients.splice(index, 1);
        }

        return {
          success: true,
          message: response.data.message || 'Empresa eliminada del sistema.',
        };
      } catch (error) {
        const message = error.response?.data?.message || 'Error al eliminar la empresa.';
        return { success: false, message };
      } finally {
        this.deleting = false;
      }
    },

    addClientToTop(client) {
			console.log('Adding client to top:', client);
			this.clients.unshift(client)
		},
  },
});
