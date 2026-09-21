<template>
  <div class="client-payments-view-container px-0 py-2">
    <!-- 1. Tarjetas de Información Bancaria y CLABE -->
    <client-payment-info-component class="mb-4" />
  </div>
</template>

<script>
import ClientPaymentInfoComponent from '@/components/clients/ClientPaymentInfoComponent.vue';

export default {
  name: 'ClientPaymentsView',
  components: {
    ClientPaymentInfoComponent,
  },
};
</script>

<style scoped>
.client-payments-view-container {
  max-width: 1400px;
  margin: 0 auto;
}
</style>
