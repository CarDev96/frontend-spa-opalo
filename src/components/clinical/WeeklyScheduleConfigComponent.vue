<template>
  <v-card flat class="schedule-table-card elevation-0">
    <!-- Cabecera en una sola línea integrada -->
    <div class="card-table-header px-6 py-4 d-flex align-center justify-space-between gap-3">
      <div class="d-flex align-center min-w-0">
        <div class="header-icon-box mr-3 flex-shrink-0">
          <v-icon icon="mdi-calendar-clock-outline" color="#ffffff" size="20"></v-icon>
        </div>
        <div class="min-w-0">
          <div class="d-flex align-center gap-2">
            <h2 class="card-title text-white mb-0 text-truncate">
              {{ selectedPsychologist ? selectedPsychologist.name : 'Configuración de Horarios' }}
            </h2>
            <v-chip
              v-if="selectedPsychologist"
              size="x-small"
              :color="isConfigured ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.15)'"
              class="font-weight-bold text-white"
            >
              {{ isConfigured ? 'Horario Asignado' : 'Sin Guardar' }}
            </v-chip>
          </div>
          <span class="card-subtitle text-white opacity-80">
            Define la disponibilidad semanal para citas y evaluaciones (bloques de 30 min)
          </span>
        </div>
      </div>

      <!-- Botón de Guardar Compacto (igual al botón Recargar) -->
      <v-btn
        v-if="selectedPsychologist"
        variant="flat"
        size="small"
        color="#ffffff"
        prepend-icon="mdi-content-save-outline"
        class="text-none font-weight-bold reload-btn px-4 flex-shrink-0"
        :loading="saving"
        @click="handleSave"
      >
        Guardar
      </v-btn>
    </div>

    <!-- Si no hay psicólogo seleccionado -->
    <v-card-text v-if="!selectedPsychologist" class="py-12 text-center text-slate-500 bg-white">
      <v-avatar size="56" color="#f8fafc" class="mb-3 empty-avatar">
        <v-icon size="28" color="#07254A">mdi-account-question-outline</v-icon>
      </v-avatar>
      <div class="text-subtitle-2 font-weight-bold text-slate-800">
        Ningún psicólogo seleccionado
      </div>
      <div class="text-caption text-grey">
        Elige un especialista del panel izquierdo para editar o asignar sus horarios.
      </div>
    </v-card-text>

    <!-- Matriz de Días (Lunes a Sábado) -->
    <v-card-text v-else class="pa-0 bg-white">
      <!-- Barra superior con aviso si no tiene horarios -->
      <div v-if="!isConfigured" class="px-6 py-2 bg-amber-lighten-5 border-bottom d-flex align-center">
        <v-icon icon="mdi-information-outline" size="16" color="#b45309" class="mr-2"></v-icon>
        <span class="text-caption text-amber-darken-4 font-weight-medium">
          Este especialista aún no tiene horarios guardados. Activa los días correspondientes y presiona "Guardar".
        </span>
      </div>

      <div class="table-responsive">
        <v-table density="compact" class="custom-schedule-table">
          <thead>
            <tr>
              <th class="text-caption font-weight-bold pl-6" style="width: 26%;">DÍA DE LA SEMANA</th>
              <th class="text-caption font-weight-bold text-center" style="width: 14%;">ESTATUS</th>
              <th class="text-caption font-weight-bold" style="width: 20%;">HORA INICIO</th>
              <th class="text-caption font-weight-bold" style="width: 20%;">HORA FIN</th>
              <th class="text-caption font-weight-bold text-center pr-6" style="width: 20%;">CITAS DISPONIBLES</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="day in weekDays"
              :key="day.day_of_week"
              class="table-row"
              :class="{ 'row-inactive': !day.is_active }"
            >
              <!-- Día -->
              <td class="pl-6 py-3">
                <div class="d-flex align-center">
                  <v-icon
                    :icon="day.is_active ? 'mdi-calendar-check' : 'mdi-calendar-blank-outline'"
                    size="16"
                    :color="day.is_active ? '#07254A' : '#94a3b8'"
                    class="mr-2"
                  ></v-icon>
                  <span class="day-name font-weight-bold" :class="day.is_active ? 'text-slate-800' : 'text-slate-400'">
                    {{ day.name }}
                  </span>
                </div>
              </td>

              <!-- Switch Activo / Inactivo -->
              <td class="text-center py-3">
                <v-switch
                  v-model="day.is_active"
                  color="#10B981"
                  density="compact"
                  hide-details
                  inset
                  class="d-inline-flex schedule-switch"
                ></v-switch>
              </td>

              <!-- Hora Inicio -->
              <td class="py-3">
                <v-select
                  v-model="day.start_time"
                  :items="timeOptions"
                  :disabled="!day.is_active"
                  density="compact"
                  variant="outlined"
                  hide-details
                  rounded="lg"
                  color="#07254A"
                  class="hour-select"
                ></v-select>
              </td>

              <!-- Hora Fin -->
              <td class="py-3">
                <v-select
                  v-model="day.end_time"
                  :items="timeOptions"
                  :disabled="!day.is_active"
                  density="compact"
                  variant="outlined"
                  hide-details
                  rounded="lg"
                  color="#07254A"
                  class="hour-select"
                ></v-select>
              </td>

              <!-- Capacidad de citas en bloques de 30 min -->
              <td class="text-center py-3 pr-6">
                <v-chip
                  v-if="day.is_active && calculateSlots(day) > 0"
                  size="small"
                  variant="tonal"
                  color="#07254A"
                  class="font-weight-bold slot-chip"
                >
                  <v-icon icon="mdi-clock-outline" start size="13"></v-icon>
                  {{ calculateSlots(day) }} citas ({{ calculateHoursText(day) }})
                </v-chip>
                <span v-else class="text-caption text-slate-400 font-italic">
                  {{ day.is_active ? 'Horario inválido' : 'No labora' }}
                </span>
              </td>
            </tr>
          </tbody>
        </v-table>
      </div>
    </v-card-text>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="top right" timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </v-card>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { usePsychologistSchedulesStore } from '@/store/psychologistSchedules';

