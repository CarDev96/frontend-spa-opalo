<template>
  <v-card flat class="appointment-table-card elevation-0 mt-4">
    <!-- Cabecera Corporativa -->
    <div class="card-table-header px-6 py-4 d-flex flex-wrap align-center justify-space-between gap-3">
      <div class="d-flex align-center">
        <div class="header-icon-box mr-3 flex-shrink-0">
          <v-icon icon="mdi-calendar-check-outline" color="#ffffff" size="20"></v-icon>
        </div>
        <div>
          <h2 class="card-title text-white mb-0">Citas de Evaluación Programadas</h2>
          <span class="card-subtitle text-white opacity-80">
            Total de citas registradas: {{ appointments.length }}
          </span>
        </div>
      </div>

      <div class="d-flex align-center gap-2">
        <v-chip color="rgba(255,255,255,0.15)" text-color="#ffffff" size="small" class="font-weight-bold mr-2 text-white">
          {{ appointments.length }} Citas
        </v-chip>
        <v-btn
          variant="flat"
          size="small"
          color="#ffffff"
          prepend-icon="mdi-refresh"
          class="text-none font-weight-bold reload-btn"
          :loading="loading"
          @click="fetchAppointments"
        >
          Recargar
        </v-btn>
      </div>
    </div>

    <!-- Barra de Búsqueda -->
    <div class="table-toolbar px-6 py-3 border-bottom bg-slate-50">
      <v-row dense align="center">
        <v-col cols="12" sm="7" md="5">
          <v-text-field
            v-model="search"
            placeholder="Buscar por candidato, prueba o psicólogo..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            hide-details
            rounded="lg"
            bg-color="#ffffff"
            color="#07254A"
            class="search-input"
            clearable
          ></v-text-field>
        </v-col>
      </v-row>
    </div>

    <!-- Data Table Vuetify 3 -->
    <v-card-text class="pa-0">
      <v-data-table
        class="custom-opalo-table"
        :headers="headers"
        :items="appointments"
        :search="search"
        :custom-filter="customFilter"
        :loading="loading"
        hover
        density="comfortable"
        mobile-breakpoint="0"
      >
        <!-- 1. Evaluado / Nombre -->
        <template v-slot:[`item.examinee`]="{ item }">
          <div class="d-flex align-center py-2">
            <v-avatar size="32" color="#07254A" class="mr-3 text-white font-weight-bold text-caption flex-shrink-0">
              {{ getInitials(item.examinee?.full_name) }}
            </v-avatar>
            <div class="min-w-0">
              <div class="item-name font-weight-bold text-slate-800 text-truncate" style="max-width: 220px;">
                {{ item.examinee?.full_name || 'Sin nombre' }}
              </div>
              <div class="item-sub text-caption text-grey font-mono">
                Tel: {{ item.examinee?.phone || 'No registrado' }}
              </div>
            </div>
          </div>
        </template>

        <!-- 2. Tipo de Prueba y Modalidad -->
        <template v-slot:[`item.test`]="{ item }">
          <div>
            <div class="font-weight-medium text-slate-800 text-body-2">
              {{ item.evaluation_type?.name }}
            </div>
            <v-chip
              size="x-small"
              :color="item.modality === 'presencial' ? '#07254A' : '#0d9488'"
              variant="tonal"
              class="font-weight-bold text-uppercase mt-1"
            >
              {{ item.modality }}
            </v-chip>
          </div>
        </template>

        <!-- 3. Psicólogo Asignado -->
        <template v-slot:[`item.psychologist`]="{ item }">
          <div class="d-flex align-center">
            <v-icon icon="mdi-account-star-outline" size="16" color="#5b21b6" class="mr-1"></v-icon>
            <span class="text-body-2 text-slate-700 font-weight-medium text-truncate">
              {{ item.psychologist?.name }}
            </span>
          </div>
        </template>

        <!-- 4. Fecha y Horario (CORREGIDO PARSER DE FECHA) -->
        <template v-slot:[`item.schedule`]="{ item }">
          <div>
            <div class="font-weight-bold text-slate-900 text-body-2">
              {{ formatDateSafe(item.date) }}
            </div>
            <div class="font-mono text-caption text-slate-600">
              {{ formatHour(item.start_time) }} - {{ formatHour(item.end_time) }}
            </div>
          </div>
        </template>

        <!-- 5. Estatus -->
        <template v-slot:[`item.status`]="{ item }">
          <div class="text-center">
            <v-chip
              size="small"
              :color="getStatusColor(item.status)"
              variant="flat"
              class="font-weight-bold status-chip text-white"
            >
              {{ formatStatus(item.status) }}
            </v-chip>
          </div>
        </template>

        <template v-slot:no-data>
          <div class="py-10 text-center">
            <v-avatar size="64" color="#f8fafc" class="mb-3 empty-avatar">
              <v-icon size="32" color="#07254A">mdi-calendar-blank-outline</v-icon>
            </v-avatar>
            <div class="text-subtitle-1 font-weight-bold text-slate-800">
              No tienes citas programadas aún
            </div>
            <div class="text-caption text-grey mb-3">
              Utiliza el formulario de arriba para agendar la primera evaluación.
            </div>
          </div>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useAppointmentsStore } from '@/store/appointments';

