<template>
	<v-card flat class="timeline-table-card elevation-0">
		<!-- Header Corporativo Ópalo -->
		<div class="card-table-header px-6 py-4 d-flex align-center justify-space-between flex-wrap gap-2">
			<div class="d-flex align-center">
				<div class="header-icon-box mr-3 flex-shrink-0">
					<v-icon icon="mdi-calendar-clock-outline" color="#ffffff" size="20"></v-icon>
				</div>
				<div>
					<h2 class="card-title text-white mb-0">Agenda y Control de Evaluaciones</h2>
					<span class="card-subtitle text-white opacity-80">
						Atención de citas clínicas, contacto por WhatsApp y dictamen de resultados
					</span>
				</div>
			</div>

			<div class="d-flex align-center gap-2">
				<v-btn
					variant="flat"
					size="small"
					color="#ffffff"
					prepend-icon="mdi-refresh"
					class="text-none font-weight-bold reload-btn"
					:loading="loading"
					@click="loadAppointments"
				>
					Recargar
				</v-btn>
			</div>
		</div>

		<!-- Toolbar: Selector de Filtro en Lista + Métricas -->
		<div class="filter-toolbar px-6 py-3 border-bottom bg-slate-50 d-flex flex-wrap align-center justify-space-between gap-3">
			<div class="d-flex align-center gap-2" style="min-width: 320px;">
				<v-icon icon="mdi-filter-variant" size="20" color="#07254A"></v-icon>
				<span class="text-caption font-weight-bold text-slate-700">Mostrar:</span>
				<v-select
					v-model="selectedView"
					:items="viewOptions"
					item-title="title"
					item-value="value"
					density="compact"
					variant="outlined"
					hide-details
					rounded="lg"
					bg-color="#ffffff"
					color="#07254A"
					class="view-select font-weight-bold"
				></v-select>
			</div>

			<!-- Badges de conteo calculados reactivamente -->
			<div class="d-flex align-center gap-2 flex-wrap">
				<v-chip size="small" variant="flat" color="#e2e8f0" class="font-weight-bold text-slate-700">
					Total: {{ allAppointments.length }}
				</v-chip>
				<v-chip size="small" variant="flat" color="#dbeafe" class="font-weight-bold text-blue-900">
					Pendientes: {{ countScheduled }}
				</v-chip>
				<v-chip size="small" variant="flat" color="#d1fae5" class="font-weight-bold text-emerald-900">
					En espera de resultados: {{ countAttended }}
				</v-chip>
			</div>
		</div>

		<!-- Barra de Búsqueda -->
		<div class="table-search-bar px-6 py-3 border-bottom bg-white">
			<v-row dense align="center">
				<v-col cols="12" sm="8" md="5">
					<v-text-field
						v-model="search"
						placeholder="Buscar por candidato, CURP, empresa o prueba..."
						prepend-inner-icon="mdi-magnify"
						variant="outlined"
						density="compact"
						hide-details
						clearable
						rounded="lg"
						bg-color="#ffffff"
						color="#07254A"
						class="search-input"
					></v-text-field>
				</v-col>
			</v-row>
		</div>

		<!-- Data Table Oficial Ópalo -->
		<v-card-text class="pa-0">
			<v-data-table
				v-model:page="page"
				v-model:items-per-page="itemsPerPage"
				class="custom-opalo-table"
				:headers="headers"
				:items="filteredAppointments"
				:search="search"
				:loading="loading"
				hover
				density="comfortable"
				mobile-breakpoint="0"
			>
				<!-- Fila Sincronizada -->
				<template v-slot:item="{ item }">
					<tr class="table-row">
						<!-- 1. Horario y Fecha -->
						<td class="py-3">
							<div class="font-weight-bold text-slate-900">
								{{ formatSafeDate(item.date) }}
							</div>
							<div class="text-caption font-mono text-slate-500">
								{{ formatHour(item.start_time) }} - {{ formatHour(item.end_time) }}
							</div>
						</td>

						<!-- 2. Candidato / Evaluado -->
						<td>
							<div class="font-weight-bold text-slate-800">
								{{ item.examinee?.full_name || 'Candidato sin nombre' }}
							</div>
							<div class="text-caption text-slate-500 font-mono">
								{{ item.examinee?.curp || item.examinee?.position || 'Sin cargo' }}
							</div>
						</td>

						<!-- 3. Empresa Solicitante -->
						<td>
							<div class="text-body-2 font-weight-medium text-slate-800">
								{{ item.client?.trade_name || item.client?.company_name || 'N/A' }}
							</div>
						</td>

						<!-- 4. Evaluación y Modalidad -->
						<td>
							<div class="d-flex align-center gap-1 flex-wrap">
								<span class="text-caption font-weight-bold text-slate-700">
									{{ item.evaluation_type?.name || 'Evaluación' }}
								</span>
								<v-chip
									size="x-small"
									:color="item.modality === 'presencial' ? '#07254A' : '#0d9488'"
									variant="flat"
									class="font-weight-bold text-uppercase text-white ml-1"
								>
									{{ item.modality || 'Presencial' }}
								</v-chip>
							</div>
						</td>

						<!-- 5. Estatus -->
						<td class="text-center">
							<v-chip
								size="small"
								:color="getStatusColor(item.status)"
								variant="flat"
								class="font-weight-bold text-white status-chip"
							>
								{{ formatStatus(item.status) }}
							</v-chip>
						</td>

						<!-- 6. Acciones -->
						<td class="text-end pr-4">
							<div class="d-flex align-center justify-end gap-2" @click.stop>
								<!-- Botón WhatsApp -->
								<v-tooltip text="Contactar por WhatsApp" location="top">
									<template #activator="{ props }">
										<v-btn
											v-bind="props"
											color="#25D366"
											variant="flat"
											size="small"
											rounded="lg"
											icon="mdi-whatsapp"
											class="text-white whatsapp-btn"
											:disabled="!item.examinee?.phone"
											@click="openWhatsApp(item)"
										></v-btn>
									</template>
								</v-tooltip>

								<!-- Botón Atender Cita / Ver Sesión -->
								<v-btn
									size="small"
									variant="flat"
									color="#07254A"
									rounded="lg"
									prepend-icon="mdi-clipboard-check-outline"
									class="text-none font-weight-bold text-white"
									@click="openDrawer(item)"
								>
									{{ item.status === 'attended' ? 'Ver Sesión' : 'Atender Cita' }}
								</v-btn>
							</div>
						</td>
					</tr>
				</template>

				<!-- Sin datos -->
				<template v-slot:no-data>
					<div class="py-10 text-center">
						<v-avatar size="64" color="#f8fafc" class="mb-3 empty-avatar">
							<v-icon size="32" color="#07254A">mdi-calendar-blank-outline</v-icon>
						</v-avatar>
						<div class="text-subtitle-1 font-weight-bold text-slate-800">
							No hay citas para mostrar en este filtro
						</div>
						<div class="text-caption text-grey">
							Selecciona otra opción en la lista superior o recarga la agenda.
						</div>
					</div>
				</template>

				<!-- Footer en Español Nativo -->
				<template v-slot:bottom="{ pageCount }">
					<div class="d-flex align-center justify-end px-4 py-2 border-top gap-3 flex-wrap bg-white custom-footer">
						<div class="d-flex align-center gap-2">
							<span class="text-caption text-slate-600 font-weight-medium">Filas por página:</span>
							<v-select
								v-model="itemsPerPage"
								:items="[5, 10, 25, 50]"
								density="compact"
								variant="outlined"
								hide-details
								class="footer-select"
							></v-select>
						</div>

						<span class="text-caption text-slate-600 font-weight-medium">
							{{ paginationText }}
						</span>

						<div class="d-flex align-center">
							<v-btn
								icon="mdi-page-first"
								variant="text"
								size="small"
								density="comfortable"
								:disabled="page <= 1"
								@click="page = 1"
							></v-btn>
							<v-btn
								icon="mdi-chevron-left"
								variant="text"
								size="small"
								density="comfortable"
								:disabled="page <= 1"
								@click="page--"
							></v-btn>
							<v-btn
								icon="mdi-chevron-right"
								variant="text"
								size="small"
								density="comfortable"
								:disabled="page >= pageCount"
								@click="page++"
							></v-btn>
							<v-btn
								icon="mdi-page-last"
								variant="text"
								size="small"
								density="comfortable"
								:disabled="page >= pageCount"
								@click="page = pageCount"
							></v-btn>
						</div>
					</div>
				</template>
			</v-data-table>
		</v-card-text>
	</v-card>
