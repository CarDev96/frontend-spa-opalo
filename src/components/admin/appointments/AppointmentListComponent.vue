<template>
  <v-card flat class="appointment-table-card elevation-0 mt-4">
    <!-- Cabecera Corporativa Ópalo -->
    <div class="card-table-header px-6 py-4 d-flex flex-wrap align-center justify-space-between gap-3">
      <div class="d-flex align-center">
        <div class="header-icon-box mr-3 flex-shrink-0">
          <v-icon icon="mdi-calendar-multiselect" color="#ffffff" size="20"></v-icon>
        </div>
        <div>
          <h2 class="card-title text-white mb-0">Directorio General de Citas</h2>
          <span class="card-subtitle text-white opacity-80">
            Total de citas programadas: {{ appointments.length }}
          </span>
        </div>
      </div>

      <div class="d-flex align-center gap-2">
        <v-chip color="rgba(255,255,255,0.15)" text-color="#ffffff" size="small" class="font-weight-bold mr-2 text-white">
          {{ appointments.length }} Agendadas
        </v-chip>
        <v-btn
          variant="flat"
          size="small"
          color="#ffffff"
          prepend-icon="mdi-refresh"
          class="text-none font-weight-bold reload-btn"
          :loading="loading"
          @click="reloadList"
        >
          Recargar
        </v-btn>
      </div>
    </div>

    <!-- Barra de Filtro / Búsqueda -->
    <div class="table-toolbar px-6 py-3 border-bottom bg-slate-50">
      <v-row dense align="center">
        <v-col cols="12" sm="7" md="5">
          <v-text-field
            v-model="dt.search"
            placeholder="Buscar por candidato, empresa o psicóloga..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            hide-details
            rounded="lg"
            bg-color="#ffffff"
            color="#07254A"
            class="search-input"
          ></v-text-field>
        </v-col>
      </v-row>
    </div>

    <!-- Data Table sincronizada -->
    <v-card-text class="pa-0">
      <v-data-table
        class="custom-opalo-table"
        :headers="dt.headers"
        :items="appointments"
        :search="dt.search"
        :loading="loading"
        hover
        density="comfortable"
        mobile-breakpoint="0"
      >
        <!-- RENDERIZADO DE FILA SINCRONIZADA -->
        <template v-slot:item="{ item }">
          <tr class="table-row">
            <!-- 1. Fecha y Horario -->
            <td class="py-3">
              <div class="font-weight-bold text-slate-800">
                {{ formatDate(item.date) }}
              </div>
              <div class="mt-1">
                <span class="badge-time font-mono">
                  {{ formatHour(item.start_time) }} - {{ formatHour(item.end_time) }} hrs
                </span>
              </div>
            </td>

            <!-- 2. Candidato / Evaluado -->
            <td>
              <div class="candidate-name font-weight-bold text-slate-800">
                {{ item.examinee?.full_name || 'Sin nombre asignado' }}
              </div>
              <div class="text-caption text-grey">
                {{ item.examinee?.position || 'Sin puesto registrado' }}
              </div>
            </td>

            <!-- 3. Empresa Solicitante -->
            <td>
              <div class="d-flex align-center contact-line">
                <v-icon icon="mdi-domain" size="15" class="mr-1 text-slate-400"></v-icon>
                <span class="text-body-2 text-slate-700 text-truncate font-weight-medium">
                  {{ item.client?.trade_name || item.client?.company_name }}
                </span>
              </div>
              <div v-if="item.client?.contact_email" class="d-flex align-center contact-line mt-1 text-caption text-grey">
                <v-icon icon="mdi-email-outline" size="14" class="mr-1 text-slate-400"></v-icon>
                <span>{{ item.client?.contact_email }}</span>
              </div>
            </td>

            <!-- 4. Especialista Asignada -->
            <td>
              <div class="d-flex align-center">
                <v-icon icon="mdi-account-star-outline" size="16" class="mr-1 text-slate-500"></v-icon>
                <span class="text-body-2 text-slate-800 font-weight-semibold">
                  {{ item.psychologist?.name || 'No asignada' }}
                </span>
              </div>
              <div class="text-caption text-grey ml-5">
                {{ item.evaluation_type?.name }} ({{ item.modality || 'Presencial' }})
              </div>
            </td>

            <!-- 5. Estatus -->
            <td class="text-center">
              <v-chip
                size="small"
                :color="getStatusColor(item.status)"
                variant="flat"
                class="font-weight-bold status-chip text-white"
              >
                <v-icon start :icon="getStatusIcon(item.status)" size="14"></v-icon>
                {{ formatStatus(item.status) }}
              </v-chip>
            </td>

            <!-- 6. Acciones -->
            <td class="text-end pr-4">
              <div class="d-flex align-center justify-end gap-1">
                <!-- Enlace a WhatsApp -->
                <v-tooltip text="Contactar por WhatsApp" location="top">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon
                      size="small"
                      variant="tonal"
                      color="#25D366"
                      class="action-btn"
                      :disabled="!item.examinee?.phone"
                      @click="openWhatsApp(item)"
                    >
                      <v-icon icon="mdi-whatsapp" size="18"></v-icon>
                    </v-btn>
                  </template>
                </v-tooltip>

                <!-- Cancelar Cita -->
                <v-tooltip v-if="item.status === 'scheduled'" text="Cancelar cita" location="top">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon
                      size="small"
                      variant="tonal"
                      color="error"
                      class="action-btn"
                      @click="cancelAppointment(item)"
                    >
                      <v-icon icon="mdi-calendar-remove-outline" size="18"></v-icon>
                    </v-btn>
                  </template>
                </v-tooltip>
              </div>
            </td>
          </tr>
        </template>

        <!-- Sin registros (Icono con color #07254A corporativo) -->
        <template v-slot:no-data>
          <div class="py-10 text-center">
            <v-avatar size="64" color="#f8fafc" class="mb-3 empty-avatar">
              <v-icon size="32" color="#07254A">mdi-calendar-blank-outline</v-icon>
            </v-avatar>
            <div class="text-subtitle-1 font-weight-bold text-slate-800">
              No hay citas programadas aún
            </div>
            <div class="text-caption text-grey mb-3">
              Completa el formulario superior para asignar evaluador y fecha a un candidato.
            </div>
          </div>
        </template>
      </v-data-table>
    </v-card-text>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="top right" timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </v-card>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'AppointmentListComponent',
  data() {
    return {
      appointments: [],
      loading: false,
      dt: {
        search: '',
        headers: [
          { title: 'Fecha y Horario', key: 'date', align: 'start' },
          { title: 'Candidato / Evaluado', key: 'examinee.full_name', align: 'start' },
          { title: 'Empresa Solicitante', key: 'client.trade_name', align: 'start' },
          { title: 'Especialista Asignada', key: 'psychologist.name', align: 'start' },
          { title: 'Estatus', key: 'status', align: 'center' },
          { title: 'Acciones', key: 'actions', align: 'end', sortable: false },
        ],
      },
      snackbar: { show: false, text: '', color: 'success' },
    };
  },

  mounted() {
    this.fetchAppointments();
  },

  methods: {
    notify(text, color = 'success') {
      this.snackbar.text = text;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },

    async fetchAppointments() {
      this.loading = true;
      try {
        // 👉 Ruta exacta: /admin/appointments/dt
        const res = await api.get('/admin/appointments/dt');
        this.appointments = res.data || [];
      } catch (e) {
        console.error('Error cargando listado de citas:', e);
      } finally {
        this.loading = false;
      }
    },

    async reloadList() {
      try {
        await this.fetchAppointments();
        this.notify('Listado de citas actualizado.');
      } catch (e) {
        this.notify('Error al recargar las citas.', 'error');
      }
    },

    addAppointmentToTop(appointment) {
      if (appointment && appointment.id) {
        const exists = this.appointments.some((a) => a.id === appointment.id);
        if (!exists) {
          this.appointments.unshift(appointment);
        }
      }
    },

    formatHour(hourStr) {
      if (!hourStr) return '';
      return hourStr.substring(0, 5);
    },

    formatDate(dateStr) {
      if (!dateStr) return '';
      const [year, month, day] = dateStr.split('-');
      const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
      return d.toLocaleDateString('es-MX', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
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

    getStatusIcon(status) {
      const map = {
        scheduled: 'mdi-clock-outline',
        attended: 'mdi-check-circle',
        cancelled: 'mdi-close-circle',
        no_show: 'mdi-account-cancel',
      };
      return map[status] || 'mdi-help-circle-outline';
    },

    formatStatus(status) {
      const map = {
        scheduled: 'Programada',
        attended: 'Atendida',
        cancelled: 'Cancelada',
        no_show: 'No Asistió',
      };
      return map[status] || status;
    },

    openWhatsApp(item) {
      const rawPhone = item.examinee?.phone || '';
      const cleanPhone = rawPhone.replace(/\D/g, '');
      const candidateName = item.examinee?.full_name || 'Candidato';
      const time = this.formatHour(item.start_time);

      const message = encodeURIComponent(
        `Hola ${candidateName}, te contactamos de Ópalo Certificados de Confianza respecto a tu cita de evaluación programada para el día ${item.date} a las ${time} hrs.`
      );

      window.open(`https://wa.me/52${cleanPhone}?text=${message}`, '_blank');
    },

    async cancelAppointment(item) {
      const confirmed = confirm(`¿Deseas cancelar la cita de ${item.examinee?.full_name}?`);
      if (!confirmed) return;

      try {
        await api.patch(`/admin/appointments/${item.id}/cancel`);
        item.status = 'cancelled';
        this.notify('Cita cancelada correctamente.');
      } catch (e) {
        this.notify('Error al cancelar la cita.', 'error');
      }
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

.table-toolbar {
  border-bottom: 1px solid #e2e8f0;
}

.bg-slate-50 {
  background-color: #f8fafc;
}

:deep(.search-input .v-field) {
  border-radius: 8px !important;
  font-size: 0.84rem !important;
}

.table-row:hover {
  background-color: #f8fafc;
}

.badge-time {
  background-color: #f1f5f9;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.76rem;
  font-weight: 700;
  color: #1e293b;
  border: 1px solid #e2e8f0;
}

.status-chip {
  padding: 0 8px !important;
  height: 22px !important;
  font-size: 0.72rem !important;
}

.action-btn {
  border-radius: 8px !important;
}

.empty-avatar {
  border: 1px solid #e2e8f0;
}

.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
</style>
