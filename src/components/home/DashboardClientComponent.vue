<template>
  <div class="client-dashboard-wrapper">
    <!-- ========================================================================= -->
    <!-- 1. BANNER CORPORATIVO DE BIENVENIDA                                       -->
    <!-- ========================================================================= -->
    <v-card flat class="welcome-card elevation-0 mb-6">
      <div class="card-header px-6 py-5 d-flex flex-wrap align-center justify-space-between text-white gap-3">
        <div class="d-flex align-center">
          <div class="header-icon-box mr-4 flex-shrink-0">
            <v-icon icon="mdi-shield-check-outline" color="#ffffff" size="26"></v-icon>
          </div>
          <div>
            <h2 class="card-title text-white mb-1">
              Portal Empresarial • GCD Ópalo Certificaciones
            </h2>
            <span class="card-subtitle text-white opacity-80">
              Monitoreo en tiempo real del avance de tus candidatos, órdenes y resultados
            </span>
          </div>
        </div>

        <div class="d-flex align-center gap-2 flex-wrap">
          <v-btn
            variant="flat"
            color="#ffffff"
            rounded="lg"
            size="small"
            prepend-icon="mdi-account-plus-outline"
            class="text-none font-weight-bold action-btn"
            @click="$router.push('/portal/examinees')"
          >
            Registrar Evaluado
          </v-btn>

          <v-btn
            variant="flat"
            color="rgba(255,255,255,0.16)"
            rounded="lg"
            size="small"
            prepend-icon="mdi-receipt-text-plus-outline"
            class="text-none font-weight-bold text-white"
            @click="$router.push('/portal/orders')"
          >
            Generar Orden
          </v-btn>
        </div>
      </div>
    </v-card>

    <!-- ========================================================================= -->
    <!-- 2. ESTADÍSTICAS DEL FLUJO DE EVALUACIÓN (KPIs EN TIEMPO REAL)             -->
    <!-- ========================================================================= -->
    <v-row dense class="mb-6">
      <!-- KPI 1: Perfil Creado -->
      <v-col cols="12" sm="6" md="4" lg class="pa-2">
        <v-card
          flat
          class="kpi-card pa-4 cursor-pointer h-100"
          :class="{ 'kpi-selected': selectedStage === 'pending' }"
          @click="toggleFilter('pending')"
        >
          <div class="d-flex align-center justify-space-between mb-2">
            <span class="kpi-step-tag">ETAPA 1</span>
            <div class="kpi-icon bg-slate-100">
              <v-icon icon="mdi-account-check-outline" color="#475569" size="20"></v-icon>
            </div>
          </div>
          <div class="kpi-count text-slate-800">{{ stats.pending }}</div>
          <div class="kpi-title">Perfil Creado</div>
          <div class="kpi-desc">Pendientes de orden</div>
        </v-card>
      </v-col>

      <!-- KPI 2: Orden Generada -->
      <v-col cols="12" sm="6" md="4" lg class="pa-2">
        <v-card
          flat
          class="kpi-card pa-4 cursor-pointer h-100"
          :class="{ 'kpi-selected-indigo': selectedStage === 'order_created' }"
          @click="toggleFilter('order_created')"
        >
          <div class="d-flex align-center justify-space-between mb-2">
            <span class="kpi-step-tag tag-indigo">ETAPA 2</span>
            <div class="kpi-icon bg-indigo-50">
              <v-icon icon="mdi-file-document-check-outline" color="#4F46E5" size="20"></v-icon>
            </div>
          </div>
          <div class="kpi-count text-indigo-600">{{ stats.order_created }}</div>
          <div class="kpi-title">Orden Generada</div>
          <div class="kpi-desc">En proceso de agenda</div>
        </v-card>
      </v-col>

      <!-- KPI 3: Cita Agendada -->
      <v-col cols="12" sm="6" md="4" lg class="pa-2">
        <v-card
          flat
          class="kpi-card pa-4 cursor-pointer h-100"
          :class="{ 'kpi-selected-blue': selectedStage === 'scheduled' }"
          @click="toggleFilter('scheduled')"
        >
          <div class="d-flex align-center justify-space-between mb-2">
            <span class="kpi-step-tag tag-blue">ETAPA 3</span>
            <div class="kpi-icon bg-blue-50">
              <v-icon icon="mdi-calendar-clock" color="#2563EB" size="20"></v-icon>
            </div>
          </div>
          <div class="kpi-count text-blue-600">{{ stats.scheduled }}</div>
          <div class="kpi-title">Cita Agendada</div>
          <div class="kpi-desc">Turno asignado</div>
        </v-card>
      </v-col>

      <!-- KPI 4: Atendida / En espera de resultados / Terminada -->
      <v-col cols="12" sm="6" md="6" lg class="pa-2">
        <v-card
          flat
          class="kpi-card pa-4 cursor-pointer h-100"
          :class="{ 'kpi-selected-emerald': selectedStage === 'awaiting_results' }"
          @click="toggleFilter('awaiting_results')"
        >
          <div class="d-flex align-center justify-space-between mb-2">
            <span class="kpi-step-tag tag-emerald">ETAPA 4</span>
            <div class="kpi-icon bg-emerald-50">
              <v-icon icon="mdi-hourglass-split" color="#059669" size="20"></v-icon>
            </div>
          </div>
          <div class="kpi-count text-emerald-600">{{ stats.awaiting_results }}</div>
          <div class="kpi-title">En Resultados / Terminadas</div>
          <div class="kpi-desc">Sesión atendida</div>
        </v-card>
      </v-col>

      <!-- KPI 5: Canceladas / No se presentó -->
      <v-col cols="12" sm="6" md="6" lg class="pa-2">
        <v-card
          flat
          class="kpi-card pa-4 cursor-pointer h-100"
          :class="{ 'kpi-selected-red': selectedStage === 'incidents' }"
          @click="toggleFilter('incidents')"
        >
          <div class="d-flex align-center justify-space-between mb-2">
            <span class="kpi-step-tag tag-red">INCIDENCIAS</span>
            <div class="kpi-icon bg-red-50">
              <v-icon icon="mdi-alert-circle-outline" color="#DC2626" size="20"></v-icon>
            </div>
          </div>
          <div class="kpi-count text-red-600">{{ stats.incidents }}</div>
          <div class="kpi-title">Cancelada / Ausente</div>
          <div class="kpi-desc">Requiere reprogramación</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- ========================================================================= -->
    <!-- 3. MONITOR DE FLUJO POR EVALUADO (STEPPER VISUAL)                         -->
    <!-- ========================================================================= -->
    <v-card flat class="guide-card elevation-0 mb-6">
      <div class="px-6 py-4 bg-slate-50 border-bottom d-flex flex-wrap align-center justify-space-between gap-3">
        <div class="d-flex align-center">
          <div class="section-icon-box mr-3">
            <v-icon icon="mdi-timeline-check-outline" color="#07254A" size="20"></v-icon>
          </div>
          <div>
            <h3 class="text-subtitle-1 font-weight-bold text-slate-900 mb-0">
              Avance del Proceso por Evaluado
            </h3>
            <span class="text-caption text-slate-500">
              Seguimiento paso a paso desde el registro hasta la entrega de dictamen
            </span>
          </div>
        </div>

        <div class="d-flex align-center gap-2">
          <v-chip
            v-if="selectedStage !== 'all'"
            closable
            size="small"
            color="#07254A"
            variant="flat"
            class="text-white font-weight-bold"
            @click:close="selectedStage = 'all'"
          >
            Filtro activo
          </v-chip>

          <v-btn
            variant="outlined"
            size="small"
            color="#07254A"
            rounded="lg"
            prepend-icon="mdi-refresh"
            class="text-none font-weight-bold"
            :loading="loading"
            @click="fetchExaminees"
          >
            Actualizar
          </v-btn>
        </div>
      </div>

      <v-card-text class="pa-0">
        <v-data-table
          :headers="headers"
          :items="filteredExaminees"
          :loading="loading"
          hover
          density="comfortable"
          no-data-text="Aún no tienes evaluados registrados en esta etapa"
          items-per-page-text="Evaluados por página:"
        >
          <template v-slot:item="{ item }">
            <tr class="table-row">
              <!-- Candidato -->
              <td class="py-3">
                <div class="d-flex align-center">
                  <v-avatar size="36" color="#EFF6FF" class="mr-3 flex-shrink-0 border-avatar">
                    <span class="text-caption font-weight-bold text-primary">
                      {{ getInitials(item.full_name) }}
                    </span>
                  </v-avatar>
                  <div>
                    <div class="font-weight-bold text-slate-900 text-body-2">{{ item.full_name }}</div>
                    <div class="text-caption text-slate-500 font-mono">
                      {{ item.position || 'Candidato' }} • {{ item.curp || 'SIN CURP' }}
                    </div>
                  </div>
                </div>
              </td>

              <!-- Línea de Progreso Visual (Stepper de 4 pasos) -->
              <td class="py-3" style="min-width: 340px;">
                <div class="flow-stepper d-flex align-center">
                  <div class="flow-node" :class="getStepState(item.status, 1)">
                    <v-icon :icon="getStepIcon(item.status, 1)" size="14"></v-icon>
                    <span>Perfil</span>
                  </div>
                  <div class="flow-line" :class="{ 'line-done': getStepNumber(item.status) >= 2 }"></div>

                  <div class="flow-node" :class="getStepState(item.status, 2)">
                    <v-icon :icon="getStepIcon(item.status, 2)" size="14"></v-icon>
                    <span>Orden</span>
                  </div>
                  <div class="flow-line" :class="{ 'line-done': getStepNumber(item.status) >= 3 }"></div>

                  <div class="flow-node" :class="getStepState(item.status, 3)">
                    <v-icon :icon="getStepIcon(item.status, 3)" size="14"></v-icon>
                    <span>Cita</span>
                  </div>
                  <div class="flow-line" :class="{ 'line-done': getStepNumber(item.status) >= 4 }"></div>

                  <div class="flow-node" :class="getStepState(item.status, 4)">
                    <v-icon :icon="getStepIcon(item.status, 4)" size="14"></v-icon>
                    <span>Resultados</span>
                  </div>
                </div>
              </td>

              <!-- Estatus Actual -->
              <td class="text-center py-3">
                <v-chip
                  size="small"
                  :color="getStatusBadge(item.status).color"
                  variant="tonal"
                  class="font-weight-bold px-3"
                >
                  <v-icon :icon="getStatusBadge(item.status).icon" start size="14"></v-icon>
                  {{ getStatusBadge(item.status).label }}
                </v-chip>
              </td>

              <!-- Acción Rápida -->
              <td class="text-end pr-5 py-3">
                <v-btn
                  v-if="['pending', 'registered', null].includes(item.status)"
                  size="small"
                  variant="flat"
                  color="#07254A"
                  rounded="lg"
                  prepend-icon="mdi-file-document-plus-outline"
                  class="text-none font-weight-bold text-white"
                  @click="$router.push('/portal/orders')"
                >
                  Generar Orden
                </v-btn>

                <v-btn
                  v-else
                  size="small"
                  variant="text"
                  color="#07254A"
                  rounded="lg"
                  append-icon="mdi-arrow-right"
                  class="text-none font-weight-bold"
                  @click="$router.push('/portal/examinees')"
                >
                  Ver Expediente
                </v-btn>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- ========================================================================= -->
    <!-- 4. PASOS RÁPIDOS RECOMENDADOS Y POLÍTICAS DE SERVICIO                     -->
    <!-- ========================================================================= -->
    <v-card flat class="guide-card elevation-0">
      <div class="px-6 py-4 bg-slate-50 border-bottom d-flex align-center">
        <div class="section-icon-box mr-3">
          <v-icon icon="mdi-compass-outline" color="#07254A" size="20"></v-icon>
        </div>
        <div>
          <h3 class="text-subtitle-1 font-weight-bold text-slate-900 mb-0">
            Pasos Rápidos Recomendados
          </h3>
          <span class="text-caption text-slate-500">
            Guía operativa para gestionar tus evaluaciones de control de confianza
          </span>
        </div>
      </div>

      <div class="pa-5 bg-slate-50">
        <v-row dense>
          <!-- Paso 1 -->
          <v-col cols="12" sm="6" md="3" class="pa-2">
            <div
              class="step-card pa-4 bg-white rounded-xl h-100 d-flex flex-column justify-space-between cursor-pointer"
              @click="$router.push('/portal/examinees')"
            >
              <div>
                <div class="d-flex align-center justify-space-between mb-3">
                  <span class="step-badge">1</span>
                  <v-icon icon="mdi-account-tie-outline" color="#07254A" size="22"></v-icon>
                </div>
                <h4 class="text-subtitle-2 font-weight-bold text-slate-900 mb-1">
                  Registrar Evaluado
                </h4>
                <p class="text-caption text-slate-600 mb-0">
                  Da de alta los datos generales del candidato y carga su documentación requerida en el expediente.
                </p>
              </div>
              <span class="text-caption text-primary font-weight-bold mt-3 d-inline-flex align-center">
                Ir a Mis Evaluados <v-icon icon="mdi-arrow-right" size="14" class="ml-1"></v-icon>
              </span>
            </div>
          </v-col>

          <!-- Paso 2 -->
          <v-col cols="12" sm="6" md="3" class="pa-2">
            <div
              class="step-card pa-4 bg-white rounded-xl h-100 d-flex flex-column justify-space-between cursor-pointer"
              @click="$router.push('/portal/psychometric-tests')"
            >
              <div>
                <div class="d-flex align-center justify-space-between mb-3">
                  <span class="step-badge">2</span>
                  <v-icon icon="mdi-file-document-multiple-outline" color="#07254A" size="22"></v-icon>
                </div>
                <h4 class="text-subtitle-2 font-weight-bold text-slate-900 mb-1">
                  Pruebas Psicométricas
                </h4>
                <p class="text-caption text-slate-600 mb-0">
                  Descarga los cuadernillos aplicables y sube las hojas de respuesta contestadas por el candidato.
                </p>
              </div>
              <span class="text-caption text-primary font-weight-bold mt-3 d-inline-flex align-center">
                Ir a Psicometría <v-icon icon="mdi-arrow-right" size="14" class="ml-1"></v-icon>
              </span>
            </div>
          </v-col>

          <!-- Paso 3 -->
          <v-col cols="12" sm="6" md="3" class="pa-2">
            <div
              class="step-card pa-4 bg-white rounded-xl h-100 d-flex flex-column justify-space-between cursor-pointer"
              @click="$router.push('/portal/orders')"
            >
              <div>
                <div class="d-flex align-center justify-space-between mb-3">
                  <span class="step-badge">3</span>
                  <v-icon icon="mdi-cash-plus" color="#07254A" size="22"></v-icon>
                </div>
                <h4 class="text-subtitle-2 font-weight-bold text-slate-900 mb-1">
                  Generar Orden y Pago
                </h4>
                <p class="text-caption text-slate-600 mb-0">
                  Selecciona al evaluado, cotiza el servicio con IVA y adjunta tu comprobante de transferencia.
                </p>
              </div>
              <span class="text-caption text-primary font-weight-bold mt-3 d-inline-flex align-center">
                Generar Orden <v-icon icon="mdi-arrow-right" size="14" class="ml-1"></v-icon>
              </span>
            </div>
          </v-col>

          <!-- Paso 4 -->
          <v-col cols="12" sm="6" md="3" class="pa-2">
            <div
              class="step-card pa-4 bg-white rounded-xl h-100 d-flex flex-column justify-space-between cursor-pointer"
              @click="$router.push('/portal/fiscal-data')"
            >
              <div>
                <div class="d-flex align-center justify-space-between mb-3">
                  <span class="step-badge">4</span>
                  <v-icon icon="mdi-shield-star-outline" color="#059669" size="22"></v-icon>
                </div>
                <h4 class="text-subtitle-2 font-weight-bold text-slate-900 mb-1">
                  Agenda y Dictamen
                </h4>
                <p class="text-caption text-slate-600 mb-0">
                  Nuestro equipo asigna la cita con el especialista y emite el dictamen oficial de evaluación.
                </p>
              </div>
              <span class="text-caption text-success font-weight-bold mt-3 align-self-start">
                Validación Administrativa
              </span>
            </div>
          </v-col>
        </v-row>
      </div>

      <!-- POLÍTICAS Y TIEMPOS DE SERVICIO -->
      <div class="pa-5 bg-white border-top">
        <v-row dense align="center">
          <v-col cols="12" md="7">
            <div class="d-flex align-start mb-2">
              <v-icon icon="mdi-clock-outline" color="#07254A" size="20" class="mr-2 mt-1"></v-icon>
              <div>
                <span class="text-body-2 font-weight-bold text-slate-800">
                  Tiempos de Entrega de Resultados
                </span>
                <p class="text-caption text-slate-600 mb-0">
                  Entrega en <strong>5 días hábiles</strong> • Pruebas de polígrafo en <strong>3 días hábiles</strong>.
                </p>
              </div>
            </div>

            <div class="d-flex align-start">
              <v-icon icon="mdi-card-account-details-outline" color="#07254A" size="20" class="mr-2 mt-1"></v-icon>
              <div>
                <span class="text-body-2 font-weight-bold text-slate-800">
                  Acreditación del Evaluado
                </span>
                <p class="text-caption text-slate-600 mb-0">
                  Al finalizar el proceso satisfactoriamente se entrega la credencial oficial del evaluado.
                </p>
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="5">
            <v-alert
              density="comfortable"
              type="warning"
              variant="tonal"
              class="mb-0 text-caption rounded-xl border"
            >
              <div class="font-weight-bold mb-1">Políticas de Pago:</div>
              El pago de la certificación no es transferible para otro evaluado. No hay reembolso bajo ninguna circunstancia.
            </v-alert>
          </v-col>
        </v-row>
      </div>
    </v-card>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'DashboardClientComponent',
  data() {
    return {
      examinees: [],
      loading: false,
      selectedStage: 'all',
      headers: [
        { title: 'Candidato / Evaluado', key: 'full_name', align: 'start' },
        { title: 'Progreso de Certificación', key: 'status', align: 'start', sortable: false },
        { title: 'Estatus Actual', key: 'status_badge', align: 'center', sortable: false },
        { title: 'Acción', key: 'actions', align: 'end', sortable: false },
      ],
    };
  },

  computed: {
    stats() {
      const list = this.examinees;
      return {
        pending: list.filter((e) => ['pending', 'registered', null].includes(e.status)).length,
        order_created: list.filter((e) => e.status === 'order_created').length,
        scheduled: list.filter((e) => e.status === 'scheduled').length,
        awaiting_results: list.filter((e) => ['awaiting_results', 'attended', 'completed'].includes(e.status)).length,
        incidents: list.filter((e) => ['cancelled', 'no_show'].includes(e.status)).length,
      };
    },

    filteredExaminees() {
      if (this.selectedStage === 'all') return this.examinees;
      if (this.selectedStage === 'pending') {
        return this.examinees.filter((e) => ['pending', 'registered', null].includes(e.status));
      }
      if (this.selectedStage === 'awaiting_results') {
        return this.examinees.filter((e) => ['awaiting_results', 'attended', 'completed'].includes(e.status));
      }
      if (this.selectedStage === 'incidents') {
        return this.examinees.filter((e) => ['cancelled', 'no_show'].includes(e.status));
      }
      return this.examinees.filter((e) => e.status === this.selectedStage);
    },
  },

  mounted() {
    this.fetchExaminees();
  },

  methods: {
    toggleFilter(stage) {
      this.selectedStage = this.selectedStage === stage ? 'all' : stage;
    },

    getInitials(name) {
      if (!name) return 'OP';
      const parts = name.trim().split(/\s+/);
      return parts.length > 1
        ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
        : parts[0].substring(0, 2).toUpperCase();
    },

    async fetchExaminees() {
      this.loading = true;
      try {
        const res = await api.get('/portal/examinees');
        const data = res.data?.data || res.data || [];
        this.examinees = Array.isArray(data) ? data : [];
      } catch (e) {
        console.error('Error cargando estadisticas de evaluados:', e);
      } finally {
        this.loading = false;
      }
    },

    getStepNumber(status) {
      if (['awaiting_results', 'attended', 'completed'].includes(status)) return 4;
      if (['scheduled', 'cancelled', 'no_show'].includes(status)) return 3;
      if (status === 'order_created') return 2;
      return 1;
    },

    getStepState(status, step) {
      const current = this.getStepNumber(status);
      if (step === 3 && ['cancelled', 'no_show'].includes(status)) {
        return 'node-error';
      }
      if (step < current) return 'node-done';
      if (step === current) return 'node-current';
      return 'node-pending';
    },

    getStepIcon(status, step) {
      const state = this.getStepState(status, step);
      if (state === 'node-error') return 'mdi-close-circle';
      if (state === 'node-done') return 'mdi-check-circle';
      if (state === 'node-current') return 'mdi-record-circle';
      return 'mdi-circle-outline';
    },

    getStatusBadge(status) {
      const map = {
        pending: { label: 'Perfil Creado', color: '#475569', icon: 'mdi-account-check-outline' },
        registered: { label: 'Perfil Creado', color: '#475569', icon: 'mdi-account-check-outline' },
        order_created: { label: 'Orden Generada', color: '#4F46E5', icon: 'mdi-file-document-check-outline' },
        scheduled: { label: 'Cita Agendada', color: '#2563EB', icon: 'mdi-calendar-clock' },
        awaiting_results: { label: 'Atendida • En espera de resultados', color: '#059669', icon: 'mdi-timer-sand' },
        attended: { label: 'Atendida • En espera de resultados', color: '#059669', icon: 'mdi-timer-sand' },
        completed: { label: 'Evaluación Terminada', color: '#047857', icon: 'mdi-check-decagram' },
        cancelled: { label: 'Cita Cancelada', color: '#DC2626', icon: 'mdi-calendar-remove' },
        no_show: { label: 'No se presentó', color: '#D97706', icon: 'mdi-account-alert-outline' },
      };
      return map[status] || map.pending;
    },
  },
};
</script>

