<template>
  <v-card flat class="list-orders-card elevation-0">
    <div class="card-table-header text-white px-6 py-4 border-bottom bg-slate-50 d-flex flex-wrap align-center justify-space-between gap-3">
      <div class="d-flex align-center">
        <v-icon icon="mdi-history" color="#07254A" class="mr-2" size="20"></v-icon>
        <h3 class="text-subtitle-1 font-weight-bold text-slate-800 mb-0">
          Órdenes Generadas, Pagos y Agenda
        </h3>
      </div>

      <div class="d-flex align-center gap-2 flex-wrap">
        <v-text-field
          v-model="search"
          placeholder="Buscar cliente, candidato o prueba..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          hide-details
          rounded="lg"
          bg-color="#ffffff"
          color="#07254A"
          style="min-width: 260px;"
        ></v-text-field>

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
    </div>

    <v-card-text class="pa-0">
      <v-data-table
        :headers="headers"
        :items="orders"
        :search="search"
        :loading="loadingOrders"
        hover
        density="comfortable"
        no-data-text="No hay órdenes registradas"
      >
        <template v-slot:item="{ item }">
          <tr class="table-row">
            <!-- Empresa Cliente -->
            <td class="py-3">
              <div class="font-weight-bold text-slate-800">
                {{ item.client?.company_name || item.client?.trade_name || 'Cliente' }}
              </div>
              <div class="text-caption text-grey font-mono">
                {{ item.client?.rfc || 'SIN RFC' }}
              </div>
            </td>

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

            <!-- Acciones: Agendar Cita + Revisar/Aprobar Pago + Subir Comprobante -->
            <td class="text-end pr-4">
              <div class="d-flex align-center justify-end gap-2 flex-wrap">
                <!-- 1. Agendar Cita Directo (Siempre habilitado para Admin / Ventas) -->
                <v-btn
                  size="small"
                  variant="flat"
                  color="#10B981"
                  rounded="lg"
                  prepend-icon="mdi-calendar-clock"
                  class="text-none font-weight-bold text-white"
                  @click="$router.push(`/admin/appointments/book-order/${item.id}`)"
                >
                  Agendar Cita
                </v-btn>

                <!-- 2. Revisar / Aprobar Pago -->
                <v-btn
                  size="small"
                  variant="flat"
                  color="#07254A"
                  rounded="lg"
                  prepend-icon="mdi-shield-search"
                  class="text-none font-weight-bold text-white"
                  @click="$emit('open-validate', item)"
                >
                  Revisar Pago
                </v-btn>

                <!-- 3. Subir / Reemplazar Comprobante -->
                <v-btn
                  size="small"
                  variant="outlined"
                  color="#07254A"
                  rounded="lg"
                  prepend-icon="mdi-file-upload-outline"
                  class="text-none font-weight-bold"
                  :disabled="item.payment_status === 'approved'"
                  @click="openUploadModal(item)"
                >
                  {{ getButtonLabel(item.payment_status) }}
                </v-btn>
              </div>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card-text>

    <!-- Modal para Subir / Reemplazar Comprobante -->
    <v-dialog v-model="uploadDialog" max-width="480">
      <v-card rounded="xl">
        <v-card-title class="px-6 py-4 bg-slate-50 border-bottom d-flex align-center justify-space-between">
          <span class="text-subtitle-1 font-weight-bold text-slate-800">
            Adjuntar Comprobante de Pago
          </span>
          <v-btn icon="mdi-close" variant="text" size="small" @click="uploadDialog = false"></v-btn>
        </v-card-title>

        <v-card-text class="pa-6">
          <div class="mb-4 text-caption text-slate-600" v-if="selectedOrder">
            <div><strong>Empresa:</strong> {{ selectedOrder.client?.company_name }}</div>
            <div><strong>Evaluado:</strong> {{ selectedOrder.examinee?.full_name }}</div>
            <div><strong>Importe Total:</strong> ${{ formatMoney(selectedOrder.total) }} MXN</div>
          </div>

          <v-file-input
            v-model="receiptFile"
            label="Selecciona comprobante (PDF, JPG, PNG)"
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
          <v-btn variant="text" class="text-none" @click="uploadDialog = false">Cancelar</v-btn>
          <v-btn
            color="#07254A"
            variant="flat"
            rounded="lg"
            class="text-none font-weight-bold text-white px-5"
            :loading="uploadingReceipt"
            :disabled="!receiptFile"
            @click="submitReceipt"
          >
            Subir Comprobante
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
import api from '@/services/api';

export default {
  name: 'AdminListOrdersComponent',
  emits: ['open-validate'],
  data() {
    return {
      orders: [],
      search: '',
      loadingOrders: false,
      uploadDialog: false,
      selectedOrder: null,
      receiptFile: null,
      uploadingReceipt: false,
      snackbar: { show: false, text: '', color: 'success' },
      headers: [
        { title: 'Empresa Cliente', key: 'client.company_name', align: 'start' },
        { title: 'Candidato Evaluado', key: 'examinee.full_name', align: 'start' },
        { title: 'Prueba Solicitada', key: 'evaluation_type.name', align: 'start' },
        { title: 'Total (c/ IVA)', key: 'total', align: 'end' },
        { title: 'Estatus del Pago', key: 'payment_status', align: 'center' },
        { title: 'Acciones', key: 'actions', align: 'end', sortable: false },
      ],
    };
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

    openUploadModal(order) {
      this.selectedOrder = order;
      this.receiptFile = null;
      this.uploadDialog = true;
    },

    async submitReceipt() {
      if (!this.selectedOrder || !this.receiptFile) return;

      const fileToUpload = Array.isArray(this.receiptFile) ? this.receiptFile[0] : this.receiptFile;
      const formData = new FormData();
      formData.append('file', fileToUpload);

      this.uploadingReceipt = true;
      try {
        const res = await api.post(`/admin/evaluation-orders/${this.selectedOrder.id}/receipt`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        this.notify(res.data?.message || 'Comprobante cargado exitosamente.');
        const updated = res.data?.order;
        if (updated) {
          this.updateOrderItem(updated);
        } else {
          await this.fetchOrders();
        }
        this.uploadDialog = false;
      } catch (e) {
        this.notify(e.response?.data?.message || 'Error al subir el comprobante.', 'error');
      } finally {
        this.uploadingReceipt = false;
      }
    },

    async fetchOrders() {
      this.loadingOrders = true;
      try {
        const res = await api.get('/admin/evaluation-orders');
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

    updateOrderItem(updated) {
      const idx = this.orders.findIndex((o) => o.id === updated.id);
      if (idx !== -1) {
        this.orders.splice(idx, 1, updated);
      }
    },

    getButtonLabel(status) {
      if (status === 'approved') return 'Pagado';
      if (status === 'rejected') return 'Reemplazar Ficha';
      if (status === 'under_review') return 'Cambiar Ficha';
      return 'Subir Ficha';
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
