<template>
	<div class="today-sessions-container">
		<v-row dense>
			<!-- Panel Izquierdo: Tarjeta Enfoque "Próxima Entrevista" -->
			<v-col cols="12" md="5" class="pr-md-3">
				<v-card flat class="focus-session-card elevation-0 h-100 d-flex flex-column">
					<!-- Cabecera Corporativa -->
					<div class="card-gradient-header px-5 py-3 d-flex align-center justify-space-between">
						<div class="d-flex align-center">
							<div class="header-icon-mini mr-2">
								<v-icon icon="mdi-account-clock-outline" color="#ffffff" size="16"></v-icon>
							</div>
							<h3 class="header-title text-white mb-0">Próxima Entrevista</h3>
						</div>
						<v-chip v-if="nextAppointment" size="x-small"
							:color="nextAppointment.modality === 'presencial' ? '#07254A' : '#0d9488'" variant="flat"
							class="font-weight-bold text-uppercase text-white border-white-15">
							{{ nextAppointment.modality }}
						</v-chip>
					</div>

					<v-card-text class="pa-5 flex-grow-1 d-flex flex-column justify-space-between bg-white">
						<div v-if="loading" class="text-center py-10">
							<v-progress-circular indeterminate color="#07254A" size="28"></v-progress-circular>
						</div>

						<div v-else-if="!nextAppointment" class="text-center py-10">
							<v-avatar size="54" color="#f8fafc" class="mb-3 empty-state-avatar">
								<v-icon size="26" color="#07254A">mdi-calendar-check-outline</v-icon>
							</v-avatar>
							<div class="text-subtitle-2 font-weight-bold text-slate-800 mb-1">
								Jornada al Día
							</div>
							<p class="text-caption text-slate-400 mb-0">
								No tienes entrevistas pendientes por realizar el día de hoy.
							</p>
						</div>

						<div v-else>
							<!-- Horario Destacado -->
							<div class="d-flex align-center gap-2 mb-3">
								<div class="time-badge-focus px-3 py-1 rounded-lg d-flex align-center">
									<v-icon icon="mdi-clock-outline" size="14" color="#07254A" class="mr-1"></v-icon>
									<span class="font-mono font-weight-black text-slate-900 text-body-2">
										{{ formatHour(nextAppointment.start_time) }} - {{ formatHour(nextAppointment.end_time) }}
									</span>
								</div>
							</div>

							<!-- Candidato y Empresa Contratante -->
							<div class="mb-3">
								<div class="candidate-focus-name text-slate-900 mb-1 text-truncate">
									{{ nextAppointment.examinee?.full_name }}
								</div>
								<div class="text-caption text-slate-600 d-flex align-center flex-wrap gap-1">
									<span class="font-weight-semibold text-slate-800">{{ nextAppointment.examinee?.position }}</span>
									<span class="text-slate-300">•</span>
									<span class="text-slate-700">
										{{ nextAppointment.client?.trade_name || nextAppointment.client?.company_name }}
									</span>
								</div>
							</div>

							<!-- Recuadro Resumen -->
							<div class="details-box pa-3 rounded-lg mb-4">
								<div class="d-flex justify-space-between py-1 text-caption">
									<span class="text-slate-500">Prueba / Batería:</span>
									<span class="text-slate-900 font-weight-bold text-truncate ml-2">
										{{ nextAppointment.evaluation_type?.name }}
									</span>
								</div>
								<div class="d-flex justify-space-between py-1 text-caption">
									<span class="text-slate-500">Teléfono móvil:</span>
									<span class="font-mono text-slate-900 font-weight-bold">
										{{ nextAppointment.examinee?.phone || 'No registrado' }}
									</span>
								</div>
							</div>
						</div>

						<!-- Botón WhatsApp -->
						<div v-if="nextAppointment" class="mt-2">
							<v-btn block variant="flat" rounded="lg" prepend-icon="mdi-whatsapp"
								class="whatsapp-focus-btn text-none font-weight-bold text-white py-3"
								:disabled="!nextAppointment.examinee?.phone" @click="openWhatsApp(nextAppointment)">
								Iniciar Contacto por WhatsApp
							</v-btn>
						</div>
					</v-card-text>
				</v-card>
			</v-col>

			<!-- Panel Derecho: Lista de Citas del Día -->
			<v-col cols="12" md="7" class="pl-md-3 mt-3 mt-md-0">
				<v-card flat class="today-list-card elevation-0 h-100 d-flex flex-column">
					<!-- Cabecera -->
					<div class="card-gradient-header px-5 py-3 d-flex align-center justify-space-between">
						<div class="d-flex align-center">
							<div class="header-icon-mini mr-2">
								<v-icon icon="mdi-format-list-checks" color="#ffffff" size="16"></v-icon>
							</div>
							<h3 class="header-title text-white mb-0">Citas Programadas para Hoy</h3>
						</div>
						<v-btn variant="text" size="x-small" color="#ffffff" append-icon="mdi-arrow-right"
							class="text-none font-weight-bold view-all-link" @click="$router.push('/appointments')">
							Ver Agenda Completa
						</v-btn>
					</div>

					<!-- Contenido Cronológico -->
					<v-card-text class="pa-4 bg-slate-50 flex-grow-1 overflow-y-auto" style="max-height: 380px;">
						<div v-if="loading" class="text-center py-10">
							<v-progress-circular indeterminate color="#07254A" size="24"></v-progress-circular>
						</div>

						<div v-else-if="todayAppointments.length === 0" class="text-center py-10 text-caption text-slate-400">
							No hay entrevistas programadas para la jornada de hoy.
						</div>

						<div v-else class="d-flex flex-column gap-2">
							<div v-for="item in todayAppointments" :key="item.id"
								class="session-item-row pa-3 rounded-xl d-flex align-center justify-space-between bg-white">
								<div class="d-flex align-center min-w-0 mr-3">
									<!-- Horario -->
									<div class="time-capsule px-2 py-1 rounded-lg text-center mr-3 flex-shrink-0">
										<span class="font-mono font-weight-bold text-caption text-slate-900">
											{{ formatHour(item.start_time) }}
										</span>
									</div>

									<!-- Info Candidato -->
									<div class="min-w-0">
										<div class="font-weight-bold text-slate-900 text-body-2 text-truncate">
											{{ item.examinee?.full_name }}
										</div>
										<div class="text-caption text-slate-500 text-truncate">
											<span class="font-weight-medium text-slate-700">
												{{ item.client?.trade_name || item.client?.company_name }}
											</span>
											• {{ item.evaluation_type?.name }}
										</div>
									</div>
								</div>

								<!-- Chips de Estatus y WhatsApp Rápido -->
								<div class="d-flex align-center gap-2 flex-shrink-0">
									<v-chip size="x-small" :color="getStatusColor(item.status)" variant="flat"
										class="font-weight-bold text-white status-pill">
										{{ formatStatus(item.status) }}
									</v-chip>

									<v-btn icon="mdi-whatsapp" size="small" variant="flat" color="#25D366"
										class="whatsapp-micro-btn text-white" :disabled="!item.examinee?.phone"
										@click="openWhatsApp(item)"></v-btn>
								</div>
							</div>
						</div>
					</v-card-text>
				</v-card>
			</v-col>
		</v-row>
	</div>
