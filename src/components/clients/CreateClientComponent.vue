<template>
  <v-card flat class="client-reg-card elevation-0">
    <!-- Header Corporativo Ópalo -->
    <div class="card-table-header px-6 py-4 d-flex align-center justify-space-between flex-wrap gap-2">
      <div class="d-flex align-center">
        <div class="header-icon-box mr-3 flex-shrink-0">
          <v-icon icon="mdi-domain-plus" color="#ffffff" size="20"></v-icon>
        </div>
        <div>
          <h2 class="card-title text-white mb-0">Alta de Empresa Cliente</h2>
          <span class="card-subtitle text-white opacity-80">
            Registra una nueva razón social para solicitud de evaluaciones de confianza
          </span>
        </div>
      </div>
      <v-chip color="rgba(255,255,255,0.15)" text-color="#ffffff" size="small" class="font-weight-bold text-white">
        <v-icon icon="mdi-shield-check-outline" start size="14"></v-icon>
        Credenciales Automatizadas
      </v-chip>
    </div>

    <!-- Formulario Modular -->
    <v-card-text class="pa-6 bg-slate-50">
      <v-form ref="form" v-model="valid" @submit.prevent="submit">
        <v-row dense>
          <!-- BLOQUE 1: IDENTIDAD FISCAL Y COMERCIAL -->
          <v-col cols="12" class="mb-2">
            <div class="section-indicator d-flex align-center mb-3">
              <span class="step-badge mr-2">1</span>
              <span class="step-title">Datos Fiscales y Comerciales</span>
            </div>
            <v-card flat class="inner-step-card pa-4">
              <v-row dense>
                <!-- Razón Social -->
                <v-col cols="12" md="6" class="px-2 mb-2">
                  <label class="field-label">Razón Social *</label>
                  <v-text-field
                    v-model="f.company_name"
                    placeholder="Ej. Logística y Transportes del Norte S.A. de C.V."
                    prepend-inner-icon="mdi-domain"
                    density="compact"
                    variant="outlined"
                    rounded="lg"
                    color="#07254A"
                    :rules="[r.required]"
                    class="custom-field bg-white"
                  ></v-text-field>
                </v-col>

                <!-- Nombre Comercial -->
                <v-col cols="12" md="6" class="px-2 mb-2">
                  <label class="field-label">Nombre Comercial / Corto *</label>
                  <v-text-field
                    v-model="f.trade_name"
                    placeholder="Ej. TransNorte"
                    prepend-inner-icon="mdi-tag-outline"
                    density="compact"
                    variant="outlined"
                    rounded="lg"
                    color="#07254A"
                    :rules="[r.required]"
                    class="custom-field bg-white"
                  ></v-text-field>
                </v-col>

                <!-- RFC -->
                <v-col cols="12" md="4" class="px-2 mb-2">
                  <label class="field-label">RFC (con Homoclave) *</label>
                  <v-text-field
                    v-model="f.rfc"
                    placeholder="Ej. LTN180512AB3"
                    prepend-inner-icon="mdi-card-account-details-outline"
                    density="compact"
                    variant="outlined"
                    rounded="lg"
                    color="#07254A"
                    :rules="[r.required, r.rfc]"
                    class="custom-field bg-white uppercase-input"
                    @input="f.rfc = f.rfc ? f.rfc.toUpperCase() : ''"
                  ></v-text-field>
                </v-col>

                <!-- Régimen Fiscal -->
                <v-col cols="12" md="5" class="px-2 mb-2">
                  <label class="field-label">Régimen Fiscal *</label>
                  <v-select
                    v-model="f.fiscal_regime"
                    :items="fiscalRegimeOptions"
                    item-title="title"
                    item-value="value"
                    placeholder="Selecciona régimen..."
                    prepend-inner-icon="mdi-file-certificate-outline"
                    density="compact"
                    variant="outlined"
                    rounded="lg"
                    color="#07254A"
                    :rules="[r.required]"
                    class="custom-field bg-white"
                  ></v-select>
                </v-col>

                <!-- Código Postal Fiscal -->
                <v-col cols="12" md="3" class="px-2 mb-2">
                  <label class="field-label">C.P. Fiscal *</label>
                  <v-text-field
                    v-model="f.fiscal_zip_code"
                    placeholder="Ej. 45100"
                    prepend-inner-icon="mdi-map-marker-outline"
                    density="compact"
                    variant="outlined"
                    rounded="lg"
                    color="#07254A"
                    maxlength="5"
                    :rules="[r.required, r.zipCode]"
                    class="custom-field bg-white"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-card>
          </v-col>

          <!-- BLOQUE 2: ENLACE DE RECURSOS HUMANOS / CONTACTO -->
          <v-col cols="12" class="mb-2">
            <div class="section-indicator d-flex align-center mb-3">
              <span class="step-badge mr-2">2</span>
              <span class="step-title">Contacto y Acceso al Portal</span>
            </div>
            <v-card flat class="inner-step-card pa-4">
              <v-row dense>
                <!-- Correo de Acceso -->
                <v-col cols="12" md="6" class="px-2 mb-2">
                  <label class="field-label">Correo Electrónico (Usuario del Portal) *</label>
                  <v-text-field
                    v-model="f.contact_email"
                    placeholder="Ej. rh@transnorte.com"
                    prepend-inner-icon="mdi-email-outline"
                    density="compact"
                    variant="outlined"
                    rounded="lg"
                    color="#07254A"
                    :rules="[r.required, r.email]"
                    class="custom-field bg-white"
                  ></v-text-field>
                </v-col>

                <!-- Teléfono -->
                <v-col cols="12" md="6" class="px-2 mb-2">
                  <label class="field-label">Teléfono de Contacto (10 Dígitos) *</label>
                  <v-text-field
                    v-model="f.contact_phone"
                    placeholder="Ej. 3312345678"
                    prepend-inner-icon="mdi-phone-outline"
                    density="compact"
                    variant="outlined"
                    rounded="lg"
                    color="#07254A"
                    maxlength="10"
                    :rules="[r.required, r.phone]"
                    class="custom-field bg-white"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-card>
          </v-col>

          <!-- BLOQUE 3: POLÍTICA DE ORDEN DE COMPRA (NUEVO) -->
          <v-col cols="12" class="mb-2">
            <div class="section-indicator d-flex align-center mb-3">
              <span class="step-badge mr-2">3</span>
              <span class="step-title">Condiciones de Facturación</span>
            </div>
            <v-card flat class="inner-step-card pa-4">
              <div class="d-flex align-center justify-space-between flex-wrap gap-2">
                <div style="max-width: 680px;">
                  <span class="font-weight-bold text-slate-800 text-body-2 d-block">
                    ¿Requiere Orden de Compra (PO) previa?
                  </span>
                  <span class="text-caption text-slate-500">
                    Al activar esta opción, el cliente verá un aviso obligatorio al generar citas u órdenes indicando que debe enviar su Orden de Compra previa a la facturación.
                  </span>
                </div>
                <v-switch
                  v-model="f.requires_purchase_order"
                  color="#07254A"
                  inset
                  hide-details
                  density="compact"
                ></v-switch>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Barra Inferior -->
        <div class="d-flex align-center justify-space-between flex-wrap gap-2 mt-4 pt-2">
          <span class="text-caption text-slate-500">
            Al registrarse, el sistema generará la cuenta del cliente y enviará el correo con sus claves de acceso.
          </span>

          <v-btn
            type="submit"
            color="#07254A"
            variant="flat"
            rounded="lg"
            size="default"
            prepend-icon="mdi-check-circle"
            class="text-none font-weight-bold text-white px-6 submit-btn"
            :loading="saving"
          >
            Registrar Empresa
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
import { mapState, mapActions } from 'pinia';
import { useClientsStore } from '@/store/clients';

