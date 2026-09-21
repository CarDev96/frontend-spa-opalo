<template>
  <div class="payment-receipts-view-container px-0 py-2">
    <!-- 1. Módulo Formulario de Subida -->
    <upload-receipt-component
      @receipt-uploaded="onReceiptUploaded"
      class="mb-4"
    />

    <!-- 2. Módulo Listado e Historial -->
    <receipts-list-component
      ref="receiptsListRef"
    />
  </div>
</template>

<script>
import UploadReceiptComponent from '@/components/clients/payments/UploadReceiptComponent.vue';
import ReceiptsListComponent from '@/components/clients/payments/ReceiptsListComponent.vue';

export default {
  name: 'ClientPaymentReceiptsView',
  components: {
    UploadReceiptComponent,
    ReceiptsListComponent,
  },
  methods: {
    onReceiptUploaded() {
      // Recarga la tabla de comprobantes al completarse la subida
      this.$refs.receiptsListRef?.fetchReceipts();
    },
  },
};
</script>

<style scoped>
.payment-receipts-view-container {
  max-width: 1400px;
  margin: 0 auto;
}
</style>
