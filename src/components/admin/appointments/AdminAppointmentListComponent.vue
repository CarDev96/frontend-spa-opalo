<template>
  <div class="admin-appointments-wrapper">
    <!-- ========================================================================= -->
    <!-- 1. TARJETAS KPI INTERACTIVAS (FILTROS RÁPIDOS)                            -->
    <!-- ========================================================================= -->
    <v-row dense class="mb-5">
      <v-col cols="6" sm="3" class="pa-2">
        <v-card
          flat
          class="kpi-card pa-4 cursor-pointer"
          :class="{ 'kpi-active': statusFilter === 'all' }"
          @click="statusFilter = 'all'"
        >
          <div class="d-flex align-center justify-space-between">
            <div>
              <span class="kpi-label">Total de Citas</span>
              <div class="kpi-value text-slate-900">{{ stats.total }}</div>
            </div>
            <div class="kpi-icon-box bg-slate-100">
              <v-icon icon="mdi-calendar-multiple" color="#07254A" size="22"></v-icon>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="6" sm="3" class="pa-2">
        <v-card
          flat
          class="kpi-card pa-4 cursor-pointer"
          :class="{ 'kpi-active-blue': statusFilter === 'scheduled' }"
          @click="statusFilter = statusFilter === 'scheduled' ? 'all' : 'scheduled'"
        >
          <div class="d-flex align-center justify-space-between">
            <div>
              <span class="kpi-label">Agendadas</span>
              <div class="kpi-value text-blue-600">{{ stats.scheduled }}</div>
            </div>
            <div class="kpi-icon-box bg-blue-50">
              <v-icon icon="mdi-calendar-clock" color="#2563EB" size="22"></v-icon>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="6" sm="3" class="pa-2">
        <v-card
          flat
          class="kpi-card pa-4 cursor-pointer"
          :class="{ 'kpi-active-green': statusFilter === 'attended' }"
          @click="statusFilter = statusFilter === 'attended' ? 'all' : 'attended'"
        >
          <div class="d-flex align-center justify-space-between">
            <div>
              <span class="kpi-label">Atendidas / Finalizadas</span>
              <div class="kpi-value text-emerald-600">{{ stats.attended }}</div>
            </div>
            <div class="kpi-icon-box bg-emerald-50">
              <v-icon icon="mdi-check-decagram-outline" color="#059669" size="22"></v-icon>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="6" sm="3" class="pa-2">
        <v-card
          flat
          class="kpi-card pa-4 cursor-pointer"
          :class="{ 'kpi-active-red': statusFilter === 'cancelled' }"
          @click="statusFilter = statusFilter === 'cancelled' ? 'all' : 'cancelled'"
        >
          <div class="d-flex align-center justify-space-between">
            <div>
              <span class="kpi-label">Canceladas</span>
              <div class="kpi-value text-red-600">{{ stats.cancelled }}</div>
            </div>
            <div class="kpi-icon-box bg-red-50">
              <v-icon icon="mdi-calendar-remove-outline" color="#DC2626" size="22"></v-icon>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- ========================================================================= -->
    <!-- 2. CONTENEDOR PRINCIPAL DE TABLA                                          -->
    <!-- ========================================================================= -->
    <v-card flat class="main-card elevation-0">
      <!-- Cabecera Institucional Ópalo -->
      <div class="card-header px-6 py-4 d-flex align-center justify-space-between text-white flex-wrap gap-3">
        <div class="d-flex align-center">
          <div class="header-icon-box mr-3 flex-shrink-0">
            <v-icon icon="mdi-calendar-check-outline" color="#ffffff" size="22"></v-icon>
          </div>
          <div>
            <h2 class="card-title text-white mb-0">Control General de Citas</h2>
            <span class="card-subtitle text-white opacity-80">
              Seguimiento operativo de turnos, especialistas y estado de atención
            </span>
          </div>
        </div>

        <div class="d-flex align-center gap-2 flex-wrap">
          <v-btn
            variant="flat"
            color="#ffffff"
            rounded="lg"
            size="small"
            prepend-icon="mdi-plus-circle-outline"
            class="text-none font-weight-bold new-order-btn"
            @click="$router.push('/admin/orders')"
          >
            Nueva Orden / Cita
          </v-btn>

          <v-btn
            variant="flat"
            color="rgba(255,255,255,0.16)"
            rounded="lg"
            size="small"
            prepend-icon="mdi-refresh"
            class="text-none font-weight-bold text-white"
            :loading="loadingAppointments"
            @click="fetchAllAppointments"
          >
            Recargar
          </v-btn>
        </div>
      </div>

      <!-- Barra de Herramientas y Filtros -->
      <div class="px-6 py-3 bg-slate-50 border-bottom d-flex flex-wrap align-center justify-space-between gap-3">
        <div class="d-flex align-center flex-grow-1" style="max-width: 380px;">
          <v-text-field
            v-model="search"
            placeholder="Buscar candidato, empresa o prueba..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            rounded="lg"
            hide-details
            clearable
            bg-color="#ffffff"
            color="#07254A"
          ></v-text-field>
        </div>

        <div class="d-flex align-center gap-2 flex-wrap">
          <v-select
            v-model="psychologistFilter"
            :items="psychologistOptions"
            item-title="label"
            item-value="value"
            variant="outlined"
            density="compact"
            rounded="lg"
            hide-details
            bg-color="#ffffff"
            color="#07254A"
            style="min-width: 210px;"
            prepend-inner-icon="mdi-account-star-outline"
          ></v-select>

          <v-select
            v-model="statusFilter"
            :items="statusOptions"
            item-title="label"
            item-value="value"
            variant="outlined"
            density="compact"
            rounded="lg"
            hide-details
            bg-color="#ffffff"
            color="#07254A"
            style="min-width: 175px;"
            prepend-inner-icon="mdi-filter-variant"
          ></v-select>
        </div>
      </div>

      <!-- Tabla de Datos -->
      <v-card-text class="pa-0 bg-white">
        <v-data-table
          :headers="headers"
          :items="filteredAppointments"
          :search="search"
          :loading="loadingAppointments"
          hover
          density="comfortable"
          no-data-text="No hay citas que coincidan con los filtros seleccionados"
          items-per-page-text="Citas por página:"
          page-text="{0}-{1} de {2}"
        >
          <template v-slot:item="{ item }">
            <tr class="table-row">
              <!-- Candidato y Empresa -->
              <td class="py-3">
                <div class="d-flex align-center">
                  <v-avatar size="36" color="#EFF6FF" class="mr-3 flex-shrink-0 border-avatar">
                    <span class="text-caption font-weight-bold text-primary">
                      {{ getInitials(item.examinee?.full_name) }}
                    </span>
                  </v-avatar>
                  <div>
                    <div class="font-weight-bold text-slate-900 text-body-2">
                      {{ item.examinee?.full_name || 'Sin nombre' }}
                    </div>
                    <div class="text-caption font-weight-medium text-slate-500 d-flex align-center mt-05">
                      <v-icon icon="mdi-domain" size="13" class="mr-1 text-slate-400"></v-icon>
                      {{ item.client?.company_name || 'Empresa no especificada' }}
                    </div>
                  </div>
                </div>
              </td>

              <!-- Especialista -->
              <td class="py-3">
                <div class="d-flex align-center">
                  <v-icon icon="mdi-stethoscope" size="16" color="#07254A" class="mr-2 flex-shrink-0"></v-icon>
                  <span class="text-body-2 font-weight-semibold text-slate-800 whitespace-nowrap">
                    {{ item.psychologist?.name || 'Sin asignar' }}
                  </span>
                </div>
              </td>

              <!-- Fecha y Turno (Sin saltos rotos) -->
              <td class="py-3">
                <div class="schedule-cell">
                  <div class="d-flex align-center text-body-2 font-weight-bold text-slate-800 whitespace-nowrap">
                    <v-icon icon="mdi-calendar-blank-outline" size="15" color="#07254A" class="mr-1"></v-icon>
                    {{ formatDate(item.date) }}
                  </div>
                  <div class="time-pill mt-1 whitespace-nowrap">
                    <v-icon icon="mdi-clock-outline" size="12" class="mr-1"></v-icon>
                    {{ formatTime(item.start_time) }} – {{ formatTime(item.end_time) }}
                  </div>
                </div>
              </td>

              <!-- Servicio y Modalidad -->
              <td class="py-3">
                <div class="text-body-2 font-weight-semibold text-slate-800">
                  {{ item.evaluation_type?.name }}
                </div>
                <div class="mt-1">
                  <v-chip
                    size="x-small"
                    :color="isRemote(item.evaluation_type?.modality) ? '#7C3AED' : '#07254A'"
                    variant="tonal"
                    class="font-weight-bold px-2"
                  >
                    <v-icon
                      :icon="isRemote(item.evaluation_type?.modality) ? 'mdi-laptop' : 'mdi-office-building-marker-outline'"
                      start
                      size="12"
                    ></v-icon>
                    {{ (item.evaluation_type?.modality || 'PRESENCIAL').toUpperCase() }}
                  </v-chip>
                </div>
              </td>

              <!-- Estatus -->
              <td class="text-center py-3">
                <v-chip
                  size="small"
                  :color="getStatusColor(item.status)"
                  variant="tonal"
                  class="font-weight-bold status-pill px-3"
                >
                  <span class="status-dot mr-1" :style="{ backgroundColor: getStatusColor(item.status) }"></span>
                  {{ formatStatus(item.status) }}
                </v-chip>
              </td>

              <!-- Acciones -->
              <td class="text-end pr-5 py-3">
                <div class="d-flex align-center justify-end gap-2 whitespace-nowrap">
                  <v-tooltip text="Ver detalle de la cita" location="top">
                    <template v-slot:activator="{ props }">
                      <v-btn
                        v-bind="props"
                        icon="mdi-eye-outline"
                        size="small"
                        variant="text"
                        color="#475569"
                        @click="openDetailModal(item)"
                      ></v-btn>
                    </template>
                  </v-tooltip>

                  <v-btn
                    v-if="item.status === 'scheduled'"
                    size="small"
                    variant="tonal"
                    color="#DC2626"
                    rounded="lg"
                    prepend-icon="mdi-close-circle-outline"
                    class="text-none font-weight-bold"
                    :loading="cancelingId === item.id"
                    @click="confirmCancel(item)"
                  >
                    Cancelar
                  </v-btn>
                </div>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- ========================================================================= -->
    <!-- MODAL DETALLE DE CITA                                                     -->
    <!-- ========================================================================= -->
    <v-dialog v-model="detailDialog" max-width="500">
      <v-card class="rounded-xl overflow-hidden elevation-6" v-if="detailItem">
        <div class="card-header px-6 py-4 d-flex align-center justify-space-between text-white">
          <div class="d-flex align-center">
            <v-icon icon="mdi-card-account-details-outline" color="#ffffff" size="20" class="mr-2"></v-icon>
            <span class="text-subtitle-1 font-weight-bold">Detalle de Cita Programada</span>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" color="#ffffff" @click="detailDialog = false"></v-btn>
        </div>

        <v-card-text class="pa-6 bg-slate-50">
          <div class="detail-box pa-4 bg-white rounded-lg border mb-3">
            <div class="text-caption font-weight-bold text-slate-400">CANDIDATO / EVALUADO</div>
            <div class="text-body-1 font-weight-bold text-slate-900">{{ detailItem.examinee?.full_name }}</div>
            <div class="text-caption font-mono text-slate-500">CURP: {{ detailItem.examinee?.curp || 'No registrada' }}</div>
          </div>

          <v-row dense class="mb-3">
            <v-col cols="6">
              <div class="detail-box pa-3 bg-white rounded-lg border h-100">
                <div class="text-caption font-weight-bold text-slate-400">EMPRESA</div>
                <div class="text-body-2 font-weight-bold text-slate-800">{{ detailItem.client?.company_name }}</div>
              </div>
            </v-col>
            <v-col cols="6">
              <div class="detail-box pa-3 bg-white rounded-lg border h-100">
                <div class="text-caption font-weight-bold text-slate-400">ESPECIALISTA</div>
                <div class="text-body-2 font-weight-bold text-slate-800">{{ detailItem.psychologist?.name }}</div>
              </div>
            </v-col>
          </v-row>

          <div class="detail-box pa-3 bg-white rounded-lg border mb-3">
            <div class="text-caption font-weight-bold text-slate-400">FECHA Y HORARIO</div>
            <div class="text-body-2 font-weight-bold text-slate-800">
              {{ formatDate(detailItem.date) }} • {{ formatTime(detailItem.start_time) }} a {{ formatTime(detailItem.end_time) }}
            </div>
          </div>

          <div class="detail-box pa-3 bg-white rounded-lg border">
            <div class="text-caption font-weight-bold text-slate-400">NOTAS / OBSERVACIONES</div>
            <div class="text-body-2 text-slate-700 mt-1">
              {{ detailItem.notes || 'Sin observaciones adicionales registradas.' }}
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="px-6 py-3 bg-white border-top d-flex justify-end gap-2">
          <v-btn variant="text" class="text-none font-weight-bold" @click="detailDialog = false">Cerrar</v-btn>
          <v-btn
            v-if="detailItem.status === 'scheduled'"
            variant="flat"
            color="#DC2626"
            rounded="lg"
            class="text-none font-weight-bold text-white px-4"
            @click="detailDialog = false; confirmCancel(detailItem)"
          >
            Cancelar Cita
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ========================================================================= -->
    <!-- DIÁLOGO CONFIRMAR CANCELACIÓN                                              -->
    <!-- ========================================================================= -->
    <v-dialog v-model="cancelDialog" max-width="420">
      <v-card class="rounded-xl elevation-6 pa-2">
        <v-card-text class="text-center pt-6 pb-4">
          <div class="cancel-icon-circle mx-auto mb-3">
            <v-icon icon="mdi-calendar-alert" color="#DC2626" size="28"></v-icon>
          </div>
          <h3 class="text-h6 font-weight-bold text-slate-900 mb-2">
            ¿Confirmar cancelación?
          </h3>
          <p class="text-body-2 text-slate-600 mb-2" v-if="selectedItem">
            Se cancelará la cita de <strong>{{ selectedItem.examinee?.full_name }}</strong> programada para el <strong>{{ formatDate(selectedItem.date) }}</strong> a las <strong>{{ formatTime(selectedItem.start_time) }}</strong>.
          </p>
          <p class="text-caption text-slate-500">
            El candidato volverá a estatus pendiente y el turno quedará liberado en la agenda de la psicóloga.
          </p>
        </v-card-text>
        <v-card-actions class="px-6 pb-5 pt-0 d-flex justify-center gap-3">
          <v-btn
            variant="outlined"
            color="#64748B"
            class="text-none font-weight-bold px-5"
            rounded="lg"
            @click="cancelDialog = false"
          >
            No, mantener
          </v-btn>
          <v-btn
            variant="flat"
            color="#DC2626"
            class="text-none font-weight-bold text-white px-5"
            rounded="lg"
            @click="executeCancel"
          >
            Sí, cancelar cita
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="top right" timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useAdminAppointmentsStore } from '@/store/adminAppointments';

