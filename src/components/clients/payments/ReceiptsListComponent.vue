<template>
  <v-container fluid class="pa-2 pa-sm-4 max-wrapper">
    <v-card flat class="receipts-list-card elevation-0">
      <!-- Header de la tabla -->
      <div class="px-4 py-3 px-sm-6 py-sm-4 border-bottom d-flex align-center justify-space-between bg-white">
        <div>
          <h3 class="text-subtitle-2 font-weight-bold text-slate-800 mb-0">Comprobantes Reportados</h3>
          <span class="text-caption text-grey">Estatus de revisión y validación administrativa</span>
        </div>
        <v-btn
          icon="mdi-refresh"
          variant="text"
          size="small"
          color="grey-darken-1"
          :loading="loadingReceipts"
          @click="fetchReceipts"
        ></v-btn>
      </div>

      <!-- Tabla -->
      <v-card-text class="pa-0">
        <div class="table-responsive">
          <v-table density="compact" class="receipts-table">
            <thead>
              <tr class="bg-slate-50">
                <th class="text-caption font-weight-bold text-slate-700 py-3">FECHA</th>
                <th class="text-caption font-weight-bold text-slate-700">COMPROBANTE</th>
                <th class="text-caption font-weight-bold text-slate-700">BANCO / CUENTA</th>
                <th class="text-caption font-weight-bold text-slate-700">MONTO</th>
                <th class="text-caption font-weight-bold text-slate-700 text-center">ESTATUS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="receipt in receipts" :key="receipt.id">
                <td class="text-caption text-slate-600">{{ formatDate(receipt.created_at) }}</td>
                <td class="text-caption font-weight-medium">
                  <a
                    v-if="receipt.file_url"
                    :href="receipt.file_url"
                    target="_blank"
                    class="text-decoration-none text-primary d-inline-flex align-center"
                  >
                    <v-icon icon="mdi-file-document-outline" size="16" class="mr-1"></v-icon>
                    <span class="text-truncate" style="max-width: 220px;">{{ receipt.title }}</span>
                  </a>
                  <span v-else class="text-slate-700 d-inline-flex align-center">
                    <v-icon icon="mdi-file-document-outline" size="16" class="mr-1"></v-icon>
                    {{ receipt.title }}
                  </span>
                </td>
                <td class="text-caption">
                  <div class="d-flex align-center">
                    <v-chip
                      size="x-small"
                      :color="receipt.account_type === 'fiscal' ? '#07254A' : '#475569'"
                      class="text-white font-weight-bold mr-2"
                    >
                      {{ receipt.account_type === 'fiscal' ? 'Fiscal' : 'No Fiscal' }}
                    </v-chip>
                    <span class="text-slate-700 font-weight-medium">
                      {{ receipt.bank_account?.bank_name || 'Banco' }}
                    </span>
                  </div>
                </td>
                <td class="text-caption font-mono font-weight-bold text-slate-800">
                  {{ receipt.amount ? `$${Number(receipt.amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : 'N/A' }}
                </td>
                <td class="text-center">
                  <v-chip
                    size="x-small"
                    :color="getStatusColor(receipt.status)"
                    class="font-weight-bold text-capitalize"
                  >
                    {{ formatStatus(receipt.status) }}
                  </v-chip>
                </td>
              </tr>
              <tr v-if="receipts.length === 0">
                <td colspan="5" class="text-center py-8 text-caption text-grey">
                  No hay comprobantes de pago registrados hasta el momento.
                </td>
              </tr>
            </tbody>
          </v-table>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { usePaymentsStore } from '@/store/payments';

export default {
  name: 'ReceiptsListComponent',
  computed: {
    ...mapState(usePaymentsStore, ['receipts', 'loadingReceipts']),
  },
  async mounted() {
    await this.fetchReceipts();
  },
  methods: {
    ...mapActions(usePaymentsStore, ['fetchReceipts']),

    getStatusColor(status) {
      if (status === 'approved') return 'success';
      if (status === 'rejected') return 'error';
      return 'warning';
    },
    formatStatus(status) {
      if (status === 'approved') return 'Aprobado';
      if (status === 'rejected') return 'Rechazado';
      return 'Pendiente';
    },
    formatDate(dateStr) {
      if (!dateStr) return '';
      return new Date(dateStr).toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    },
  },
};
</script>

<style scoped>
.max-wrapper { max-width: 1200px; margin: 0 auto; }
.receipts-list-card {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 12px !important;
  overflow: hidden;
}
.border-bottom { border-bottom: 1px solid #e2e8f0; }
.table-responsive { overflow-x: auto; }
.receipts-table { background-color: #ffffff; }
.font-mono { font-family: monospace; }
</style>
