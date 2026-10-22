import { defineStore } from 'pinia';
import api from '@/services/api';

export const useUserStore = defineStore('users', {
  state: () => ({
    users: [],
    roles: [],
    loading: false,
    error: null,
  }),

  getters: {
    totalUsers: (state) => state.users.length,
    activeUsers: (state) => state.users.filter(u => !u.deleted_at).length,
    inactiveUsers: (state) => state.users.filter(u => !!u.deleted_at).length,

    // Getters auxiliares por perfil
    psychologists: (state) => state.users.filter(u => u.role?.name === 'psychologist' && !u.deleted_at),
    socialWorkers: (state) => state.users.filter(u => u.role?.name === 'social_work' && !u.deleted_at),
    salesAgents: (state) => state.users.filter(u => u.role?.name === 'sales' && !u.deleted_at),
  },

  actions: {
    /**
     * Carga exclusivamente el catálogo de roles para selects
     */
    async fetchRoles() {
      try {
        const response = await api.get('/users/roles');
        this.roles = response.data || [];
      } catch (err) {
        console.error('Error al cargar roles:', err);
      }
    },

		async updateUser(id, payload) {
      this.loading = true;
      try {
        const response = await api.put(`/users/${id}`, payload);
        const updated = response.data.data || response.data.user || response.data;

        const index = this.users.findIndex((u) => u.id === id);
        if (index !== -1 && updated) {
          this.users[index] = { ...this.users[index], ...updated };
        }

        return {
          success: true,
          message: response.data.message || 'Colaborador actualizado exitosamente.',
          user: updated,
        };
      } catch (error) {
        const message =
          error.response?.data?.message ||
          (error.response?.data?.errors
            ? Object.values(error.response.data.errors).flat().join(' ')
            : 'Ocurrió un error al actualizar los datos.');

        return { success: false, message };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Carga de colaboradores para la tabla
     */
    async fetchUsers() {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.get('/users/dt');
        this.users = response.data.users || [];
        if (response.data.roles) {
          this.roles = response.data.roles;
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al cargar los usuarios.';
        console.error('Error fetching users:', err);
      } finally {
        this.loading = false;
      }
    },

    addUser(newUser) {
      this.users.unshift(newUser);
    },

    async reloadList() {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.get('/users/dt');
        this.users = response.data.users || response.data || [];
        if (response.data.roles) {
          this.roles = response.data.roles;
        }
      } catch (err) {
        this.error = 'Error al recargar la lista de colaboradores.';
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    async toggleStatus(user) {
      try {
        const response = await api.post(`/users/${user.id}/toggle-status`);
        const updatedUser = response.data.user;

        const index = this.users.findIndex(u => u.id === user.id);
        if (index !== -1) {
          this.users[index] = { ...this.users[index], ...updatedUser };
        }

        return {
          success: true,
          message: response.data.message || 'Estatus de colaborador actualizado.'
        };
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || 'Error al actualizar el estatus.'
        };
      }
    },

    async removeUser(id) {
      try {
        const response = await api.delete(`/users/${id}`);
        const index = this.users.findIndex(u => u.id === id);

        if (index !== -1) {
          this.users[index].deleted_at = new Date().toISOString();
        }

        return {
          success: true,
          message: response.data.message || 'Colaborador dado de baja.'
        };
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || 'Error al dar de baja al usuario.'
        };
      }
    },
  },
});
