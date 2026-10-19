<template>
	<div class="clinical-appointments-container px-0 py-2">
		<!-- Cronograma y Tabla de Citas -->
		<appointments-timeline-component ref="timelineRef" />

		<!-- Drawer Lateral Deslizable -->
		<appointment-detail-drawer-component @session-updated="refreshTable" />
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
	methods: {
		refreshTable() {
			if (this.$refs.timelineRef) {
				this.$refs.timelineRef.loadAppointments();
			}
		},
	},
};
</script>

<style scoped>
.clinical-appointments-container {
	max-width: 1400px;
	margin: 0 auto;
}
</style>
