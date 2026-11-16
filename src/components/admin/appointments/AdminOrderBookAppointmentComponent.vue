<template>
  <div class="book-order-component">
    <!-- Botón Regresar -->
    <v-btn
      variant="text"
      prepend-icon="mdi-arrow-left"
      color="#64748b"
      class="text-none font-weight-bold mb-4 px-0"
      @click="$router.push('/admin/orders')"
    >
      Regresar a Órdenes de Evaluación
    </v-btn>

    <v-card flat class="main-card elevation-0" :loading="loadingInitial">
      <!-- Header Corporativo -->
      <div class="card-header px-6 py-4 d-flex align-center justify-space-between flex-wrap gap-2">
        <div class="d-flex align-center">
          <div class="header-icon-box mr-3 flex-shrink-0">
            <v-icon icon="mdi-calendar-star" color="#ffffff" size="22"></v-icon>
          </div>
          <div>
            <h2 class="card-title text-white mb-0">Agendar Cita de Evaluación</h2>
            <span class="card-subtitle text-white opacity-80">
              Asignación directa de turno vinculada a la orden de evaluación
            </span>
          </div>
        </div>
        <v-chip
          v-if="order"
          :color="order.payment_status === 'approved' ? '#10B981' : 'rgba(255,255,255,0.2)'"
          size="small"
          class="font-weight-bold text-white"
        >
          <v-icon :icon="order.payment_status === 'approved' ? 'mdi-check-decagram' : 'mdi-clock-outline'" start size="14"></v-icon>
          {{ order.payment_status === 'approved' ? 'Pago Aprobado' : 'Pago Pendiente / En Validación' }}
        </v-chip>
      </div>

      <v-card-text class="pa-6 bg-slate-50">
        <v-form ref="form" v-model="valid" @submit.prevent="submit">

          <!-- RESUMEN DE LA ORDEN (BLOQUEADO) -->
          <div class="section-indicator d-flex align-center mb-3">
            <span class="step-badge mr-2">1</span>
            <span class="step-title">Información del Servicio (Asignación Automática)</span>
          </div>

          <v-card flat class="inner-step-card pa-5 mb-6 bg-slate-100 border">
            <v-row dense v-if="order">
              <v-col cols="12" md="4" class="mb-2 mb-md-0">
                <div class="text-caption font-weight-bold text-slate-500 mb-1">EMPRESA CLIENTE</div>
                <div class="d-flex align-center">
                  <v-icon icon="mdi-domain" size="18" color="#07254A" class="mr-2"></v-icon>
                  <span class="text-body-2 font-weight-bold text-slate-800">{{ order.client?.company_name }}</span>
                </div>
              </v-col>
              <v-col cols="12" md="4" class="mb-2 mb-md-0">
                <div class="text-caption font-weight-bold text-slate-500 mb-1">CANDIDATO / EVALUADO</div>
                <div class="d-flex align-center">
                  <v-icon icon="mdi-account-tie-outline" size="18" color="#07254A" class="mr-2"></v-icon>
                  <span class="text-body-2 font-weight-bold text-slate-800">{{ order.examinee?.full_name }}</span>
                </div>
              </v-col>
              <v-col cols="12" md="4">
                <div class="text-caption font-weight-bold text-slate-500 mb-1">EVALUACIÓN SOLICITADA</div>
                <div class="d-flex align-center">
                  <v-icon icon="mdi-clipboard-check-outline" size="18" color="#10B981" class="mr-2"></v-icon>
                  <span class="text-body-2 font-weight-bold text-slate-800">{{ order.evaluation_type?.name }}</span>
                </div>
                <div class="text-caption text-slate-500 ml-6">Modalidad: {{ order.evaluation_type?.modality }}</div>
              </v-col>
            </v-row>
            <div v-else class="text-center py-4 text-caption text-slate-500">
              Cargando información de la orden...
            </div>
          </v-card>

          <!-- SELECCIÓN DE PSICÓLOGO Y HORARIO -->
          <div class="section-indicator d-flex align-center mb-3">
            <span class="step-badge mr-2">2</span>
            <span class="step-title">Especialista y Horario de 30 Minutos</span>
          </div>

          <v-card flat class="inner-step-card pa-5 bg-white border">
            <v-row dense>
              <!-- Psicóloga -->
              <v-col cols="12" md="6" class="px-2 mb-3">
                <label class="field-label">Especialista en Psicología *</label>
                <v-select
                  v-model="form.psychologist_id"
                  :items="psychologists"
                  item-title="name"
                  item-value="id"
                  placeholder="Selecciona a la psicóloga..."
                  prepend-inner-icon="mdi-account-star-outline"
                  density="compact"
                  variant="outlined"
                  rounded="lg"
                  color="#07254A"
                  :rules="[(v) => !!v || 'Requerido']"
                  class="custom-field bg-white"
                  :disabled="!order"
                  @update:model-value="onPsychologistChange"
                ></v-select>
              </v-col>

              <!-- Fecha (Modal en Español) -->
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
                  :disabled="!form.psychologist_id"
                  :rules="[(v) => !!form.date || 'Requerido']"
                  class="custom-field bg-white cursor-pointer"
                  @click="openDateDialog"
                ></v-text-field>

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

              <!-- Turnos (30 min) a través de Pinia -->
              <v-col cols="12" class="px-2 mb-3">
                <label class="field-label">Turno Libre (Bloques de 30 min) *</label>

                <div v-if="loadingSlots" class="d-flex align-center py-2">
                  <v-progress-circular indeterminate color="#07254A" size="20" class="mr-2"></v-progress-circular>
                  <span class="text-caption text-slate-500 font-weight-medium">Consultando horarios disponibles...</span>
                </div>

                <div v-else-if="!form.psychologist_id || !form.date" class="py-2 text-caption text-slate-400 font-italic">
                  Selecciona a la psicóloga y la fecha para desplegar los turnos.
                </div>

                <div v-else-if="availableSlots.length === 0" class="py-2 d-flex align-center text-caption text-amber-700 font-weight-medium">
                  <v-icon icon="mdi-alert-circle-outline" size="16" class="mr-1"></v-icon>
                  No hay turnos disponibles para esta psicóloga en la fecha seleccionada.
                </div>

                <div v-else class="py-1">
                  <v-chip-group v-model="form.start_time" selected-class="selected-slot-chip" mandatory>
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

              <!-- Notas -->
              <v-col cols="12" class="px-2 mt-2">
                <label class="field-label">Instrucciones o Notas Administrativas (Opcional)</label>
                <v-text-field
                  v-model="form.notes"
                  placeholder="Detalles sobre el candidato, pago o prueba..."
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

          <!-- Barra Inferior -->
          <div class="d-flex align-center justify-space-between flex-wrap gap-2 mt-6 border-top pt-4">
            <span class="text-caption text-slate-500">
              Esta cita se vinculará automáticamente con la orden de evaluación seleccionada.
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
              :disabled="!form.start_time || !order"
            >
              Confirmar y Agendar Cita
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="top right" timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useAdminAppointmentsStore } from '@/store/adminAppointments';
import api from '@/services/api';

