<template>
  <v-card flat class="selector-card elevation-0">
    <!-- Header Corporativo Ópalo -->
    <div class="card-table-header px-4 py-3 d-flex align-center">
      <div class="header-icon-box mr-3 flex-shrink-0">
        <v-icon icon="mdi-account-star-outline" color="#ffffff" size="18"></v-icon>
      </div>
      <div>
        <h2 class="card-title text-white mb-0">Especialistas</h2>
        <span class="card-subtitle text-white opacity-80">
          {{ psychologists.length }} registrados
        </span>
      </div>
    </div>

    <!-- Lista de Psicólogos -->
    <v-card-text class="pa-3 bg-slate-50">
      <div v-if="loading" class="text-center py-6">
        <v-progress-circular indeterminate color="#07254A" size="24"></v-progress-circular>
      </div>

      <div v-else-if="psychologists.length === 0" class="text-center py-6 text-caption text-grey">
        No hay psicólogos registrados en el sistema.
      </div>

      <div v-else class="d-flex flex-column gap-2">
        <div
          v-for="psych in psychologists"
          :key="psych.id"
          class="psych-item pa-3 rounded-lg cursor-pointer transition-all"
          :class="{ 'active-psych-item': selectedPsychologistId === psych.id }"
          @click="selectPsychologist(psych.id)"
        >
          <div class="d-flex align-center">
            <!-- Avatar -->
            <v-avatar size="34" color="#5b21b6" class="mr-3 text-white font-weight-bold text-caption flex-shrink-0">
              {{ getInitials(psych.name) }}
            </v-avatar>

            <!-- Textos y Estatus Integrado -->
            <div class="min-w-0 flex-grow-1">
              <div class="font-weight-bold text-slate-800 text-body-2 text-truncate">
                {{ psych.name }}
              </div>
              <div class="text-caption text-grey text-truncate font-mono">
                {{ psych.email }}
              </div>

              <!-- Indicador de Días Activos (debajo, sin desbordarse) -->
              <div class="mt-1 d-flex align-center">
                <span
                  class="status-dot mr-1"
                  :class="getActiveDaysCount(psych) > 0 ? 'dot-active' : 'dot-inactive'"
                ></span>
                <span
                  class="text-caption font-weight-medium"
                  :class="getActiveDaysCount(psych) > 0 ? 'text-emerald-700' : 'text-slate-400'"
                >
                  {{ getActiveDaysCount(psych) > 0 ? `${getActiveDaysCount(psych)} días de atención configurados` : 'Sin horarios asignados' }}
                </span>
              </div>
            </div>

            <!-- Flecha sutil indicadora -->
            <v-icon
              v-if="selectedPsychologistId === psych.id"
              icon="mdi-chevron-right"
              size="20"
              color="#07254A"
              class="flex-shrink-0"
            ></v-icon>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { usePsychologistSchedulesStore } from '@/store/psychologistSchedules';

export default {
  name: 'PsychologistSelectorComponent',
  computed: {
    ...mapState(usePsychologistSchedulesStore, [
      'psychologists',
      'selectedPsychologistId',
      'loading',
    ]),
  },
  methods: {
    ...mapActions(usePsychologistSchedulesStore, ['selectPsychologist']),

    getInitials(name) {
      if (!name) return 'PS';
      const parts = name.trim().split(' ');
      return parts.length > 1
        ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
        : parts[0].substring(0, 2).toUpperCase();
    },

    getActiveDaysCount(psych) {
      if (!psych.psychologist_schedules || psych.psychologist_schedules.length === 0) return 0;
      return psych.psychologist_schedules.filter((s) => s.is_active).length;
    },
  },
};
</script>

<style scoped>
.selector-card {
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
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-title {
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: -0.2px;
}

.card-subtitle {
  font-size: 0.72rem;
}

.bg-slate-50 {
  background-color: #f8fafc;
}

.psych-item {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.psych-item:hover {
  border-color: #cbd5e1;
  background-color: #f1f5f9;
}

.active-psych-item {
  background: #ffffff !important;
  border: 1.5px solid #07254A !important;
  box-shadow: 0 2px 6px rgba(7, 37, 74, 0.12) !important;
}

.cursor-pointer {
  cursor: pointer;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: inline-block;
}

.dot-active {
  background-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}

.dot-inactive {
  background-color: #94a3b8;
}

.text-emerald-700 {
  color: #047857 !important;
}

.gap-2 {
  gap: 8px;
}
</style>