<style scoped>
.welcome-card,
.guide-card {
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
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-icon-box {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background-color: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.3px;
}

.card-subtitle {
  font-size: 0.85rem;
}

.action-btn {
  color: #07254A !important;
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
  box-shadow: 0 6px 14px rgba(7, 37, 74, 0.06) !important;
}

.kpi-selected { border-color: #475569 !important; background: #f8fafc !important; }
.kpi-selected-indigo { border-color: #4F46E5 !important; background: #eef2ff !important; }
.kpi-selected-blue { border-color: #2563EB !important; background: #eff6ff !important; }
.kpi-selected-emerald { border-color: #059669 !important; background: #ecfdf5 !important; }
.kpi-selected-red { border-color: #DC2626 !important; background: #fef2f2 !important; }

.kpi-step-tag {
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  padding: 2px 7px;
  border-radius: 6px;
  background: #f1f5f9;
  color: #475569;
}

.tag-indigo { background: #e0e7ff; color: #4338ca; }
.tag-blue { background: #dbeafe; color: #1d4ed8; }
.tag-emerald { background: #d1fae5; color: #047857; }
.tag-red { background: #fee2e2; color: #b91c1c; }

.kpi-icon {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-slate-100 { background: #f1f5f9; }
.bg-indigo-50 { background: #eef2ff; }
.bg-blue-50 { background: #eff6ff; }
.bg-emerald-50 { background: #ecfdf5; }
.bg-red-50 { background: #fef2f2; }

.kpi-count {
  font-size: 1.65rem;
  font-weight: 800;
  line-height: 1.15;
}

.kpi-title {
  font-size: 0.84rem;
  font-weight: 700;
  color: #1e293b;
  margin-top: 2px;
}

.kpi-desc {
  font-size: 0.72rem;
  color: #64748b;
}

/* Flow Stepper inside Table */
.flow-stepper {
  gap: 4px;
}

.flow-node {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 20px;
  white-space: nowrap;
}

.node-done {
  background-color: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
}

.node-current {
  background-color: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #93c5fd;
}

.node-error {
  background-color: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.node-pending {
  background-color: #f8fafc;
  color: #94a3b8;
  border: 1px solid #e2e8f0;
}

.flow-line {
  width: 16px;
  height: 2px;
  background-color: #e2e8f0;
  flex-shrink: 0;
}

.line-done {
  background-color: #10B981;
}

/* Pasos Rápidos Recomendados */
.step-card {
  border: 1px solid #e2e8f0;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.step-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.08);
}

.step-badge {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background-color: #07254A;
  color: #ffffff;
  font-size: 0.78rem;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.bg-slate-50 { background-color: #f8fafc; }
.border-bottom { border-bottom: 1px solid #e2e8f0; }
.border-top { border-top: 1px solid #e2e8f0; }
.border-avatar { border: 1px solid #dbeafe; }
.cursor-pointer { cursor: pointer; }
.font-mono { font-family: monospace; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
</style>
