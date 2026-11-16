<template>
  <div class="admin-appointments-container pa-4">
    <admin-appointment-list-component ref="listComponent" />
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
      if (this.$refs.listComponent?.fetchAllAppointments) {
        this.$refs.listComponent.fetchAllAppointments();
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
