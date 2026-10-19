<template>
  <div class="admin-appointments-container px-0 py-2">
    <!-- Tabla de Citas Generales de Evaluación -->
    <admin-appointment-list-component ref="listComponent" class="mt-4" />
  </div>
</template>

<script>
import AdminAppointmentListComponent from '@/components/admin/appointments/AdminAppointmentListComponent.vue';

export default {
  name: 'AdminAppointmentsView',
  components: {
    AdminAppointmentListComponent,
  },
  methods: {
    refreshList() {
      if (this.$refs.listComponent?.fetchAppointments) {
        this.$refs.listComponent.fetchAppointments();
      }
    },
  },
};
</script>

<style scoped>
.admin-appointments-container {
  max-width: 1400px;
  margin: 0 auto;
}
</style>
