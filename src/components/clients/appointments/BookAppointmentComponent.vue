<template>
  <v-card flat class="book-card elevation-0">
    <!-- Header Corporativo Ópalo -->
    <div class="card-table-header px-6 py-4 d-flex align-center justify-space-between flex-wrap gap-2">
      <div class="d-flex align-center">
        <div class="header-icon-box mr-3 flex-shrink-0">
          <v-icon icon="mdi-calendar-plus" color="#ffffff" size="20"></v-icon>
        </div>
        <div>
          <h2 class="card-title text-white mb-0">Agendar Cita de Evaluación</h2>
          <span class="card-subtitle text-white opacity-80">
            Reserva una sesión para tu candidato con los especialistas disponibles
          </span>
        </div>
      </div>

      <div class="d-none d-sm-flex align-center">
        <v-chip color="rgba(255,255,255,0.15)" text-color="#ffffff" size="small" class="font-weight-bold text-white">
          <v-icon icon="mdi-shield-check-outline" start size="14"></v-icon>
          Disponibilidad en Tiempo Real
        </v-chip>
      </div>
    </div>

    <!-- Formulario Modular -->
    <v-card-text class="pa-6 bg-slate-50">
      <v-form ref="form" v-model="valid" @submit.prevent="submit">
        <v-row dense>
          <!-- BLOQUE 1: DATOS DEL EVALUADO Y PRUEBA -->
          <v-col cols="12" class="mb-2">
            <div class="section-indicator d-flex align-center mb-3">
              <span class="step-badge mr-2">1</span>
              <span class="step-title">Candidato y Tipo de Evaluación</span>
            </div>
            <v-card flat class="inner-step-card pa-4">
              <v-row dense>
                <!-- Evaluado -->
                <v-col cols="12" md="6" class="px-2">
                  <label class="field-label">Selecciona al Evaluado / Candidato *</label>
                  <v-select
                    v-model="f.examinee_id"
                    :items="examineeOptions"
                    item-title="title"
                    item-value="value"
                    placeholder="Elige un candidato registrado..."
                    prepend-inner-icon="mdi-account-tie-outline"
                    density="compact"
                    variant="outlined"
                    rounded="lg"
                    color="#07254A"
                    :rules="[r.required]"
                    class="custom-field bg-white"
                    no-data-text="No tienes evaluados registrados"
                  ></v-select>
                </v-col>

                <!-- Tipo de Prueba -->
                <v-col cols="12" md="6" class="px-2">
                  <label class="field-label">Tipo de Evaluación Requerida *</label>
                  <v-select
                    v-model="f.evaluation_type_id"
                    :items="evaluationTypeOptions"
                    item-title="title"
                    item-value="value"
                    placeholder="Elige la batería o prueba..."
                    prepend-inner-icon="mdi-clipboard-text-outline"
                    density="compact"
                    variant="outlined"
                    rounded="lg"
                    color="#07254A"
                    :rules="[r.required]"
                    class="custom-field bg-white"
                    no-data-text="No hay tipos de prueba activos"
                  ></v-select>
                </v-col>
              </v-row>
            </v-card>
          </v-col>

          <!-- BLOQUE 2: ESPECIALISTA, FECHA Y HORARIO -->
          <v-col cols="12" class="mt-2 mb-2">
            <div class="section-indicator d-flex align-center mb-3">
              <span class="step-badge mr-2">2</span>
              <span class="step-title">Especialista, Fecha y Turno de Atención</span>
            </div>
            <v-card flat class="inner-step-card pa-4">
              <v-row dense>
                <!-- Especialista -->
                <v-col cols="12" md="6" class="px-2 mb-3">
                  <label class="field-label">Especialista en Psicología *</label>
                  <v-select
                    v-model="f.psychologist_id"
                    :items="psychologists"
                    item-title="name"
                    item-value="id"
                    placeholder="Selecciona especialista..."
                    prepend-inner-icon="mdi-account-star-outline"
                    density="compact"
                    variant="outlined"
                    rounded="lg"
                    color="#07254A"
                    :rules="[r.required]"
                    class="custom-field bg-white"
                    @update:model-value="onPsychologistChange"
                  ></v-select>
                </v-col>

                <!-- Fecha (Con Diálogo centrado y DatePicker en español) -->
                <v-col cols="12" md="6" class="px-2 mb-3">
                  <label class="field-label">Fecha de la Cita *</label>
                  <v-text-field
                    :model-value="formattedDisplayDate"
                    placeholder="Haz clic para seleccionar fecha..."
                    prepend-inner-icon="mdi-calendar-month-outline"
                    density="compact"
                    variant="outlined"
                    rounded="lg"
                    color="#07254A"
                    readonly
                    :disabled="!f.psychologist_id"
                    :rules="[r.required]"
                    class="custom-field bg-white cursor-pointer"
                    @click="openDateDialog"
                  ></v-text-field>

                  <!-- Diálogo centrado para el DatePicker -->
                  <v-dialog v-model="dateDialog" max-width="360px">
                    <v-card class="rounded-xl overflow-hidden date-dialog-card elevation-6">
                      <div class="dialog-header px-4 py-3 opaloBrand d-flex align-center justify-space-between">
                        <div class="d-flex align-center">
                          <v-icon icon="mdi-calendar" color="#ffffff" size="18" class="mr-2"></v-icon>
                          <span class="text-subtitle-2 font-weight-bold text-white">Selecciona la Fecha</span>
                        </div>
                        <v-btn icon="mdi-close" variant="text" size="small" color="#ffffff" @click="dateDialog = false"></v-btn>
                      </div>

                      <v-date-picker
                        v-model="pickerDate"
                        color="#07254A"
                        locale="es"
                        hide-header
                        :min="todayDate"
                        :allowed-dates="allowedDates"
                        class="mx-auto"
                        @update:model-value="onDateSelected"
                      ></v-date-picker>
                    </v-card>
                  </v-dialog>
                </v-col>

                <!-- Selección de Horario Interactivo con Chips -->
                <v-col cols="12" class="px-2">
                  <label class="field-label">Turno / Horario Disponible *</label>

                  <div v-if="loadingSlots" class="d-flex align-center py-3">
                    <v-progress-circular indeterminate color="#07254A" size="20" class="mr-2"></v-progress-circular>
                    <span class="text-caption text-slate-500 font-weight-medium">Consultando turnos libres...</span>
                  </div>

                  <div v-else-if="!f.psychologist_id || !f.date" class="py-2 text-caption text-slate-400 font-italic">
                    Selecciona al especialista y la fecha para desplegar los turnos de atención.
                  </div>

                  <div v-else-if="availableSlots.length === 0" class="py-2 d-flex align-center text-caption text-amber-700 font-weight-medium">
                    <v-icon icon="mdi-alert-circle-outline" size="16" class="mr-1"></v-icon>
                    No hay turnos disponibles para este especialista en la fecha seleccionada.
                  </div>

                  <!-- Chips de Horarios -->
                  <div v-else class="py-1">
                    <v-chip-group
                      v-model="f.start_time"
                      selected-class="selected-slot-chip"
                      mandatory
                    >
                      <v-chip
                        v-for="slot in availableSlots"
                        :key="slot.start_time"
                        :value="slot.start_time"
                        filter
                        variant="outlined"
                        class="time-slot-chip font-weight-bold"
                      >
                        <v-icon icon="mdi-clock-outline" start size="14"></v-icon>
                        {{ slot.label }}
                      </v-chip>
                    </v-chip-group>
                  </div>
                </v-col>

                <!-- Notas Opcionales -->
                <v-col cols="12" class="px-2 mt-3">
                  <label class="field-label">Notas Adicionales para el Especialista (Opcional)</label>
                  <v-text-field
                    v-model="f.notes"
                    placeholder="Instrucciones especiales, antecedentes o aclaraciones del candidato..."
                    prepend-inner-icon="mdi-comment-text-outline"
                    density="compact"
                    variant="outlined"
                    rounded="lg"
                    color="#07254A"
                    hide-details
                    class="custom-field bg-white"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>

        <!-- Barra inferior de confirmación -->
        <div class="d-flex align-center justify-space-between flex-wrap gap-2 mt-4 pt-2">
          <div class="d-flex align-center">
            <v-icon icon="mdi-information-outline" size="16" color="#64748b" class="mr-1"></v-icon>
            <span class="text-caption text-slate-500">
              Al confirmar, el evaluado y el especialista recibirán la notificación con los detalles de acceso.
            </span>
          </div>

          <v-btn
            type="submit"
            color="#07254A"
            variant="flat"
            rounded="lg"
            size="default"
            prepend-icon="mdi-calendar-check"
            class="text-none font-weight-bold text-white px-6 submit-btn"
            :loading="booking"
            :disabled="!f.start_time"
          >
            Confirmar y Agendar Cita
          </v-btn>
        </div>
      </v-form>
    </v-card-text>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="top right" timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </v-card>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useAppointmentsStore } from '@/store/appointments';
