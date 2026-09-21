<template>
  <div class="appointments-view-container px-0 py-2">
    <!-- Formulario de Agendamiento -->
    <book-appointment-component />

    <!-- Listado de Citas Programadas -->
    <appointment-list-component />
  </div>
</template>

<script>
import BookAppointmentComponent from '@/components/clients/appointments/BookAppointmentComponent.vue';
import AppointmentListComponent from '@/components/clients/appointments/AppointmentListComponent.vue';

export default {
  name: 'BookAppointmentView',
  components: {
    BookAppointmentComponent,
    AppointmentListComponent,
  },
};
</script>

<style scoped>
.appointments-view-container {
  max-width: 1400px;
  margin: 0 auto;
}
</style>
