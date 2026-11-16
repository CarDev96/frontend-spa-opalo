<template>
  <v-card flat class="list-orders-card elevation-0">
    <div class="card-table-header text-white px-6 py-4 border-bottom bg-slate-50 d-flex flex-wrap align-center justify-space-between gap-3">
      <div class="d-flex align-center">
        <v-icon icon="mdi-history" color="#07254A" class="mr-2" size="20"></v-icon>
        <h3 class="text-subtitle-1 font-weight-bold text-slate-800 mb-0">
          Órdenes Generadas y Comprobantes de Pago
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
        :headers="dynamicHeaders"
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

            <!-- Estatus PO (Solo si el cliente tiene activado requires_purchase_order) -->
            <td v-if="clientProfile?.requires_purchase_order" class="text-center">
              <v-chip
                size="small"
                :color="getPoStatusColor(item.po_status)"
                variant="flat"
                class="font-weight-bold text-white status-chip"
              >
                {{ formatPoStatus(item.po_status) }}
              </v-chip>
              <div v-if="item.po_status === 'po_rejected'" class="text-caption text-error mt-1 font-weight-medium">
                Motivo: {{ item.po_rejection_reason }}
              </div>
            </td>

            <!-- Estatus Pago -->
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

            <!-- Acciones -->
            <td class="text-end pr-4">
              <div class="d-flex align-center justify-end gap-2 flex-wrap">
                <!-- Botón Subir PO (Visible solo si el cliente requiere PO) -->
                <v-btn
                  v-if="clientProfile?.requires_purchase_order"
                  size="small"
                  variant="outlined"
                  color="#07254A"
                  rounded="lg"
                  prepend-icon="mdi-file-upload-outline"
                  class="text-none font-weight-bold"
                  @click="openPoModal(item)"
                >
                  {{ item.po_file_path ? 'Cambiar OC' : 'Subir OC' }}
                </v-btn>

                <!-- Botón Subir Comprobante (Bloqueado solo si requiere PO y no está aprobada) -->
                <v-tooltip
                  :text="clientProfile?.requires_purchase_order && item.po_status !== 'po_approved' ? 'Debes subir y esperar la aprobación de tu Orden de Compra (PO) primero' : ''"
                  location="top"
                >
                  <template #activator="{ props }">
                    <div v-bind="props" class="d-inline-block">
                      <v-btn
                        size="small"
                        variant="flat"
                        :color="item.payment_status === 'approved' ? 'success' : '#07254A'"
                        rounded="lg"
                        prepend-icon="mdi-cash-check"
                        class="text-none font-weight-bold text-white"
                        :disabled="clientProfile?.requires_purchase_order && item.po_status !== 'po_approved'"
                        @click="goToUploadReceipt(item.id)"
                      >
                        {{ item.payment_status === 'approved' ? 'Pagado' : 'Subir Pago' }}
                      </v-btn>
                    </div>
                  </template>
                </v-tooltip>
              </div>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card-text>

    <!-- Modal para Subir Orden de Compra (PO) -->
    <v-dialog v-model="poDialog" max-width="480">
      <v-card rounded="xl">
        <v-card-title class="px-6 py-4 bg-slate-50 border-bottom d-flex align-center justify-space-between">
          <span class="text-subtitle-1 font-weight-bold text-slate-800">
            Cargar Orden de Compra (OC)
          </span>
          <v-btn icon="mdi-close" variant="text" size="small" @click="poDialog = false"></v-btn>
        </v-card-title>

        <v-card-text class="pa-6">
          <div class="mb-4 text-caption text-slate-600" v-if="selectedOrder">
            <div><strong>Evaluado:</strong> {{ selectedOrder.examinee?.full_name }}</div>
            <div><strong>Total:</strong> ${{ formatMoney(selectedOrder.total) }} MXN</div>
          </div>

          <v-file-input
            v-model="poFile"
            label="Selecciona Orden de Compra (PDF, JPG, PNG)"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            prepend-inner-icon="mdi-paperclip"
            prepend-icon=""
            variant="outlined"
            density="comfortable"
            rounded="lg"
            color="#07254A"
            show-size
          ></v-file-input>
        </v-card-text>

        <v-card-actions class="px-6 pb-5 pt-0 d-flex justify-end gap-2">
          <v-btn variant="text" class="text-none" @click="poDialog = false">Cancelar</v-btn>
          <v-btn
            color="#07254A"
            variant="flat"
            rounded="lg"
            class="text-none font-weight-bold text-white px-5"
            :loading="uploadingPo"
            :disabled="!poFile"
            @click="submitPo"
          >
            Enviar OC
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="top right" timeout="3500">
      {{ snackbar.text }}
    </v-snackbar>
  </v-card>
</template>

<script>
import { useAuthStore } from '@/store/auth';
import api from '@/services/api';

export default {
  name: 'ListOrdersComponent',
  data() {
    return {
      orders: [],
      loadingOrders: false,
      poDialog: false,
      selectedOrder: null,
      poFile: null,
      uploadingPo: false,
      snackbar: { show: false, text: '', color: 'success' },
    };
  },

  computed: {
    clientProfile() {
      const authStore = useAuthStore();
      return authStore.user?.client || authStore.client || {};
    },

    dynamicHeaders() {
      const headers = [
        { title: 'Candidato Evaluado', key: 'examinee.full_name', align: 'start' },
        { title: 'Prueba Solicitada', key: 'evaluation_type.name', align: 'start' },
        { title: 'Total (c/ IVA)', key: 'total', align: 'end' },
      ];

      if (this.clientProfile?.requires_purchase_order) {
        headers.push({ title: 'Estatus PO', key: 'po_status', align: 'center' });
      }

      headers.push(
        { title: 'Estatus del Pago', key: 'payment_status', align: 'center' },
        { title: 'Acciones', key: 'actions', align: 'end', sortable: false }
      );

      return headers;
    },
  },

  mounted() {
    this.fetchOrders();
  },

  methods: {
    notify(text, color = 'success') {
      this.snackbar.text = text;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },

    formatMoney(val) {
      return Number(val || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 });
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

    openPoModal(order) {
      this.selectedOrder = order;
      this.poFile = null;
      this.poDialog = true;
    },

    async submitPo() {
      if (!this.selectedOrder || !this.poFile) return;
      const fileToUpload = Array.isArray(this.poFile) ? this.poFile[0] : this.poFile;
      const formData = new FormData();
      formData.append('file', fileToUpload);

      this.uploadingPo = true;
      try {
        const res = await api.post(`/portal/evaluation-orders/${this.selectedOrder.id}/po`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        this.notify(res.data?.message || 'Orden de Compra cargada exitosamente.');
        await this.fetchOrders();
        this.poDialog = false;
      } catch (e) {
        this.notify(e.response?.data?.message || 'Error al subir la PO.', 'error');
      } finally {
        this.uploadingPo = false;
      }
    },

    getPoStatusColor(status) {
      const map = {
        pending_po: '#64748B',
        po_under_review: '#0284C7',
        po_approved: '#10B981',
        po_rejected: '#EF4444',
      };
      return map[status] || '#64748B';
    },

    formatPoStatus(status) {
      const map = {
        pending_po: 'Sin PO',
        po_under_review: 'PO En Validación',
        po_approved: 'PO Aprobada',
        po_rejected: 'PO Rechazada',
      };
      return map[status] || 'Sin PO';
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