</template>

<script>
import { mapActions } from 'pinia';
import { useClinicalAppointmentsStore } from '@/store/clinicalAppointments';
import api from '@/services/api';

export default {
	name: 'AppointmentsTimelineComponent',
	data() {
		return {
			loading: false,
			allAppointments: [],
			selectedView: 'all', // De inicio muestra todas completas
			search: '',
			page: 1,
			itemsPerPage: 10,
			viewOptions: [
				{ title: 'Todas las Citas (Historial Completo)', value: 'all' },
				{ title: 'Citas de Esta Semana', value: 'week' },
				{ title: 'Citas Próximas (Por Atender)', value: 'upcoming' },
				{ title: 'Solo Pendientes (Programadas)', value: 'scheduled' },
				{ title: 'En Espera de Resultados (Completadas)', value: 'attended' },
			],
			headers: [
				{ title: 'Fecha y Horario', key: 'date', align: 'start' },
				{ title: 'Candidato / Evaluado', key: 'examinee.full_name', align: 'start' },
				{ title: 'Empresa Cliente', key: 'client.trade_name', align: 'start' },
				{ title: 'Evaluación y Modalidad', key: 'evaluation_type.name', align: 'start', sortable: false },
				{ title: 'Estatus', key: 'status', align: 'center' },
				{ title: 'Acciones', key: 'actions', align: 'end', sortable: false },
			],
		};
	},

	computed: {
		filteredAppointments() {
			if (!Array.isArray(this.allAppointments)) return [];

			const today = new Date();
			const todayStr = today.toISOString().substring(0, 10);

			switch (this.selectedView) {
				case 'week': {
					const current = new Date();
					const day = current.getDay();
					const diff = current.getDate() - day + (day === 0 ? -6 : 1);
					const monday = new Date(current.setDate(diff));
					const sunday = new Date(current.setDate(monday.getDate() + 6));

					const start = monday.toISOString().substring(0, 10);
					const end = sunday.toISOString().substring(0, 10);

					return this.allAppointments.filter((a) => {
						const d = a.date ? a.date.substring(0, 10) : '';
						return d >= start && d <= end;
					});
				}
				case 'upcoming': {
					return this.allAppointments.filter((a) => {
						const d = a.date ? a.date.substring(0, 10) : '';
						return d >= todayStr && a.status === 'scheduled';
					});
				}
				case 'scheduled': {
					return this.allAppointments.filter((a) => a.status === 'scheduled');
				}
				case 'attended': {
					return this.allAppointments.filter((a) => a.status === 'attended');
				}
				case 'all':
				default:
					return this.allAppointments;
			}
		},

		countScheduled() {
			return this.allAppointments.filter((a) => a.status === 'scheduled').length;
		},

		countAttended() {
			return this.allAppointments.filter((a) => a.status === 'attended').length;
		},

		paginationText() {
			const total = this.filteredAppointments.length;
			if (total === 0) return '0 de 0';
			const start = (this.page - 1) * this.itemsPerPage + 1;
			const end = Math.min(this.page * this.itemsPerPage, total);
			return `${start}-${end} de ${total}`;
		},
	},

	mounted() {
		this.loadAppointments();
	},

	methods: {
		...mapActions(useClinicalAppointmentsStore, ['openDrawer']),

		async loadAppointments() {
			this.loading = true;
			try {
				// Usa la ruta oficial pasando timeframe=all
				const response = await api.get('/clinical/appointments/list', {
					params: { timeframe: 'all' },
				});
				const res = response.data;

				if (Array.isArray(res)) {
					this.allAppointments = res;
				} else if (res && Array.isArray(res.data)) {
					this.allAppointments = res.data;
				} else {
					this.allAppointments = [];
				}
			} catch (error) {
				console.error('Error al extraer citas:', error);
				this.allAppointments = [];
			} finally {
				this.loading = false;
			}
		},

		formatSafeDate(dateVal) {
			if (!dateVal) return 'Sin fecha';
			const cleanDate = typeof dateVal === 'string' ? dateVal.substring(0, 10) : '';
			const parts = cleanDate.split('-');
			if (parts.length === 3) {
				const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
				return d.toLocaleDateString('es-MX', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
			}
			return cleanDate;
		},

		formatHour(hourStr) {
			if (!hourStr) return '--:--';
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
				scheduled: 'Programada (Pendiente)',
				attended: 'Completada (En espera de resultados)',
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

			window.open(`https://wa.me/52${cleanPhone}?text=${message}`, '_blank');
		},
	},
};
</script>

<style scoped>
.timeline-table-card {
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
	width: 38px;
	height: 38px;
	border-radius: 10px;
	background: rgba(255, 255, 255, 0.12);
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
}

.filter-toolbar {
	border-bottom: 1px solid #e2e8f0;
}

.bg-slate-50 {
	background-color: #f8fafc;
}

.view-select {
	max-width: 340px;
}

:deep(.view-select .v-field) {
	border-radius: 8px !important;
	font-size: 0.82rem !important;
	min-height: 36px !important;
	height: 36px !important;
}

:deep(.view-select .v-field__input) {
	padding-top: 6px !important;
	padding-bottom: 6px !important;
}

.table-search-bar {
	border-bottom: 1px solid #e2e8f0;
}

:deep(.search-input .v-field) {
	border-radius: 8px !important;
	font-size: 0.84rem !important;
}

.table-row:hover {
	background-color: #f8fafc;
}

.status-chip {
	padding: 0 10px !important;
	height: 24px !important;
	font-size: 0.72rem !important;
}

.whatsapp-btn {
	box-shadow: 0 2px 4px rgba(37, 211, 102, 0.3) !important;
}

.empty-avatar {
	border: 1px solid #e2e8f0;
}

.footer-select {
	width: 80px;
}

:deep(.footer-select .v-field) {
	border-radius: 6px !important;
	font-size: 0.78rem !important;
	min-height: 32px !important;
	height: 32px !important;
}

:deep(.footer-select .v-field__input) {
	padding-top: 4px !important;
	padding-bottom: 4px !important;
}

.custom-footer {
	border-top: 1px solid #e2e8f0;
}

.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
</style>
