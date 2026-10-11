<template>
  <v-card flat class="admin-book-card elevation-0">
    <!-- Header Corporativo -->
    <div class="card-table-header px-6 py-4 d-flex align-center justify-space-between flex-wrap gap-2">
      <div class="d-flex align-center">
        <div class="header-icon-box mr-3 flex-shrink-0">
          <v-icon icon="mdi-calendar-check" color="#ffffff" size="20"></v-icon>
        </div>
        <div>
          <h2 class="card-title text-white mb-0">Programar Cita de Evaluación</h2>
          <span class="card-subtitle text-white opacity-80">
            Asigna candidato pagado, especialista en psicología y horario disponible
          </span>
        </div>
      </div>
      <v-chip color="rgba(255,255,255,0.15)" text-color="#ffffff" size="small" class="font-weight-bold text-white">
        <v-icon icon="mdi-shield-crown-outline" start size="14"></v-icon>
        Control Administrativo
      </v-chip>
    </div>

    <!-- Formulario en 2 Fases -->
    <v-card-text class="pa-6 bg-slate-50">
      <v-form ref="form" v-model="valid" @submit.prevent="submit">
        <v-row dense>
          <!-- BLOQUE 1: EMPRESA, CANDIDATO Y PRUEBA -->
          <v-col cols="12" class="mb-3">
            <div class="section-indicator d-flex align-center mb-3">
              <span class="step-badge mr-2">1</span>
              <span class="step-title">Empresa Cliente, Candidato y Tipo de Prueba</span>
            </div>
            <v-card flat class="inner-step-card pa-4">
              <v-row dense>
                <!-- Empresa Cliente -->
                <v-col cols="12" md="4" class="px-2">
                  <label class="field-label">Empresa Solicitante *</label>
                  <v-select
                    v-model="f.client_id"
                    :items="clientOptions"
                    item-title="title"
                    item-value="value"
                    placeholder="Selecciona empresa..."
                    prepend-inner-icon="mdi-domain"
                    density="compact"
                    variant="outlined"
                    rounded="lg"
                    color="#07254A"
                    :rules="[r.required]"
                    class="custom-field bg-white"
                    @update:model-value="onClientChange"
                  ></v-select>
                </v-col>

                <!-- Candidato Evaluado -->
                <v-col cols="12" md="4" class="px-2">
                  <label class="field-label">Candidato / Evaluado *</label>
                  <v-select
                    v-model="f.examinee_id"
                    :items="examineeOptions"
                    item-title="title"
                    item-value="value"
                    :placeholder="!f.client_id ? 'Elige primero una empresa' : 'Selecciona candidato...'"
                    :disabled="!f.client_id || examineeOptions.length === 0"
                    prepend-inner-icon="mdi-account-tie-outline"
                    density="compact"
                    variant="outlined"
                    rounded="lg"
                    color="#07254A"
                    :rules="[r.required]"
                    class="custom-field bg-white"
                    no-data-text="No hay candidatos pendientes de cita para esta empresa"
                  ></v-select>
                </v-col>

                <!-- Tipo de Prueba -->
                <v-col cols="12" md="4" class="px-2">
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
                  ></v-select>
                </v-col>
              </v-row>
            </v-card>
          </v-col>

          <!-- BLOQUE 2: PSICÓLOGA Y HORARIO -->
          <v-col cols="12" class="mb-2">
            <div class="section-indicator d-flex align-center mb-3">
              <span class="step-badge mr-2">2</span>
              <span class="step-title">Especialista Asignada, Fecha y Turno</span>
            </div>
            <v-card flat class="inner-step-card pa-4">
              <v-row dense>
                <!-- Psicóloga -->
                <v-col cols="12" md="6" class="px-2 mb-3">
                  <label class="field-label">Especialista en Psicología *</label>
                  <v-select
                    v-model="f.psychologist_id"
                    :items="psychologists"
                    item-title="name"
                    item-value="id"
                    placeholder="Selecciona a la psicóloga..."
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

                <!-- Fecha con DatePicker Modal en Español -->
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

                  <!-- Diálogo Modal Centrado -->
                  <v-dialog v-model="dateDialog" max-width="360px">
                    <v-card class="rounded-xl overflow-hidden elevation-6 bg-white">
                      <div class="dialog-header px-4 py-3 opaloBrand d-flex align-center justify-space-between">
                        <div class="d-flex align-center">
                          <v-icon icon="mdi-calendar" color="#ffffff" size="18" class="mr-2"></v-icon>
                          <span class="text-subtitle-2 font-weight-bold text-white">Selecciona Fecha</span>
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

                <!-- Slots Interactivos por Chips -->
                <v-col cols="12" class="px-2">
                  <label class="field-label">Turno / Horario Disponible *</label>

                  <div v-if="loadingSlots" class="d-flex align-center py-2">
                    <v-progress-circular indeterminate color="#07254A" size="20" class="mr-2"></v-progress-circular>
                    <span class="text-caption text-slate-500 font-weight-medium">Consultando disponibilidad...</span>
                  </div>

                  <div v-else-if="!f.psychologist_id || !f.date" class="py-2 text-caption text-slate-400 font-italic">
                    Selecciona a la psicóloga y la fecha para desplegar los turnos libres.
                  </div>

                  <div v-else-if="availableSlots.length === 0" class="py-2 d-flex align-center text-caption text-amber-700 font-weight-medium">
                    <v-icon icon="mdi-alert-circle-outline" size="16" class="mr-1"></v-icon>
                    No hay turnos disponibles para esta psicóloga en la fecha seleccionada.
                  </div>

                  <div v-else class="py-1">
                    <v-chip-group v-model="f.start_time" selected-class="selected-slot-chip" mandatory>
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
                  <label class="field-label">Instrucciones o Notas Administrativas (Opcional)</label>
                  <v-text-field
                    v-model="f.notes"
                    placeholder="Instrucciones para la evaluadora o detalles del pago..."
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

        <!-- Barra Inferior -->
        <div class="d-flex align-center justify-space-between flex-wrap gap-2 mt-4 pt-2">
          <span class="text-caption text-slate-500">
            Al agendar, la cita aparecerá de inmediato en la agenda de la psicóloga y se notificará al evaluado.
          </span>

          <v-btn
            type="submit"
            color="#07254A"
            variant="flat"
            rounded="lg"
            size="default"
            prepend-icon="mdi-calendar-check"
            class="text-none font-weight-bold text-white px-6"
            :loading="booking"
            :disabled="!f.start_time"
          >
            Agendar y Notificar Cita
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
import { useAdminAppointmentsStore } from '@/store/adminAppointments';

