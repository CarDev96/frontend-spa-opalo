<template>
  <v-card flat class="list-orders-card elevation-0">
    <div class="card-table-header text-white px-6 py-4 border-bottom bg-slate-50 d-flex flex-wrap align-center justify-space-between gap-3">
      <div class="d-flex align-center">
        <v-icon icon="mdi-history" color="#07254A" class="mr-2" size="20"></v-icon>
        <h3 class="text-subtitle-1 font-weight-bold text-slate-800 mb-0">
          Órdenes Generadas y Comprobantes
        </h3>
      </div>

      <v-btn
        variant="flat"
        size="small"
        color="#07254A"
        prepend-icon="mdi-refresh"
        class="text-none font-weight-bold text-white reload-btn"
        :loading="loadingOrders"
        @click="fetchOrders"
      >
        Recargar
      </v-btn>
    </div>

    <v-card-text class="pa-0">
      <v-data-table
        :headers="headers"
        :items="orders"
        :loading="loadingOrders"
        hover
        density="comfortable"
        no-data-text="No tienes órdenes generadas"
      >
        <template v-slot:item="{ item }">
          <tr class="table-row">
            <!-- Candidato -->
            <td class="py-3">
              <div class="font-weight-bold text-slate-800">{{ item.examinee?.full_name }}</div>
              <div class="text-caption text-grey font-mono">{{ item.examinee?.curp || 'SIN CURP' }}</div>
            </td>

            <!-- Tipo de Prueba -->
            <td>
              <div class="text-body-2 font-weight-medium text-slate-800">
                {{ item.evaluation_type?.name }}
              </div>
              <div class="text-caption text-slate-400">
                Modalidad: {{ item.evaluation_type?.modality }}
              </div>
            </td>

            <!-- Total con IVA -->
            <td class="text-end font-mono font-weight-bold text-slate-800">
              ${{ formatMoney(item.total) }} MXN
            </td>

            <!-- Estatus -->
            <td class="text-center">
              <v-chip
                size="small"
                :color="getPaymentStatusColor(item.payment_status)"
                variant="flat"
                class="font-weight-bold text-white status-chip"
              >
                {{ formatPaymentStatus(item.payment_status) }}
              </v-chip>

              <div v-if="item.payment_status === 'rejected'" class="text-caption text-error mt-1 font-weight-medium">
                Motivo: {{ item.rejection_reason }}
              </div>
            </td>

            <!-- Botón que redirige a Comprobantes de Pago -->
            <td class="text-end pr-4">
              <div class="d-flex align-center justify-end gap-2">
                <v-btn
                  v-if="item.receipt_url"
                  size="small"
                  variant="outlined"
                  color="#07254A"
                  rounded="lg"
                  prepend-icon="mdi-file-eye-outline"
                  class="text-none font-weight-bold"
                  @click="openFile(item.receipt_url)"
                >
                  Ver Ficha
                </v-btn>

                <v-btn
                  size="small"
                  variant="flat"
                  :color="item.payment_status === 'approved' ? 'success' : (item.payment_status === 'rejected' ? 'error' : '#07254A')"
                  rounded="lg"
                  :prepend-icon="item.payment_status === 'approved' ? 'mdi-check-decagram' : 'mdi-file-upload-outline'"
                  class="text-none font-weight-bold text-white"
                  :disabled="item.payment_status === 'approved'"
                  @click="goToUploadReceipt(item.id)"
                >
                  {{ getButtonLabel(item.payment_status) }}
                </v-btn>
              </div>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'ListOrdersComponent',
  data() {
    return {
      orders: [],
      loadingOrders: false,
      headers: [
        { title: 'Candidato Evaluado', key: 'examinee.full_name', align: 'start' },
        { title: 'Prueba Solicitada', key: 'evaluation_type.name', align: 'start' },
        { title: 'Total (c/ IVA)', key: 'total', align: 'end' },
        { title: 'Estatus del Pago', key: 'payment_status', align: 'center' },
        { title: 'Comprobante', key: 'actions', align: 'end', sortable: false },
      ],
    };
  },

  mounted() {
    this.fetchOrders();
  },

  methods: {
    formatMoney(val) {
      return Number(val || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 });
    },

    openFile(url) {
      if (url) window.open(url, '_blank');
    },

    goToUploadReceipt(orderId) {
      this.$router.push({
        path: '/portal/payment-receipts',
        query: { order_id: orderId },
      });
    },

    async fetchOrders() {
      this.loadingOrders = true;
      try {
        const res = await api.get('/portal/evaluation-orders');
        const data = res.data?.data || res.data || [];
        this.orders = Array.isArray(data) ? data : [];
      } catch (e) {
        console.error('Error al cargar órdenes:', e);
      } finally {
        this.loadingOrders = false;
      }
    },

    appendOrder(newOrder) {
      if (newOrder) {
        this.orders.unshift(newOrder);
      }
    },

    getButtonLabel(status) {
      if (status === 'approved') return 'Aprobado';
      if (status === 'rejected') return 'Reemplazar Pago';
      if (status === 'under_review') return 'Cambiar Ficha';
      return 'Subir Comprobante';
    },

    getPaymentStatusColor(status) {
      const map = {
        pending_receipt: '#64748B',
        under_review: '#0284C7',
        approved: '#10B981',
        rejected: '#EF4444',
      };
      return map[status] || '#64748B';
    },

    formatPaymentStatus(status) {
      const map = {
        pending_receipt: 'Pendiente de Pago',
        under_review: 'En Validación',
        approved: 'Pago Aprobado',
        rejected: 'Rechazado',
      };
      return map[status] || 'Pendiente';
    },
  },
};
</script>

<style scoped>
.list-orders-card {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 16px !important;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04) !important;
}

.bg-slate-50 {
  background-color: #f8fafc;
}

.status-chip {
  padding: 0 8px !important;
  height: 22px !important;
  font-size: 0.72rem !important;
}

.reload-btn {
  border-radius: 8px !important;
}

.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
</style>
