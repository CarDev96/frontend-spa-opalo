<template>
	<v-card flat class="timeline-card elevation-0">
		<!-- Header Corporativo Ópalo -->
		<div class="card-table-header px-6 py-4 d-flex align-center justify-space-between flex-wrap gap-2">
			<div class="d-flex align-center">
				<div class="header-icon-box mr-3 flex-shrink-0">
					<v-icon icon="mdi-calendar-clock-outline" color="#ffffff" size="20"></v-icon>
				</div>
				<div>
					<h2 class="card-title text-white mb-0">Citas de Evaluación Asignadas</h2>
					<span class="card-subtitle text-white opacity-80">
						Control de candidatos citados, atención de pruebas y contacto por WhatsApp
					</span>
				</div>
			</div>

			<div class="d-flex align-center gap-2">
				<v-btn variant="flat" size="small" color="#ffffff" prepend-icon="mdi-refresh"
					class="text-none font-weight-bold reload-btn" :loading="loading" @click="fetchAppointments()">
					Recargar
				</v-btn>
			</div>
		</div>

		<!-- Barra de Filtros Rápidos y Contadores -->
		<div
			class="filter-toolbar px-6 py-3 border-bottom bg-slate-50 d-flex flex-wrap align-center justify-space-between gap-3">
			<v-btn-toggle v-model="selectedTimeframe" mandatory rounded="lg" density="compact" color="#07254A"
				class="filter-toggle" @update:model-value="onTimeframeChange">
				<v-btn value="today" class="text-none font-weight-bold px-4">
					<v-icon icon="mdi-calendar-today" start size="16"></v-icon>
					Citas de Hoy
				</v-btn>
				<v-btn value="week" class="text-none font-weight-bold px-4">
					<v-icon icon="mdi-calendar-range" start size="16"></v-icon>
					Esta Semana
				</v-btn>
				<v-btn value="all" class="text-none font-weight-bold px-4">
					<v-icon icon="mdi-history" start size="16"></v-icon>
					Historial Completo
				</v-btn>
			</v-btn-toggle>

			<div class="d-flex align-center gap-2">
				<v-chip size="small" variant="flat" color="#e2e8f0" class="font-weight-bold text-slate-700">
					Total: {{ totalCount }}
				</v-chip>
				<v-chip size="small" variant="flat" color="#dbeafe" class="font-weight-bold text-blue-900">
					Pendientes: {{ scheduledCount }}
				</v-chip>
				<v-chip size="small" variant="flat" color="#d1fae5" class="font-weight-bold text-emerald-900">
					Atendidas: {{ attendedCount }}
				</v-chip>
			</div>
		</div>

		<!-- Contenedor Principal de Citas -->
		<v-card-text class="pa-4 pa-sm-6 bg-slate-50">
			<div v-if="loading" class="text-center py-12">
				<v-progress-circular indeterminate color="#07254A" size="36"></v-progress-circular>
				<div class="text-caption text-slate-500 mt-2 font-weight-medium">Cargando evaluaciones...</div>
			</div>

			<div v-else-if="appointments.length === 0" class="text-center py-12">
				<v-avatar size="64" color="#f8fafc" class="mb-3 empty-avatar">
					<v-icon size="32" color="#07254A">mdi-calendar-blank-outline</v-icon>
				</v-avatar>
				<div class="text-subtitle-1 font-weight-bold text-slate-800">No hay citas en este periodo</div>
				<div class="text-caption text-grey">
					Las citas programadas por los clientes aparecerán automáticamente aquí.
				</div>
			</div>

			<!-- Listado de Tarjetas -->
			<div v-else class="d-flex flex-column gap-3">
				<div v-for="item in appointments" :key="item.id"
					class="appointment-card pa-4 rounded-xl d-flex flex-wrap align-center justify-space-between gap-3 cursor-pointer transition-all"
					@click="openDrawer(item)">
					<!-- 1. Bloque de Horario -->
					<div class="schedule-block d-flex align-center pr-sm-4 border-sm-right">
						<div class="time-badge px-3 py-2 rounded-lg text-center">
							<div class="text-caption font-weight-bold text-slate-500 text-uppercase">
								{{ formatSafeDate(item.date) }}
							</div>
							<div class="font-mono text-body-1 font-weight-black text-slate-900">
								{{ formatHour(item.start_time) }}
							</div>
							<div class="text-caption font-mono text-grey">
								{{ formatHour(item.end_time) }}
							</div>
						</div>
					</div>

					<!-- 2. Información del Candidato -->
					<div class="candidate-block flex-grow-1 min-w-0">
						<div class="d-flex align-center gap-2 mb-1">
							<span class="font-weight-bold text-slate-900 text-body-1 text-truncate">
								{{ item.examinee?.full_name || 'Candidato sin nombre' }}
							</span>
							<v-chip size="x-small" :color="item.modality === 'presencial' ? '#07254A' : '#0d9488'" variant="flat"
								class="font-weight-bold text-uppercase text-white">
								{{ item.modality }}
							</v-chip>
						</div>

						<div class="d-flex flex-wrap align-center text-caption text-slate-600 gap-x-4 gap-y-1">
							<div>
								<v-icon icon="mdi-briefcase-outline" size="14" class="mr-1 text-slate-400"></v-icon>
								<span>{{ item.examinee?.position }}</span>
							</div>
							<div>
								<v-icon icon="mdi-domain" size="14" class="mr-1 text-slate-400"></v-icon>
								<span class="font-weight-medium text-slate-800">
									{{ item.client?.trade_name || item.client?.company_name }}
								</span>
							</div>
							<div>
								<v-icon icon="mdi-clipboard-text-outline" size="14" class="mr-1 text-slate-400"></v-icon>
								<span>{{ item.evaluation_type?.name }}</span>
							</div>
						</div>
					</div>

					<!-- 3. Acciones de Atención Inmediata -->
					<div class="action-block d-flex align-center gap-2 flex-shrink-0" @click.stop>
						<v-chip size="small" :color="getStatusColor(item.status)" variant="flat"
							class="font-weight-bold status-chip text-white">
							{{ formatStatus(item.status) }}
						</v-chip>

						<!-- Botón WhatsApp -->
						<v-btn color="#25D366" variant="flat" size="small" rounded="lg" prepend-icon="mdi-whatsapp"
							class="text-none font-weight-bold text-white px-3 whatsapp-btn" :disabled="!item.examinee?.phone"
							@click="openWhatsApp(item)">
							WhatsApp
						</v-btn>

						<v-btn icon="mdi-chevron-right" variant="text" size="small" color="#07254A"
							@click="openDrawer(item)"></v-btn>
					</div>
				</div>
			</div>
		</v-card-text>
	</v-card>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useClinicalAppointmentsStore } from '@/store/clinicalAppointments';

