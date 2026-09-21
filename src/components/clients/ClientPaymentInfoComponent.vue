<template>
  <v-container fluid class="pa-2 pa-sm-4 max-content-wrapper">
    <v-row dense>
      <v-col cols="12">
        <v-card flat class="main-payment-card elevation-0">
          <!-- Cabecera Corporativa Ópalo -->
          <div class="card-header px-4 py-3 px-sm-6 py-sm-4 opaloBrand">
            <div class="d-flex align-start align-sm-center">
              <div class="header-icon-box mr-3 flex-shrink-0">
                <v-icon icon="mdi-bank-transfer" color="#ffffff" size="20"></v-icon>
              </div>
              <div class="flex-grow-1 min-w-0">
                <h2 class="card-title text-white mb-1">
                  Cuentas Bancarias y Métodos de Pago
                </h2>
                <p class="card-subtitle text-white opacity-80 mb-0">
                  Transfiere utilizando la cuenta adecuada según tus requerimientos fiscales
                </p>
              </div>
            </div>
          </div>

          <!-- Skeleton Loader -->
          <v-card-text v-if="loading" class="pa-4 pa-sm-6">
            <v-skeleton-loader type="article, article"></v-skeleton-loader>
          </v-card-text>

          <!-- Detalle de Cuentas -->
          <v-card-text v-else class="pa-3 pa-sm-6">
            <v-alert
              density="compact"
              variant="tonal"
              color="#07254A"
              icon="mdi-information-outline"
              class="mb-4 mb-sm-6 rounded-lg alert-text"
            >
              Si tu empresa requiere <strong>Factura (CFDI)</strong>, realiza tu depósito a la cuenta fiscal para que contabilidad genere tu comprobante sin contratiempos.
            </v-alert>

            <v-row dense>
              <!-- 1. CUENTA FISCAL -->
              <v-col cols="12" md="6" class="mb-3 mb-md-0">
                <v-card variant="outlined" class="account-box h-100 rounded-lg pa-4 pa-sm-5">
                  <div class="d-flex flex-wrap align-center justify-space-between gap-2 mb-3">
                    <v-chip color="#07254A" variant="flat" size="x-small" class="font-weight-bold text-white px-2 py-1">
                      <v-icon icon="mdi-receipt-text-check" start size="14"></v-icon>
                      Con Facturación (Fiscal)
                    </v-chip>
                    <span class="text-caption text-grey-darken-1 font-weight-medium">Transferencia SPEI</span>
                  </div>

                  <div v-if="accounts.fiscal" class="account-details">
                    <div class="detail-item mb-2">
                      <span class="detail-label">Institución Bancaria</span>
                      <div class="detail-value text-slate-800 font-weight-bold text-body-2">
                        {{ accounts.fiscal.bank_name }}
                      </div>
                    </div>

                    <div class="detail-item mb-2">
                      <span class="detail-label">Beneficiario / Razón Social</span>
                      <div class="detail-value text-slate-800 font-weight-bold text-caption text-sm-body-2">
                        {{ accounts.fiscal.beneficiary }}
                      </div>
                    </div>

                    <div class="detail-item mb-2">
                      <span class="detail-label">RFC Receptor Fiscal</span>
                      <div class="detail-value font-mono text-slate-800 font-weight-bold text-caption">
                        {{ accounts.fiscal.rfc || 'No especificado' }}
                      </div>
                    </div>

                    <div class="detail-item clabe-highlight pa-3 rounded-lg mt-3 mb-2">
                      <span class="detail-label">CLABE Interbancaria (18 dígitos)</span>
                      <div class="d-flex flex-column flex-xs-row flex-sm-row align-start align-sm-center justify-space-between gap-2 mt-1">
                        <span class="clabe-number font-mono font-weight-bold text-slate-900">
                          {{ accounts.fiscal.clabe }}
                        </span>
                        <v-btn
                          size="x-small"
                          variant="tonal"
                          color="#07254A"
                          prepend-icon="mdi-content-copy"
                          class="text-none font-weight-bold copy-btn"
                          @click="copyToClipboard(accounts.fiscal.clabe, 'CLABE Fiscal copiada')"
                        >
                          Copiar
                        </v-btn>
                      </div>
                    </div>

                    <div v-if="accounts.fiscal.account_number" class="detail-item mt-2">
                      <span class="detail-label">No. de Cuenta</span>
                      <div class="detail-value text-caption font-mono text-slate-700">
                        {{ accounts.fiscal.account_number }}
                      </div>
                    </div>
                  </div>

                  <div v-else class="text-center py-6 text-grey text-caption">
                    Información bancaria fiscal pendiente de configuración.
                  </div>
                </v-card>
              </v-col>

              <!-- 2. CUENTA NO FISCAL -->
              <v-col cols="12" md="6">
                <v-card variant="outlined" class="account-box h-100 rounded-lg pa-4 pa-sm-5">
                  <div class="d-flex flex-wrap align-center justify-space-between gap-2 mb-3">
                    <v-chip color="#475569" variant="flat" size="x-small" class="font-weight-bold text-white px-2 py-1">
                      <v-icon icon="mdi-cash-fast" start size="14"></v-icon>
                      Sin Factura (Operativa)
                    </v-chip>
                    <span class="text-caption text-grey-darken-1 font-weight-medium">Transferencia SPEI</span>
                  </div>

                  <div v-if="accounts.non_fiscal" class="account-details">
                    <div class="detail-item mb-2">
                      <span class="detail-label">Institución Bancaria</span>
                      <div class="detail-value text-slate-800 font-weight-bold text-body-2">
                        {{ accounts.non_fiscal.bank_name }}
                      </div>
                    </div>

                    <div class="detail-item mb-2">
                      <span class="detail-label">Beneficiario Titular</span>
                      <div class="detail-value text-slate-800 font-weight-bold text-caption text-sm-body-2">
                        {{ accounts.non_fiscal.beneficiary }}
                      </div>
                    </div>

                    <div class="detail-item clabe-highlight pa-3 rounded-lg mt-3 mb-2">
                      <span class="detail-label">CLABE Interbancaria (18 dígitos)</span>
                      <div class="d-flex flex-column flex-xs-row flex-sm-row align-start align-sm-center justify-space-between gap-2 mt-1">
                        <span class="clabe-number font-mono font-weight-bold text-slate-900">
                          {{ accounts.non_fiscal.clabe }}
                        </span>
                        <v-btn
                          size="x-small"
                          variant="tonal"
                          color="#475569"
                          prepend-icon="mdi-content-copy"
                          class="text-none font-weight-bold copy-btn"
                          @click="copyToClipboard(accounts.non_fiscal.clabe, 'CLABE Operativa copiada')"
                        >
                          Copiar
                        </v-btn>
                      </div>
                    </div>

                    <div v-if="accounts.non_fiscal.account_number" class="detail-item mt-2">
                      <span class="detail-label">No. de Tarjeta / Cuenta</span>
                      <div class="detail-value text-caption font-mono text-slate-700">
                        {{ accounts.non_fiscal.account_number }}
                      </div>
                    </div>
                  </div>

                  <div v-else class="text-center py-6 text-grey text-caption">
                    Información bancaria operativa pendiente de configuración.
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Snackbar de Copiado -->
    <v-snackbar v-model="snackbar.show" color="#07254A" location="bottom center" timeout="2000">
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'ClientPaymentInfoComponent',
  data() {
    return {
      loading: true,
      accounts: { fiscal: null, non_fiscal: null },
      snackbar: { show: false, text: '' },
    };
  },
  async mounted() {
    await this.fetchAccounts();
  },
  methods: {
    async fetchAccounts() {
      this.loading = true;
      try {
        const response = await api.get('/settings/bank-accounts');
        this.accounts = response.data || { fiscal: null, non_fiscal: null };
      } catch (error) {
        console.error('Error cargando cuentas bancarias:', error);
      } finally {
        this.loading = false;
      }
    },
    copyToClipboard(text, message) {
      if (!text) return;
      navigator.clipboard.writeText(text).then(() => {
        this.snackbar.text = message;
        this.snackbar.show = true;
      });
    },
  },
};
</script>