export default {
  name: 'AdminAppointmentsListComponent',
  data() {
    return {
      search: '',
      statusFilter: 'all',
      psychologistFilter: 'all',
      cancelDialog: false,
      detailDialog: false,
      cancelingId: null,
      selectedItem: null,
      detailItem: null,

      statusOptions: [
        { label: 'Todos los estatus', value: 'all' },
        { label: 'Agendadas', value: 'scheduled' },
        { label: 'Atendidas', value: 'attended' },
        { label: 'Finalizadas', value: 'completed' },
        { label: 'En Curso', value: 'in_progress' },
        { label: 'Canceladas', value: 'cancelled' },
      ],

      headers: [
        { title: 'Candidato y Empresa', key: 'examinee.full_name', align: 'start' },
        { title: 'Especialista', key: 'psychologist.name', align: 'start' },
        { title: 'Fecha y Turno', key: 'date', align: 'start' },
        { title: 'Servicio y Modalidad', key: 'evaluation_type.name', align: 'start' },
        { title: 'Estatus', key: 'status', align: 'center' },
        { title: 'Acciones', key: 'actions', align: 'end', sortable: false },
      ],
      snackbar: { show: false, text: '', color: 'success' },
    };
  },

  computed: {
    ...mapState(useAdminAppointmentsStore, ['appointments', 'loadingAppointments']),

    stats() {
      const list = Array.isArray(this.appointments) ? this.appointments : [];
      return {
        total: list.length,
        scheduled: list.filter((a) => a.status === 'scheduled').length,
        attended: list.filter((a) => ['attended', 'completed'].includes(a.status)).length,
        cancelled: list.filter((a) => a.status === 'cancelled').length,
      };
    },

    psychologistOptions() {
      const list = Array.isArray(this.appointments) ? this.appointments : [];
      const map = new Map();
      list.forEach((a) => {
        if (a.psychologist?.id && a.psychologist?.name) {
          map.set(a.psychologist.id, a.psychologist.name);
        }
      });
      const options = [{ label: 'Todas las especialistas', value: 'all' }];
      map.forEach((name, id) => {
        options.push({ label: name, value: id });
      });
      return options;
    },

    filteredAppointments() {
      const list = Array.isArray(this.appointments) ? this.appointments : [];
      return list.filter((item) => {
        const matchStatus =
          this.statusFilter === 'all' ||
          (this.statusFilter === 'attended'
            ? ['attended', 'completed'].includes(item.status)
            : item.status === this.statusFilter);

        const matchPsych =
          this.psychologistFilter === 'all' || item.psychologist?.id === this.psychologistFilter;

        return matchStatus && matchPsych;
      });
    },
  },

  mounted() {
    this.fetchAllAppointments();
  },

  methods: {
    ...mapActions(useAdminAppointmentsStore, ['fetchAllAppointments', 'cancelAppointment']),

    notify(text, color = 'success') {
      this.snackbar.text = text;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },

    getInitials(fullName) {
      if (!fullName) return 'OP';
      const parts = fullName.trim().split(/\s+/);
      if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
      return (parts[0][0] + parts[1][0]).toUpperCase();
    },

    isRemote(modality) {
      return String(modality || '').toLowerCase().includes('remot');
    },

    formatDate(dateString) {
      if (!dateString) return '';
      try {
        const cleanDate = dateString.split('T')[0];
        const [year, month, day] = cleanDate.split('-');
        const d = new Date(year, month - 1, day);
        return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
      } catch (e) {
        return dateString;
      }
    },

    formatTime(timeString) {
      if (!timeString) return '';
      try {
        const cleanTime = timeString.split('T')[1]
          ? timeString.split('T')[1].substring(0, 5)
          : timeString.substring(0, 5);
        const [hour, minute] = cleanTime.split(':');
        const d = new Date();
        d.setHours(hour, minute);
        return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });
      } catch (e) {
        return timeString;
      }
    },

    getStatusColor(status) {
      const map = {
        scheduled: '#2563EB',
        attended: '#059669',
        completed: '#059669',
        cancelled: '#DC2626',
        in_progress: '#D97706',
      };
      return map[status] || '#64748B';
    },

    formatStatus(status) {
      const map = {
        scheduled: 'Agendada',
        attended: 'Atendida',
        completed: 'Finalizada',
        cancelled: 'Cancelada',
        in_progress: 'En Curso',
      };
      return map[status] || 'Pendiente';
    },

    openDetailModal(item) {
      this.detailItem = item;
      this.detailDialog = true;
    },

    confirmCancel(item) {
      this.selectedItem = item;
      this.cancelDialog = true;
    },

    async executeCancel() {
      if (!this.selectedItem) return;
      this.cancelingId = this.selectedItem.id;
      this.cancelDialog = false;

      const res = await this.cancelAppointment(this.selectedItem.id);

      if (res.success) {
        this.notify(res.message);
      } else {
        this.notify(res.message, 'error');
      }

      this.cancelingId = null;
      this.selectedItem = null;
    },
  },
};
</script>

