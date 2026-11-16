<template>
  <v-card flat class="create-order-card elevation-0 mb-6">
    <div class="px-6 card-table-header text-white py-4 border-bottom bg-slate-50 d-flex align-center">
      <div class="section-icon-box mr-3">
        <v-icon icon="mdi-file-document-edit-outline" color="#07254A" size="20"></v-icon>
      </div>
      <div>
        <h3 class="text-subtitle-1 font-weight-bold text-slate-800 mb-0">
          Nueva Solicitud de Certificación
        </h3>
        <span class="text-caption text-slate-500">
          Selecciona el evaluado y el tipo de prueba para generar tu orden con desglose de IVA
        </span>
      </div>
    </div>

    <v-card-text class="pa-6 bg-white">
      <!-- DISCLAIMER DE ORDEN DE COMPRA (PO) PREVIA OBLIGATORIA -->
      <v-slide-y-transition>
        <v-alert
          v-if="clientProfile?.requires_purchase_order"
          type="warning"
          variant="tonal"
          density="comfortable"
          class="mb-6 rounded-xl border-amber-subtle"
        >
          <div class="d-flex align-start">
            <v-icon icon="mdi-alert-octagon-outline" color="#D97706" size="26" class="mr-3 mt-1 flex-shrink-0"></v-icon>
            <div>
              <h4 class="text-subtitle-2 font-weight-bold text-slate-900 mb-1">
                Requisito Previo de Facturación: Orden de Compra (PO)
              </h4>
              <p class="text-caption text-slate-700 mb-1">
                Estimado cliente, de acuerdo con las condiciones operativas registradas para <strong>{{ clientProfile.company_name || clientProfile.trade_name }}</strong>, es obligatorio cargar previamente su <strong>Orden de Compra (PO)</strong> vigente desde la tabla inferior antes de efectuar el pago.
              </p>
            </div>
          </div>
        </v-alert>
      </v-slide-y-transition>

      <v-form ref="orderFormRef" @submit.prevent="generateOrder">
        <v-row dense>
          <!-- 1. Seleccionar Candidato -->
          <v-col cols="12" md="6" class="pa-2">
            <label class="field-label">Selecciona al Candidato / Evaluado *</label>
            <v-select
              v-model="orderForm.examinee_id"
              :items="examinees"
              item-title="displayText"
              item-value="id"
              placeholder="Elegir candidato registrado"
              prepend-inner-icon="mdi-account-outline"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              color="#07254A"
              bg-color="#ffffff"
              :loading="loadingExaminees"
              :rules="[(v) => !!v || 'Debes seleccionar un candidato']"
            >
              <template v-slot:no-data>
                <div class="pa-3 text-caption text-grey text-center">
                  No hay candidatos registrados disponibles.
                </div>
              </template>
            </v-select>
          </v-col>

          <!-- 2. Seleccionar Tipo de Evaluación -->
          <v-col cols="12" md="6" class="pa-2">
            <label class="field-label">Tipo de Prueba y Costo Base *</label>
            <v-select
              v-model="orderForm.evaluation_type_id"
              :items="evaluationTypes"
              item-title="displayText"
              item-value="id"
              placeholder="Seleccionar tipo de prueba..."
              prepend-inner-icon="mdi-format-list-checks"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              color="#07254A"
              bg-color="#ffffff"
              :loading="loadingTypes"
              :rules="[(v) => !!v || 'Debes seleccionar el tipo de evaluación']"
              @update:model-value="onTypeSelected"
            >
              <template v-slot:no-data>
                <div class="pa-3 text-caption text-grey text-center">
                  No se encontraron tipos de evaluación activos.
                </div>
              </template>
            </v-select>
          </v-col>
        </v-row>

        <!-- Resumen de Costo con IVA (16%) -->
        <v-expand-transition>
          <div v-if="selectedType" class="mt-4">
            <div class="order-summary-box pa-4 rounded-xl border">
              <div class="d-flex align-center justify-space-between mb-3 border-bottom pb-2">
                <span class="text-caption font-weight-bold text-slate-700 text-uppercase">
                  Desglose de Cotización Fiscal
                </span>
                <v-chip size="x-small" color="#07254A" variant="flat" class="font-weight-bold text-white px-2">
                  Modalidad {{ selectedType.modality }}
                </v-chip>
              </div>

              <div class="d-flex justify-space-between mb-2 text-body-2 text-slate-700">
                <span>Costo Base:</span>
                <strong class="font-mono">${{ formatMoney(selectedType.cost) }} MXN</strong>
              </div>

              <div class="d-flex justify-space-between mb-2 text-body-2 text-slate-700">
                <span>IVA (16%):</span>
                <strong class="font-mono">${{ formatMoney(selectedType.cost * 0.16) }} MXN</strong>
              </div>

              <v-divider class="my-2"></v-divider>

              <div class="d-flex justify-space-between align-center pt-1">
                <div>
                  <span class="text-subtitle-2 font-weight-bold text-slate-900 d-block">
                    Total a Pagar / Transferir:
                  </span>
                  <span class="text-caption text-slate-500">
                    Importe neto con comprobante fiscal
                  </span>
                </div>
                <span class="text-h6 font-weight-bold font-mono text-primary">
                  ${{ formatMoney(selectedType.cost * 1.16) }} MXN
                </span>
              </div>
            </div>
          </div>
        </v-expand-transition>

        <!-- Botón de Envío -->
        <div class="d-flex justify-end mt-4">
          <v-btn
            type="submit"
            color="#07254A"
            variant="flat"
            rounded="lg"
            prepend-icon="mdi-file-document-plus-outline"
            class="text-none font-weight-bold text-white px-6 submit-btn"
            :loading="generatingOrder"
          >
            Generar Orden de Evaluación
          </v-btn>
        </div>
      </v-form>
    </v-card-text>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="top right" timeout="3500">
      {{ snackbar.text }}
    </v-snackbar>
  </v-card>
