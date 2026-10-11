<template>
  <div class="clients-view-container px-0 py-2">
    <!-- Formulario de Registro (Hijo 1 que emite el evento) -->
    <create-client-component @client-registered="onClientRegistered" />

    <!-- Tabla de Clientes (Hijo 2 que muestra la lista reactiva) -->
    <client-list-component class="mt-5" />
  </div>
</template>

<script>
import { mapActions } from 'pinia';
import { useClientsStore } from '@/store/clients';
import CreateClientComponent from '@/components/clients/CreateClientComponent.vue';
import ClientListComponent from '@/components/clients/ClientListComponent.vue';

export default {
  name: 'ClientsView',
  components: {
    CreateClientComponent,
    ClientListComponent,
  },
  methods: {
    ...mapActions(useClientsStore, ['addClientToTop']),

    onClientRegistered(newClient) {
      // Garantizamos que entre al inicio del arreglo compartido por Pinia
      this.addClientToTop(newClient);
    },
  },
};
</script>

<style scoped>
.clients-view-container {
  max-width: 1400px;
  margin: 0 auto;
}
</style>
