<template>
	<v-card flat class="admin-orders-card elevation-0">
		<!-- Barra de Filtros y Búsqueda -->
		<div class="px-6 py-4 border-bottom bg-slate-50 d-flex flex-wrap align-center justify-space-between gap-3">
			<div class="d-flex align-center flex-grow-1" style="max-width: 400px;">
				<v-text-field v-model="search" placeholder="Buscar por evaluado, CURP o empresa..."
					prepend-inner-icon="mdi-magnify" density="compact" variant="outlined" rounded="lg" hide-details
					bg-color="#ffffff" @update:model-value="debounceFetch"></v-text-field>
			</div>

			<div class="d-flex align-center gap-2">
				<v-select v-model="statusFilter" :items="statusOptions" item-title="label" item-value="value" density="compact"
					variant="outlined" rounded="lg" hide-details style="min-width: 180px;" bg-color="#ffffff"
					@update:model-value="fetchOrders"></v-select>

				<v-btn variant="flat" color="#07254A" prepend-icon="mdi-refresh"
					class="text-none font-weight-bold text-white reload-btn" :loading="loading" @click="fetchOrders">
					Recargar
				</v-btn>
			</div>
		</div>

		<!-- Tabla de Órdenes -->
		<v-card-text class="pa-0">
			<v-data-table :headers="headers" :items="orders" :loading="loading" hover density="comfortable"
				no-data-text="No se encontraron órdenes registradas">
				<template v-slot:item="{ item }">
					<tr class="table-row">
						<!-- Empresa Cliente -->
						<td class="py-3">
							<div class="font-weight-bold text-slate-800">{{ item.client?.company_name }}</div>
							<div class="text-caption font-mono text-slate-500">{{ item.client?.rfc || 'SIN RFC' }}</div>
						</td>

						<!-- Evaluado -->
						<td>
							<div class="font-weight-bold text-slate-800">{{ item.examinee?.full_name }}</div>
							<div class="text-caption font-mono text-grey">{{ item.examinee?.curp || 'SIN CURP' }}</div>
						</td>

						<!-- Tipo de Prueba -->
						<td>
							<div class="text-body-2 font-weight-medium text-slate-800">{{ item.evaluation_type?.name }}</div>
							<div class="text-caption text-slate-400">Modalidad: {{ item.evaluation_type?.modality }}</div>
						</td>

						<!-- Total con IVA -->
						<td class="text-end font-mono font-weight-bold text-slate-900">
							${{ formatMoney(item.total) }} MXN
						</td>

						<!-- Estatus -->
						<td class="text-center">
							<v-chip size="small" :color="getStatusColor(item.payment_status)" variant="flat"
								class="font-weight-bold text-white px-2">
								{{ formatStatus(item.payment_status) }}
							</v-chip>
						</td>

						<!-- Acción -->
						<td class="text-end pr-4">
							<div class="d-flex align-center justify-end gap-2">
								<!-- BOTÓN AGENDAR CITA: Solo visible si el pago está aprobado Y el evaluado está pendiente -->
								<v-btn
									v-if="item.payment_status === 'approved'"
									size="small" variant="flat" color="#10B981" rounded="lg" prepend-icon="mdi-calendar-clock"
									class="text-none font-weight-bold text-white mr-2"
									@click="$router.push(`/admin/appointments/book-order/${item.id}`)">
									Agendar Cita
								</v-btn>

								<!-- BOTÓN ORIGINAL: Revisar Pago -->
								<v-btn size="small" variant="flat" color="#07254A" rounded="lg" prepend-icon="mdi-shield-search"
									class="text-none font-weight-bold text-white" @click="$emit('open-validate', item)">
									Revisar Pago
								</v-btn>
							</div>
						</td>
					</tr>
				</template>
			</v-data-table>
		</v-card-text>
	</v-card>
</template>

<script>
import api from '@/services/api';

export default {
	name: 'AdminOrdersListComponent',
	emits: ['open-validate'],
	data() {
		return {
			orders: [],
			loading: false,
			search: '',
			statusFilter: 'all',
			searchTimeout: null,
			statusOptions: [
				{ label: 'Todos los Estatus', value: 'all' },
				{ label: 'En Validación', value: 'under_review' },
				{ label: 'Aprobados', value: 'approved' },
				{ label: 'Rechazados', value: 'rejected' },
				{ label: 'Pendientes de Pago', value: 'pending_receipt' },
			],
			headers: [
				{ title: 'Empresa Cliente', key: 'client.company_name', align: 'start' },
				{ title: 'Candidato Evaluado', key: 'examinee.full_name', align: 'start' },
				{ title: 'Prueba Solicitada', key: 'evaluation_type.name', align: 'start' },
				{ title: 'Total (c/ IVA)', key: 'total', align: 'end' },
				{ title: 'Estatus Pago', key: 'payment_status', align: 'center' },
				{ title: 'Acciones', key: 'actions', align: 'end', sortable: false },
			],
		};
	},
	mounted() {
		this.fetchOrders();
	},
	methods: {
		formatMoney(val) {
			return Number(val || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 });
		},
		debounceFetch() {
			clearTimeout(this.searchTimeout);
			this.searchTimeout = setTimeout(() => {
				this.fetchOrders();
			}, 350);
		},
		async fetchOrders() {
			this.loading = true;
			try {
				const res = await api.get('/admin/evaluation-orders', {
					params: {
						payment_status: this.statusFilter,
						search: this.search,
					},
				});
				this.orders = res.data?.data || [];
			} catch (e) {
				console.error('Error cargando órdenes staff:', e);
			} finally {
				this.loading = false;
			}
		},
		updateOrderItem(updated) {
			const idx = this.orders.findIndex((o) => o.id === updated.id);
			if (idx !== -1) {
				this.orders[idx] = updated;
			}
		},
		getStatusColor(status) {
			const map = { pending_receipt: '#64748B', under_review: '#0284C7', approved: '#10B981', rejected: '#EF4444' };
			return map[status] || '#64748B';
		},
		formatStatus(status) {
			const map = { pending_receipt: 'Pendiente', under_review: 'En Validación', approved: 'Aprobado', rejected: 'Rechazado' };
			return map[status] || 'Pendiente';
		},
	},
};
</script>

<style scoped>
.admin-orders-card {
	background: #ffffff !important;
	border: 1px solid #e2e8f0 !important;
	border-radius: 16px !important;
	overflow: hidden;
}

.bg-slate-50 {
	background-color: #f8fafc;
}

.reload-btn {
	border-radius: 8px !important;
}

.gap-2 {
	gap: 8px;
}

.gap-3 {
	gap: 12px;
}

.font-mono {
	font-family: monospace;
}
</style>