export default {
  name: 'WeeklyScheduleConfigComponent',
  data() {
    return {
      snackbar: { show: false, text: '', color: 'success' },
      isConfigured: false,
      // Horarios en intervalos exactos de 30 minutos (07:00 a 20:00)
      timeOptions: [
        { title: '07:00 AM', value: '07:00' },
        { title: '07:30 AM', value: '07:30' },
        { title: '08:00 AM', value: '08:00' },
        { title: '08:30 AM', value: '08:30' },
        { title: '09:00 AM', value: '09:00' },
        { title: '09:30 AM', value: '09:30' },
        { title: '10:00 AM', value: '10:00' },
        { title: '10:30 AM', value: '10:30' },
        { title: '11:00 AM', value: '11:00' },
        { title: '11:30 AM', value: '11:30' },
        { title: '12:00 PM', value: '12:00' },
        { title: '12:30 PM', value: '12:30' },
        { title: '01:00 PM', value: '13:00' },
        { title: '01:30 PM', value: '13:30' },
        { title: '02:00 PM', value: '14:00' },
        { title: '02:30 PM', value: '14:30' },
        { title: '03:00 PM', value: '15:00' },
        { title: '03:30 PM', value: '15:30' },
        { title: '04:00 PM', value: '16:00' },
        { title: '04:30 PM', value: '16:30' },
        { title: '05:00 PM', value: '17:00' },
        { title: '05:30 PM', value: '17:30' },
        { title: '06:00 PM', value: '18:00' },
        { title: '06:30 PM', value: '18:30' },
        { title: '07:00 PM', value: '19:00' },
        { title: '07:30 PM', value: '19:30' },
        { title: '08:00 PM', value: '20:00' },
      ],
      weekDays: [
        { day_of_week: 1, name: 'Lunes', is_active: false, start_time: '08:00', end_time: '17:00' },
        { day_of_week: 2, name: 'Martes', is_active: false, start_time: '08:00', end_time: '17:00' },
        { day_of_week: 3, name: 'Miércoles', is_active: false, start_time: '08:00', end_time: '17:00' },
        { day_of_week: 4, name: 'Jueves', is_active: false, start_time: '08:00', end_time: '17:00' },
        { day_of_week: 5, name: 'Viernes', is_active: false, start_time: '08:00', end_time: '17:00' },
        { day_of_week: 6, name: 'Sábado', is_active: false, start_time: '09:00', end_time: '14:00' },
      ],
    };
  },

  computed: {
    ...mapState(usePsychologistSchedulesStore, [
      'selectedPsychologist',
      'selectedPsychologistId',
      'saving',
    ]),
  },

  watch: {
    selectedPsychologist: {
      immediate: true,
      handler(newVal) {
        this.loadExistingSchedules(newVal);
      },
    },
  },

  methods: {
    ...mapActions(usePsychologistSchedulesStore, ['saveSchedule']),

    notify(text, color = 'success') {
      this.snackbar.text = text;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },

    loadExistingSchedules(psych) {
      if (!psych || !psych.psychologist_schedules || psych.psychologist_schedules.length === 0) {
        this.isConfigured = false;
        this.weekDays.forEach((d) => {
          d.is_active = false;
          d.start_time = d.day_of_week === 6 ? '09:00' : '08:00';
          d.end_time = d.day_of_week === 6 ? '14:00' : '17:00';
        });
        return;
      }

      this.isConfigured = psych.psychologist_schedules.some((s) => s.is_active);

      this.weekDays.forEach((d) => {
        const found = psych.psychologist_schedules.find((s) => s.day_of_week === d.day_of_week);
        if (found) {
          d.is_active = Boolean(found.is_active);
          d.start_time = (found.start_time || '08:00').substring(0, 5);
          d.end_time = (found.end_time || '17:00').substring(0, 5);
        } else {
          d.is_active = false;
        }
      });
    },

    /**
     * Calcula la diferencia total de minutos entre hora de inicio y fin
     */
    calculateTotalMinutes(day) {
      if (!day.start_time || !day.end_time) return 0;
      const [startH, startM] = day.start_time.split(':').map(Number);
      const [endH, endM] = day.end_time.split(':').map(Number);
      const startTotal = startH * 60 + startM;
      const endTotal = endH * 60 + endM;
      return Math.max(0, endTotal - startTotal);
    },

    /**
     * Devuelve el texto formateado de horas trabajadas (ej: "8.5 hrs" o "9 hrs")
     */
    calculateHoursText(day) {
      const minutes = this.calculateTotalMinutes(day);
      const hours = minutes / 60;
      return Number.isInteger(hours) ? `${hours} hrs` : `${hours.toFixed(1)} hrs`;
    },

    /**
     * Calcula la cantidad exacta de citas disponibles de 30 minutos
     */
    calculateSlots(day) {
      const totalMinutes = this.calculateTotalMinutes(day);
      return Math.floor(totalMinutes / 30);
    },

    async handleSave() {
      if (!this.selectedPsychologistId) return;

      for (const d of this.weekDays) {
        if (d.is_active && this.calculateTotalMinutes(d) <= 0) {
          this.notify(`En ${d.name}, la hora de fin debe ser posterior a la de inicio.`, 'error');
          return;
        }
      }

      const payload = this.weekDays.map((d) => ({
        day_of_week: d.day_of_week,
        start_time: d.start_time,
        end_time: d.end_time,
        slot_duration_minutes: 30, // Granularidad de 30 minutos configurada
        is_active: d.is_active,
      }));

      const res = await this.saveSchedule(this.selectedPsychologistId, payload);
      if (res.success) {
        this.isConfigured = this.weekDays.some((d) => d.is_active);
      }
      this.notify(res.message, res.success ? 'success' : 'error');
    },
  },
};
</script>

<style scoped>
.schedule-table-card {
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

.border-bottom {
  border-bottom: 1px solid #e2e8f0;
}

:deep(.custom-schedule-table thead th) {
  font-size: 0.73rem !important;
  font-weight: 700 !important;
  color: #64748b !important;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background-color: #ffffff !important;
  border-bottom: 1px solid #e2e8f0 !important;
  padding: 12px 14px !important;
}

.table-row td {
  padding: 10px 14px !important;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.table-row:hover {
  background-color: #f8fafc;
}

.row-inactive {
  background-color: #fafbfc;
}

.day-name {
  font-size: 0.86rem;
}

.hour-select {
  max-width: 145px;
  font-size: 0.82rem;
}

:deep(.hour-select .v-field) {
  border-radius: 8px !important;
  font-size: 0.82rem !important;
}

.slot-chip {
  font-size: 0.75rem !important;
  height: 24px !important;
}

.schedule-switch {
  transform: scale(0.85);
}

.empty-avatar {
  border: 1px solid #e2e8f0;
}

.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
</style>
