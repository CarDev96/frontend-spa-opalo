<template>
  <div class="home-container px-0 py-2">
    <!-- 1. Perfil de Psicología -->
    <psychology-dashboard-component v-if="userRole === 'psychology'" />

    <!-- 2. Perfil de Administrador (Placeholder mientras armamos sus KPIs) -->
    <div v-else-if="userRole === 'admin'" class="admin-dashboard-placeholder">
      <!-- Puedes mostrar el panel clínico también si es admin o su resumen general -->
      <admin-dashboard-component />
    </div>

    <!-- 3. Perfil de Cliente / Empresas -->
    <div v-else-if="userRole === 'client'" class="client-dashboard-placeholder">
			<dashboard-client-component />
    </div>

    <!-- 4. Default / Otros Roles (Ventas, Trabajo Social) -->
    <div v-else class="default-dashboard-placeholder">
      <v-card flat class="pa-8 text-center rounded-xl border-subtle elevation-0 bg-white">
        <v-avatar size="56" color="#f8fafc" class="mb-3 empty-avatar">
          <v-icon size="28" color="#07254A">mdi-shield-account-outline</v-icon>
        </v-avatar>
        <div class="text-subtitle-1 font-weight-bold text-slate-900">
          Bienvenido a Ópalo Certificados de Confianza
        </div>
        <div class="text-caption text-slate-500">
          Utiliza el menú lateral para acceder a tus herramientas operativas.
        </div>
      </v-card>
    </div>
  </div>
</template>

<script>
import { mapState } from 'pinia';
import { useAuthStore } from '@/store/auth';
import PsychologyDashboardComponent from '@/components/clinical/dashboard/PsychologyDashboardComponent.vue';
import AdminDashboardComponent from '@/components/admin/dashboard/AdminDashboardComponent.vue';
import DashboardClientComponent from '@/components/home/DashboardClientComponent.vue';

export default {
  name: 'HomeView',
  components: {
    PsychologyDashboardComponent,
    DashboardClientComponent,
		AdminDashboardComponent,
  },
  computed: {
    ...mapState(useAuthStore, ['user']),

    userRole() {
      return this.user?.role || '';
    },
  },
};
</script>

<style scoped>
.home-container {
  max-width: 1400px;
  margin: 0 auto;
}

.border-subtle {
  border: 1px solid #e2e8f0;
}

.empty-avatar {
  border: 1px solid #e2e8f0;
}

.gap-3 {
  gap: 12px;
}
</style>
