<template>
	<div class="clinical-appointments-container px-0 py-2">
		<!-- Cronograma de Citas -->
		<appointments-timeline-component />

		<!-- Drawer Lateral Deslizable -->
		<appointment-detail-drawer-component />
	</div>
</template>

<script>
import AppointmentsTimelineComponent from '@/components/clinical/appointments/AppointmentsTimelineComponent.vue';
import AppointmentDetailDrawerComponent from '@/components/clinical/appointments/AppointmentDetailDrawerComponent.vue';

export default {
	name: 'ClinicalAppointmentsView',
	components: {
		AppointmentsTimelineComponent,
		AppointmentDetailDrawerComponent,
	},
};
</script>

<style scoped>
.clinical-appointments-container {
	max-width: 1400px;
	margin: 0 auto;
}
</style>
