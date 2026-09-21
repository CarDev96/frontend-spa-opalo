<template>
  <v-container fluid class="pa-2 pa-sm-4 max-wrapper">
    <v-card flat class="upload-receipt-card elevation-0">
      <!-- Cabecera Corporativa Ópalo -->
      <div class="card-header px-4 py-3 px-sm-6 py-sm-4 opaloBrand">
        <div class="d-flex align-start align-sm-center">
          <div class="header-icon-box mr-3 flex-shrink-0">
            <v-icon icon="mdi-cloud-upload-outline" color="#ffffff" size="20"></v-icon>
          </div>
          <div class="flex-grow-1 min-w-0">
            <h2 class="card-title text-white mb-1">Reportar Transferencia / Subir Comprobante</h2>
            <p class="card-subtitle text-white opacity-80 mb-0">
              Adjunta el comprobante emitido por tu banco para validación de servicios
            </p>
          </div>
        </div>
      </div>

      <!-- Formulario -->
      <v-card-text class="pa-4 pa-sm-6">
        <v-form ref="form" v-model="valid" @submit.prevent="submitReceipt">
          <v-row dense>
            <!-- Select enlazado directamente al UUID (bank_account_id) -->
            <v-col cols="12" md="6" class="px-2">
              <label class="field-label">Cuenta a la que transferiste *</label>
              <v-select
                v-model="f.bank_account_id"
                :items="bankAccountList"
                item-title="title"
                item-value="id"
                :loading="loadingAccounts"
                density="compact"
                variant="outlined"
                rounded="lg"
                color="#07254A"
                :rules="[r.required]"
                placeholder="Selecciona la cuenta destino"
                class="custom-field"
              ></v-select>
            </v-col>

            <!-- Monto Transferido -->
            <v-col cols="12" md="3" class="px-2">
              <label class="field-label">Monto transferido (Opcional)</label>
              <v-text-field
                v-model="f.amount"
                type="number"
                step="0.01"
                prefix="$"
                placeholder="0.00"
                prepend-inner-icon="mdi-currency-usd"
                density="compact"
                variant="outlined"
                rounded="lg"
                color="#07254A"
                class="custom-field font-mono"
              ></v-text-field>
            </v-col>

            <!-- Archivo Comprobante -->
            <v-col cols="12" md="3" class="px-2">
              <label class="field-label">Comprobante (PDF, JPG, PNG) *</label>
              <v-file-input
                v-model="f.file"
                density="compact"
                variant="outlined"
                rounded="lg"
                prepend-icon=""
                prepend-inner-icon="mdi-paperclip"
                show-size
                accept="application/pdf,image/png,image/jpeg,image/jpg"
                placeholder="Seleccionar archivo"
                color="#07254A"
                :rules="[r.requiredFile]"
                class="custom-field"
              ></v-file-input>
            </v-col>

            <!-- Notas / Referencia -->
            <v-col cols="12" class="px-2">
              <label class="field-label">Referencia bancaria o nota descriptiva (Opcional)</label>
              <v-text-field
                v-model="f.notes"
                placeholder="Ej. Transferencia correspondiente a evaluaciones del mes"
                density="compact"
                variant="outlined"
                rounded="lg"
                color="#07254A"
                class="custom-field"
              ></v-text-field>
            </v-col>
          </v-row>

          <div class="d-flex justify-end mt-2">
            <v-btn
              type="submit"
              color="#07254A"
              variant="flat"
              rounded="lg"
              size="small"
              prepend-icon="mdi-upload"
              class="text-none font-weight-bold text-white px-5 submit-btn"
              :loading="uploadingReceipt"
            >
              Enviar Comprobante
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="top right" timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { usePaymentsStore } from '@/store/payments';

export default {
  name: 'UploadReceiptComponent',
  data() {
    return {
      valid: false,
      f: {
        bank_account_id: null, // Guarda únicamente el string del UUID
        amount: '',
        notes: '',
        file: null,
      },
      r: {
        required: v => !!v || 'Campo obligatorio.',
        requiredFile: v => {
          if (!v) return 'El comprobante es obligatorio.';
          const file = Array.isArray(v) ? v[0] : v;
          if (!file) return 'El comprobante es obligatorio.';
          if (file.size > 5 * 1024 * 1024) return 'El archivo excede los 5 MB permitidos.';
          return true;
        },
      },
      snackbar: { show: false, text: '', color: 'success' },
    };
  },
  computed: {
    ...mapState(usePaymentsStore, [
      'bankAccountList',
      'defaultFiscalAccountId',
      'loadingAccounts',
      'uploadingReceipt',
    ]),
  },
  async mounted() {
    await this.fetchBankAccounts();
    // Asigna únicamente el UUID (string)
    if (this.defaultFiscalAccountId) {
      this.f.bank_account_id = this.defaultFiscalAccountId;
    }
  },
  methods: {
    ...mapActions(usePaymentsStore, ['fetchBankAccounts', 'uploadReceipt']),

    notify(text, color = 'success') {
      this.snackbar.text = text;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },

    async submitReceipt() {
      const { valid } = await this.$refs.form.validate();
      if (!valid) return;

      const fileToUpload = Array.isArray(this.f.file) ? this.f.file[0] : this.f.file;
      if (!fileToUpload) {
        this.notify('Debes seleccionar un archivo.', 'error');
        return;
      }

      const formData = new FormData();
      formData.append('receipt', fileToUpload);
      formData.append('bank_account_id', this.f.bank_account_id);
      if (this.f.amount) formData.append('amount', this.f.amount);
      if (this.f.notes) formData.append('notes', this.f.notes);

      try {
        const response = await this.uploadReceipt(formData);
        this.notify(response.message || 'Comprobante recibido exitosamente.');

        // Limpieza y reseteo al UUID por defecto
        this.$refs.form.reset();
        this.f.amount = '';
        this.f.notes = '';
        this.f.file = null;
        this.f.bank_account_id = this.defaultFiscalAccountId;
      } catch (err) {
        const msg = err.response?.data?.message || 'Error al subir el comprobante.';
        this.notify(msg, 'error');
      }
    },
  },
};
</script>

<style scoped>
.max-wrapper { max-width: 1200px; margin: 0 auto; }
.upload-receipt-card {
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
.card-title { font-size: 0.95rem; font-weight: 700; }
.card-subtitle { font-size: 0.72rem; }
.field-label {
  display: block;
  font-size: 0.76rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 4px;
}
:deep(.custom-field .v-field) {
  border-radius: 8px !important;
  font-size: 0.82rem !important;
}
.submit-btn { height: 36px !important; font-size: 0.8rem !important; }
.font-mono { font-family: monospace; }
</style>
