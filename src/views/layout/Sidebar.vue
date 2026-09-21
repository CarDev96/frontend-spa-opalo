<template>
  <v-app>
    <navbar-component @toggle-drawer="drawer = !drawer" />
    <left-sidebar-component v-model="drawer" />
    <!-- Fondo suave que contrasta con el navbar y sidebar oscuros -->
    <v-main class="bg-surface-variant-custom">
      <v-container fluid class="pa-6">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import NavbarComponent from '@/components/layout/NavbarComponent.vue';
import LeftSidebarComponent from '@/components/layout/LeftSidebarComponent.vue';

export default {
  name: 'Sidebar',
  components: {
    NavbarComponent,
    LeftSidebarComponent,
  },
  data() {
    return {
      drawer: true,
    };
  },
};
</script>

<style scoped>
.bg-surface-variant-custom {
  background-color: #f4f6f9 !important;
  min-height: 100vh;
}

:deep(.v-main) {
  background-color: #f8fafc !important;
  min-height: 100vh;
}
</style>
