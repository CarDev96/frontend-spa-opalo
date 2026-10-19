import { defineStore } from 'pinia';
import api from '@/services/api';

export const useAdminPsychometricTestsStore = defineStore('adminPsychometricTests', {
  state: () => ({
    tests: [],
    loading: false,
    saving: false,
  }),

  actions: {
    async fetchTests() {
      this.loading = true;
      try {
        const res = await api.get('/admin/psychometric-tests');
        this.tests = res.data?.data || [];
      } catch (e) {
        console.error('Error cargando catálogo de pruebas:', e);
      } finally {
        this.loading = false;
      }
    },

    async saveTest(formData, id = null) {
      this.saving = true;
      try {
        const url = id ? `/admin/psychometric-tests/${id}` : '/admin/psychometric-tests';
        const res = await api.post(url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        await this.fetchTests();
        return { success: true, message: res.data?.message || 'Prueba guardada correctamente.' };
      } catch (e) {
        return {
          success: false,
          message: e.response?.data?.message || 'Error al guardar la prueba.',
        };
      } finally {
        this.saving = false;
      }
    },

    async toggleStatus(id) {
      try {
        const res = await api.patch(`/admin/psychometric-tests/${id}/toggle-status`);
        await this.fetchTests();
        return { success: true, message: res.data?.message || 'Estatus actualizado.' };
      } catch (e) {
        return { success: false, message: e.response?.data?.message || 'Error al cambiar estatus.' };
      }
    },

    async deleteTest(id) {
      try {
        const res = await api.delete(`/admin/psychometric-tests/${id}`);
        await this.fetchTests();
        return { success: true, message: res.data?.message || 'Prueba eliminada.' };
      } catch (e) {
        return { success: false, message: e.response?.data?.message || 'Error al eliminar.' };
      }
    },
  },
});
