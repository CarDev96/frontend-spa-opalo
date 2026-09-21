<template>
  <div class="bank-accounts-wrapper py-2">
    <div class="text-caption text-grey mb-4">
      Configura las dos cuentas receptoras de transferencias. El portal del cliente mostrará automáticamente la cuenta correspondiente según si su servicio requiere factura o no.
    </div>

    <v-form ref="form" v-model="valid" @submit.prevent="submitBankSettings">
      <!-- BLOQUE 1: Cuenta Fiscal (Con Factura) -->
      <div class="account-block mb-6 pa-4 rounded-lg">
        <div class="d-flex align-center mb-3">
          <v-chip size="small" color="#07254A" variant="flat" class="font-weight-bold text-white mr-2">
            1. Con Facturación
          </v-chip>
          <span class="text-subtitle-2 font-weight-bold text-slate-800">
            Cuenta Fiscal (Personas Morales / Físicas con CFDI)
          </span>
        </div>

        <v-row dense>
          <v-col cols="12" md="4" class="px-2">
            <label class="field-label">Institución Bancaria *</label>
            <v-text-field
              v-model="f.fiscal.bank_name"
              placeholder="Ej. BBVA México"
              prepend-inner-icon="mdi-bank"
              variant="outlined"
              density="compact"
              rounded="lg"
              :rules="[r.required]"
              color="#07254A"
              class="custom-field"
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="4" class="px-2">
            <label class="field-label">CLABE Interbancaria (18 dígitos) *</label>
            <v-text-field
              v-model="f.fiscal.clabe"
              placeholder="012345678901234567"
              prepend-inner-icon="mdi-numeric"
              variant="outlined"
              density="compact"
              rounded="lg"
              maxlength="18"
              :rules="[r.required, r.clabe]"
              color="#07254A"
              class="custom-field font-mono"
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="4" class="px-2">
            <label class="field-label">RFC Receptor Fiscal *</label>
            <v-text-field
              v-model="f.fiscal.rfc"
              placeholder="Ej. OPA200101XYZ"
              prepend-inner-icon="mdi-card-text-outline"
              variant="outlined"
              density="compact"
              rounded="lg"
              maxlength="13"
              :rules="[r.required]"
              color="#07254A"
              class="custom-field font-mono text-uppercase"
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="6" class="px-2">
            <label class="field-label">Beneficiario / Razón Social Fiscal *</label>
            <v-text-field
              v-model="f.fiscal.beneficiary"
              placeholder="Ej. Ópalo Certificados S.A. de C.V."
              prepend-inner-icon="mdi-office-building"
              variant="outlined"
              density="compact"
              rounded="lg"
              :rules="[r.required]"
              color="#07254A"
              class="custom-field"
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="6" class="px-2">
            <label class="field-label">Número de Cuenta / Tarjeta (Opcional)</label>
            <v-text-field
              v-model="f.fiscal.account_number"
              placeholder="Ej. 0123456789"
              prepend-inner-icon="mdi-credit-card-outline"
              variant="outlined"
              density="compact"
              rounded="lg"
              color="#07254A"
              class="custom-field"
            ></v-text-field>
          </v-col>
        </v-row>
      </div>

      <!-- BLOQUE 2: Cuenta Sin Factura -->
      <div class="account-block mb-4 pa-4 rounded-lg">
        <div class="d-flex align-center mb-3">
          <v-chip size="small" color="#475569" variant="flat" class="font-weight-bold text-white mr-2">
            2. Sin Facturación
          </v-chip>
          <span class="text-subtitle-2 font-weight-bold text-slate-800">
            Cuenta No Fiscal (Operativa / Sin Comprobante Fiscal)
          </span>
        </div>

        <v-row dense>
          <v-col cols="12" md="4" class="px-2">
            <label class="field-label">Institución Bancaria *</label>
            <v-text-field
              v-model="f.non_fiscal.bank_name"
              placeholder="Ej. Santander México"
              prepend-inner-icon="mdi-bank"
              variant="outlined"
              density="compact"
              rounded="lg"
              :rules="[r.required]"
              color="#07254A"
              class="custom-field"
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="4" class="px-2">
            <label class="field-label">CLABE Interbancaria (18 dígitos) *</label>
            <v-text-field
              v-model="f.non_fiscal.clabe"
              placeholder="012345678901234567"
              prepend-inner-icon="mdi-numeric"
              variant="outlined"
              density="compact"
              rounded="lg"
              maxlength="18"
              :rules="[r.required, r.clabe]"
              color="#07254A"
              class="custom-field font-mono"
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="4" class="px-2">
            <label class="field-label">Número de Cuenta / Tarjeta (Opcional)</label>
            <v-text-field
              v-model="f.non_fiscal.account_number"
              placeholder="Ej. 5579..."
              prepend-inner-icon="mdi-credit-card-outline"
              variant="outlined"
              density="compact"
              rounded="lg"
              color="#07254A"
              class="custom-field"
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="12" class="px-2">
            <label class="field-label">Beneficiario Receptora *</label>
            <v-text-field
              v-model="f.non_fiscal.beneficiary"
              placeholder="Ej. Nombre del titular de la cuenta"
              prepend-inner-icon="mdi-account"
              variant="outlined"
              density="compact"
              rounded="lg"
              :rules="[r.required]"
              color="#07254A"
              class="custom-field"
            ></v-text-field>
          </v-col>
        </v-row>
      </div>

      <!-- Botón de Guardado -->
      <div class="d-flex justify-end mt-4">
        <v-btn
          type="submit"
          color="#07254A"
          variant="flat"
          rounded="lg"
          size="small"
          prepend-icon="mdi-content-save-check-outline"
          class="text-none font-weight-bold text-white px-6 submit-btn"
          :loading="loading"
        >
          Guardar Cuentas Bancarias
        </v-btn>
      </div>
    </v-form>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="top right" timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'BankPaymentSettingsComponent',
  data() {
    return {
      valid: false,
      loading: false,
      f: {
        fiscal: {
          bank_name: '',
          clabe: '',
          beneficiary: '',
          rfc: '',
          account_number: '',
        },
        non_fiscal: {
          bank_name: '',
          clabe: '',
          beneficiary: '',
          account_number: '',
        },
      },
      r: {
        required: v => !!v || 'Campo requerido.',
        clabe: v => (v && /^\d{18}$/.test(v)) || 'La CLABE debe contener exactamente 18 dígitos numéricos.',
      },
      snackbar: {
        show: false,
        text: '',
        color: 'success',
      },
    };
  },
  async mounted() {
    await this.fetchBankAccounts();
  },
  methods: {
    notify(text, color = 'success') {
      this.snackbar.text = text;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },

    async fetchBankAccounts() {
      try {
        const response = await api.get('/settings/bank-accounts');
        if (response.data) {
          if (response.data.fiscal) {
            this.f.fiscal = { ...this.f.fiscal, ...response.data.fiscal };
          }
          if (response.data.non_fiscal) {
            this.f.non_fiscal = { ...this.f.non_fiscal, ...response.data.non_fiscal };
          }
        }
      } catch (err) {
        console.error('Error al cargar datos bancarios:', err);
      }
    },

    async submitBankSettings() {
      const { valid } = await this.$refs.form.validate();
      if (!valid) return;

      this.loading = true;
      try {
        const response = await api.post('/settings/bank-accounts/store', this.f);
        this.notify(response.data.message || 'Cuentas bancarias actualizadas correctamente.');
      } catch (err) {
        const msg = err.response?.data?.message || 'Error al guardar las cuentas bancarias.';
        this.notify(msg, 'error');
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.account-block {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
}

.field-label {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 4px;
}

:deep(.custom-field .v-field) {
  border-radius: 8px !important;
  background-color: #ffffff !important;
  font-size: 0.82rem !important;
}

.font-mono {
  font-family: monospace;
}

.submit-btn {
  height: 38px !important;
  font-size: 0.82rem !important;
}
</style>