export default {
  name: 'AdminBookAppointmentComponent',
  emits: ['appointment-created'],
  data() {
    return {
      valid: false,
      dateDialog: false,
      pickerDate: null,
      todayDate: new Date().toISOString().split('T')[0],
      f: {
        client_id: null,
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
    ...mapState(useAdminAppointmentsStore, [
      'clients',
      'evaluationTypes',
      'psychologists',
      'availableSlots',
      'loadingSlots',
      'booking',
    ]),

    clientOptions() {
      if (!this.clients) return [];
      return this.clients.map((c) => ({
        title: `${c.trade_name || c.company_name}`,
        value: c.id,
      }));
    },

    examineeOptions() {
      if (!this.f.client_id || !this.clients) return [];
      const selectedClient = this.clients.find((c) => c.id === this.f.client_id);
      if (!selectedClient || !selectedClient.examinees) return [];

      return selectedClient.examinees.map((e) => ({
        title: `${e.full_name} — ${e.position} (Tel: ${e.phone || 'S/N'})`,
        value: e.id,
      }));
    },

    evaluationTypeOptions() {
      if (!this.evaluationTypes) return [];
      return this.evaluationTypes.map((t) => ({
        title: `${t.name} • ${(t.modality || 'Presencial').toUpperCase()}`,
        value: t.id,
      }));
    },

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
      const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
      return d.toLocaleDateString('es-MX', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    },
  },

  mounted() {
    this.fetchFormData();
  },

  methods: {
    ...mapActions(useAdminAppointmentsStore, [
      'fetchFormData',
      'fetchSlots',
      'bookAppointment',
    ]),

    notify(text, color = 'success') {
      this.snackbar.text = text;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },

    onClientChange() {
      this.f.examinee_id = null;
    },

    openDateDialog() {
      if (!this.f.psychologist_id) {
        this.notify('Por favor selecciona primero a la psicóloga.', 'warning');
        return;
      }
      this.dateDialog = true;
    },

    allowedDates(val) {
      if (!this.enabledDays.length) return false;
      const d = new Date(val);
      return this.enabledDays.includes(d.getDay());
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

      this.f.start_time = null;
      if (this.f.psychologist_id && this.f.date) {
        this.fetchSlots(this.f.psychologist_id, this.f.date);
      }
    },

    async submit() {
      const { valid } = await this.$refs.form.validate();
      if (!valid || !this.f.start_time) {
        this.notify('Completa todos los campos obligatorios y selecciona un horario.', 'error');
        return;
      }

      const res = await this.bookAppointment({
        client_id: this.f.client_id,
        examinee_id: this.f.examinee_id,
        evaluation_type_id: this.f.evaluation_type_id,
        psychologist_id: this.f.psychologist_id,
        date: this.f.date,
        start_time: this.f.start_time,
        notes: this.f.notes || null,
      });

      if (res.success) {
        this.notify(res.message);
        this.$emit('appointment-created');
        this.$refs.form.reset();
        this.f.client_id = null;
        this.f.examinee_id = null;
        this.f.evaluation_type_id = null;
        this.f.psychologist_id = null;
        this.f.date = '';
        this.f.start_time = null;
        this.f.notes = '';
        this.pickerDate = null;
        // Refrescar evaluados disponibles
        this.fetchFormData();
      } else {
        this.notify(res.message, 'error');
      }
    },
  },
};
</script>

<style scoped>
.admin-book-card {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 14px !important;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04) !important;
}

.card-table-header,
.opaloBrand {
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

.cursor-pointer {
  cursor: pointer;
}

.gap-2 { gap: 8px; }
</style>