</template>

<script>
import { useAuthStore } from '@/store/auth';
import api from '@/services/api';

export default {
  name: 'CreateOrderComponent',
  emits: ['order-created'],
  data() {
    return {
      examinees: [],
      evaluationTypes: [],
      selectedType: null,
      loadingExaminees: false,
      loadingTypes: false,
      generatingOrder: false,
      orderForm: {
        examinee_id: null,
        evaluation_type_id: null,
      },
      snackbar: {
        show: false,
        text: '',
        color: 'success',
      },
    };
  },

  computed: {
    clientProfile() {
      const authStore = useAuthStore();
      return authStore.user?.client || authStore.client || {};
    },
  },

  mounted() {
    this.fetchExaminees();
    this.fetchTypes();
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

    async fetchExaminees() {
      this.loadingExaminees = true;
      try {
        let res;
        try {
          res = await api.get('/portal/examinees');
        } catch (err) {
          if (err.response?.status === 404) {
            res = await api.get('/portal/examinees/list');
          } else {
            throw err;
          }
        }
        const data = res.data?.data || res.data || [];
        this.examinees = (Array.isArray(data) ? data : []).map((e) => ({
          ...e,
          displayText: `${e.full_name} (${e.curp || 'SIN CURP'})`,
        }));
      } catch (e) {
        console.error('Error cargando candidatos:', e);
      } finally {
        this.loadingExaminees = false;
      }
    },

    async fetchTypes() {
      this.loadingTypes = true;
      try {
        const res = await api.get('/evaluation-types');
        const rawTypes = res.data?.data || res.data || [];
        this.evaluationTypes = (Array.isArray(rawTypes) ? rawTypes : []).map((t) => ({
          ...t,
          displayText: `${t.name} — $${this.formatMoney(t.cost)} + IVA (${t.modality})`,
        }));
      } catch (e) {
        console.error('Error cargando tipos de evaluación:', e);
      } finally {
        this.loadingTypes = false;
      }
    },

    onTypeSelected(typeId) {
      this.selectedType = this.evaluationTypes.find((t) => t.id === typeId) || null;
    },

    async generateOrder() {
      const { valid } = await this.$refs.orderFormRef.validate();
      if (!valid) return;

      this.generatingOrder = true;
      try {
        const res = await api.post('/portal/evaluation-orders', {
          examinee_id: this.orderForm.examinee_id,
          evaluation_type_id: this.orderForm.evaluation_type_id,
        });

        this.notify(res.data.message || 'Orden generada exitosamente.');

        const createdOrder = res.data?.order || res.data?.data;
        this.$emit('order-created', createdOrder);

        this.orderForm.examinee_id = null;
        this.orderForm.evaluation_type_id = null;
        this.selectedType = null;
        this.$refs.orderFormRef.resetValidation();
      } catch (e) {
        this.notify(e.response?.data?.message || 'Error al generar la orden.', 'error');
      } finally {
        this.generatingOrder = false;
      }
    },
  },
};
</script>

<style scoped>
.create-order-card {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 16px !important;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04) !important;
}

.bg-slate-50 {
  background-color: #f8fafc;
}

.section-icon-box {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background-color: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.border-amber-subtle {
  border: 1px solid #fde68a !important;
  background-color: #fffbeb !important;
}

.field-label {
  display: block;
  font-size: 0.78rem;
  font-weight: 700;
  color: #334155;
  margin-bottom: 6px;
}

.order-summary-box {
  background-color: #f8fafc;
  border: 1px solid #cbd5e1;
}

.submit-btn {
  height: 40px !important;
  font-size: 0.85rem !important;
}

.font-mono {
  font-family: monospace;
}
</style>
