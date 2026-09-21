<template>
  <v-container class="px-0 py-2">
    <v-row dense>
      <v-col cols="12">
        <v-card flat class="settings-main-card elevation-0">
          <!-- Cabecera Corporativa Ópalo -->
          <v-card-title class="opaloBrand py-3 px-6 d-flex align-center">
            <v-icon icon="mdi-tune" color="#ffffff" size="20" class="mr-3"></v-icon>
            <div>
              <div class="subtitle-1 font-weight-bold text-white">Ajustes del Sistema</div>
              <div class="caption text-white opacity-80">
                {{ isAdmin ? 'Configuración global y preferencias de cuenta' : 'Preferencias personales de cuenta' }}
              </div>
            </div>
          </v-card-title>

          <!-- Acordeón con los Paneles -->
          <v-card-text class="pa-4">
            <v-expansion-panels v-model="activePanels" variant="separated" class="custom-panels">

              <!-- 1. Foto de Perfil (VISIBLE PARA TODOS) -->
              <v-expansion-panel rounded="lg" class="border-panel mb-3">
                <v-expansion-panel-title class="opaloBrand white--text py-2 px-4">
                  <div class="d-flex align-center">
                    <v-icon icon="mdi-camera-account" size="18" class="mr-2 text-white"></v-icon>
                    <span class="subtitle-2 font-weight-bold text-white">Foto de Perfil</span>
                  </div>
                </v-expansion-panel-title>
                <v-expansion-panel-text class="pa-4 bg-white">
                  <user-profile-photo-component />
                </v-expansion-panel-text>
              </v-expansion-panel>

              <!-- 2. Cambio de Contraseña (VISIBLE PARA TODOS) -->
              <v-expansion-panel rounded="lg" class="border-panel mb-3">
                <v-expansion-panel-title class="opaloBrand white--text py-2 px-4">
                  <div class="d-flex align-center">
                    <v-icon icon="mdi-lock-reset" size="18" class="mr-2 text-white"></v-icon>
                    <span class="subtitle-2 font-weight-bold text-white">Cambio de Contraseña</span>
                  </div>
                </v-expansion-panel-title>
                <v-expansion-panel-text class="pa-4 bg-white">
                  <change-password-component />
                </v-expansion-panel-text>
              </v-expansion-panel>

              <!-- 3. Configuración Bancaria / CLABE (SOLO ADMIN) -->
              <v-expansion-panel v-if="isAdmin" rounded="lg" class="border-panel mb-3">
                <v-expansion-panel-title class="opaloBrand white--text py-2 px-4">
                  <div class="d-flex align-center">
                    <v-icon icon="mdi-bank-outline" size="18" class="mr-2 text-white"></v-icon>
                    <span class="subtitle-2 font-weight-bold text-white">Datos de Pago y CLABE Interbancaria</span>
                  </div>
                </v-expansion-panel-title>
                <v-expansion-panel-text class="pa-4 bg-white">
                  <bank-payment-settings-component />
                </v-expansion-panel-text>
              </v-expansion-panel>

            </v-expansion-panels>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState } from 'pinia';
import { useAuthStore } from '@/store/auth';
import UserProfilePhotoComponent from '@/components/settings/UserProfilePhotoComponent.vue';
import ChangePasswordComponent from '@/components/settings/ChangePasswordComponent.vue';
import BankPaymentSettingsComponent from '@/components/settings/BankPaymentSettingsComponent.vue';

export default {
  name: 'SettingsComponent',
  components: {
    UserProfilePhotoComponent,
    ChangePasswordComponent,
    BankPaymentSettingsComponent,
  },
  data() {
    return {
      activePanels: [0],
    };
  },
  computed: {
    // Leemos directamente el getter de useAuthStore
    ...mapState(useAuthStore, ['isAdmin', 'user']),
  },
};
</script>

<style scoped>
.settings-main-card {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 14px !important;
  overflow: hidden;
}

.opaloBrand {
  background: linear-gradient(135deg, #07254A 0%, #0e1726 100%) !important;
}

.border-panel {
  border: 1px solid #e2e8f0 !important;
  overflow: hidden;
}

:deep(.v-expansion-panel-title__overlay) {
  opacity: 0 !important;
}

:deep(.v-expansion-panel-title .v-icon) {
  color: #ffffff !important;
}

.subtitle-1 {
  font-size: 0.95rem !important;
}

.subtitle-2 {
  font-size: 0.85rem !important;
}

.caption {
  font-size: 0.75rem !important;
}
</style>
