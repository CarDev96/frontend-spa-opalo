<template>
  <div class="admin-payments-view-container px-0 py-2">
    <admin-payment-receipts-table-component />
  </div>
</template>

<script>
import AdminPaymentReceiptsTableComponent from '@/components/admin/payments/AdminPaymentReceiptsTableComponent.vue';

export default {
  name: 'AdminPaymentReceiptsView',
  components: {
    AdminPaymentReceiptsTableComponent,
  },
};
</script>

<style scoped>
.admin-payments-view-container {
  max-width: 1400px;
  margin: 0 auto;
}
</style>