export default {
  name: 'AdminOrderBookAppointmentComponent',
  props: {
    orderId: {
      type: [String, Number],
      required: true,
    },
  },
  data() {
    return {
      order: null,
      valid: false,
      dateDialog: false,
      pickerDate: null,
      todayDate: new Date().toISOString().split('T')[0],

      loadingInitial: true,

      form: {
        psychologist_id: null,
        date: '',
        start_time: null,
        notes: '',
      },

      snackbar: { show: false, text: '', color: 'success' },
    };
  },

  computed: {
    ...mapState(useAdminAppointmentsStore, [
      'psychologists',
      'availableSlots',
      'loadingSlots',
      'booking',
    ]),

    enabledDays() {
      if (!this.form.psychologist_id || !this.psychologists.length) return [];
      const psych = this.psychologists.find((p) => p.id === this.form.psychologist_id);

      if (!psych || !psych.psychologist_schedules) return [];

      return psych.psychologist_schedules
        .filter((s) => s.is_active)
        .map((s) => Number(s.day_of_week));
    },

    formattedDisplayDate() {
      if (!this.form.date) return '';
      const [year, month, day] = this.form.date.split('-');
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
    this.fetchInitialData();
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

    async fetchInitialData() {
      this.loadingInitial = true;
      try {
        const resOrders = await api.get('/admin/evaluation-orders');
        const orders = resOrders.data?.data || resOrders.data || [];
        this.order = orders.find((o) => String(o.id) === String(this.orderId));

        if (!this.order) {
          this.notify('La orden no existe o ya no está disponible.', 'error');
          setTimeout(() => this.$router.push('/admin/orders'), 2000);
          return;
        }

        await this.fetchFormData();
      } catch (error) {
        console.error('Error cargando datos iniciales:', error);
        this.notify('Ocurrió un error al cargar la información.', 'error');
      } finally {
        this.loadingInitial = false;
      }
    },

    openDateDialog() {
      if (!this.form.psychologist_id) {
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
      this.form.date = '';
      this.form.start_time = null;
      this.pickerDate = null;
    },

    onDateSelected(val) {
      if (!val) return;
      const d = new Date(val);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');

      this.form.date = `${year}-${month}-${day}`;
      this.dateDialog = false;

      this.form.start_time = null;
      if (this.form.psychologist_id && this.form.date) {
        this.fetchSlots(this.form.psychologist_id, this.form.date);
      }
    },

    async submit() {
      const { valid } = await this.$refs.form.validate();
      if (!valid || !this.form.start_time) {
        this.notify('Selecciona un psicólogo, fecha y horario.', 'error');
        return;
      }

      const payload = {
        client_id: this.order.client_id,
        examinee_id: this.order.examinee_id,
        evaluation_type_id: this.order.evaluation_type_id,
        psychologist_id: this.form.psychologist_id,
        date: this.form.date,
        start_time: this.form.start_time,
        notes: this.form.notes || null,
      };

      const res = await this.bookAppointment(payload);

      if (res.success) {
        this.notify('¡Cita agendada exitosamente!');

        setTimeout(() => {
          this.$router.push('/admin/orders');
        }, 1500);
      } else {
        this.notify(res.message, 'error');
      }
    },
  },
};
</script>

<style scoped>
.book-order-component {
  width: 100%;
}

.main-card {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 16px !important;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05) !important;
}

.card-header,
.opaloBrand {
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

.bg-slate-50 {
  background-color: #f8fafc;
}

.bg-slate-100 {
  background-color: #f1f5f9;
}

.border-top {
  border-top: 1px solid #e2e8f0;
}

.inner-step-card {
  border-radius: 12px !important;
  border-color: #e2e8f0 !important;
}

.step-badge {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #07254A;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.step-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1e293b;
}

.field-label {
  display: block;
  font-size: 0.78rem;
  font-weight: 700;
  color: #475569;
  margin-bottom: 6px;
}

:deep(.custom-field .v-field) {
  border-radius: 8px !important;
  font-size: 0.86rem !important;
}

.time-slot-chip {
  border-color: #cbd5e1 !important;
  font-size: 0.8rem !important;
  height: 34px !important;
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
