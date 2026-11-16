<template>
  <div class="admin-dashboard-wrapper">
    <!-- Banner Principal -->
    <v-card flat class="banner-card elevation-0 mb-6">
      <div class="card-header px-6 py-5 d-flex flex-wrap align-center justify-space-between text-white gap-3">
        <div class="d-flex align-center">
          <div class="header-icon-box mr-4 flex-shrink-0">
            <v-icon icon="mdi-shield-check" color="#ffffff" size="26"></v-icon>
          </div>
          <div>
            <h2 class="card-title text-white mb-1">Panel de Control Operativo</h2>
            <span class="card-subtitle text-white opacity-80">
              Resumen en tiempo real de citas, tiempos de atención desde orden y estatus de evaluados
            </span>
          </div>
        </div>

        <v-btn
          variant="flat"
          color="rgba(255,255,255,0.16)"
          rounded="lg"
          size="small"
          prepend-icon="mdi-refresh"
          class="text-none font-weight-bold text-white"
          :loading="loading"
          @click="loadStats"
        >
          Actualizar Datos
        </v-btn>
      </div>
    </v-card>

    <!-- 1. KPIs PRINCIPALES -->
    <v-row dense class="mb-6">
      <v-col cols="12" sm="6" md="3" class="pa-2">
        <v-card flat class="kpi-card pa-4 h-100 border-top-blue">
          <div class="d-flex align-center justify-space-between mb-2">
            <span class="kpi-label">CITAS PROGRAMADAS</span>
            <div class="kpi-icon bg-blue-50">
              <v-icon icon="mdi-calendar-check" color="#2563EB" size="20"></v-icon>
            </div>
          </div>
          <div class="kpi-value text-slate-900">{{ stats.scheduled_appointments || 0 }}</div>
          <div class="kpi-sub text-slate-500 mt-1">
            {{ stats.today_appointments || 0 }} para el día de hoy
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3" class="pa-2">
        <v-card flat class="kpi-card pa-4 h-100 border-top-amber">
          <div class="d-flex align-center justify-space-between mb-2">
            <span class="kpi-label">PAGOS EN REVISIÓN</span>
            <div class="kpi-icon bg-amber-50">
              <v-icon icon="mdi-file-clock-outline" color="#D97706" size="20"></v-icon>
            </div>
          </div>
          <div class="kpi-value text-slate-900">{{ stats.pending_orders || 0 }}</div>
          <div class="kpi-sub text-slate-500 mt-1">Pendientes de liberación</div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3" class="pa-2">
        <v-card flat class="kpi-card pa-4 h-100 border-top-emerald">
          <div class="d-flex align-center justify-space-between mb-2">
            <span class="kpi-label">EVALUACIONES TERMINADAS</span>
            <div class="kpi-icon bg-emerald-50">
              <v-icon icon="mdi-check-decagram" color="#059669" size="20"></v-icon>
            </div>
          </div>
          <div class="kpi-value text-emerald-700">{{ stats.completed_count || 0 }}</div>
          <div class="kpi-sub text-slate-500 mt-1">
            De {{ stats.total_examinees || 0 }} candidatos registrados
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3" class="pa-2">
        <v-card flat class="kpi-card pa-4 h-100 border-top-indigo">
          <div class="d-flex align-center justify-space-between mb-2">
            <span class="kpi-label">TIEMPO PROMEDIO CIERRE</span>
            <div class="kpi-icon bg-indigo-50">
              <v-icon icon="mdi-timer-check-outline" color="#4F46E5" size="20"></v-icon>
            </div>
          </div>
          <div class="kpi-value text-indigo-700">
            {{ formatAvgTime(stats.avg_completion_hours) }}
          </div>
          <div class="kpi-sub text-slate-500 mt-1">
            Desde orden de evaluación hasta cierre
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- 2. EMBUDO COMPLETO DE ESTATUS DE EVALUADOS -->
    <v-card flat class="section-card elevation-0 mb-6">
      <div class="px-6 py-4 bg-slate-50 border-bottom d-flex flex-wrap align-center justify-space-between gap-2">
        <div class="d-flex align-center">
          <v-icon icon="mdi-chart-timeline-variant" color="#07254A" size="20" class="mr-2"></v-icon>
          <h3 class="text-subtitle-1 font-weight-bold text-slate-900 mb-0">
            Distribución Operativa por Estatus del Evaluado
          </h3>
        </div>
        <span class="text-caption text-slate-500">Haz clic en un estatus para filtrar la tabla de tiempos</span>
      </div>

      <div class="pa-4 bg-white">
        <v-row dense>
          <v-col cols="6" sm="4" md="2" class="pa-1">
            <div
              class="funnel-pill pa-3 rounded-xl text-center cursor-pointer"
              :class="{ 'pill-active': statusFilter === 'pending' }"
              @click="toggleStatusFilter('pending')"
            >
              <div class="text-h6 font-weight-black text-slate-700">{{ breakdown.pending || 0 }}</div>
              <div class="text-caption font-weight-bold text-slate-600">Perfil Creado</div>
            </div>
          </v-col>

          <v-col cols="6" sm="4" md="2" class="pa-1">
            <div
              class="funnel-pill pa-3 rounded-xl text-center cursor-pointer"
              :class="{ 'pill-active': statusFilter === 'order_created' }"
              @click="toggleStatusFilter('order_created')"
            >
              <div class="text-h6 font-weight-black text-indigo-600">{{ breakdown.order_created || 0 }}</div>
              <div class="text-caption font-weight-bold text-indigo-800">Orden Generada</div>
            </div>
          </v-col>

          <v-col cols="6" sm="4" md="2" class="pa-1">
            <div
              class="funnel-pill pa-3 rounded-xl text-center cursor-pointer"
              :class="{ 'pill-active': statusFilter === 'scheduled' }"
              @click="toggleStatusFilter('scheduled')"
            >
              <div class="text-h6 font-weight-black text-blue-600">{{ breakdown.scheduled || 0 }}</div>
              <div class="text-caption font-weight-bold text-blue-800">Cita Agendada</div>
            </div>
          </v-col>

          <v-col cols="6" sm="4" md="2" class="pa-1">
            <div
              class="funnel-pill pa-3 rounded-xl text-center cursor-pointer"
              :class="{ 'pill-active': statusFilter === 'awaiting_results' }"
              @click="toggleStatusFilter('awaiting_results')"
            >
              <div class="text-h6 font-weight-black text-amber-600">{{ breakdown.awaiting_results || 0 }}</div>
              <div class="text-caption font-weight-bold text-amber-800">Espera Resultados</div>
            </div>
          </v-col>

          <v-col cols="6" sm="4" md="2" class="pa-1">
            <div
              class="funnel-pill pa-3 rounded-xl text-center cursor-pointer"
              :class="{ 'pill-active': statusFilter === 'completed' }"
              @click="toggleStatusFilter('completed')"
            >
              <div class="text-h6 font-weight-black text-emerald-600">{{ breakdown.completed || 0 }}</div>
              <div class="text-caption font-weight-bold text-emerald-800">Eval. Terminada</div>
            </div>
          </v-col>

          <v-col cols="6" sm="4" md="2" class="pa-1">
            <div
              class="funnel-pill pa-3 rounded-xl text-center cursor-pointer"
              :class="{ 'pill-active': statusFilter === 'incidents' }"
              @click="toggleStatusFilter('incidents')"
            >
              <div class="text-h6 font-weight-black text-red-600">{{ breakdown.incidents || 0 }}</div>
              <div class="text-caption font-weight-bold text-red-800">Cancelada / Ausente</div>
            </div>
          </v-col>
        </v-row>
      </div>
    </v-card>

    <!-- 3. MONITOR DE TIEMPOS DE EXPEDIENTE + PRÓXIMAS CITAS Y ACCESOS -->
    <v-row dense>
      <!-- Columna Izquierda: Tiempos por Evaluado -->
      <v-col cols="12" lg="8" class="pa-2">
        <v-card flat class="section-card elevation-0 mb-5">
          <div class="px-6 py-4 bg-slate-50 border-bottom d-flex flex-wrap align-center justify-space-between gap-2">
            <div class="d-flex align-center">
              <v-icon icon="mdi-clock-check-outline" color="#07254A" size="20" class="mr-2"></v-icon>
              <h3 class="text-subtitle-1 font-weight-bold text-slate-900 mb-0">
                Tiempos de Atención (Desde Orden de Evaluación)
              </h3>
            </div>

            <div class="d-flex align-center gap-2">
              <v-chip
                v-if="statusFilter !== 'all'"
                closable
                size="x-small"
                color="#07254A"
                variant="flat"
                class="text-white font-weight-bold"
                @click:close="statusFilter = 'all'"
              >
                Filtro activo
              </v-chip>

              <v-btn
                variant="text"
                size="small"
                color="#07254A"
                append-icon="mdi-arrow-right"
                class="text-none font-weight-bold"
                @click="$router.push('/social-work/dossiers')"
              >
                Ir a Expedientes
              </v-btn>
            </div>
          </div>

          <v-card-text class="pa-0">
            <v-data-table
              :headers="timelineHeaders"
              :items="filteredTimelines"
              :loading="loading"
              density="comfortable"
              hover
              no-data-text="No hay registros en este estatus"
            >
              <template v-slot:item="{ item }">
                <tr>
                  <td class="py-3">
                    <div class="font-weight-bold text-slate-900 text-body-2">{{ item.full_name }}</div>
                    <div class="text-caption text-slate-500">{{ item.client_name }}</div>
                  </td>

                  <td class="text-center">
                    <v-chip
                      size="small"
                      :color="getStatusMeta(item.status).color"
                      variant="tonal"
                      class="font-weight-bold"
                    >
                      {{ getStatusMeta(item.status).label }}
                    </v-chip>
                  </td>

                  <td class="text-end pr-5">
                    <v-chip
                      v-if="!item.has_order"
                      size="small"
                      color="#94A3B8"
                      variant="tonal"
                      class="font-weight-bold"
                    >
                      Sin orden generada
                    </v-chip>

                    <v-chip
                      v-else
                      size="small"
                      :color="item.status === 'completed' ? '#059669' : '#475569'"
                      :variant="item.status === 'completed' ? 'flat' : 'tonal'"
                      class="font-mono font-weight-bold"
                      :class="{ 'text-white': item.status === 'completed' }"
                    >
                      <v-icon :icon="item.status === 'completed' ? 'mdi-check-circle' : 'mdi-timer-sand'" start size="13"></v-icon>
                      {{ item.elapsed_text }}
                    </v-chip>
                  </td>
                </tr>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>

        <!-- Próximas Citas Programadas -->
        <v-card flat class="section-card elevation-0">
          <div class="px-6 py-4 bg-slate-50 border-bottom d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-icon icon="mdi-calendar-clock-outline" color="#07254A" size="20" class="mr-2"></v-icon>
              <h3 class="text-subtitle-1 font-weight-bold text-slate-900 mb-0">
                Próximas Citas Programadas
              </h3>
            </div>
            <v-btn
              variant="text"
              size="small"
              color="#07254A"
              append-icon="mdi-arrow-right"
              class="text-none font-weight-bold"
              @click="$router.push('/admin/appointments')"
            >
              Ver Todas
            </v-btn>
          </div>

          <v-card-text class="pa-0">
            <v-table density="comfortable">
              <thead>
                <tr>
                  <th>CANDIDATO / EMPRESA</th>
                  <th>PSICÓLOGA</th>
                  <th>HORARIO</th>
                  <th>MODALIDAD</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="appt in upcomingAppointments" :key="appt.id">
                  <td class="py-3">
                    <div class="font-weight-bold text-slate-900">{{ appt.examinee?.full_name }}</div>
                    <div class="text-caption text-slate-500">{{ appt.client?.company_name }}</div>
                  </td>
                  <td class="font-weight-medium text-slate-800">{{ appt.psychologist?.name }}</td>
                  <td class="whitespace-nowrap">
                    <div class="font-weight-bold text-slate-800">{{ formatDate(appt.date) }}</div>
                    <div class="text-caption font-mono text-slate-500">
                      {{ formatTime(appt.start_time) }} - {{ formatTime(appt.end_time) }}
                    </div>
                  </td>
                  <td>
                    <v-chip size="x-small" color="#07254A" variant="tonal" class="font-weight-bold">
                      {{ (appt.evaluation_type?.modality || 'PRESENCIAL').toUpperCase() }}
                    </v-chip>
                  </td>
                </tr>
                <tr v-if="!upcomingAppointments.length">
                  <td colspan="4" class="text-center py-6 text-caption text-grey">
                    No hay citas próximas programadas.
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Columna Derecha: Accesos Rápidos -->
      <v-col cols="12" lg="4" class="pa-2">
        <v-card flat class="section-card elevation-0 pa-5">
          <div class="d-flex align-center mb-4">
            <v-icon icon="mdi-lightning-bolt" color="#D97706" size="20" class="mr-2"></v-icon>
            <h3 class="text-subtitle-1 font-weight-bold text-slate-900 mb-0">Accesos Rápidos</h3>
          </div>

          <v-btn
            block
            color="#07254A"
            variant="flat"
            rounded="lg"
            prepend-icon="mdi-cash-plus"
            class="text-none font-weight-bold text-white mb-3 justify-start px-4"
            height="44"
            @click="$router.push('/admin/orders')"
          >
            Generar Orden de Evaluación
          </v-btn>

          <v-btn
            block
            color="#07254A"
            variant="outlined"
            rounded="lg"
            prepend-icon="mdi-check-decagram-outline"
            class="text-none font-weight-bold mb-3 justify-start px-4"
            height="42"
            @click="$router.push('/admin/orders-validation')"
          >
            Revisión de Órdenes y Pagos
          </v-btn>

          <v-btn
            block
            color="#07254A"
            variant="outlined"
            rounded="lg"
            prepend-icon="mdi-calendar-check-outline"
            class="text-none font-weight-bold mb-3 justify-start px-4"
            height="42"
            @click="$router.push('/admin/appointments')"
          >
            Control General de Citas
          </v-btn>

          <v-btn
            block
            color="#07254A"
            variant="outlined"
            rounded="lg"
            prepend-icon="mdi-folder-check-outline"
            class="text-none font-weight-bold mb-3 justify-start px-4"
            height="42"
            @click="$router.push('/social-work/dossiers')"
          >
            Validación de Expedientes
          </v-btn>

          <v-btn
            block
            color="#07254A"
            variant="outlined"
            rounded="lg"
            prepend-icon="mdi-calendar-account-outline"
            class="text-none font-weight-bold justify-start px-4"
            height="42"
            @click="$router.push('/clinical/psychologists-schedules')"
          >
            Agenda de Psicólogos
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'AdminDashboardComponent',
  data() {
    return {
      loading: false,
      stats: {},
      breakdown: {},
      examineeTimelines: [],
      upcomingAppointments: [],
      statusFilter: 'all',
      timelineHeaders: [
        { title: 'Candidato / Empresa', key: 'full_name', align: 'start' },
        { title: 'Estatus Actual', key: 'status', align: 'center' },
        { title: 'Tiempo Desde Orden', key: 'total_hours', align: 'end' },
      ],
    };
  },

  computed: {
    filteredTimelines() {
      if (this.statusFilter === 'all') return this.examineeTimelines;
      if (this.statusFilter === 'pending') {
        return this.examineeTimelines.filter((e) => ['pending', 'registered', null].includes(e.status));
      }
      if (this.statusFilter === 'awaiting_results') {
        return this.examineeTimelines.filter((e) => ['awaiting_results', 'attended'].includes(e.status));
      }
      if (this.statusFilter === 'incidents') {
        return this.examineeTimelines.filter((e) => ['cancelled', 'no_show'].includes(e.status));
      }
      return this.examineeTimelines.filter((e) => e.status === this.statusFilter);
    },
  },

  mounted() {
    this.loadStats();
  },

  methods: {
    toggleStatusFilter(stage) {
      this.statusFilter = this.statusFilter === stage ? 'all' : stage;
    },

    formatAvgTime(hours) {
      const h = Number(hours || 0);
      if (h === 0) return 'Sin cierres aún';
      if (h < 24) return `${h} hrs`;
      const days = Math.floor(h / 24);
      const remHours = Math.round(h % 24);
      return `${days}d ${remHours}h`;
    },

    getStatusMeta(status) {
      const map = {
        pending: { label: 'Perfil Creado', color: '#475569' },
        registered: { label: 'Perfil Creado', color: '#475569' },
        order_created: { label: 'Orden Generada', color: '#4F46E5' },
        scheduled: { label: 'Cita Agendada', color: '#2563EB' },
        awaiting_results: { label: 'En Espera Resultados', color: '#D97706' },
        attended: { label: 'En Espera Resultados', color: '#D97706' },
        completed: { label: 'Evaluación Terminada', color: '#059669' },
        cancelled: { label: 'Cita Cancelada', color: '#DC2626' },
        no_show: { label: 'No se presentó', color: '#DC2626' },
      };
      return map[status] || map.pending;
    },

    formatDate(dateString) {
      if (!dateString) return '';
      const clean = dateString.split('T')[0];
      const [y, m, d] = clean.split('-');
      return new Date(y, m - 1, d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
    },

    formatTime(timeString) {
      if (!timeString) return '';
      const clean = timeString.split('T')[1] ? timeString.split('T')[1].substring(0, 5) : timeString.substring(0, 5);
      const [h, m] = clean.split(':');
      const d = new Date();
      d.setHours(h, m);
      return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });
    },

    async loadStats() {
      this.loading = true;
      try {
        const res = await api.get('/admin/dashboard/stats');
        this.stats = res.data?.stats || {};
        this.breakdown = res.data?.status_breakdown || {};
        this.examineeTimelines = res.data?.examinee_timelines || [];
        this.upcomingAppointments = res.data?.upcoming_appointments || [];
      } catch (e) {
        console.error('Error cargando estadísticas del dashboard:', e);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.banner-card,
.section-card {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 16px !important;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04) !important;
}

.card-header {
  background: linear-gradient(135deg, #07254A 0%, #0e1726 100%) !important;
}

.header-icon-box {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 800;
}

.card-subtitle {
  font-size: 0.85rem;
}

.kpi-card {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 14px !important;
}

.border-top-blue { border-top: 3px solid #2563EB !important; }
.border-top-amber { border-top: 3px solid #D97706 !important; }
.border-top-emerald { border-top: 3px solid #059669 !important; }
.border-top-indigo { border-top: 3px solid #4F46E5 !important; }

.kpi-label {
  font-size: 0.7rem;
  font-weight: 800;
  color: #64748b;
  letter-spacing: 0.4px;
}

.kpi-value {
  font-size: 1.75rem;
  font-weight: 800;
  line-height: 1.2;
}

.kpi-sub {
  font-size: 0.75rem;
}

.kpi-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-blue-50 { background: #eff6ff; }
.bg-amber-50 { background: #fffbeb; }
.bg-emerald-50 { background: #ecfdf5; }
.bg-indigo-50 { background: #eef2ff; }
.bg-slate-50 { background: #f8fafc; }

.funnel-pill {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.funnel-pill:hover {
  transform: translateY(-2px);
  border-color: #94a3b8;
}

.pill-active {
  border-color: #07254A !important;
  background-color: #eff6ff !important;
}

.border-bottom { border-bottom: 1px solid #e2e8f0; }
.whitespace-nowrap { white-space: nowrap; }
.cursor-pointer { cursor: pointer; }
.font-mono { font-family: monospace; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
</style>
