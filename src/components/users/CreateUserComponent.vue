<template>
  <v-card flat class="create-client-card elevation-0 mb-6">
    <!-- Header Corporativo idéntico a Clientes -->
    <div class="card-header px-6 py-4 d-flex align-center justify-space-between">
      <div class="d-flex align-center">
        <div class="header-icon-box mr-3">
          <v-icon icon="mdi-account-plus-outline" color="#ffffff" size="20"></v-icon>
        </div>
        <div>
          <h2 class="card-title text-white mb-0">Alta de Colaborador</h2>
          <span class="card-subtitle text-white opacity-80">
            Completa la información institucional y credenciales de acceso
          </span>
        </div>
      </div>

      <!-- Botón Limpiar arriba en la cabecera -->
      <v-btn
        variant="flat"
        color="#ffffff"
        size="small"
        prepend-icon="mdi-broom"
        class="text-none font-weight-bold clear-btn"
        @click="resetForm"
      >
        Limpiar
      </v-btn>
    </div>

    <!-- Cuerpo del Formulario -->
    <v-card-text class="pa-6">
      <v-form ref="form" v-model="valid" @submit.prevent="submitUser">

        <!-- SECCIÓN 1: Datos Personales y Área -->
        <div class="section-header d-flex align-center mb-4">
          <div class="section-number mr-2">1</div>
          <span class="section-title">Datos del Colaborador y Perfil</span>
        </div>

        <v-row dense class="mb-4">
          <!-- Nombre Completo -->
          <v-col cols="12" md="6" class="px-2">
            <label class="field-label">Nombre Completo *</label>
            <v-text-field
              v-model="f.name"
              placeholder="Ej. Lic. Mariana Valadez Gómez"
              prepend-inner-icon="mdi-card-account-details-outline"
              variant="outlined"
              density="compact"
              rounded="lg"
              :rules="[r.required]"
              color="#07254A"
              class="custom-field"
            ></v-text-field>
          </v-col>

          <!-- Perfil / Rol Operativo -->
          <v-col cols="12" md="6" class="px-2">
            <label class="field-label">Perfil / Especialidad *</label>
            <v-select
              v-model="f.role_id"
              :items="roles"
              item-title="display_name"
              item-value="id"
              placeholder="Seleccionar área..."
              prepend-inner-icon="mdi-badge-account-horizontal-outline"
              variant="outlined"
              density="compact"
              rounded="lg"
              :rules="[r.required]"
              color="#07254A"
              class="custom-field"
            ></v-select>
          </v-col>
        </v-row>

        <!-- SECCIÓN 2: Acceso y Seguridad -->
        <div class="section-header d-flex align-center mb-4">
          <div class="section-number mr-2">2</div>
          <span class="section-title">Credenciales y Acceso al Portal</span>
        </div>

        <v-row dense class="mb-2">
          <!-- Correo Institucional -->
          <v-col cols="12" md="6" class="px-2">
            <label class="field-label">Correo Institucional (Login) *</label>
            <v-text-field
              v-model="f.email"
              placeholder="nombre@opalo.com"
              prepend-inner-icon="mdi-email-outline"
              type="email"
              variant="outlined"
              density="compact"
              rounded="lg"
              :rules="[r.required, r.email]"
              color="#07254A"
              class="custom-field"
            ></v-text-field>
          </v-col>

          <!-- Contraseña Temporal -->
          <v-col cols="12" md="6" class="px-2">
            <div class="d-flex justify-space-between align-center mb-1">
              <label class="field-label mb-0">Contraseña Temporal</label>
              <span class="generate-link cursor-pointer" @click="generatePassword">
                <v-icon icon="mdi-refresh" size="13" class="mr-1"></v-icon>Generar clave
              </span>
            </div>
            <v-text-field
              v-model="f.password"
              :type="showPwd ? 'text' : 'password'"
              placeholder="Dejar en blanco para autogenerar"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="showPwd ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
              @click:append-inner="showPwd = !showPwd"
              variant="outlined"
              density="compact"
              rounded="lg"
              color="#07254A"
              class="custom-field"
            ></v-text-field>
          </v-col>
        </v-row>

        <!-- Botón de Envío -->
        <div class="d-flex justify-end mt-4">
          <v-btn
            type="submit"
            color="#07254A"
            variant="flat"
            rounded="lg"
            prepend-icon="mdi-account-check-outline"
            class="text-none font-weight-bold text-white px-6 submit-btn"
            :loading="loading"
          >
            Registrar Colaborador
          </v-btn>
        </div>
      </v-form>
    </v-card-text>

    <!-- Modal de Credenciales Generadas -->
    <v-dialog v-model="credentialsDialog.show" max-width="440" persistent>
      <v-card rounded="xl" class="pa-6">
        <div class="text-center mb-4">
          <v-avatar color="#f0fdf4" size="56" class="mb-2">
            <v-icon icon="mdi-check-decagram" color="#16a34a" size="30"></v-icon>
          </v-avatar>
          <h3 class="text-h6 font-weight-bold text-slate-800">Colaborador Registrado</h3>
          <p class="text-caption text-grey">Se ha habilitado la cuenta y despachado el correo con las credenciales.</p>
        </div>

        <div class="pa-4 bg-grey-lighten-4 rounded-lg mb-4">
          <div class="text-caption text-grey font-weight-bold">CORREO DE ACCESO</div>
          <div class="text-body-1 font-weight-bold text-slate-800 mb-2">{{ credentialsDialog.email }}</div>

          <div class="text-caption text-grey font-weight-bold">CONTRASEÑA TEMPORAL</div>
          <div class="text-h6 font-mono font-weight-bold text-primary">{{ credentialsDialog.password }}</div>
        </div>

        <v-btn
          block
          color="#07254A"
          variant="flat"
          rounded="lg"
          class="text-none text-white font-weight-bold"
          @click="credentialsDialog.show = false"
        >
          Entendido
        </v-btn>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useUserStore } from '@/store/users';
