<template>
  <div class="client-payment-receipts-view pa-4">
    <!-- Header General -->
    <v-card flat class="top-nav-card elevation-0 mb-6">
      <div class="px-6 py-4 border-bottom bg-white d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-btn
            variant="text"
            color="#07254A"
            density="compact"
            prepend-icon="mdi-arrow-left"
            class="text-none font-weight-bold mr-2"
            @click="$router.push('/portal/orders')"
          >
            Volver a Órdenes
          </v-btn>
          <span class="text-caption text-slate-400">|</span>
          <span class="text-caption font-weight-bold text-slate-600 ml-2">
            Comprobante de Pago
          </span>
        </div>
      </div>
    </v-card>

    <!-- Componente Único Enfocado en la Orden -->
    <UploadReceiptComponent
      :order-id="activeOrderId"
      @receipt-uploaded="onReceiptUploaded"
    />
  </div>
</template>

<script>
import UploadReceiptComponent from '@/components/clients/payments/UploadReceiptComponent.vue';

export default {
  name: 'ClientPaymentReceiptsView',
  components: {
    UploadReceiptComponent,
  },
  computed: {
    activeOrderId() {
      return this.$route.query.order_id || this.$route.params.orderId || null;
    },
  },
  methods: {
    onReceiptUploaded() {
      // Opcional: después de subir con éxito, si quieres redirigir o mantenerte aquí
    },
  },
};
</script>

<style scoped>
.client-payment-receipts-view {
  max-width: 1400px;
  margin: 0 auto;
}

.top-nav-card {
  border: 1px solid #e2e8f0 !important;
  border-radius: 12px !important;
}
</style>
