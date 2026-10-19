<template>
  <v-dialog v-model="visible" max-width="650" persistent>
    <v-card flat class="rounded-xl overflow-hidden border">
      <!-- Header Institucional -->
      <div class="dialog-header px-6 py-4 d-flex align-center justify-space-between text-white">
        <div class="d-flex align-center">
          <v-avatar size="36" color="rgba(255,255,255,0.15)" class="mr-3">
            <v-icon icon="mdi-shield-check-outline" color="#ffffff" size="20"></v-icon>
          </v-avatar>
          <div>
            <h3 class="text-subtitle-1 font-weight-bold text-white mb-0">Revisión de Comprobante</h3>
            <span class="text-caption text-white opacity-80">Validación contable para liberación de cita</span>
          </div>
        </div>
        <v-btn icon="mdi-close" variant="text" size="small" color="white" @click="close"></v-btn>
      </div>

      <v-card-text class="pa-6 bg-white" v-if="order">
        <!-- Ficha de la Orden y Candidato -->
        <div class="pa-4 rounded-xl border bg-slate-50 mb-4">
          <div class="d-flex justify-space-between align-start mb-2">
            <div>
              <span class="text-caption text-slate-500 font-weight-bold d-block">EMPRESA CLIENTE</span>
              <strong class="text-body-2 text-slate-900">{{ order.client?.company_name || 'Sin empresa' }}</strong>
            </div>
            <v-chip size="small" :color="getStatusColor(order.payment_status)" variant="flat" class="text-white font-weight-bold">
              {{ formatStatus(order.payment_status) }}
            </v-chip>
          </div>

          <v-divider class="my-2"></v-divider>

          <v-row dense class="text-caption">
            <v-col cols="6">
              <span class="text-slate-500 font-weight-bold">Evaluado:</span>
              <div class="font-weight-bold text-slate-800">{{ order.examinee?.full_name || 'No asignado' }}</div>
              <div class="font-mono text-slate-500">{{ order.examinee?.curp || 'SIN CURP' }}</div>
            </v-col>
            <v-col cols="6">
              <span class="text-slate-500 font-weight-bold">Prueba Solicitada:</span>
              <div class="font-weight-bold text-slate-800">{{ order.evaluation_type?.name }}</div>
              <div class="text-slate-500">Modalidad: {{ order.evaluation_type?.modality }}</div>
            </v-col>
          </v-row>
        </div>

        <!-- Resumen Financiero y Comprobante Adjunto -->
        <div class="d-flex align-center justify-space-between pa-4 rounded-xl border bg-white mb-4">
          <div>
            <span class="text-caption text-slate-500 font-weight-bold d-block">TOTAL A VALIDAR (c/ IVA)</span>
            <span class="text-h6 font-mono font-weight-bold text-primary">
              ${{ formatMoney(order.total) }} MXN
            </span>
          </div>

          <v-btn
            color="#07254A"
            variant="flat"
            rounded="lg"
            prepend-icon="mdi-file-eye-outline"
            class="text-none font-weight-bold text-white"
            :loading="loadingReceipt"
            @click="openReceipt"
          >
            Ver Comprobante
          </v-btn>
        </div>

        <!-- Formulario de Dictamen -->
        <v-form ref="validateFormRef">
          <label class="field-label">Resolución del Comprobante *</label>
          <v-radio-group v-model="form.status" inline density="compact" class="mb-2">
            <v-radio label="Aprobar Pago" value="approved" color="success"></v-radio>
            <v-radio label="Rechazar Pago" value="rejected" color="error"></v-radio>
          </v-radio-group>

          <!-- Si es Rechazado, pide el motivo -->
          <div v-if="form.status === 'rejected'" class="mt-2">
            <label class="field-label text-error">Motivo de Rechazo (Visible para el Cliente) *</label>
            <v-textarea
              v-model="form.rejection_reason"
              rows="3"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              color="error"
              placeholder="Ej. El comprobante no es legible / El monto no cubre el total con IVA / Falta clave de rastreo SPEI"
              :rules="[(v) => !!v || 'Debes detallar el motivo del rechazo']"
            ></v-textarea>
          </div>

          <!-- Notas Internas Opcionales -->
          <div v-else class="mt-2">
            <label class="field-label">Notas de Validación Administrativa (Opcional)</label>
            <v-text-field
              v-model="form.notes"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              color="#07254A"
              placeholder="Ej. SPEI verificado en banca en línea BBVA"
            ></v-text-field>
          </div>
        </v-form>
      </v-card-text>

      <div class="px-6 py-4 border-top bg-slate-50 d-flex justify-end gap-2">
        <v-btn variant="text" rounded="lg" class="text-none font-weight-bold text-slate-600" @click="close">
          Cancelar
        </v-btn>
        <v-btn
          :color="form.status === 'approved' ? 'success' : 'error'"
          variant="flat"
          rounded="lg"
          class="text-none font-weight-bold text-white px-5"
          :loading="submitting"
          @click="submitResolution"
        >
          {{ form.status === 'approved' ? 'Confirmar y Aprobar' : 'Rechazar Pago' }}
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'ValidatePaymentModalComponent',
  emits: ['payment-validated'],
  data() {
    return {
      visible: false,
      order: null,
      submitting: false,
      loadingReceipt: false,
      form: {
        status: 'approved',
        rejection_reason: '',
        notes: '',
      },
    };
  },
  methods: {
    open(order) {
      this.order = order;
      this.form.status = order.payment_status === 'rejected' ? 'rejected' : 'approved';
      this.form.rejection_reason = order.rejection_reason || '';
      this.form.notes = '';
      this.visible = true;
    },

    close() {
      this.visible = false;
      this.order = null;
      this.loadingReceipt = false;
      this.submitting = false;
    },

    formatMoney(val) {
      return Number(val || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 });
    },

    async openReceipt() {
      if (!this.order?.id) return;

      this.loadingReceipt = true;
      try {
        // Solicitar el archivo binario mediante stream autenticado como en el visor de expedientes
        const response = await api.get(`/admin/evaluation-orders/${this.order.id}/receipt/stream`, {
          responseType: 'blob',
        });

        const contentType = response.headers['content-type'] || 'application/pdf';
        const fileBlob = new Blob([response.data], { type: contentType });
        const blobUrl = window.URL.createObjectURL(fileBlob);

        window.open(blobUrl, '_blank');
      } catch (e) {
        console.error('Error al visualizar comprobante:', e);
      } finally {
        this.loadingReceipt = false;
      }
    },

    async submitResolution() {
      if (this.$refs.validateFormRef) {
        const { valid } = await this.$refs.validateFormRef.validate();
        if (!valid) return;
      }

      this.submitting = true;
      try {
        const res = await api.post(`/admin/evaluation-orders/${this.order.id}/validate-payment`, this.form);
        this.$emit('payment-validated', res.data.data);
        this.close();
      } catch (e) {
        console.error('Error al validar pago:', e);
      } finally {
        this.submitting = false;
      }
    },

    getStatusColor(status) {
      const map = {
        pending_receipt: '#64748B',
        under_review: '#0284C7',
        approved: '#10B981',
        rejected: '#EF4444',
      };
      return map[status] || '#64748B';
    },

    formatStatus(status) {
      const map = {
        pending_receipt: 'Pendiente de Pago',
        under_review: 'En Validación',
        approved: 'Aprobado',
        rejected: 'Rechazado',
      };
      return map[status] || 'Pendiente';
    },
  },
};
</script>

<style scoped>
.dialog-header {
  background: linear-gradient(135deg, #07254A 0%, #0e1726 100%) !important;
}

.bg-slate-50 {
  background-color: #f8fafc;
}

.field-label {
  display: block;
  font-size: 0.76rem;
  font-weight: 700;
  color: #334155;
  margin-bottom: 4px;
}

.font-mono {
  font-family: monospace;
}

.gap-2 {
  gap: 8px;
}
</style>
