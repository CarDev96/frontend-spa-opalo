<template>
  <v-card flat class="create-examinee-card elevation-0">
    <!-- Cabecera Corporativa -->
    <div class="card-header px-6 py-4 opaloBrand d-flex align-center">
      <div class="header-icon-box mr-3 flex-shrink-0">
        <v-icon icon="mdi-account-plus-outline" color="#ffffff" size="20"></v-icon>
      </div>
      <div>
        <h2 class="card-title text-white mb-0">Registrar Nuevo Evaluado</h2>
        <p class="card-subtitle text-white opacity-80 mb-0">
          Ingresa los datos del candidato para agendar su cita y generar su expediente
        </p>
      </div>
    </div>

    <!-- Formulario -->
    <v-card-text class="pa-6">
      <v-form ref="form" v-model="valid" @submit.prevent="submit">
        <v-row dense>
          <!-- Nombre Completo -->
          <v-col cols="12" md="6" class="px-2">
            <label class="field-label">Nombre Completo del Evaluado *</label>
            <v-text-field
              v-model="f.full_name"
              placeholder="Ej. Juan Carlos Pérez Morales"
              prepend-inner-icon="mdi-account-outline"
              density="compact"
              variant="outlined"
              rounded="lg"
              color="#07254A"
              :rules="[r.required]"
              class="custom-field"
            ></v-text-field>
          </v-col>

          <!-- Puesto / Categoría -->
          <v-col cols="12" md="6" class="px-2">
            <label class="field-label">Puesto o Categoría a Evaluar *</label>
            <v-text-field
              v-model="f.position"
              placeholder="Ej. Operador de Transporte de Carga / Custodio"
              prepend-inner-icon="mdi-briefcase-outline"
              density="compact"
              variant="outlined"
              rounded="lg"
              color="#07254A"
              :rules="[r.required]"
              class="custom-field"
            ></v-text-field>
          </v-col>

          <!-- Teléfono Obligatorio -->
          <v-col cols="12" md="4" class="px-2">
            <label class="field-label">Número de Teléfono (Móvil) *</label>
            <v-text-field
              v-model="f.phone"
              placeholder="Ej. 3312345678"
              prepend-inner-icon="mdi-phone-outline"
              density="compact"
              variant="outlined"
              rounded="lg"
              color="#07254A"
              :rules="[r.required]"
              class="custom-field font-mono"
            ></v-text-field>
          </v-col>

          <!-- Correo Electrónico (Opcional) -->
          <v-col cols="12" md="4" class="px-2">
            <label class="field-label">Correo Electrónico (Opcional)</label>
            <v-text-field
              v-model="f.email"
              placeholder="evaluado@ejemplo.com"
              prepend-inner-icon="mdi-email-outline"
              density="compact"
              variant="outlined"
              rounded="lg"
              color="#07254A"
              :rules="[r.email]"
              class="custom-field"
            ></v-text-field>
          </v-col>

          <!-- CURP (Opcional) -->
          <v-col cols="12" md="4" class="px-2">
            <label class="field-label">CURP (Opcional - 18 caracteres)</label>
            <v-text-field
              v-model="f.curp"
              placeholder="ABCD010203HDFRRL01"
              prepend-inner-icon="mdi-card-account-details-outline"
              density="compact"
              variant="outlined"
              rounded="lg"
              color="#07254A"
              :rules="[r.curp]"
              class="custom-field font-mono text-uppercase"
              maxlength="18"
            ></v-text-field>
          </v-col>
        </v-row>

        <div class="d-flex justify-end mt-4">
          <v-btn
            type="submit"
            color="#07254A"
            variant="flat"
            rounded="lg"
            size="small"
            prepend-icon="mdi-account-plus"
            class="text-none font-weight-bold text-white px-5 submit-btn"
            :loading="saving"
          >
            Registrar Evaluado
          </v-btn>
        </div>
      </v-form>
    </v-card-text>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="top right" timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </v-card>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useExamineesStore } from '@/store/examinees';

export default {
  name: 'CreateExamineeComponent',
  data() {
    return {
      valid: false,
      f: {
        full_name: '',
        position: '',
        phone: '',
        email: '',
        curp: '',
      },
      r: {
        required: (v) => !!v || 'Campo obligatorio.',
        email: (v) => !v || /.+@.+\..+/.test(v) || 'Correo no válido.',
        curp: (v) => !v || v.length === 18 || 'La CURP debe tener 18 caracteres.',
      },
      snackbar: { show: false, text: '', color: 'success' },
    };
  },

  computed: {
    ...mapState(useExamineesStore, ['saving']),
  },

  methods: {
    ...mapActions(useExamineesStore, ['addExaminee']),

    notify(text, color = 'success') {
      this.snackbar.text = text;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },

    async submit() {
      const { valid } = await this.$refs.form.validate();
      if (!valid) return;

      const res = await this.addExaminee({
        full_name: this.f.full_name,
        position: this.f.position,
        phone: this.f.phone,
        email: this.f.email || null,
        curp: this.f.curp ? this.f.curp.toUpperCase() : null,
      });

      if (res.success) {
        this.notify(res.message);
        this.$refs.form.reset();
        this.f.full_name = '';
        this.f.position = '';
        this.f.phone = '';
        this.f.email = '';
        this.f.curp = '';
      } else {
        this.notify(res.message, 'error');
      }
    },
  },
};
</script>

<style scoped>
.create-examinee-card {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 14px !important;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04) !important;
}

.opaloBrand {
  background: linear-gradient(135deg, #07254A 0%, #0e1726 100%) !important;
}

.header-icon-box {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
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

.field-label {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 4px;
}

:deep(.custom-field .v-field) {
  border-radius: 8px !important;
  font-size: 0.85rem !important;
}

.submit-btn {
  height: 38px !important;
  font-size: 0.82rem !important;
}

.font-mono {
  font-family: monospace;
}
</style>