export default {
  name: 'ClientRegistrationComponent',
  emits: ['client-registered'],
  data() {
    return {
      valid: false,
      f: {
        company_name: '',
        trade_name: '',
        rfc: '',
        fiscal_regime: '',
        fiscal_zip_code: '',
        contact_email: '',
        contact_phone: '',
        requires_purchase_order: false,
      },
      fiscalRegimeOptions: [
        { title: '601 - General de Ley Personas Morales', value: '601 - General de Ley Personas Morales' },
        { title: '603 - Personas Morales con Fines no Lucrativos', value: '603 - Personas Morales con Fines no Lucrativos' },
        { title: '612 - Personas Físicas con Actividades Empresariales y Profesionales', value: '612 - Personas Físicas con Actividades Empresariales y Profesionales' },
        { title: '626 - Régimen Simplificado de Confianza (RESICO)', value: '626 - Régimen Simplificado de Confianza (RESICO)' },
      ],
      r: {
        required: (v) => !!v || 'Campo obligatorio.',
        rfc: (v) => (!v || (v.length >= 12 && v.length <= 13)) || 'El RFC debe tener entre 12 y 13 caracteres.',
        email: (v) => (!v || /.+@.+\..+/.test(v)) || 'Ingresa un correo electrónico válido.',
        phone: (v) => (!v || /^[0-9]{10}$/.test(v)) || 'El teléfono debe contener 10 dígitos numéricos.',
        zipCode: (v) => (!v || /^[0-9]{5}$/.test(v)) || 'El C.P. debe contener 5 dígitos.',
      },
      snackbar: { show: false, text: '', color: 'success' },
    };
  },

  computed: {
    ...mapState(useClientsStore, ['saving']),
  },

  methods: {
    ...mapActions(useClientsStore, ['registerClient', 'addClientToTop']),

    notify(text, color = 'success') {
      this.snackbar.text = text;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },

    clearForm() {
      this.f = {
        company_name: '',
        trade_name: '',
        rfc: '',
        fiscal_regime: '',
        fiscal_zip_code: '',
        contact_email: '',
        contact_phone: '',
        requires_purchase_order: false,
      };
      if (this.$refs.form) {
        this.$refs.form.resetValidation();
      }
    },

    async submit() {
      const { valid } = await this.$refs.form.validate();
      if (!valid) {
        this.notify('Por favor completa todos los campos requeridos correctamente.', 'error');
        return;
      }

      const res = await this.registerClient({
        company_name: this.f.company_name,
        trade_name: this.f.trade_name,
        rfc: this.f.rfc.toUpperCase().trim(),
        fiscal_regime: this.f.fiscal_regime,
        fiscal_zip_code: this.f.fiscal_zip_code.trim(),
        contact_email: this.f.contact_email.toLowerCase().trim(),
        contact_phone: this.f.contact_phone.trim(),
        requires_purchase_order: this.f.requires_purchase_order,
      });

      if (res.success) {
        this.notify(res.message);
        this.addClientToTop(res.client);
        this.clearForm();
      } else {
        this.notify(res.message, 'error');
      }
    },
  },
};
</script>

<style scoped>
.client-reg-card {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 14px !important;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04) !important;
}

.card-table-header {
  background: linear-gradient(135deg, #07254A 0%, #0e1726 100%) !important;
}

.header-icon-box {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-title {
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: -0.2px;
}

.card-subtitle {
  font-size: 0.78rem;
}

.bg-slate-50 {
  background-color: #f8fafc;
}

.inner-step-card {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 10px !important;
}

.step-badge {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background-color: #07254A;
  color: #ffffff;
  font-size: 0.72rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.step-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: #1e293b;
}

.field-label {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 5px;
}

:deep(.custom-field .v-field) {
  border-radius: 8px !important;
  font-size: 0.84rem !important;
}

:deep(.uppercase-input input) {
  text-transform: uppercase;
}

.submit-btn {
  height: 40px !important;
  font-size: 0.85rem !important;
  box-shadow: 0 2px 6px rgba(7, 37, 74, 0.2) !important;
}

.gap-2 {
  gap: 8px;
}
</style>