import { useExamineesStore } from '@/store/examinees';

export default {
  name: 'BookAppointmentComponent',
  data() {
    return {
      valid: false,
      dateDialog: false,
      pickerDate: null,
      todayDate: new Date().toISOString().split('T')[0],
      f: {
        examinee_id: null,
        evaluation_type_id: null,
        psychologist_id: null,
        date: '',
        start_time: null,
        notes: '',
      },
      r: {
        required: (v) => !!v || 'Campo obligatorio.',
      },
      snackbar: { show: false, text: '', color: 'success' },
    };
  },

  computed: {
    ...mapState(useAppointmentsStore, [
      'evaluationTypes',
      'psychologists',
      'availableSlots',
      'loadingSlots',
      'booking',
    ]),
    ...mapState(useExamineesStore, ['examinees']),

    examineeOptions() {
      if (!this.examinees || !Array.isArray(this.examinees)) return [];
      return this.examinees.map((e) => ({
        title: `${e.full_name} — ${e.position} (Tel: ${e.phone})`,
        value: e.id,
      }));
    },

    evaluationTypeOptions() {
      if (!this.evaluationTypes || !Array.isArray(this.evaluationTypes)) return [];
      return this.evaluationTypes.map((t) => ({
        title: `${t.name} • Modalidad: ${(t.modality || 'Presencial').toUpperCase()}`,
        value: t.id,
      }));
    },

    /**
     * Días habilitados según la agenda del psicólogo:
     * En BD: 1 = Lunes, 2 = Martes, 3 = Miércoles, 4 = Jueves, 5 = Viernes, 6 = Sábado.
     */
    enabledDays() {
      if (!this.f.psychologist_id || !this.psychologists.length) return [];
      const psych = this.psychologists.find((p) => p.id === this.f.psychologist_id);
      if (!psych || !psych.psychologist_schedules) return [];

      return psych.psychologist_schedules
        .filter((s) => s.is_active)
        .map((s) => Number(s.day_of_week));
    },

    formattedDisplayDate() {
      if (!this.f.date) return '';
      const [year, month, day] = this.f.date.split('-');
      const dateObj = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
      return dateObj.toLocaleDateString('es-MX', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    },
  },

  async mounted() {
    try {
      await Promise.all([this.fetchFormData(), this.fetchExaminees()]);
    } catch (e) {
      console.error('Error inicializando formulario de citas:', e);
    }
  },

  methods: {
    ...mapActions(useAppointmentsStore, ['fetchFormData', 'fetchSlots', 'bookAppointment']),
    ...mapActions(useExamineesStore, ['fetchExaminees']),

    notify(text, color = 'success') {
      this.snackbar.text = text;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },

    openDateDialog() {
      if (!this.f.psychologist_id) {
        this.notify('Por favor selecciona primero un especialista.', 'warning');
        return;
      }
      this.dateDialog = true;
    },

    /**
     * Valida si una fecha cae en los días de atención activos del especialista.
     * En JS getDay(): 0 = Domingo, 1 = Lunes, 2 = Martes, 3 = Miércoles, 4 = Jueves, 5 = Viernes, 6 = Sábado.
     */
    allowedDates(val) {
      if (!this.enabledDays.length) return false;
      const d = new Date(val);
      const jsDay = d.getDay();
      return this.enabledDays.includes(jsDay);
    },

    onPsychologistChange() {
      this.f.date = '';
      this.f.start_time = null;
      this.pickerDate = null;
    },

    onDateSelected(val) {
      if (!val) return;
      const d = new Date(val);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');

      this.f.date = `${year}-${month}-${day}`;
      this.dateDialog = false;

      // Consultar slots disponibles
      this.f.start_time = null;
      if (this.f.psychologist_id && this.f.date) {
        this.fetchSlots(this.f.psychologist_id, this.f.date);
      }
    },

    async submit() {
      const { valid } = await this.$refs.form.validate();
      if (!valid || !this.f.start_time) {
        this.notify('Por favor completa todos los campos y selecciona un horario.', 'error');
        return;
      }

      const res = await this.bookAppointment({
        examinee_id: this.f.examinee_id,
        evaluation_type_id: this.f.evaluation_type_id,
        psychologist_id: this.f.psychologist_id,
        date: this.f.date,
        start_time: this.f.start_time,
        notes: this.f.notes || null,
      });

      if (res.success) {
        this.notify(res.message);
        this.$refs.form.reset();
        this.f.examinee_id = null;
        this.f.evaluation_type_id = null;
        this.f.psychologist_id = null;
        this.f.date = '';
        this.f.start_time = null;
        this.f.notes = '';
        this.pickerDate = null;
      } else {
        this.notify(res.message, 'error');
      }
    },
  },
};
</script>

<style scoped>
.book-card {
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

.bg-slate-50 {
  background-color: #f8fafc;
}

.inner-step-card {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 10px !important;
}

.step-badge {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background-color: #07254A;
  color: #ffffff;
  font-size: 0.72rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.step-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: -0.2px;
}

.field-label {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 5px;
}

:deep(.custom-field .v-field) {
  border-radius: 8px !important;
  font-size: 0.84rem !important;
}

.date-dialog-card {
  background: #ffffff !important;
}

.opaloBrand {
  background: linear-gradient(135deg, #07254A 0%, #0e1726 100%) !important;
}

.time-slot-chip {
  border-color: #cbd5e1 !important;
  font-size: 0.78rem !important;
  height: 32px !important;
}

:deep(.selected-slot-chip) {
  background-color: #07254A !important;
  color: #ffffff !important;
  border-color: #07254A !important;
}

.submit-btn {
  height: 40px !important;
  font-size: 0.85rem !important;
  box-shadow: 0 2px 6px rgba(7, 37, 74, 0.2) !important;
}

.cursor-pointer {
  cursor: pointer;
}

.gap-2 { gap: 8px; }
</style>
