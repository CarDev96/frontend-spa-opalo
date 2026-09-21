import { defineStore } from 'pinia';
import api from '@/services/api';

export const useAdminPaymentsStore = defineStore('adminPayments', {
  state: () => ({
    receipts: [],
    loading: false,
    updating: false,
    filters: {
      search: '',
      status: 'all',
    },
  }),

  getters: {
    filteredReceipts: (state) => {
      let list = state.receipts;

      if (state.filters.status && state.filters.status !== 'all') {
        list = list.filter((r) => r.status === state.filters.status);
      }

      if (state.filters.search) {
        const query = state.filters.search.toLowerCase().trim();
        list = list.filter((r) => {
          const clientName = r.client?.trade_name || r.client?.company_name || '';
          const clientRfc = r.client?.rfc || '';
          const bankName = r.bank_account?.bank_name || '';
          const fileName = r.title || '';
          const amount = String(r.amount || '');

          return (
            clientName.toLowerCase().includes(query) ||
            clientRfc.toLowerCase().includes(query) ||
            bankName.toLowerCase().includes(query) ||
            fileName.toLowerCase().includes(query) ||
            amount.includes(query)
          );
        });
      }

      return list;
    },

    pendingCount: (state) => {
      return state.receipts.filter((r) => r.status === 'pending').length;
    },
  },

  actions: {
    async fetchReceipts(params = {}) {
      this.loading = true;
      try {
        const response = await api.get('/admin/payment-receipts', { params });
        this.receipts = response.data || [];
        return this.receipts;
      } catch (error) {
        console.error('Error al cargar comprobantes admin:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateReceiptStatus(id, payload) {
      this.updating = true;
      try {
        const response = await api.patch(`/admin/payment-receipts/${id}/status`, payload);
        const updated = response.data?.data;

        const index = this.receipts.findIndex((r) => r.id === id);
        if (index !== -1 && updated) {
          this.receipts[index] = updated;
        }

        return response.data;
      } catch (error) {
        console.error('Error actualizando estatus del comprobante:', error);
        throw error;
      } finally {
        this.updating = false;
      }
    },
  },
});
