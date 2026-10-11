<template>
  <div class="metrics-grid mb-5">
    <v-row dense>
      <!-- 1. Entrevistas para Hoy (Cyan / Sky) -->
      <v-col cols="12" sm="6" md="3">
        <v-card flat class="stat-card stat-today pa-4 elevation-0">
          <div class="stat-badge-glow bg-sky-glow"></div>
          <div class="d-flex align-center justify-space-between mb-3">
            <span class="stat-label text-sky-800">Citas para Hoy</span>
            <div class="stat-icon-box bg-sky-100 text-sky-700">
              <v-icon icon="mdi-calendar-today" size="18"></v-icon>
            </div>
          </div>
          <div class="d-flex align-baseline justify-space-between">
            <div class="stat-number text-slate-900">{{ metrics.today_total }}</div>
            <v-chip size="x-small" color="#0284C7" variant="flat" class="font-weight-bold text-white">
              {{ metrics.today_pending }} por atender
            </v-chip>
          </div>
        </v-card>
      </v-col>

      <!-- 2. Esta Semana (Azul Ópalo Corporativo) -->
      <v-col cols="12" sm="6" md="3">
        <v-card flat class="stat-card stat-week pa-4 elevation-0">
          <div class="stat-badge-glow bg-navy-glow"></div>
          <div class="d-flex align-center justify-space-between mb-3">
            <span class="stat-label text-slate-700">Esta Semana</span>
            <div class="stat-icon-box bg-navy-100 text-opalo">
              <v-icon icon="mdi-calendar-range" size="18"></v-icon>
            </div>
          </div>
          <div class="d-flex align-baseline justify-space-between">
            <div class="stat-number text-slate-900">{{ metrics.week_total }}</div>
            <span class="stat-helper text-slate-500 font-weight-medium">programadas</span>
          </div>
        </v-card>
      </v-col>

      <!-- 3. Evaluaciones Concluidas (Esmeralda) -->
      <v-col cols="12" sm="6" md="3">
        <v-card flat class="stat-card stat-done pa-4 elevation-0">
          <div class="stat-badge-glow bg-emerald-glow"></div>
          <div class="d-flex align-center justify-space-between mb-3">
            <span class="stat-label text-emerald-800">Entrevistas Realizadas</span>
            <div class="stat-icon-box bg-emerald-100 text-emerald-700">
              <v-icon icon="mdi-account-check-outline" size="18"></v-icon>
            </div>
          </div>
          <div class="d-flex align-baseline justify-space-between">
            <div class="stat-number text-slate-900">{{ metrics.total_attended }}</div>
            <v-chip size="x-small" color="#10B981" variant="flat" class="font-weight-bold text-white">
              completadas
            </v-chip>
          </div>
        </v-card>
      </v-col>

      <!-- 4. Candidatos en Historial (Violeta / Púrpura) -->
      <v-col cols="12" sm="6" md="3">
        <v-card flat class="stat-card stat-candidates pa-4 elevation-0">
          <div class="stat-badge-glow bg-purple-glow"></div>
          <div class="d-flex align-center justify-space-between mb-3">
            <span class="stat-label text-purple-800">Candidatos Asignados</span>
            <div class="stat-icon-box bg-purple-100 text-purple-700">
              <v-icon icon="mdi-account-group-outline" size="18"></v-icon>
            </div>
          </div>
          <div class="d-flex align-baseline justify-space-between">
            <div class="stat-number text-slate-900">{{ metrics.total_examinees }}</div>
            <span class="stat-helper text-slate-500 font-weight-medium">en expediente</span>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapState } from 'pinia';
import { useClinicalDashboardStore } from '@/store/clinicalDashboard';

export default {
  name: 'DashboardMetricsCardsComponent',
  computed: {
    ...mapState(useClinicalDashboardStore, ['metrics', 'loading']),
  },
};
</script>

<style scoped>
.stat-card {
  position: relative;
  background: #ffffff !important;
  border-radius: 14px !important;
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04) !important;
  overflow: hidden;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px -2px rgba(0, 0, 0, 0.08) !important;
}

/* Bordes superiores de acento de color */
.stat-today {
  border-top: 4px solid #0284C7 !important;
  background: linear-gradient(180deg, rgba(2, 132, 199, 0.03) 0%, #ffffff 100%) !important;
}

.stat-week {
  border-top: 4px solid #07254A !important;
  background: linear-gradient(180deg, rgba(7, 37, 74, 0.03) 0%, #ffffff 100%) !important;
}

.stat-done {
  border-top: 4px solid #10B981 !important;
  background: linear-gradient(180deg, rgba(16, 185, 129, 0.03) 0%, #ffffff 100%) !important;
}

.stat-candidates {
  border-top: 4px solid #7c3aed !important;
  background: linear-gradient(180deg, rgba(124, 58, 237, 0.03) 0%, #ffffff 100%) !important;
}

.stat-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.stat-number {
  font-size: 1.65rem;
  font-weight: 800;
  letter-spacing: -0.5px;
  line-height: 1;
}

.stat-helper {
  font-size: 0.75rem;
}

.stat-icon-box {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Colores de iconos y cajas */
.bg-sky-100 { background-color: #e0f2fe; }
.text-sky-700 { color: #0369a1; }
.text-sky-800 { color: #075985; }

.bg-navy-100 { background-color: #e2e8f0; }
.text-opalo { color: #07254A; }

.bg-emerald-100 { background-color: #d1fae5; }
.text-emerald-700 { color: #047857; }
.text-emerald-800 { color: #065f46; }

.bg-purple-100 { background-color: #ede9fe; }
.text-purple-700 { color: #6d28d9; }
.text-purple-800 { color: #5b21b6; }
</style>