export default {
  name: 'AppointmentListComponent',
  data() {
    return {
      search: '',
      headers: [
        { title: 'EVALUADO / CANDIDATO', key: 'examinee', width: '28%', sortable: true },
        { title: 'TIPO DE PRUEBA', key: 'test', width: '22%', sortable: true },
        { title: 'ESPECIALISTA ASIGNADO', key: 'psychologist', width: '22%', sortable: true },
        { title: 'FECHA Y HORARIO', key: 'schedule', width: '18%', sortable: true },
        { title: 'ESTATUS', key: 'status', align: 'center', width: '10%', sortable: true },
      ],
    };
  },

  computed: {
    ...mapState(useAppointmentsStore, ['appointments', 'loading']),
  },

  mounted() {
    this.fetchAppointments();
  },

  methods: {
    ...mapActions(useAppointmentsStore, ['fetchAppointments']),

    getInitials(name) {
      if (!name) return 'EV';
      const parts = name.trim().split(' ');
      return parts.length > 1
        ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
        : parts[0].substring(0, 2).toUpperCase();
    },

    customFilter(value, query, item) {
      if (!query) return true;
      const q = query.toLowerCase().trim();
      const raw = item?.raw || item;
      const examinee = raw.examinee?.full_name?.toLowerCase() || '';
      const test = raw.evaluation_type?.name?.toLowerCase() || '';
      const psych = raw.psychologist?.name?.toLowerCase() || '';

      return examinee.includes(q) || test.includes(q) || psych.includes(q);
    },

    /**
     * Formateador seguro contra Invalid Date:
     * Extrae siempre el YYYY-MM-DD sin importar si viene fecha simple, ISO con Z o datetime
     */
    formatDateSafe(dateVal) {
      if (!dateVal) return 'Sin fecha';

      try {
        let cleanDate = '';
        if (typeof dateVal === 'string') {
          // Si viene tipo "2026-09-24T00:00:00.000000Z" o "2026-09-24"
          cleanDate = dateVal.substring(0, 10);
        } else if (dateVal instanceof Date) {
          cleanDate = dateVal.toISOString().substring(0, 10);
        }

        const parts = cleanDate.split('-');
        if (parts.length === 3) {
          const year = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const day = parseInt(parts[2], 10);

          const dateObj = new Date(year, month, day);
          return dateObj.toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          });
        }

        return cleanDate;
      } catch (e) {
        return String(dateVal);
      }
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
        no_show: 'No se presentó',
      };
      return map[status] || status;
    },
  },
};
</script>

<style scoped>
.appointment-table-card {
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

.table-toolbar {
  border-bottom: 1px solid #e2e8f0;
  background-color: #f8fafc;
}

.bg-slate-50 {
  background-color: #f8fafc;
}

:deep(.search-input .v-field) {
  border-radius: 8px !important;
  border: 1px solid #cbd5e1 !important;
  font-size: 0.85rem !important;
}

:deep(.custom-opalo-table thead th) {
  font-size: 0.73rem !important;
  font-weight: 700 !important;
  color: #64748b !important;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background-color: #ffffff !important;
  border-bottom: 1px solid #e2e8f0 !important;
  padding: 12px 16px !important;
}

:deep(.custom-opalo-table tbody td) {
  padding: 12px 16px !important;
  border-bottom: 1px solid #f1f5f9 !important;
  vertical-align: middle !important;
}

:deep(.custom-opalo-table tbody tr:hover) {
  background-color: #f8fafc !important;
}

.item-name {
  font-size: 0.88rem;
  line-height: 1.25;
}

.item-sub {
  font-size: 0.75rem;
}

.status-chip {
  padding: 0 10px !important;
  height: 24px !important;
  font-size: 0.75rem !important;
}

.empty-avatar {
  border: 1px solid #e2e8f0;
}

.font-mono {
  font-family: monospace;
}

.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
</style>