<style scoped>
.admin-appointments-wrapper {
  width: 100%;
}

/* KPI Cards */
.kpi-card {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 14px !important;
  transition: all 0.2s ease;
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(7, 37, 74, 0.06) !important;
}

.kpi-active {
  border-color: #07254A !important;
  background-color: #f8fafc !important;
}

.kpi-active-blue {
  border-color: #2563EB !important;
  background-color: #eff6ff !important;
}

.kpi-active-green {
  border-color: #059669 !important;
  background-color: #ecfdf5 !important;
}

.kpi-active-red {
  border-color: #DC2626 !important;
  background-color: #fef2f2 !important;
}

.kpi-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.kpi-value {
  font-size: 1.55rem;
  font-weight: 800;
  line-height: 1.2;
  margin-top: 4px;
}

.kpi-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-slate-100 { background-color: #f1f5f9; }
.bg-blue-50 { background-color: #eff6ff; }
.bg-emerald-50 { background-color: #ecfdf5; }
.bg-red-50 { background-color: #fef2f2; }

/* Main Table Card */
.main-card {
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
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-title {
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: -0.2px;
}

.card-subtitle {
  font-size: 0.8rem;
}

.new-order-btn {
  color: #07254A !important;
}

.bg-slate-50 {
  background-color: #f8fafc;
}

.border-bottom {
  border-bottom: 1px solid #e2e8f0;
}

.border-top {
  border-top: 1px solid #e2e8f0;
}

.border-avatar {
  border: 1px solid #dbeafe;
}

/* Fecha y Turno pill */
.schedule-cell {
  min-width: 165px;
}

.time-pill {
  display: inline-flex;
  align-items: center;
  background-color: #f1f5f9;
  color: #334155;
  font-family: monospace;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

/* Status Pill */
.status-pill {
  font-size: 0.75rem !important;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: inline-block;
}

.cancel-icon-circle {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background-color: #fef2f2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.whitespace-nowrap {
  white-space: nowrap;
}

.cursor-pointer {
  cursor: pointer;
}

.font-mono {
  font-family: monospace;
}

.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
</style>
