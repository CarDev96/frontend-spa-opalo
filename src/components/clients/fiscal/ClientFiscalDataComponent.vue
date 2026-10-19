<template>
  <div class="client-fiscal-data-component">
    <!-- Header Corporativo -->
    <v-card flat class="fiscal-header-card elevation-0 mb-6">
      <div class="card-header px-6 py-4 d-flex align-center justify-space-between text-white">
        <div class="d-flex align-center">
          <div class="header-icon-box mr-3 flex-shrink-0">
            <v-icon icon="mdi-file-certificate-outline" color="#ffffff" size="22"></v-icon>
          </div>
          <div>
            <h2 class="card-title text-white mb-0">Datos Fiscales y Facturación (CSF)</h2>
            <span class="card-subtitle text-white opacity-80">
              Registra tu Constancia de Situación Fiscal actualizada para la emisión de tus facturas CFDI
            </span>
          </div>
        </div>
      </div>
    </v-card>

    <!-- Alerta Informativa del SAT -->
    <v-alert
      density="comfortable"
      type="info"
      variant="tonal"
      color="#07254A"
      class="mb-6 rounded-xl border text-caption"
    >
      <div class="d-flex align-center">
        <v-icon icon="mdi-shield-alert-outline" color="#07254A" class="mr-2" size="20"></v-icon>
        <div>
          Conforme a las disposiciones del SAT para <strong>CFDI 4.0</strong>, la <strong>Razón Social</strong>, <strong>RFC</strong>, <strong>Régimen Fiscal</strong> y <strong>Código Postal</strong> deben coincidir idénticamente con tu Constancia de Situación Fiscal vigente (no mayor a 3 meses).
        </div>
      </div>
    </v-alert>

    <v-row dense>
      <!-- Formulario de Captura y Carga -->
      <v-col cols="12" md="7">
        <v-card flat class="fiscal-card elevation-0 h-100">
          <div class="px-6 py-4 border-bottom bg-slate-50 d-flex align-center">
            <v-icon icon="mdi-cloud-upload-outline" color="#07254A" class="mr-2" size="20"></v-icon>
            <h3 class="text-subtitle-1 font-weight-bold text-slate-800 mb-0">
              Actualizar Constancia de Situación Fiscal
            </h3>
          </div>

          <v-card-text class="pa-6 bg-white">
            <v-form ref="fiscalFormRef" @submit.prevent="submitFiscalData">
              <v-row dense>
                <!-- RFC -->
                <v-col cols="12" sm="6" class="pa-2">
                  <label class="field-label">RFC Receptor *</label>
                  <v-text-field
                    v-model="form.rfc"
                    placeholder="Ej. LTN180512AB3"
                    prepend-inner-icon="mdi-card-text-outline"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    maxlength="13"
                    color="#07254A"
                    class="text-uppercase"
                    :rules="[
                      (v) => !!v || 'El RFC es obligatorio',
                      (v) => (v && v.length >= 12) || 'Mínimo 12 caracteres',
                      (v) => /^[A-Z&Ñ]{3,4}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])[A-Z0-9]{3}$/i.test(v) || 'Formato de RFC no válido'
                    ]"
                  ></v-text-field>
                </v-col>

                <!-- Código Postal -->
                <v-col cols="12" sm="6" class="pa-2">
                  <label class="field-label">Código Postal Fiscal *</label>
                  <v-text-field
                    v-model="form.postal_code"
                    placeholder="45100"
                    prepend-inner-icon="mdi-map-marker-outline"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    maxlength="5"
                    color="#07254A"
                    :rules="[
                      (v) => !!v || 'El código postal es obligatorio',
                      (v) => /^[0-9]{5}$/.test(v) || 'Debe ser de 5 dígitos'
                    ]"
                  ></v-text-field>
                </v-col>

                <!-- Razón Social -->
                <v-col cols="12" class="pa-2">
                  <label class="field-label">Razón Social *</label>
                  <v-text-field
                    v-model="form.business_name"
                    placeholder="Ej. LOGÍSTICA Y TRANSPORTES DEL NORTE S.A. DE C.V."
                    prepend-inner-icon="mdi-domain"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    color="#07254A"
                    class="text-uppercase"
                    :rules="[(v) => !!v || 'La razón social es obligatoria']"
                  ></v-text-field>
                </v-col>

                <!-- Régimen Fiscal -->
                <v-col cols="12" class="pa-2">
                  <label class="field-label">Régimen Fiscal *</label>
                  <v-select
                    v-model="form.fiscal_regime"
                    :items="regimes"
                    placeholder="Selecciona tu régimen fiscal"
                    prepend-inner-icon="mdi-briefcase-outline"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    color="#07254A"
                    :rules="[(v) => !!v || 'Debes seleccionar el régimen fiscal']"
                  ></v-select>
                </v-col>

                <!-- Archivo PDF con regla corregida para Vuetify 3 -->
                <v-col cols="12" class="pa-2">
                  <label class="field-label">Constancia de Situación Fiscal en PDF (Max 15MB) *</label>
                  <v-file-input
                    v-model="form.file"
                    accept="application/pdf"
                    prepend-icon=""
                    prepend-inner-icon="mdi-file-pdf-box"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    color="#07254A"
                    placeholder="Selecciona tu archivo PDF"
                    :rules="[
                      (v) => (Array.isArray(v) ? v.length > 0 : !!v) || 'Debes adjuntar el archivo PDF de tu constancia'
                    ]"
                  ></v-file-input>
                </v-col>
              </v-row>

              <div class="d-flex justify-end mt-4">
                <v-btn
                  type="submit"
                  color="#07254A"
                  variant="flat"
                  rounded="lg"
                  prepend-icon="mdi-content-save-check"
                  class="text-none font-weight-bold text-white px-6"
                  :loading="submitting"
                >
                  Guardar Datos Fiscales
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Resumen / Estado de la Constancia Actual -->
      <v-col cols="12" md="5">
        <v-card flat class="fiscal-card elevation-0 h-100">
          <div class="px-6 py-4 border-bottom bg-slate-50 d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-icon icon="mdi-file-eye-outline" color="#07254A" class="mr-2" size="20"></v-icon>
              <h3 class="text-subtitle-1 font-weight-bold text-slate-800 mb-0">
                Constancia Registrada
              </h3>
            </div>
            <v-chip
              v-if="currentDoc"
              size="small"
              :color="getStatusColor(currentDoc.status)"
              variant="flat"
              class="font-weight-bold text-white status-chip"
            >
              {{ formatStatus(currentDoc.status) }}
            </v-chip>
          </div>

          <v-card-text class="pa-6 bg-white">
            <div v-if="currentDoc">
              <div class="mb-3">
                <span class="label-caption">RFC REGISTRADO</span>
                <div class="text-body-1 font-mono font-weight-bold text-slate-800">
                  {{ currentDoc.rfc }}
                </div>
              </div>

              <div class="mb-3">
                <span class="label-caption">RAZÓN SOCIAL</span>
                <div class="text-body-2 font-weight-bold text-slate-800">
                  {{ currentDoc.business_name }}
                </div>
              </div>

              <div class="mb-3">
                <span class="label-caption">RÉGIMEN FISCAL</span>
                <div class="text-caption font-weight-medium text-slate-700">
                  {{ currentDoc.fiscal_regime }}
                </div>
              </div>

              <div class="mb-4">
                <span class="label-caption">CÓDIGO POSTAL</span>
                <div class="text-body-2 font-mono font-weight-bold text-slate-800">
                  {{ currentDoc.postal_code }}
                </div>
              </div>

              <v-alert
                v-if="currentDoc.status === 'rejected'"
                type="error"
                density="compact"
                variant="tonal"
                class="mb-4 text-caption rounded-lg"
              >
                <strong>Motivo de rechazo:</strong> {{ currentDoc.rejection_reason }}
              </v-alert>

              <div class="pdf-box pa-4 rounded-xl border bg-slate-50 d-flex align-center justify-space-between">
                <div class="d-flex align-center text-truncate mr-2">
                  <v-icon icon="mdi-file-pdf-box" color="#EF4444" size="32" class="mr-2"></v-icon>
                  <div class="text-truncate">
                    <div class="text-caption font-weight-bold text-slate-800 text-truncate">
                      {{ currentDoc.original_name }}
                    </div>
                    <div class="text-caption text-grey">
                      {{ formatFileSize(currentDoc.file_size) }}
                    </div>
                  </div>
                </div>

                <v-btn
                  v-if="currentDoc.file_url"
                  variant="flat"
                  size="small"
                  color="#07254A"
                  rounded="lg"
                  prepend-icon="mdi-download"
                  class="text-none font-weight-bold text-white flex-shrink-0"
                  @click="openFile(currentDoc.file_url)"
                >
                  Ver PDF
                </v-btn>
              </div>
            </div>

            <div v-else class="text-center py-12">
              <v-avatar size="56" color="#f8fafc" class="border mb-3">
                <v-icon size="28" color="#07254A">mdi-file-pdf-box</v-icon>
              </v-avatar>
              <div class="text-body-2 font-weight-bold text-slate-800">
                Sin Constancia Registrada
              </div>
              <p class="text-caption text-slate-500 mb-0">
                Completa el formulario lateral para habilitar la facturación de tus servicios.
              </p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="top right" timeout="3500">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'ClientFiscalDataComponent',
  data() {
    return {
      submitting: false,
      currentDoc: null,
      form: {
        rfc: '',
        business_name: '',
        postal_code: '',
        fiscal_regime: null,
        file: null,
      },
      regimes: [
        '601 - General de Ley Personas Morales',
        '603 - Personas Morales con Fines no Lucrativos',
        '612 - Personas Físicas con Actividades Empresariales y Profesionales',
        '626 - Régimen Simplificado de Confianza (RESICO)',
        '605 - Sueldos y Salarios e Ingresos Asimilados a Salarios',
        '606 - Arrendamiento',
      ],
      snackbar: { show: false, text: '', color: 'success' },
    };
  },

  mounted() {
    this.fetchFiscalData();
  },

  methods: {
    notify(text, color = 'success') {
      this.snackbar.text = text;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },

    formatFileSize(bytes) {
      if (!bytes) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    },

    openFile(url) {
      if (url) window.open(url, '_blank');
    },

    getStatusColor(status) {
      const map = {
        pending: '#0284C7',
        approved: '#10B981',
        rejected: '#EF4444',
      };
      return map[status] || '#64748B';
    },

    formatStatus(status) {
      const map = {
        pending: 'En Revisión',
        approved: 'Validada',
        rejected: 'Rechazada',
      };
      return map[status] || 'Pendiente';
    },

    async fetchFiscalData() {
      try {
        const res = await api.get('/portal/fiscal-data');
        const client = res.data?.client;
        const fiscalDoc = res.data?.fiscal_document;

        if (fiscalDoc) {
          this.currentDoc = fiscalDoc;
          this.form.rfc = fiscalDoc.rfc;
          this.form.business_name = fiscalDoc.business_name;
          this.form.postal_code = fiscalDoc.postal_code;
          this.form.fiscal_regime = fiscalDoc.fiscal_regime;
        } else if (client) {
          this.form.rfc = client.rfc || '';
          this.form.business_name = client.company_name || '';
          this.form.postal_code = client.fiscal_zip_code || '';
          this.form.fiscal_regime = client.fiscal_regime || null;
        }
      } catch (e) {
        console.error('Error cargando datos fiscales:', e);
      }
    },

    async submitFiscalData() {
      const { valid } = await this.$refs.fiscalFormRef.validate();
      if (!valid) return;

      // Extracción segura del archivo (soporta File único o Array de Vuetify)
      let fileObj = this.form.file;
      if (Array.isArray(fileObj)) {
        fileObj = fileObj[0];
      }

      if (!fileObj) {
        this.notify('Debes adjuntar el archivo PDF de la constancia.', 'error');
        return;
      }

      const formData = new FormData();
      formData.append('rfc', this.form.rfc.trim().toUpperCase());
      formData.append('business_name', this.form.business_name.trim().toUpperCase());
      formData.append('fiscal_regime', this.form.fiscal_regime);
      formData.append('postal_code', this.form.postal_code.trim());
      formData.append('file', fileObj);

      this.submitting = true;
      try {
        const res = await api.post('/portal/fiscal-data', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        this.notify(res.data.message || 'Constancia fiscal registrada correctamente.');
        this.currentDoc = res.data.fiscal_document;
        this.form.file = null;
        this.$refs.fiscalFormRef.resetValidation();
      } catch (e) {
        this.notify(e.response?.data?.message || 'Error al guardar constancia fiscal.', 'error');
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>

<style scoped>
.fiscal-header-card,
.fiscal-card {
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

.label-caption {
  display: block;
  font-size: 0.72rem;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 0.3px;
  margin-bottom: 2px;
}

.pdf-box {
  border: 1px dashed #cbd5e1;
}

.status-chip {
  padding: 0 8px !important;
  height: 22px !important;
  font-size: 0.72rem !important;
}
</style>
