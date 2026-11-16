<template>
  <v-card flat class="payment-info-card elevation-0">
    <!-- Header Corporativo -->
    <div class="card-header px-6 py-4 d-flex align-center justify-space-between text-white">
      <div class="d-flex align-center">
        <div class="header-icon-box mr-3 flex-shrink-0">
          <v-icon icon="mdi-bank" color="#ffffff" size="22"></v-icon>
        </div>
        <div>
          <h2 class="card-title text-white mb-0">Cuentas Bancarias y Métodos de Pago</h2>
          <span class="card-subtitle text-white opacity-80">
            Transfiere utilizando la cuenta oficial fiscal para la emisión de tu comprobante
          </span>
        </div>
      </div>
    </div>

    <v-card-text class="pa-6 bg-white">
      <!-- Banner Informativo -->
      <v-alert
        density="comfortable"
        type="info"
        variant="tonal"
        color="#07254A"
        class="mb-6 rounded-xl border text-caption"
      >
        <div class="d-flex align-center">
          <v-icon icon="mdi-information-outline" color="#07254A" class="mr-2" size="20"></v-icon>
          <div>
            Realiza tu depósito o transferencia SPEI a la <strong>cuenta fiscal oficial</strong> para que contabilidad genere tu factura (CFDI) y valide tu orden sin contratiempos.
          </div>
        </div>
      </v-alert>

      <!-- Estado de Carga -->
      <v-row v-if="loading" dense justify="center">
        <v-col cols="12" md="8" lg="7">
          <v-skeleton-loader type="article, actions" class="rounded-xl border pa-4"></v-skeleton-loader>
        </v-col>
      </v-row>

      <!-- Tarjeta Única Dinámica: Cuenta Fiscal Oficial -->
      <v-row v-else-if="fiscalAccount" dense justify="center">
        <v-col cols="12" md="8" lg="7">
          <v-card flat class="account-card pa-6 rounded-xl border bg-white">
            <div class="d-flex align-center justify-space-between mb-4">
              <v-chip
                size="small"
                color="#07254A"
                variant="flat"
                class="font-weight-bold text-white px-3"
              >
                <v-icon start icon="mdi-receipt-text-check-outline" size="16"></v-icon>
                Cuenta Fiscal (Con Facturación)
              </v-chip>
              <span class="text-caption font-weight-bold text-slate-500 font-mono">
                Transferencia SPEI
              </span>
            </div>

            <div class="mb-3">
              <span class="label-caption">INSTITUCIÓN BANCARIA</span>
              <div class="text-h6 font-weight-bold text-slate-900">
                {{ fiscalAccount.bank_name }}
              </div>
            </div>

            <div class="mb-3">
              <span class="label-caption">BENEFICIARIO / RAZÓN SOCIAL</span>
              <div class="text-body-1 font-weight-bold text-slate-800">
                {{ fiscalAccount.beneficiary }}
              </div>
            </div>

            <div class="mb-4" v-if="fiscalAccount.rfc">
              <span class="label-caption">RFC RECEPTOR FISCAL</span>
              <div class="text-body-2 font-mono font-weight-bold text-slate-800">
                {{ fiscalAccount.rfc }}
              </div>
            </div>

            <!-- Bloque Destacado de CLABE con Copiado Rápido -->
            <div class="clabe-box pa-4 rounded-xl border mb-4 bg-slate-50 d-flex flex-wrap align-center justify-space-between gap-2">
              <div>
                <span class="label-caption text-slate-600">CLABE INTERBANCARIA (18 DÍGITOS)</span>
                <div class="text-h6 font-mono font-weight-bold text-primary mt-1">
                  {{ fiscalAccount.clabe }}
                </div>
              </div>

              <v-btn
                variant="flat"
                color="#07254A"
                size="small"
                rounded="lg"
                prepend-icon="mdi-content-copy"
                class="text-none font-weight-bold text-white px-3"
                @click="copyToClipboard(fiscalAccount.clabe, 'CLABE interbancaria')"
              >
                Copiar
              </v-btn>
            </div>

            <!-- Número de Cuenta -->
            <div class="d-flex align-center justify-space-between border-top pt-3" v-if="fiscalAccount.account_number">
              <div>
                <span class="label-caption">NO. DE CUENTA</span>
                <div class="text-body-1 font-mono font-weight-bold text-slate-800">
                  {{ fiscalAccount.account_number }}
                </div>
              </div>

              <v-btn
                variant="outlined"
                color="#07254A"
                size="x-small"
                rounded="lg"
                prepend-icon="mdi-content-copy"
                class="text-none font-weight-bold"
                @click="copyToClipboard(fiscalAccount.account_number, 'Número de cuenta')"
              >
                Copiar Cuenta
              </v-btn>
            </div>

            <!-- Instrucciones Adicionales (si existen en BD) -->
            <div v-if="fiscalAccount.instructions" class="mt-4 pt-3 border-top text-caption text-slate-600">
              <strong class="text-slate-800">Instrucciones de referencia:</strong> {{ fiscalAccount.instructions }}
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Estado Vacío / Sin Cuenta Configurada -->
      <v-row v-else dense justify="center">
        <v-col cols="12" md="8" lg="7">
          <v-alert type="warning" variant="tonal" rounded="xl" class="text-center">
            No se encontró una cuenta bancaria fiscal configurada actualmente. Contacta a administración.
          </v-alert>
        </v-col>
      </v-row>
    </v-card-text>

    <!-- Snackbar de Copiado -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="top right" timeout="2500">
      {{ snackbar.text }}
    </v-snackbar>
  </v-card>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'ClientPaymentInfoComponent',
  data() {
    return {
      loading: false,
      fiscalAccount: null,
      snackbar: {
        show: false,
        text: '',
        color: 'success',
      },
    };
  },
  mounted() {
    this.fetchFiscalBankAccount();
  },
  methods: {
    async fetchFiscalBankAccount() {
      this.loading = true;
      try {
        const res = await api.get('/settings/bank-accounts');
        this.fiscalAccount = res.data?.fiscal || res.data?.data?.fiscal || null;
      } catch (e) {
        console.error('Error al cargar cuenta bancaria fiscal:', e);
        this.snackbar.text = 'No se pudo obtener la información bancaria.';
        this.snackbar.color = 'error';
        this.snackbar.show = true;
      } finally {
        this.loading = false;
      }
    },
    async copyToClipboard(text, label = 'Dato') {
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        this.snackbar.text = `${label} copiado al portapapeles.`;
        this.snackbar.color = 'success';
        this.snackbar.show = true;
      } catch (err) {
        this.snackbar.text = 'No se pudo copiar automáticamente.';
        this.snackbar.color = 'error';
        this.snackbar.show = true;
      }
    },
  },
};
</script>

<style scoped>
.payment-info-card {
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
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-title {
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: -0.2px;
}

.card-subtitle {
  font-size: 0.8rem;
}

.account-card {
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.label-caption {
  display: block;
  font-size: 0.72rem;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 0.3px;
  margin-bottom: 2px;
}

.clabe-box {
  background-color: #f8fafc;
  border: 1px dashed #cbd5e1;
}

.bg-slate-50 {
  background-color: #f8fafc;
}

.gap-2 {
  gap: 8px;
}
</style>
