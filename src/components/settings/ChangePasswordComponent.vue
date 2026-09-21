<template>
  <div class="password-module-wrapper py-1">
    <v-form ref="form" v-model="valid" @submit.prevent="submitPasswordChange">
      <v-row dense>
        <!-- Contraseña Actual -->
        <v-col cols="12" md="4" class="px-2">
          <label class="field-label">Contraseña Actual *</label>
          <v-text-field
            v-model="f.current_password"
            :type="showCurrent ? 'text' : 'password'"
            placeholder="Tu clave actual"
            prepend-inner-icon="mdi-lock-outline"
            :append-inner-icon="showCurrent ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
            @click:append-inner="showCurrent = !showCurrent"
            variant="outlined"
            density="compact"
            rounded="lg"
            :rules="[r.required]"
            :error-messages="errors.current_password"
            @update:model-value="errors.current_password = ''"
            color="#07254A"
            class="custom-field"
          ></v-text-field>
        </v-col>

        <!-- Nueva Contraseña -->
        <v-col cols="12" md="4" class="px-2">
          <label class="field-label">Nueva Contraseña *</label>
          <v-text-field
            v-model="f.password"
            :type="showNew ? 'text' : 'password'"
            placeholder="Mínimo 8 caracteres"
            prepend-inner-icon="mdi-lock-plus-outline"
            :append-inner-icon="showNew ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
            @click:append-inner="showNew = !showNew"
            variant="outlined"
            density="compact"
            rounded="lg"
            :rules="[r.required, r.min, r.different]"
            :error-messages="errors.password"
            @update:model-value="errors.password = ''"
            color="#07254A"
            class="custom-field"
          ></v-text-field>
        </v-col>

        <!-- Confirmar Contraseña -->
        <v-col cols="12" md="4" class="px-2">
          <label class="field-label">Confirmar Contraseña *</label>
          <v-text-field
            v-model="f.password_confirmation"
            :type="showNew ? 'text' : 'password'"
            placeholder="Repite la nueva clave"
            prepend-inner-icon="mdi-lock-check-outline"
            variant="outlined"
            density="compact"
            rounded="lg"
            :rules="[r.required, r.match]"
            color="#07254A"
            class="custom-field"
          ></v-text-field>
        </v-col>
      </v-row>

      <div class="d-flex justify-end mt-3">
        <v-btn
          type="submit"
          color="#07254A"
          variant="flat"
          rounded="lg"
          size="small"
          prepend-icon="mdi-key-change"
          class="text-none font-weight-bold text-white px-5 submit-btn"
          :loading="loading"
        >
          Actualizar Contraseña
        </v-btn>
      </div>
    </v-form>

    <!-- Feedback Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="top right" timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'ChangePasswordComponent',
  data() {
    return {
      valid: false,
      loading: false,
      showCurrent: false,
      showNew: false,
      f: {
        current_password: '',
        password: '',
        password_confirmation: '',
      },
      errors: {
        current_password: '',
        password: '',
      },
      r: {
        required: v => !!v || 'Campo requerido.',
        min: v => (v && v.length >= 8) || 'Debe contener al menos 8 caracteres.',
        match: v => v === this.f.password || 'Las contraseñas no coinciden.',
        different: v => v !== this.f.current_password || 'La nueva clave debe ser distinta a la actual.',
      },
      snackbar: {
        show: false,
        text: '',
        color: 'success',
      },
    };
  },
  methods: {
    notify(text, color = 'success') {
      this.snackbar.text = text;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },

    async submitPasswordChange() {
      const { valid } = await this.$refs.form.validate();
      if (!valid) return;

      this.loading = true;
      this.errors.current_password = '';
      this.errors.password = '';

      try {
        const response = await api.put('/user/password', this.f);
        this.notify(response.data.message || 'Contraseña actualizada correctamente.');

        // Limpieza de campos tras guardar
        this.$refs.form.reset();
        this.f.current_password = '';
        this.f.password = '';
        this.f.password_confirmation = '';
      } catch (err) {
        if (err.response?.status === 422 && err.response.data?.errors) {
          const resErrors = err.response.data.errors;
          if (resErrors.current_password) {
            this.errors.current_password = resErrors.current_password[0];
          }
          if (resErrors.password) {
            this.errors.password = resErrors.password[0];
          }
        } else {
          this.notify(err.response?.data?.message || 'Error al actualizar la contraseña.', 'error');
        }
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.field-label {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 4px;
}

:deep(.custom-field .v-field) {
  border-radius: 8px !important;
  font-size: 0.82rem !important;
}

.submit-btn {
  height: 36px !important;
  font-size: 0.8rem !important;
}
</style>