export default {
	name: 'AppointmentsTimelineComponent',
	data() {
		return {
			selectedTimeframe: 'today',
		};
	},

	computed: {
		...mapState(useClinicalAppointmentsStore, [
			'appointments',
			'loading',
			'totalCount',
			'scheduledCount',
			'attendedCount',
		]),
	},

	mounted() {
		this.fetchAppointments('today');
	},

	methods: {
		...mapActions(useClinicalAppointmentsStore, [
			'fetchAppointments',
			'openDrawer',
		]),

		onTimeframeChange(val) {
			if (val) {
				this.fetchAppointments(val);
			}
		},

		formatSafeDate(dateVal) {
			if (!dateVal) return '';
			const cleanDate = typeof dateVal === 'string' ? dateVal.substring(0, 10) : '';
			const parts = cleanDate.split('-');
			if (parts.length === 3) {
				const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
				return d.toLocaleDateString('es-MX', { weekday: 'short', day: '2-digit', month: 'short' });
			}
			return cleanDate;
		},

		formatHour(hourStr) {
			if (!hourStr) return '';
			return hourStr.substring(0, 5);
		},

		getStatusColor(status) {
			const map = {
				scheduled: '#0284C7',
				attended: '#10B981',
				cancelled: '#EF4444',
				no_show: '#F59E0B',
			};
			return map[status] || '#475569';
		},

		formatStatus(status) {
			const map = {
				scheduled: 'Programada',
				attended: 'Atendida',
				cancelled: 'Cancelada',
				no_show: 'No asistió',
			};
			return map[status] || status;
		},

		openWhatsApp(item) {
			const rawPhone = item.examinee?.phone || '';
			const cleanPhone = rawPhone.replace(/\D/g, '');
			const candidateName = item.examinee?.full_name || 'Candidato';
			const time = this.formatHour(item.start_time);

			const message = encodeURIComponent(
				`Hola ${candidateName}, te contacto del área de Evaluación Psicológica de Ópalo. Me comunico contigo para dar inicio a tu sesión programada a las ${time}.`
			);

			const url = `https://wa.me/52${cleanPhone}?text=${message}`;
			window.open(url, '_blank');
		},
	},
};
</script>

<style scoped>
.timeline-card {
	background: #ffffff !important;
	border: 1px solid #e2e8f0 !important;
	border-radius: 14px !important;
	overflow: hidden;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04) !important;
}

.card-table-header {
	background: linear-gradient(135deg, #07254A 0%, #0e1726 100%) !important;
}

.header-icon-box {
	width: 40px;
	height: 40px;
	border-radius: 10px;
	background: rgba(255, 255, 255, 0.12);
	border: 1px solid rgba(255, 255, 255, 0.2);
	display: flex;
	align-items: center;
	justify-content: center;
}

.card-title {
	font-size: 1.05rem;
	font-weight: 700;
	letter-spacing: -0.2px;
}

.card-subtitle {
	font-size: 0.78rem;
}

.reload-btn {
	color: #07254A !important;
	border-radius: 8px !important;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
}

.filter-toolbar {
	border-bottom: 1px solid #e2e8f0;
}

.bg-slate-50 {
	background-color: #f8fafc;
}

.appointment-card {
	background: #ffffff;
	border: 1px solid #e2e8f0;
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.appointment-card:hover {
	border-color: #cbd5e1;
	box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.07);
}

.time-badge {
	background: #f1f5f9;
	min-width: 95px;
}

.border-sm-right {
	border-right: 1px dashed #cbd5e1;
}

.status-chip {
	padding: 0 10px !important;
	height: 24px !important;
	font-size: 0.75rem !important;
}

.whatsapp-btn {
	box-shadow: 0 2px 4px rgba(37, 211, 102, 0.3) !important;
}

.empty-avatar {
	border: 1px solid #e2e8f0;
}

.cursor-pointer {
	cursor: pointer;
}

.gap-2 {
	gap: 8px;
}

.gap-3 {
	gap: 12px;
}

.gap-x-4 {
	column-gap: 16px;
}

.gap-y-1 {
	row-gap: 4px;
}
</style>
