<template>
  <div class="psychology-dashboard-wrapper">
    <!-- Header Operativo de Evaluación -->
    <div class="welcome-header mb-5">
      <div class="d-flex align-center gap-2 mb-1">
        <v-chip color="#07254A" variant="flat" size="x-small" class="font-weight-bold text-uppercase text-white">
          <v-icon icon="mdi-shield-check" start size="12"></v-icon>
          Evaluación y Confianza
        </v-chip>
        <span class="text-caption text-slate-400">•</span>
        <span class="text-caption text-slate-500 font-weight-medium">Área de Psicología</span>
      </div>
      <h1 class="dashboard-title text-slate-900 mb-1">Panel de Evaluaciones y Entrevistas</h1>
      <p class="dashboard-subtitle text-slate-500 mb-0">
        Control de candidatos programados, seguimiento a pruebas psicométricas y contacto directo con evaluados.
      </p>
    </div>

    <!-- 1. Tarjetas de Métricas con Color y Estilo Moderno -->
    <dashboard-metrics-cards-component />

    <!-- 2. Próxima Entrevista y Lista del Día -->
    <today-sessions-overview-component />
  </div>
</template>

<script>
import { mapActions } from 'pinia';
import { useClinicalDashboardStore } from '@/store/clinicalDashboard';
import DashboardMetricsCardsComponent from '@/components/clinical/dashboard/DashboardMetricsCardsComponent.vue';
import TodaySessionsOverviewComponent from '@/components/clinical/dashboard/TodaySessionsOverviewComponent.vue';

export default {
  name: 'PsychologyDashboardComponent',
  components: {
    DashboardMetricsCardsComponent,
    TodaySessionsOverviewComponent,
  },
  mounted() {
    this.fetchDashboardData();
  },
  methods: {
    ...mapActions(useClinicalDashboardStore, ['fetchDashboardData']),
  },
};
</script>

<style scoped>
.dashboard-title {
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: -0.4px;
  line-height: 1.2;
}

.dashboard-subtitle {
  font-size: 0.82rem;
  font-weight: 400;
}

.gap-2 {
  gap: 8px;
}
</style>
