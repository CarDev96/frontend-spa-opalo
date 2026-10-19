<template>
  <div class="admin-validation-view pa-4">
    <v-card flat class="header-card elevation-0 mb-6">
      <div class="card-header px-6 py-4 d-flex flex-wrap align-center justify-space-between text-white gap-3">
        <div class="d-flex align-center">
          <div class="header-icon-box mr-3 flex-shrink-0">
            <v-icon icon="mdi-cash-check" color="#ffffff" size="22"></v-icon>
          </div>
          <div>
            <h2 class="card-title text-white mb-0">Revisión de Órdenes y Pagos</h2>
            <span class="card-subtitle text-white opacity-80">
              Panel de Administración y Ventas • Aprobación de comprobantes para liberación de agenda
            </span>
          </div>
        </div>
      </div>
    </v-card>

    <AdminOrdersListComponent
      ref="ordersListRef"
      @open-validate="openValidationModal"
    />

    <ValidatePaymentModalComponent
      ref="validateModalRef"
      @payment-validated="onPaymentValidated"
    />

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="top right" timeout="3500">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script>
import AdminOrdersListComponent from '@/components/admin/orders/AdminOrdersListComponent.vue';
import ValidatePaymentModalComponent from '@/components/admin/orders/ValidatePaymentModalComponent.vue';

export default {
  name: 'AdminOrdersValidationView',
  components: {
    AdminOrdersListComponent,
    ValidatePaymentModalComponent,
  },
  data() {
    return {
      snackbar: { show: false, text: '', color: 'success' },
    };
  },
  methods: {
    openValidationModal(order) {
      this.$refs.validateModalRef.open(order);
    },
    onPaymentValidated(updatedOrder) {
      this.$refs.ordersListRef.updateOrderItem(updatedOrder);
      this.snackbar.text = updatedOrder.payment_status === 'approved'
        ? 'Pago aprobado y notificado al cliente por correo.'
        : 'Pago rechazado y notificado al cliente.';
      this.snackbar.color = updatedOrder.payment_status === 'approved' ? 'success' : 'warning';
      this.snackbar.show = true;
    },
  },
};
</script>

<style scoped>
.admin-validation-view {
  max-width: 1400px;
  margin: 0 auto;
}
.header-card {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 16px !important;
  overflow: hidden;
}
.card-header {
  background: linear-gradient(135deg, #07254A 0%, #0e1726 100%) !important;
}
.header-icon-box {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}
.card-title { font-size: 1.15rem; font-weight: 700; }
.card-subtitle { font-size: 0.8rem; }
.gap-3 { gap: 12px; }
</style>
