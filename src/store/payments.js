import { defineStore } from 'pinia';
import api from '@/services/api';

export const usePaymentsStore = defineStore('payments', {
  state: () => ({
    bankAccounts: {
      fiscal: null,
      non_fiscal: null,
    },
    receipts: [],
    loadingAccounts: false,
    loadingReceipts: false,
    uploadingReceipt: false,
  }),

  getters: {
    /**
     * Retorna las cuentas como array plano con propiedades nativas para Vuetify
     */
    bankAccountList: (state) => {
      const list = [];

      if (state.bankAccounts.fiscal) {
        list.push({
          ...state.bankAccounts.fiscal,
          title: `${state.bankAccounts.fiscal.bank_name} (Con Factura)`,
          subtitle: `Titular: ${state.bankAccounts.fiscal.beneficiary} • CLABE: ${state.bankAccounts.fiscal.clabe}`,
        });
      }

      if (state.bankAccounts.non_fiscal) {
        list.push({
          ...state.bankAccounts.non_fiscal,
          title: `${state.bankAccounts.non_fiscal.bank_name} (Sin Factura)`,
          subtitle: `Titular: ${state.bankAccounts.non_fiscal.beneficiary} • CLABE: ${state.bankAccounts.non_fiscal.clabe}`,
        });
      }

      return list;
    },

    /**
     * Obtiene el UUID de la cuenta fiscal predeterminada
     */
    defaultFiscalAccountId: (state) => {
      return state.bankAccounts.fiscal?.id || null;
    },
  },

  actions: {
    /**
     * Obtiene las cuentas bancarias activas
     */
    async fetchBankAccounts(force = false) {
      if (!force && (this.bankAccounts.fiscal || this.bankAccounts.non_fiscal)) {
        return this.bankAccounts;
      }

      this.loadingAccounts = true;
      try {
        const response = await api.get('settings/bank-accounts');
        this.bankAccounts = response.data || { fiscal: null, non_fiscal: null };
        return this.bankAccounts;
      } catch (error) {
        console.error('Error al cargar cuentas bancarias:', error);
        throw error;
      } finally {
        this.loadingAccounts = false;
      }
    },

    /**
     * Consulta el historial de comprobantes del cliente
     */
    async fetchReceipts() {
      this.loadingReceipts = true;
      try {
        const response = await api.get('/clients/payment-receipts');
        this.receipts = response.data || [];
        return this.receipts;
      } catch (error) {
        console.error('Error al obtener comprobantes:', error);
        throw error;
      } finally {
        this.loadingReceipts = false;
      }
    },

    /**
     * Sube un comprobante nuevo y actualiza el historial reactivo
     */
    async uploadReceipt(formData) {
      this.uploadingReceipt = true;
      try {
        const response = await api.post('/clients/payment-receipts', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (response.data?.data) {
          this.receipts.unshift(response.data.data);
        } else {
          await this.fetchReceipts();
        }

        return response.data;
      } catch (error) {
        console.error('Error al subir comprobante:', error);
        throw error;
      } finally {
        this.uploadingReceipt = false;
      }
    },
  },
});