</template>

<script>
import { mapState } from 'pinia';
import { useClinicalDashboardStore } from '@/store/clinicalDashboard';

export default {
	name: 'TodaySessionsOverviewComponent',
	computed: {
		...mapState(useClinicalDashboardStore, [
			'nextAppointment',
			'todayAppointments',
			'loading',
		]),
	},
	methods: {
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
				scheduled: 'Pendiente',
				attended: 'Atendida',
				cancelled: 'Cancelada',
				no_show: 'Ausente',
			};
			return map[status] || status;
		},

		openWhatsApp(item) {
			const rawPhone = item.examinee?.phone || '';
			const cleanPhone = rawPhone.replace(/\D/g, '');
			const candidateName = item.examinee?.full_name || 'Candidato';
			const time = this.formatHour(item.start_time);

			const message = encodeURIComponent(
				`Hola ${candidateName}, te contacto del área de Evaluación Psicológica de Ópalo. Me pongo en comunicación contigo para tu entrevista programada a las ${time}.`
			);

			window.open(`https://wa.me/52${cleanPhone}?text=${message}`, '_blank');
		},
	},
};
</script>

<style scoped>
.focus-session-card,
.today-list-card {
	background: #ffffff !important;
	border: 1px solid #e2e8f0 !important;
	border-radius: 14px !important;
	overflow: hidden;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04) !important;
}

.card-gradient-header {
	background: linear-gradient(135deg, #07254A 0%, #0e1726 100%) !important;
}

.header-title {
	font-size: 0.9rem;
	font-weight: 700;
	letter-spacing: -0.2px;
}

.header-icon-mini {
	width: 26px;
	height: 26px;
	border-radius: 6px;
	background: rgba(255, 255, 255, 0.12);
	display: flex;
	align-items: center;
	justify-content: center;
}

.border-white-15 {
	border: 1px solid rgba(255, 255, 255, 0.15) !important;
}

.time-badge-focus {
	background-color: #f1f5f9;
	border: 1px solid #e2e8f0;
}

.candidate-focus-name {
	font-size: 1.15rem;
	font-weight: 800;
	letter-spacing: -0.3px;
	line-height: 1.25;
}

.details-box {
	background-color: #f8fafc;
	border: 1px solid #e2e8f0;
}

.whatsapp-focus-btn {
	background: linear-gradient(135deg, #10B981 0%, #059669 100%) !important;
	box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25) !important;
	font-size: 0.85rem !important;
	letter-spacing: -0.1px;
}

.whatsapp-focus-btn:hover {
	background: linear-gradient(135deg, #059669 0%, #047857 100%) !important;
}

.session-item-row {
	border: 1px solid #e2e8f0;
	transition: all 0.15s ease;
}

.session-item-row:hover {
	border-color: #cbd5e1;
	box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.time-capsule {
	background-color: #f8fafc;
	border: 1px solid #e2e8f0;
	min-width: 54px;
}

.status-pill {
	padding: 0 8px !important;
	height: 20px !important;
	font-size: 0.7rem !important;
}

.whatsapp-micro-btn {
	width: 28px !important;
	height: 28px !important;
	border-radius: 8px !important;
	box-shadow: 0 2px 4px rgba(37, 211, 102, 0.25) !important;
}

.empty-state-avatar {
	border: 1px solid #e2e8f0;
}

.view-all-link {
	opacity: 0.9;
}

.view-all-link:hover {
	opacity: 1;
}

.bg-slate-50 {
	background-color: #f8fafc;
}

.gap-1 {
	gap: 4px;
}

.gap-2 {
	gap: 8px;
}
</style>
