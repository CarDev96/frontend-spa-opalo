<template>
  <div class="book-order-view-container pa-4">
    <AdminOrderBookAppointmentComponent :orderId="orderId" />
  </div>
</template>

<script>
import AdminOrderBookAppointmentComponent from '@/components/admin/appointments/AdminOrderBookAppointmentComponent.vue';

export default {
  name: 'AdminOrderBookAppointmentView',
  components: {
    AdminOrderBookAppointmentComponent,
  },
  computed: {
    orderId() {
      // Atrapa el parámetro :id de la URL
      return this.$route.params.id;
    },
  },
};
</script>

<style scoped>
.book-order-view-container {
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
}
</style>
