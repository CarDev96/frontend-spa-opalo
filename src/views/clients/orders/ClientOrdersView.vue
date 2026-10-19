<template>
  <div class="client-orders-view pa-4">
    <!-- Header Corporativo -->
    <v-card flat class="order-header-card elevation-0 mb-6">
      <div class="card-header px-6 py-4 d-flex flex-wrap align-center justify-space-between text-white gap-3">
        <div class="d-flex align-center">
          <div class="header-icon-box mr-3 flex-shrink-0">
            <v-icon icon="mdi-receipt-text-plus-outline" color="#ffffff" size="22"></v-icon>
          </div>
          <div>
            <h2 class="card-title text-white mb-0">Generar Orden de Evaluación</h2>
            <span class="card-subtitle text-white opacity-80">
              Gcd Opalo certificaciones • Cotización con IVA y administración de comprobantes
            </span>
          </div>
        </div>

        <v-btn
          variant="flat"
          size="small"
          color="#ffffff"
          prepend-icon="mdi-arrow-left"
          class="text-none font-weight-bold back-btn"
          @click="$router.push('/portal/dashboard')"
        >
          Volver al Inicio
        </v-btn>
      </div>
    </v-card>

    <!-- Componente 1: Formulario de Creación y Cotización -->
    <ClientOrderComponent @order-created="onOrderCreated" />

    <!-- Componente 2: Listado y Carga de Comprobantes -->
    <ListOrdersComponent ref="listOrdersRef" />
  </div>
</template>

<script>
import ClientOrderComponent from '@/components/clients/orders/ClientOrderComponent.vue';
import ListOrdersComponent from '@/components/clients/orders/ListOrdersComponent.vue';

export default {
  name: 'ClientOrdersView',
  components: {
    ClientOrderComponent,
    ListOrdersComponent,
  },
  methods: {
    onOrderCreated(newOrder) {
      if (this.$refs.listOrdersRef) {
        this.$refs.listOrdersRef.appendOrder(newOrder);
      }
    },
  },
};
</script>

<style scoped>
.client-orders-view {
  max-width: 1400px;
  margin: 0 auto;
}

.order-header-card {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 16px !important;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04) !important;
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

.card-title {
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: -0.2px;
}

.card-subtitle {
  font-size: 0.8rem;
}

.back-btn {
  color: #07254A !important;
  border-radius: 8px !important;
}

.gap-3 {
  gap: 12px;
}
</style>
