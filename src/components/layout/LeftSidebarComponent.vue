<template>
  <v-navigation-drawer
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    app
    width="270"
    class="app-sidebar"
  >
    <!-- Perfil Resumido -->
    <div class="sidebar-user-box pa-4">
      <div class="user-pill pa-3 rounded-lg">
        <div class="d-flex align-center mb-2">
          <v-avatar size="32" color="#07254A" class="text-white text-caption font-weight-bold mr-2">
            {{ userInitials }}
          </v-avatar>
          <v-chip size="x-small" variant="flat" color="#07254A" class="text-white-custom font-weight-bold">
            {{ userRole }}
          </v-chip>
        </div>
        <div class="user-fullname text-truncate" :title="userName">
          {{ userName }}
        </div>
      </div>
    </div>

    <v-divider class="border-light mx-3"></v-divider>

    <!-- Lista de Navegación Dinámica -->
    <v-list density="compact" nav class="pa-3">
      <div v-for="section in menuTree" :key="section.id" class="mb-3">
        <div class="sidebar-section-title">
          {{ section.title }}
        </div>

        <template v-for="sub in section.menu_items" :key="sub.id">
          <!-- Enlace externo (ej. Validar Certificados) -->
          <v-list-item
            v-if="isExternalRoute(sub.route)"
            :href="sub.route"
            target="_blank"
            rel="noopener noreferrer"
            :prepend-icon="sub.icon || getIcon(sub.title)"
            :title="sub.title"
            append-icon="mdi-open-in-new"
            rounded="lg"
            class="sidebar-nav-item mb-1"
          ></v-list-item>

          <!-- Ruta interna SPA -->
          <v-list-item
            v-else
            :to="sub.route"
            :prepend-icon="sub.icon || getIcon(sub.title)"
            :title="sub.title"
            rounded="lg"
            class="sidebar-nav-item mb-1"
            active-class="sidebar-item-active"
          ></v-list-item>
        </template>
      </div>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { mapActions, mapState } from 'pinia';
import { useAuthStore } from '@/store/auth';

export default {
  name: 'LeftSidebarComponent',
  props: {
    modelValue: { type: Boolean, required: true },
  },
  emits: ['update:modelValue'],
  data() {
    return {
      iconDictionary: [
        { key: 'Mis Evaluados', icon: 'mdi-account-group-outline' },
        { key: 'Avance y Estatus', icon: 'mdi-chart-timeline-variant-shimmer' },
        { key: 'Validar Certificados', icon: 'mdi-certificate-outline' },
        { key: 'Agendar Citas', icon: 'mdi-calendar-clock-outline' },
        { key: 'Datos Fiscales (CSF)', icon: 'mdi-file-document-outline' },
        { key: 'Cuentas y Pagos', icon: 'mdi-credit-card-outline' },
        { key: 'Usuarios', icon: 'mdi-account-multiple-outline' },
        { key: 'Clientes', icon: 'mdi-domain' },
        { key: 'Evaluados', icon: 'mdi-badge-account-outline' },
        { key: 'Citas', icon: 'mdi-calendar-check-outline' },
        { key: 'Pruebas', icon: 'mdi-clipboard-text-outline' },
      ],
    };
  },
  computed: {
    ...mapState(useAuthStore, ['user', 'menu']),
    menuTree() {
      return this.menu || [];
    },
    userName() {
      return this.user?.name || 'Usuario';
    },
    userRole() {
      return this.user?.role_display || this.user?.role || 'Portal';
    },
    userInitials() {
      if (!this.userName) return 'U';
      return this.userName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
    },
  },
  methods: {
    ...mapActions(useAuthStore, ['fetchNavigation']),
    isExternalRoute(route) {
      return typeof route === 'string' && (route.startsWith('http://') || route.startsWith('https://'));
    },
    getIcon(title) {
      const match = this.iconDictionary.find(
        (item) => item.key.toLowerCase() === (title || '').trim().toLowerCase()
      );
      return match ? match.icon : 'mdi-circle-small';
    },
  },
  mounted() {
    if (this.menuTree.length === 0) {
      this.fetchNavigation();
    }
  },
};
</script>

<style scoped>
.app-sidebar {
  background: #fbfbfb !important;
  border-right: 1px solid #e9ecef !important;
}

.sidebar-user-box {
  background: #ffffff;
}

.user-pill {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.user-fullname {
  font-size: 0.85rem;
  font-weight: 700;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.border-light {
  border-color: #f0f2f5 !important;
}

.sidebar-section-title {
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: #9ca3af;
  padding: 6px 12px;
}

.sidebar-nav-item {
  color: #4b5563 !important;
  font-weight: 500;
  font-size: 0.85rem !important;
  transition: all 0.15s ease-in-out;
}

.sidebar-nav-item:hover {
  background: #f1f3f5 !important;
  color: #07254A !important;
}

.sidebar-item-active {
  background: #edf2f7 !important;
  color: #07254A !important;
  font-weight: 700 !important;
}

:deep(.sidebar-item-active .v-icon) {
  color: #07254A !important;
}
</style>