import api from '@/services/api';

export default {
  name: 'CreateUserComponent',
  data() {
    return {
      valid: false,
      loading: false,
      showPwd: false,
      f: {
        name: '',
        email: '',
        role_id: null,
        password: '',
      },
      r: {
        required: v => !!v || 'Campo requerido.',
        email: v => /.+@.+\..+/.test(v) || 'Formato de correo no válido.',
      },
      credentialsDialog: {
        show: false,
        email: '',
        password: '',
      },
    };
  },
  computed: {
    ...mapState(useUserStore, ['roles']),
  },
  methods: {
    ...mapActions(useUserStore, ['addUser', 'fetchRoles']),

    generatePassword() {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
      let pass = '';
      for (let i = 0; i < 10; i++) {
        pass += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      this.f.password = pass;
    },

    resetForm() {
      this.$refs.form?.reset();
      this.f.password = '';
    },

    async submitUser() {
      const { valid } = await this.$refs.form.validate();
      if (!valid) return;

      this.loading = true;
      try {
        const response = await api.post('/users/store', this.f);
        const resData = response.data.data;

        this.credentialsDialog = {
          show: true,
          email: resData.user.email,
          password: resData.initial_password,
        };

        this.addUser(resData.user);
        this.resetForm();
      } catch (err) {
        console.error('Error al guardar colaborador:', err);
      } finally {
        this.loading = false;
      }
    },
  },
  mounted() {
    // Si los roles aún no existen en el store, los pide de una vez
    if (!this.roles || this.roles.length === 0) {
      this.fetchRoles();
    }
  },
};
</script>

<style scoped>
.create-client-card {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 14px !important;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04) !important;
}

.card-header {
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

.clear-btn {
  color: #07254A !important;
  border-radius: 8px !important;
  padding: 0 14px !important;
  font-size: 0.8rem !important;
}

.section-header {
  margin-top: 6px;
}

.section-number {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background-color: #f1f5f9;
  color: #07254A;
  font-size: 0.75rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: #334155;
}

.field-label {
  display: block;
  font-size: 0.82rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 6px;
}

.generate-link {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  transition: color 0.2s;
}

.generate-link:hover {
  color: #07254A;
}

:deep(.custom-field .v-field) {
  border-radius: 8px !important;
  border-color: #e2e8f0 !important;
  background-color: #ffffff !important;
  font-size: 0.85rem !important;
}

:deep(.custom-field input::placeholder) {
  color: #94a3b8 !important;
  font-size: 0.85rem;
}

:deep(.custom-field .v-field__prepend-inner .v-icon) {
  color: #94a3b8 !important;
  font-size: 18px !important;
}

.submit-btn {
  height: 42px !important;
  font-size: 0.875rem !important;
}

.font-mono {
  font-family: monospace;
}
</style>
