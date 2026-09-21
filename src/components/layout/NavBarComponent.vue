<template>
  <v-app-bar flat class="border-bottom bg-white px-4" height="64">
    <!-- Botón Toggle Drawer / Logo Ópalo -->
    <div class="d-flex align-center">
      <v-btn icon variant="text" size="small" class="mr-2 text-slate-700" @click="$emit('toggle-drawer')">
        <v-icon icon="mdi-menu" size="22"></v-icon>
      </v-btn>
      <div class="d-flex align-center">
        <span class="font-weight-black text-h6 text-slate-800 tracking-wider">ÓPALO</span>
        <span class="text-caption text-grey ml-2 pl-2 border-left d-none d-sm-inline">
          Certificados de Confianza
        </span>
      </div>
    </div>

    <v-spacer></v-spacer>

    <!-- Menú Desplegable de Usuario en el Avatar Superior Derecho -->
    <v-menu min-width="220" rounded="lg" transition="slide-y-transition" location="bottom end">
      <template v-slot:activator="{ props }">
        <div v-bind="props" class="d-flex align-center cursor-pointer user-menu-activator pa-1 rounded-lg">
          <div class="text-right mr-3 d-none d-sm-block">
            <div class="text-caption font-weight-bold text-slate-800 line-height-1">
              {{ userName }}
            </div>
            <span class="user-role-caption text-grey">
              {{ userRole }}
            </span>
          </div>

          <!-- Avatar con foto o iniciales -->
          <v-avatar size="36" color="#07254A" class="elevation-1">
            <v-img v-if="userPhoto" :src="userPhoto" cover></v-img>
            <span v-else class="text-white font-weight-bold text-caption">{{ initials }}</span>
          </v-avatar>

          <v-icon icon="mdi-chevron-down" size="16" class="ml-1 text-grey"></v-icon>
        </div>
      </template>

      <!-- Opciones del Menú -->
      <v-list density="compact" class="py-2 elevation-2 rounded-lg border-subtle">
        <v-list-item to="/settings" prepend-icon="mdi-cog-outline" rounded="md" class="menu-item">
          <v-list-item-title class="text-body-2 font-weight-medium">Configuración</v-list-item-title>
        </v-list-item>

        <v-divider class="my-1"></v-divider>

        <v-list-item @click="handleLogout" prepend-icon="mdi-logout" rounded="md" class="menu-item text-error">
          <v-list-item-title class="text-body-2 font-weight-medium">Cerrar Sesión</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useAuthStore } from '@/store/auth';

export default {
  name: 'AppNavbar',
  emits: ['toggle-drawer'],
  computed: {
    ...mapState(useAuthStore, ['user']),

    userName() {
      return this.user?.name || 'Administrador Ópalo';
    },

    userRole() {
      return this.user?.role?.description || this.user?.role?.name || 'Administración';
    },

    userPhoto() {
      return this.user?.photo_url || null;
    },

    initials() {
      if (!this.user?.name) return 'AÓ';
      const parts = this.user.name.trim().split(' ');
      return parts.length > 1
        ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
        : parts[0].substring(0, 2).toUpperCase();
    },
  },
  methods: {
    ...mapActions(useAuthStore, ['logout']),

    async handleLogout() {
      try {
        if (typeof this.logout === 'function') {
          await this.logout();
        }
      } catch (e) {
        console.error('Error al cerrar sesión:', e);
      } finally {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.$router.push({ name: 'Login' });
      }
    },
  },
};
</script>

<style scoped>
.user-menu-activator {
  transition: background-color 0.2s ease;
}

.user-menu-activator:hover {
  background-color: #f8fafc;
}

.line-height-1 {
  line-height: 1.15;
}

.user-role-caption {
  font-size: 0.72rem;
}

.border-subtle {
  border: 1px solid #e2e8f0;
}

.menu-item {
  font-size: 0.8rem;
  margin: 0 4px;
}
</style>
