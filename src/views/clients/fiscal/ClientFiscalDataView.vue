<template>
  <div class="client-fiscal-data-view pa-4">
    <ClientFiscalDataComponent />
  </div>
</template>

<script>
import ClientFiscalDataComponent from '@/components/clients/fiscal/ClientFiscalDataComponent.vue';

export default {
  name: 'ClientFiscalDataView',
  components: {
    ClientFiscalDataComponent,
  },
};
</script>

<style scoped>
.client-fiscal-data-view {
  max-width: 1400px;
  margin: 0 auto;
}
</style>
