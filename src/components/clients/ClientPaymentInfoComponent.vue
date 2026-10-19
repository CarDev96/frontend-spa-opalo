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

      <!-- Tarjeta Única: Cuenta Fiscal Oficial -->
      <v-row dense justify="center">
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
              <div class="text-h6 font-weight-bold text-slate-900">BBVA México</div>
            </div>

            <div class="mb-3">
              <span class="label-caption">BENEFICIARIO / RAZÓN SOCIAL</span>
              <div class="text-body-1 font-weight-bold text-slate-800">
                Ópalo Certificados de Confianza S.A. de C.V.
              </div>
            </div>

            <div class="mb-4">
              <span class="label-caption">RFC RECEPTOR FISCAL</span>
              <div class="text-body-2 font-mono font-weight-bold text-slate-800">
                OPC200415AB3
              </div>
            </div>

            <!-- Bloque Destacado de CLABE con Copiado Rápido -->
            <div class="clabe-box pa-4 rounded-xl border mb-4 bg-slate-50 d-flex flex-wrap align-center justify-space-between gap-2">
              <div>
                <span class="label-caption text-slate-600">CLABE INTERBANCARIA (18 DÍGITOS)</span>
                <div class="text-h6 font-mono font-weight-bold text-primary mt-1">
                  {{ clabeInterbancaria }}
                </div>
              </div>

              <v-btn
                variant="flat"
                color="#07254A"
                size="small"
                rounded="lg"
                prepend-icon="mdi-content-copy"
                class="text-none font-weight-bold text-white px-3"
                @click="copyToClipboard(clabeInterbancaria, 'CLABE interbancaria')"
              >
                Copiar
              </v-btn>
            </div>

            <!-- Número de Cuenta -->
            <div class="d-flex align-center justify-space-between border-top pt-3">
              <div>
                <span class="label-caption">NO. DE CUENTA</span>
                <div class="text-body-1 font-mono font-weight-bold text-slate-800">
                  {{ numeroCuenta }}
                </div>
              </div>

              <v-btn
                variant="outlined"
                color="#07254A"
                size="x-small"
                rounded="lg"
                prepend-icon="mdi-content-copy"
                class="text-none font-weight-bold"
                @click="copyToClipboard(numeroCuenta, 'Número de cuenta')"
              >
                Copiar Cuenta
              </v-btn>
            </div>
          </v-card>
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
export default {
  name: 'ClientPaymentInfoComponent',
  data() {
    return {
      clabeInterbancaria: '012320001155998842',
      numeroCuenta: '0115599884',
      snackbar: {
        show: false,
        text: '',
        color: 'success',
      },
    };
  },
  methods: {
    async copyToClipboard(text, label = 'Dato') {
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
