<template>
  <div class="admin-dashboard-container">
    <!-- Header de Bienvenida -->
    <div class="welcome-banner px-6 py-5 rounded-xl mb-6 d-flex align-center justify-space-between flex-wrap gap-4 text-white">
      <div>
        <div class="d-flex align-center mb-1">
          <div class="banner-icon-box mr-3">
            <v-icon icon="mdi-shield-check" color="#ffffff" size="24"></v-icon>
          </div>
          <div>
            <h1 class="text-h5 font-weight-bold mb-0">Panel de Control Operativo</h1>
            <p class="text-subtitle-2 opacity-80 mb-0">
              Resumen en tiempo real de citas, candidatos y validación de órdenes.
            </p>
          </div>
        </div>
      </div>
      <v-btn
        variant="flat"
        color="rgba(255, 255, 255, 0.15)"
        rounded="lg"
        prepend-icon="mdi-refresh"
        class="text-none font-weight-bold text-white refresh-btn"
        :loading="loading"
        @click="fetchDashboardStats"
      >
        Actualizar Datos
      </v-btn>
    </div>

    <!-- Tarjetas de Métricas KPI -->
    <v-row dense class="mb-6">
      <!-- Citas Activas / Hoy -->
      <v-col cols="12" sm="6" lg="3" class="pa-2">
        <v-card flat class="stat-card stat-blue pa-5 rounded-xl elevation-0 border d-flex flex-column justify-space-between h-100">
          <div>
            <div class="d-flex align-center justify-space-between mb-3">
              <span class="stat-badge-title">Citas Programadas</span>
              <div class="stat-icon-wrapper bg-blue-50">
                <v-icon icon="mdi-calendar-check" color="#0284C7" size="20"></v-icon>
              </div>
            </div>
            <div class="stat-number text-slate-900 mb-1">
              {{ stats.scheduled_appointments }}
            </div>
          </div>
          <div class="stat-footnote text-slate-500 pt-2 border-top-subtle">
            <span class="font-weight-bold text-blue-700 bg-blue-50 px-2 py-0-5 rounded-pill mr-1">
              {{ stats.today_appointments }}
            </span>
            para el día de hoy
          </div>
        </v-card>
      </v-col>

      <!-- Órdenes por Validar -->
      <v-col cols="12" sm="6" lg="3" class="pa-2">
        <v-card flat class="stat-card stat-amber pa-5 rounded-xl elevation-0 border d-flex flex-column justify-space-between h-100">
          <div>
            <div class="d-flex align-center justify-space-between mb-3">
              <span class="stat-badge-title">Pagos en Revisión</span>
              <div class="stat-icon-wrapper bg-amber-50">
                <v-icon icon="mdi-receipt-text-check-outline" color="#D97706" size="20"></v-icon>
              </div>
            </div>
            <div class="stat-number text-slate-900 mb-1">
              {{ stats.pending_orders }}
            </div>
          </div>
          <div class="stat-footnote text-slate-500 pt-2 border-top-subtle d-flex align-center">
            <v-icon icon="mdi-alert-circle-outline" size="14" color="#D97706" class="mr-1"></v-icon>
            Pendientes de liberación
          </div>
        </v-card>
      </v-col>

      <!-- Evaluados Totales -->
      <v-col cols="12" sm="6" lg="3" class="pa-2">
        <v-card flat class="stat-card stat-emerald pa-5 rounded-xl elevation-0 border d-flex flex-column justify-space-between h-100">
          <div>
            <div class="d-flex align-center justify-space-between mb-3">
              <span class="stat-badge-title">Candidatos Registrados</span>
              <div class="stat-icon-wrapper bg-emerald-50">
                <v-icon icon="mdi-account-group-outline" color="#059669" size="20"></v-icon>
              </div>
            </div>
            <div class="stat-number text-slate-900 mb-1">
              {{ stats.total_examinees }}
            </div>
          </div>
          <div class="stat-footnote text-slate-500 pt-2 border-top-subtle">
            Expedientes dados de alta
          </div>
        </v-card>
      </v-col>

      <!-- Empresas Clientes -->
      <v-col cols="12" sm="6" lg="3" class="pa-2">
        <v-card flat class="stat-card stat-purple pa-5 rounded-xl elevation-0 border d-flex flex-column justify-space-between h-100">
          <div>
            <div class="d-flex align-center justify-space-between mb-3">
              <span class="stat-badge-title">Empresas Clientes</span>
              <div class="stat-icon-wrapper bg-purple-50">
                <v-icon icon="mdi-domain" color="#7C3AED" size="20"></v-icon>
              </div>
            </div>
            <div class="stat-number text-slate-900 mb-1">
              {{ stats.total_clients }}
            </div>
          </div>
          <div class="stat-footnote text-slate-500 pt-2 border-top-subtle">
            Cuentas corporativas activas
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Sección Inferior: Próximas Citas y Accesos Rápidos -->
    <v-row dense>
      <!-- Próximas Citas -->
      <v-col cols="12" md="7" lg="8" class="pa-2">
        <v-card flat class="border rounded-xl elevation-0 overflow-hidden bg-white h-100 d-flex flex-column">
          <div class="px-6 py-4 border-bottom d-flex align-center justify-space-between bg-white">
            <div class="d-flex align-center">
              <div class="section-icon-box mr-2">
                <v-icon icon="mdi-clock-fast" color="#07254A" size="18"></v-icon>
              </div>
              <span class="text-subtitle-1 font-weight-bold text-slate-800">Próximas Citas Programadas</span>
            </div>
            <v-btn
              variant="text"
              color="#07254A"
              size="small"
              class="text-none font-weight-bold"
              append-icon="mdi-arrow-right"
              @click="$router.push('/admin/appointments')"
            >
              Ver Todas
            </v-btn>
          </div>

          <v-card-text class="pa-0 flex-grow-1">
            <div v-if="loading" class="pa-8 text-center">
              <v-progress-circular indeterminate color="#07254A" size="28"></v-progress-circular>
            </div>

            <div v-else-if="upcomingAppointments.length === 0" class="pa-8 text-center text-slate-500">
              <v-icon icon="mdi-calendar-blank-outline" size="44" class="text-slate-300 mb-2"></v-icon>
              <div class="text-body-2 font-weight-medium">No hay citas próximas agendadas</div>
            </div>

            <div v-else class="table-responsive">
              <v-table hover density="comfortable">
                <thead>
                  <tr class="table-header-row">
                    <th class="text-left font-weight-bold text-slate-700">Candidato / Empresa</th>
                    <th class="text-left font-weight-bold text-slate-700">Psicóloga</th>
                    <th class="text-left font-weight-bold text-slate-700">Horario</th>
                    <th class="text-center font-weight-bold text-slate-700">Modalidad</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="app in upcomingAppointments" :key="app.id" class="table-data-row">
                    <td class="py-3">
                      <div class="font-weight-bold text-slate-900 text-truncate" style="max-width: 220px;">
                        {{ app.examinee?.full_name }}
                      </div>
                      <div class="text-caption text-slate-500 text-truncate" style="max-width: 220px;">
                        {{ app.client?.company_name }}
                      </div>
                    </td>
                    <td>
                      <div class="text-body-2 text-slate-800 font-weight-medium">
                        {{ app.psychologist?.name || 'Por asignar' }}
                      </div>
                    </td>
                    <td>
                      <div class="font-weight-bold text-slate-800">{{ formatDate(app.date) }}</div>
                      <div class="text-caption font-mono text-slate-500">
                        {{ formatTime(app.start_time) }} - {{ formatTime(app.end_time) }}
                      </div>
                    </td>
                    <td class="text-center">
                      <v-chip size="x-small" variant="tonal" color="#07254A" class="font-weight-bold px-2">
                        {{ app.evaluation_type?.modality?.toUpperCase() || 'PRESENCIAL' }}
                      </v-chip>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Accesos Rápidos -->
      <v-col cols="12" md="5" lg="4" class="pa-2">
        <v-card flat class="border rounded-xl elevation-0 bg-white pa-5 h-100 d-flex flex-column">
          <div class="text-subtitle-1 font-weight-bold text-slate-800 mb-4 d-flex align-center">
            <div class="section-icon-box mr-2">
              <v-icon icon="mdi-lightning-bolt" color="#D97706" size="18"></v-icon>
            </div>
            Accesos Rápidos
          </div>

          <div class="d-flex flex-column gap-3 flex-grow-1 justify-space-between">
            <v-btn
              block
              variant="flat"
              color="#07254A"
              rounded="lg"
              class="quick-action-btn text-none text-white font-weight-bold py-3 px-4 elevation-1"
              prepend-icon="mdi-shield-check"
              @click="$router.push('/admin/orders-validation')"
            >
              <span class="btn-text">Revisión de Órdenes y Pagos</span>
            </v-btn>

            <v-btn
              block
              variant="outlined"
              color="#07254A"
              rounded="lg"
              class="quick-action-btn quick-action-btn-outlined text-none font-weight-bold py-3 px-4"
              prepend-icon="mdi-calendar-text"
              @click="$router.push('/admin/appointments')"
            >
              <span class="btn-text">Control General de Citas</span>
            </v-btn>

            <v-btn
              block
              variant="outlined"
              color="#07254A"
              rounded="lg"
              class="quick-action-btn quick-action-btn-outlined text-none font-weight-bold py-3 px-4"
              prepend-icon="mdi-file-document-multiple-outline"
              @click="$router.push('/admin/tests-catalog')"
            >
              <span class="btn-text">Catálogo de Pruebas</span>
            </v-btn>

            <v-btn
              block
              variant="outlined"
              color="#07254A"
              rounded="lg"
              class="quick-action-btn quick-action-btn-outlined text-none font-weight-bold py-3 px-4"
              prepend-icon="mdi-calendar-account-outline"
              @click="$router.push('/clinical/psychologists-schedules')"
            >
              <span class="btn-text">Agenda de Psicólogos</span>
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useAdminDashboardStore } from '@/store/adminDashboard';

