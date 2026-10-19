<template>
  <div class="upload-receipt-wrapper">
    <!-- Estado de Carga Inicial -->
    <div v-if="loadingOrder" class="text-center py-12">
      <v-progress-circular indeterminate color="#07254A" size="48"></v-progress-circular>
      <div class="text-caption text-grey mt-3 font-weight-bold">Cargando datos de la orden de evaluación...</div>
    </div>

    <!-- Si no se encuentra la orden -->
    <v-alert
      v-else-if="!order"
      type="warning"
      variant="tonal"
      class="rounded-xl border pa-4"
    >
      <div class="font-weight-bold">No se encontró la orden de evaluación solicitada.</div>
      <div class="text-caption">Verifica el enlace o selecciona una orden desde el listado.</div>
      <v-btn
        variant="flat"
        color="#07254A"
        size="small"
        rounded="lg"
        class="text-none font-weight-bold text-white mt-3"
        @click="$router.push('/portal/orders')"
      >
        Volver a Mis Órdenes
      </v-btn>
    </v-alert>

    <!-- INTERFAZ PRINCIPAL DEDICADA A ESTA ORDEN Y USUARIO -->
    <div v-else>
      <!-- TARJETA 1: Resumen de la Orden y Candidato -->
      <v-card flat class="receipt-card elevation-0 mb-6">
        <div class="card-header px-6 py-4 d-flex flex-wrap align-center justify-space-between text-white gap-3">
          <div class="d-flex align-center">
            <div class="header-icon-box mr-3 flex-shrink-0">
              <v-icon icon="mdi-badge-account-horizontal-outline" color="#ffffff" size="22"></v-icon>
            </div>
            <div>
              <h2 class="card-title text-white mb-0">Comprobante de Pago de Evaluación</h2>
              <span class="card-subtitle text-white opacity-80">
                Orden vinculada exclusivamente al candidato seleccionado
              </span>
            </div>
          </div>

          <v-chip
            size="small"
            :color="getStatusColor(order.payment_status)"
            variant="flat"
            class="font-weight-bold text-white px-3"
          >
            {{ formatStatus(order.payment_status) }}
          </v-chip>
        </div>

        <v-card-text class="pa-6 bg-white">
          <!-- Alerta en caso de haber sido rechazado previamente -->
          <v-alert
            v-if="order.payment_status === 'rejected'"
            type="error"
            variant="tonal"
            density="comfortable"
            class="mb-5 rounded-xl border"
          >
            <div class="font-weight-bold mb-1">Comprobante Rechazado:</div>
            <div>{{ order.rejection_reason || 'Favor de verificar el comprobante y volver a subirlo con el importe correspondiente.' }}</div>
          </v-alert>

          <!-- Ficha de Datos del Evaluado -->
          <div class="examinee-summary-box pa-4 rounded-xl border bg-slate-50 mb-5">
            <v-row dense>
              <v-col cols="12" sm="6" md="3" class="pa-2">
                <span class="label-caption">CANDIDATO / EVALUADO</span>
                <div class="text-body-1 font-weight-bold text-slate-800">
                  {{ order.examinee?.full_name || 'Sin nombre' }}
                </div>
                <div class="text-caption font-mono text-grey">
                  {{ order.examinee?.curp || 'SIN CURP REGISTRADA' }}
                </div>
              </v-col>

              <v-col cols="12" sm="6" md="3" class="pa-2">
                <span class="label-caption">TIPO DE PRUEBA</span>
                <div class="text-body-2 font-weight-bold text-slate-800">
                  {{ order.evaluation_type?.name }}
                </div>
                <v-chip size="x-small" color="#07254A" variant="tonal" class="mt-1 font-weight-bold">
                  Modalidad {{ order.evaluation_type?.modality }}
                </v-chip>
              </v-col>

              <v-col cols="12" sm="6" md="3" class="pa-2">
                <span class="label-caption">DESGLOSE FISCAL</span>
                <div class="text-caption text-slate-600">
                  Subtotal: <strong class="font-mono">${{ formatMoney(order.subtotal) }}</strong>
                </div>
                <div class="text-caption text-slate-600">
                  IVA (16%): <strong class="font-mono">${{ formatMoney(order.vat) }}</strong>
                </div>
              </v-col>

              <v-col cols="12" sm="6" md="3" class="pa-2">
                <span class="label-caption text-primary font-weight-bold">TOTAL A TRANSFERIR</span>
                <div class="text-h6 font-mono font-weight-bold text-primary">
                  ${{ formatMoney(order.total) }} MXN
                </div>
              </v-col>
            </v-row>
          </div>

          <!-- Datos de Depósito Fiscal BBVA -->
          <v-row dense class="mb-5">
            <v-col cols="12">
              <div class="pa-4 rounded-xl border bg-white d-flex flex-wrap align-center justify-space-between gap-3">
                <div class="d-flex align-center">
                  <v-avatar size="40" color="#f1f5f9" class="mr-3 border">
                    <v-icon icon="mdi-bank" color="#07254A" size="22"></v-icon>
                  </v-avatar>
                  <div>
                    <div class="text-body-2 font-weight-bold text-slate-900">
                      Cuenta Fiscal BBVA México — Ópalo Certificados de Confianza S.A. de C.V.
                    </div>
                    <div class="text-caption font-mono text-slate-600">
                      CLABE: <strong>012320001155998842</strong> | Cuenta: <strong>0115599884</strong>
                    </div>
                  </div>
                </div>

                <v-btn
                  variant="outlined"
                  size="small"
                  color="#07254A"
                  rounded="lg"
                  prepend-icon="mdi-content-copy"
                  class="text-none font-weight-bold"
                  @click="copyCLABE('012320001155998842')"
                >
                  Copiar CLABE
                </v-btn>
              </div>
            </v-col>
          </v-row>

          <!-- TARJETA 2: Formulario de Subida -->
          <v-form ref="uploadFormRef" @submit.prevent="submitReceipt">
            <v-row dense>
              <!-- Comprobante Actual si ya tiene uno -->
              <v-col cols="12" v-if="order.receipt_file_path || order.receipt_url" class="mb-3">
                <div class="pa-3 rounded-lg border bg-slate-50 d-flex align-center justify-space-between">
                  <div class="d-flex align-center text-truncate mr-2">
                    <v-icon icon="mdi-file-check" color="#10B981" size="22" class="mr-2"></v-icon>
                    <span class="text-caption font-weight-bold text-slate-800 text-truncate">
                      Ficha registrada: {{ order.receipt_original_name || 'Comprobante_Adjunto.pdf' }}
                    </span>
                  </div>
                  <v-btn
                    variant="text"
                    color="#07254A"
                    size="small"
                    prepend-icon="mdi-eye-outline"
                    class="text-none font-weight-bold"
                    @click="openFile(order.receipt_url)"
                  >
                    Ver Archivo
                  </v-btn>
                </div>
              </v-col>

              <!-- Selector de Archivo -->
              <v-col cols="12" md="7" class="pa-2">
                <label class="field-label">Seleccionar Comprobante Bancario (PDF, JPG, PNG) *</label>
                <v-file-input
                  v-model="file"
                  accept="application/pdf,image/jpeg,image/png,image/webp"
                  placeholder="Seleccionar archivo desde tu dispositivo..."
                  prepend-icon=""
                  prepend-inner-icon="mdi-paperclip"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  color="#07254A"
                  bg-color="#ffffff"
                  :disabled="order.payment_status === 'approved'"
                  :rules="[
                    (v) => (Array.isArray(v) ? v.length > 0 : !!v) || 'Debes adjuntar el archivo del comprobante'
                  ]"
                ></v-file-input>
              </v-col>

              <!-- Referencia o Folio Bancario Opcional -->
              <v-col cols="12" md="5" class="pa-2">
                <label class="field-label">Referencia / Folio Bancario (Opcional)</label>
                <v-text-field
                  v-model="notes"
                  placeholder="Ej. Folio SPEI 938210"
                  prepend-inner-icon="mdi-card-text-outline"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  color="#07254A"
                  bg-color="#ffffff"
                  :disabled="order.payment_status === 'approved'"
                ></v-text-field>
              </v-col>

              <!-- Botón de Envío -->
              <v-col cols="12" class="pa-2 d-flex justify-end mt-2">
                <v-btn
                  type="submit"
                  height="44"
                  color="#07254A"
                  variant="flat"
                  rounded="lg"
                  prepend-icon="mdi-cloud-upload-outline"
                  class="text-none font-weight-bold text-white px-6 submit-btn"
                  :loading="uploading"
                  :disabled="order.payment_status === 'approved'"
                >
                  {{ (order.receipt_file_path || order.receipt_url) ? 'Reemplazar y Notificar Comprobante' : 'Subir Comprobante' }}
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
      </v-card>
    </div>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="top right" timeout="3500">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'UploadPaymentReceiptComponent',
  emits: ['receipt-uploaded'],
  props: {
    orderId: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      order: null,
      file: null,
      notes: '',
      bankAccountId: null,
      loadingOrder: false,
      uploading: false,
      snackbar: {
        show: false,
        text: '',
        color: 'success',
      },
    };
  },

  watch: {
    orderId: {
      immediate: true,
      handler(newId) {
        const idToFetch = newId || this.$route.query.order_id;
        if (idToFetch) {
          this.fetchOrder(idToFetch);
        }
      },
    },
    '$route.query.order_id'(newQueryId) {
      if (newQueryId) {
        this.fetchOrder(newQueryId);
      }
    },
  },

  async mounted() {
    // 1. Obtener ID de la cuenta fiscal BBVA para satisfacer validaciones
    try {
      const bankRes = await api.get('settings/bank-accounts');
      if (bankRes.data?.fiscal?.id) {
        this.bankAccountId = bankRes.data.fiscal.id;
      }
    } catch (e) {
      console.warn('No se pudieron precargar las cuentas:', e);
    }

    // 2. Resolver orden si está en la query y no vino por prop
    const targetId = this.orderId || this.$route.query.order_id;
    if (targetId && !this.order) {
      this.fetchOrder(targetId);
    }
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

    openFile(url) {
      if (url) window.open(url, '_blank');
    },

    async copyCLABE(clabe) {
      try {
        await navigator.clipboard.writeText(clabe);
        this.notify('CLABE copiada al portapapeles.');
      } catch (e) {
        this.notify('Error al copiar.', 'error');
      }
    },

    async fetchOrder(id) {
      this.loadingOrder = true;
      try {
        const res = await api.get('/portal/evaluation-orders');
        const list = res.data?.data || res.data || [];
        this.order = list.find((o) => o.id === id) || null;
      } catch (e) {
        console.error('Error cargando la orden:', e);
        this.notify('No se pudo cargar la información de la orden.', 'error');
      } finally {
        this.loadingOrder = false;
      }
    },

    async submitReceipt() {
      const { valid } = await this.$refs.uploadFormRef.validate();
      if (!valid) return;

      let fileObj = this.file;
      if (Array.isArray(fileObj)) {
        fileObj = fileObj[0];
      }

      if (!fileObj) {
        this.notify('Debes seleccionar un archivo.', 'error');
        return;
      }

      // Preparar payload exacto para ClientPaymentController@uploadReceipt
      const formData = new FormData();
      formData.append('order_id', this.order.id);
      formData.append('receipt', fileObj);
      formData.append('amount', this.order.total);

      if (this.bankAccountId) {
        formData.append('bank_account_id', this.bankAccountId);
      }
      if (this.notes && this.notes.trim()) {
        formData.append('notes', this.notes.trim());
      }

      this.uploading = true;
      try {
        // Enviar a la URL EXACTA de tu backend
        const res = await api.post('/clients/payment-receipts', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        this.notify(res.data.message || 'Comprobante recibido con éxito.');

        this.order.payment_status = 'under_review';
        this.order.receipt_original_name = fileObj.name;
        if (res.data?.data?.path) {
          this.order.receipt_file_path = res.data.data.path;
        }

        this.$emit('receipt-uploaded', this.order);

        this.file = null;
        this.notes = '';
        this.$refs.uploadFormRef.resetValidation();

        setTimeout(() => {
          this.$router.push('/portal/orders');
        }, 1200);
      } catch (e) {
        const errorMsg = e.response?.data?.message || 'Error al subir el comprobante.';
        this.notify(errorMsg, 'error');
      } finally {
        this.uploading = false;
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
        approved: 'Pago Aprobado',
        rejected: 'Rechazado',
      };
      return map[status] || 'Pendiente';
    },
  },
};
</script>

<style scoped>
.receipt-card {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 16px !important;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04) !important;
}

.card-header {
  background: linear-gradient(135deg, #07254A 0%, #0e1726 100%) !important;
}

.header-icon-box {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: -0.2px;
}

.card-subtitle {
  font-size: 0.78rem;
}

.bg-slate-50 {
  background-color: #f8fafc;
}

.label-caption {
  display: block;
  font-size: 0.72rem;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 0.3px;
  margin-bottom: 3px;
}

.field-label {
  display: block;
  font-size: 0.78rem;
  font-weight: 700;
  color: #334155;
  margin-bottom: 6px;
}

.examinee-summary-box {
  border: 1px dashed #cbd5e1;
}

.submit-btn {
  font-size: 0.88rem !important;
}

.font-mono {
  font-family: monospace;
}

.gap-3 { gap: 12px; }
</style>
