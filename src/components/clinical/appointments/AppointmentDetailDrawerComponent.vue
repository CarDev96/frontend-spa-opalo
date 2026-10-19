<template>
	<v-navigation-drawer v-model="drawerModel" location="right" temporary width="480" class="appointment-drawer">
		<div v-if="selectedAppointment" class="d-flex flex-column h-100">
			<!-- Header del Drawer -->
			<div class="drawer-header px-6 py-4 opaloBrand d-flex align-center justify-space-between">
				<div>
					<h3 class="text-subtitle-1 font-weight-bold text-white mb-0">Detalle de la Evaluación</h3>
					<span class="text-caption text-white opacity-80 font-mono">
						Candidato: {{ selectedAppointment.examinee?.full_name || '---' }}
					</span>
				</div>
				<v-btn icon="mdi-close" variant="text" size="small" color="#ffffff" @click="closeDrawer"></v-btn>
			</div>

			<!-- Cuerpo del Drawer -->
			<div class="drawer-body pa-6 flex-grow-1 overflow-y-auto bg-slate-50">
				<!-- 1. Tarjeta del Candidato -->
				<v-card flat class="pa-4 bg-white border-subtle rounded-xl mb-4">
					<div class="d-flex align-center mb-3">
						<v-avatar size="44" color="#07254A" class="mr-3 text-white font-weight-bold">
							{{ getInitials(selectedAppointment.examinee?.full_name) }}
						</v-avatar>
						<div class="min-w-0">
							<div class="text-subtitle-2 font-weight-bold text-slate-900 text-truncate">
								{{ selectedAppointment.examinee?.full_name }}
							</div>
							<div class="text-caption text-slate-500 font-weight-medium">
								{{ selectedAppointment.examinee?.curp || selectedAppointment.examinee?.position || 'Sin CURP' }}
							</div>
						</div>
					</div>

					<v-divider class="my-2"></v-divider>

					<div class="info-row d-flex justify-space-between py-1 text-caption">
						<span class="text-slate-500 font-weight-medium">Empresa Solicitante:</span>
						<span class="text-slate-900 font-weight-bold">
							{{ selectedAppointment.client?.trade_name || selectedAppointment.client?.company_name }}
						</span>
					</div>
					<div class="info-row d-flex justify-space-between py-1 text-caption">
						<span class="text-slate-500 font-weight-medium">Prueba Asignada:</span>
						<span class="text-slate-900 font-weight-bold">
							{{ selectedAppointment.evaluation_type?.name }}
						</span>
					</div>
					<div class="info-row d-flex justify-space-between py-1 text-caption">
						<span class="text-slate-500 font-weight-medium">Modalidad:</span>
						<v-chip size="x-small" color="#07254A" variant="flat" class="text-white text-uppercase font-weight-bold">
							{{ selectedAppointment.modality }}
						</v-chip>
					</div>

					<!-- Formato Limpio de Fecha y Horario -->
					<div class="info-row d-flex justify-space-between align-center py-1 text-caption">
						<span class="text-slate-500 font-weight-medium">Fecha y Hora:</span>
						<span class="text-slate-900 font-weight-bold">
							{{ formatDisplayDate(selectedAppointment.date) }} — {{ formatHour(selectedAppointment.start_time) }} hrs
						</span>
					</div>
				</v-card>

				<!-- 2. Contacto Directo WhatsApp -->
				<v-card flat class="pa-4 bg-emerald-50 border-emerald rounded-xl mb-4">
					<div class="text-caption font-weight-bold text-emerald-900 mb-1">
						CONTACTO DIRECTO CON EL CANDIDATO
					</div>
					<div class="d-flex align-center justify-space-between mt-2 flex-wrap gap-2">
						<div>
							<div class="text-caption text-emerald-700 font-weight-medium">Teléfono:</div>
							<div class="font-mono text-body-1 font-weight-black text-emerald-950">
								{{ selectedAppointment.examinee?.phone || 'Sin registrar' }}
							</div>
						</div>

						<v-btn
							color="#25D366"
							variant="flat"
							rounded="lg"
							prepend-icon="mdi-whatsapp"
							class="text-none font-weight-bold text-white px-4"
							:disabled="!selectedAppointment.examinee?.phone"
							@click="openWhatsApp"
						>
							Abrir WhatsApp
						</v-btn>
					</div>
				</v-card>

				<!-- 3. Resolución de la Sesión -->
				<v-card flat class="pa-4 bg-white border-subtle rounded-xl">
					<div class="text-caption font-weight-bold text-slate-700 mb-2">
						RESOLUCIÓN DE LA SESIÓN
					</div>

					<div v-if="form.status !== 'attended'" class="mb-3">
						<v-btn
							block
							color="#10B981"
							variant="tonal"
							prepend-icon="mdi-check-circle-outline"
							class="text-none font-weight-bold mb-3"
							@click="form.status = 'attended'"
						>
							Marcar como Completada (En espera de resultados)
						</v-btn>
					</div>

					<label class="field-label">Estatus de la Cita *</label>
					<v-select
						v-model="form.status"
						:items="statusOptions"
						item-title="title"
						item-value="value"
						density="compact"
						variant="outlined"
						rounded="lg"
						color="#07254A"
						class="custom-field mb-2"
					></v-select>

					<label class="field-label">Notas Clínicas u Observaciones</label>
					<v-textarea
						v-model="form.notes"
						placeholder="Anota observaciones sobre el desarrollo de la prueba, conexión o puntualidad..."
						rows="3"
						density="compact"
						variant="outlined"
						rounded="lg"
						color="#07254A"
						class="custom-field"
					></v-textarea>

					<div class="d-flex justify-end mt-2">
						<v-btn
							color="#07254A"
							variant="flat"
							rounded="lg"
							size="small"
							prepend-icon="mdi-check"
							class="text-none font-weight-bold text-white px-4"
							:loading="saving"
							@click="saveSession"
						>
							Guardar Sesión
						</v-btn>
					</div>
				</v-card>
			</div>
		</div>
	</v-navigation-drawer>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useClinicalAppointmentsStore } from '@/store/clinicalAppointments';