<style scoped>
.max-content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}
.main-payment-card {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 12px !important;
  overflow: hidden;
}
.opaloBrand {
  background: linear-gradient(135deg, #07254A 0%, #0e1726 100%) !important;
}
.header-icon-box {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}
.card-title {
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1.25;
}
@media (min-width: 600px) {
  .card-title { font-size: 1.1rem; }
}
.card-subtitle {
  font-size: 0.72rem;
  line-height: 1.3;
}
.alert-text {
  font-size: 0.76rem !important;
  line-height: 1.4;
}
.account-box {
  border: 1px solid #e2e8f0 !important;
  background-color: #ffffff;
}
.detail-label {
  display: block;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  font-weight: 700;
  color: #64748b;
  margin-bottom: 2px;
}
.clabe-highlight {
  background-color: #f8fafc;
  border: 1px dashed #cbd5e1;
}
.clabe-number {
  font-size: 0.95rem;
  letter-spacing: 0.5px;
  word-break: break-all;
}
@media (min-width: 600px) {
  .clabe-number {
    font-size: 1.05rem;
    letter-spacing: 1px;
  }
}
.copy-btn {
  height: 26px !important;
  font-size: 0.72rem !important;
  border-radius: 6px !important;
}
.font-mono {
  font-family: monospace;
}
.gap-2 {
  gap: 8px;
}
</style>
