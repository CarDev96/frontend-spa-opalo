<template>
  <div class="admin-appointments-container px-0 py-2">
    <!-- Formulario de Agendamiento de Administración -->
    <admin-book-appointment-component @appointment-created="refreshList" />

    <!-- Tabla de Citas Generales de Evaluación -->
    <appointment-list-component ref="listComponent" class="mt-4" />
  </div>
</template>

<script>
import AdminBookAppointmentComponent from '@/components/admin/appointments/AdminBookAppointmentComponent.vue';
import AppointmentListComponent from '@/components/admin/appointments/AppointmentListComponent.vue';

export default {
  name: 'AdminAppointmentsView',
  components: {
    AdminBookAppointmentComponent,
    AppointmentListComponent,
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