import api from '@/services/api';

export default {
	name: 'AppointmentDetailDrawerComponent',
	emits: ['session-updated'],
	data() {
		return {
			saving: false,
			form: {
				status: 'scheduled',
				notes: '',
			},
			statusOptions: [
				{ title: 'Programada (Pendiente)', value: 'scheduled' },
				{ title: 'Completada (En espera de resultados)', value: 'attended' },
				{ title: 'No se presentó (Ausente)', value: 'no_show' },
				{ title: 'Cancelada', value: 'cancelled' },
			],
		};
	},

	computed: {
		...mapState(useClinicalAppointmentsStore, ['selectedAppointment', 'drawerOpen']),

		drawerModel: {
			get() {
				return this.drawerOpen;
			},
			set(val) {
				if (!val) this.closeDrawer();
			},
		},
	},

	watch: {
		selectedAppointment: {
			immediate: true,
			handler(val) {
				if (val) {
					this.form.status = val.status || 'scheduled';
					this.form.notes = val.notes || '';
				}
			},
		},
	},

	methods: {
		...mapActions(useClinicalAppointmentsStore, ['closeDrawer']),

		getInitials(name) {
			if (!name) return 'EV';
			const parts = name.trim().split(' ');
			return parts.length > 1
				? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
				: parts[0].substring(0, 2).toUpperCase();
		},

		formatDisplayDate(dateVal) {
			if (!dateVal) return 'Sin fecha';
			// Extrae únicamente YYYY-MM-DD sin importar si viene en formato ISO (Z)
			const cleanDate = typeof dateVal === 'string' ? dateVal.substring(0, 10) : '';
			const parts = cleanDate.split('-');
			if (parts.length === 3) {
				const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
				return d.toLocaleDateString('es-MX', {
					weekday: 'short',
					day: '2-digit',
					month: 'short',
					year: 'numeric',
				});
			}
			return cleanDate;
		},

		formatHour(hourStr) {
			if (!hourStr) return '--:--';
			return hourStr.substring(0, 5);
		},

		openWhatsApp() {
			if (!this.selectedAppointment?.examinee?.phone) return;
			const cleanPhone = this.selectedAppointment.examinee.phone.replace(/\D/g, '');
			const candidateName = this.selectedAppointment.examinee.full_name || 'Candidato';
			const time = this.formatHour(this.selectedAppointment.start_time);

			const message = encodeURIComponent(
				`Hola ${candidateName}, te contacto del área de Evaluación Psicológica de Ópalo. Me comunico contigo para dar inicio a tu sesión programada a las ${time}.`
			);

			window.open(`https://wa.me/52${cleanPhone}?text=${message}`, '_blank');
		},

		async saveSession() {
			if (!this.selectedAppointment) return;

			this.saving = true;
			try {
				await api.patch(`/clinical/appointments/${this.selectedAppointment.id}/session`, {
					status: this.form.status,
					notes: this.form.notes || null,
				});

				this.$emit('session-updated');
				this.closeDrawer();
			} catch (e) {
				console.error('Error al guardar sesión:', e);
			} finally {
				this.saving = false;
			}
		},
	},
};
</script>

<style scoped>
.appointment-drawer {
	z-index: 1050 !important;
}

.opaloBrand {
	background: linear-gradient(135deg, #07254A 0%, #0e1726 100%) !important;
}

.bg-slate-50 {
	background-color: #f8fafc;
}

.border-subtle {
	border: 1px solid #e2e8f0;
}

.border-emerald {
	border: 1px solid #a7f3d0;
}

.bg-emerald-50 {
	background-color: #ecfdf5;
}

.field-label {
	display: block;
	font-size: 0.78rem;
	font-weight: 600;
	color: #475569;
	margin-bottom: 4px;
}

:deep(.custom-field .v-field) {
	border-radius: 8px !important;
	font-size: 0.84rem !important;
}

.gap-2 { gap: 8px; }
</style>
