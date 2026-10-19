<template>
  <v-card flat class="main-card elevation-0">
    <!-- Cabecera Institucional Ópalo -->
    <div class="card-header px-6 py-4 d-flex align-center justify-space-between text-white flex-wrap gap-3">
      <div class="d-flex align-center">
        <div class="header-icon-box mr-3 flex-shrink-0">
          <v-icon icon="mdi-calendar-text" color="#ffffff" size="22"></v-icon>
        </div>
        <div>
          <h2 class="card-title text-white mb-0">Control de Citas</h2>
          <span class="card-subtitle text-white opacity-80">
            Listado general y seguimiento de citas programadas
          </span>
        </div>
      </div>
      <v-btn
        variant="flat"
        color="rgba(255,255,255,0.15)"
        rounded="lg"
        size="small"
        prepend-icon="mdi-refresh"
        class="text-none font-weight-bold text-white"
        :loading="loadingAppointments"
        @click="fetchAllAppointments"
      >
        Recargar Lista
      </v-btn>
    </div>

    <!-- Tabla de Datos -->
    <v-card-text class="pa-0 bg-white">
      <v-data-table
        :headers="headers"
        :items="appointments"
        :loading="loadingAppointments"
        hover
        density="comfortable"
        no-data-text="No hay citas registradas en el sistema"
        items-per-page-text="Citas por página:"
        page-text="{0}-{1} de {2}"
      >
        <template v-slot:item="{ item }">
          <tr class="table-row">

            <!-- Empresa y Candidato -->
            <td class="py-3">
              <div class="font-weight-bold text-slate-800">{{ item.examinee?.full_name }}</div>
              <div class="text-caption font-weight-medium text-slate-500 d-flex align-center">
                <v-icon icon="mdi-domain" size="14" class="mr-1"></v-icon>
                {{ item.client?.company_name }}
              </div>
            </td>

            <!-- Especialista -->
            <td>
              <div class="text-body-2 font-weight-bold text-slate-800">
                {{ item.psychologist?.name || 'No asignada' }}
              </div>
            </td>

            <!-- Fecha y Turno -->
            <td>
              <div class="font-weight-bold text-slate-800 d-flex align-center">
                <v-icon icon="mdi-calendar-blank" size="14" class="mr-1 text-slate-400"></v-icon>
                {{ formatDate(item.date) }}
              </div>
              <div class="text-caption font-mono font-weight-bold text-slate-500 mt-1">
                {{ formatTime(item.start_time) }} - {{ formatTime(item.end_time) }}
              </div>
            </td>

            <!-- Tipo de Prueba -->
            <td>
              <div class="text-body-2 font-weight-medium text-slate-800">{{ item.evaluation_type?.name }}</div>
              <v-chip size="x-small" variant="tonal" color="#07254A" class="mt-1 font-weight-bold">
                {{ item.evaluation_type?.modality?.toUpperCase() || 'PRESENCIAL' }}
              </v-chip>
            </td>

            <!-- Estatus -->
            <td class="text-center">
              <v-chip
                size="small"
                :color="getStatusColor(item.status)"
                variant="flat"
                class="font-weight-bold text-white px-3"
              >
                {{ formatStatus(item.status) }}
              </v-chip>
            </td>

            <!-- Acciones -->
            <td class="text-end pr-4">
              <v-btn
                v-if="item.status === 'scheduled'"
                size="small"
                variant="tonal"
                color="#EF4444"
                rounded="lg"
                prepend-icon="mdi-cancel"
                class="text-none font-weight-bold"
                :loading="cancelingId === item.id"
                @click="confirmCancel(item)"
              >
                Cancelar
              </v-btn>
              <span v-else class="text-caption text-slate-400 font-italic">
                Sin acciones
              </span>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card-text>

    <!-- Dialogo Confirmar Cancelación -->
    <v-dialog v-model="cancelDialog" max-width="400">
      <v-card class="rounded-xl elevation-4">
        <v-card-title class="text-h6 font-weight-bold text-center pt-6 pb-2 text-slate-800">
          ¿Cancelar Cita?
        </v-card-title>
        <v-card-text class="text-center text-slate-600 pb-6">
          El candidato volverá a estar pendiente y el horario quedará libre para la psicóloga.
        </v-card-text>
        <v-card-actions class="px-6 pb-6 d-flex justify-center gap-3">
          <v-btn variant="tonal" color="#64748B" class="text-none font-weight-bold" rounded="lg" @click="cancelDialog = false">
            Regresar
          </v-btn>
          <v-btn variant="flat" color="#EF4444" class="text-none font-weight-bold text-white px-6" rounded="lg" @click="executeCancel">
            Sí, Cancelar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="top right" timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </v-card>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useAdminAppointmentsStore } from '@/store/adminAppointments';

export default {
  name: 'AdminAppointmentsListComponent',
  data() {
    return {
      cancelDialog: false,
      cancelingId: null,
      selectedItem: null,

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

    formatDate(dateString) {
      if (!dateString) return '';
      // Limpieza blindada para evitar "Invalid Date"
      try {
        const cleanDate = dateString.split('T')[0];
        const [year, month, day] = cleanDate.split('-');
        const d = new Date(year, month - 1, day);
        return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
      } catch (e) {
        return dateString; // Fallback seguro
      }
    },

    formatTime(timeString) {
      if (!timeString) return '';
      try {
        // En caso de que venga con milisegundos tipo 09:00:00.000000Z
        const cleanTime = timeString.split('T')[1] ? timeString.split('T')[1].substring(0,5) : timeString.substring(0,5);
        const [hour, minute] = cleanTime.split(':');
        const d = new Date();
        d.setHours(hour, minute);
        return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });
      } catch (e) {
        return timeString; // Fallback seguro
      }
    },

    getStatusColor(status) {
      const map = {
        scheduled: '#3B82F6',
        attended: '#10B981',
        completed: '#059669',
        cancelled: '#EF4444',
        in_progress: '#F59E0B'
      };
      return map[status] || '#64748B';
    },

    formatStatus(status) {
      const map = {
        scheduled: 'Agendada',
        attended: 'Atendida',
        completed: 'Finalizada',
        cancelled: 'Cancelada',
        in_progress: 'En Curso'
      };
      return map[status] || 'Desconocido';
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
    }
  },
};
</script>

<style scoped>
.main-card {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 16px !important;
  overflow: hidden;
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
}

.card-subtitle {
  font-size: 0.8rem;
}

.font-mono {
  font-family: monospace;
}

.gap-3 { gap: 12px; }
</style>