export default {
  name: 'AdminDashboardComponent',
  computed: {
    ...mapState(useAdminDashboardStore, ['stats', 'upcomingAppointments', 'loading']),
  },
  mounted() {
    this.fetchDashboardStats();
  },
  methods: {
    ...mapActions(useAdminDashboardStore, ['fetchDashboardStats']),

    formatDate(dateString) {
      if (!dateString) return '';
      try {
        const cleanDate = dateString.split('T')[0];
        const [year, month, day] = cleanDate.split('-');
        const d = new Date(year, month - 1, day);
        return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
      } catch (e) {
        return dateString;
      }
    },

    formatTime(timeString) {
      if (!timeString) return '';
      try {
        const cleanTime = timeString.split('T')[1] ? timeString.split('T')[1].substring(0, 5) : timeString.substring(0, 5);
        const [hour, minute] = cleanTime.split(':');
        const d = new Date();
        d.setHours(hour, minute);
        return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });
      } catch (e) {
        return timeString;
      }
    },
  },
};
</script>

<style scoped>
.admin-dashboard-container {
  width: 100%;
}

.welcome-banner {
  background: linear-gradient(135deg, #07254A 0%, #0e1726 100%) !important;
  box-shadow: 0 4px 14px rgba(7, 37, 74, 0.12);
}

.banner-icon-box {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}

.refresh-btn {
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* KPI Cards */
.stat-card {
  background-color: #ffffff;
  border-color: #e2e8f0 !important;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.04) !important;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
}

.stat-blue::before { background-color: #0284C7; }
.stat-amber::before { background-color: #D97706; }
.stat-emerald::before { background-color: #059669; }
.stat-purple::before { background-color: #7C3AED; }

.stat-badge-title {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #64748B;
}

.stat-number {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.5px;
}

.stat-footnote {
  font-size: 0.75rem;
}

.border-top-subtle {
  border-top: 1px solid #f1f5f9;
}

.stat-icon-wrapper {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-blue-50 { background-color: #f0f9ff; }
.bg-amber-50 { background-color: #fffbeb; }
.bg-emerald-50 { background-color: #ecfdf5; }
.bg-purple-50 { background-color: #f5f3ff; }

.section-icon-box {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background-color: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
}

.border-bottom {
  border-bottom: 1px solid #e2e8f0;
}

.table-header-row th {
  background-color: #f8fafc !important;
  font-size: 0.78rem !important;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.table-data-row:hover {
  background-color: #f8fafc !important;
}

/* Quick Action Buttons */
.quick-action-btn {
  height: 48px !important;
  font-size: 0.85rem !important;
  transition: all 0.2s ease;
}

.quick-action-btn:hover {
  transform: translateX(3px);
}

.quick-action-btn-outlined {
  border-color: #cbd5e1 !important;
  background-color: #ffffff;
}

.quick-action-btn-outlined:hover {
  background-color: #f8fafc !important;
  border-color: #07254A !important;
}

.btn-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.font-mono {
  font-family: monospace;
}

.py-0-5 {
  padding-top: 2px;
  padding-bottom: 2px;
}

.gap-3 { gap: 12px; }
.gap-4 { gap: 16px; }

@media (max-width: 960px) {
  .stat-number {
    font-size: 1.7rem;
  }
}
</style>
