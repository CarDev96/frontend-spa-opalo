<template>
  <div class="schedules-view-container px-0 py-2">
    <v-row dense>
      <!-- Panel Izquierdo: Lista de Psicólogos -->
      <v-col cols="12" md="4" class="pr-md-2">
        <psychologist-selector-component />
      </v-col>

      <!-- Panel Derecho: Matriz Semanal de Horarios -->
      <v-col cols="12" md="8" class="pl-md-2">
        <weekly-schedule-config-component />
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapActions } from 'pinia';
import { usePsychologistSchedulesStore } from '@/store/psychologistSchedules';
import PsychologistSelectorComponent from '@/components/clinical/PsychologistSelectorComponent.vue';
import WeeklyScheduleConfigComponent from '@/components/clinical/WeeklyScheduleConfigComponent.vue';

export default {
  name: 'PsychologistsScheduleView',
  components: {
    PsychologistSelectorComponent,
    WeeklyScheduleConfigComponent,
  },
  methods: {
    ...mapActions(usePsychologistSchedulesStore, ['fetchPsychologists']),
  },
  mounted() {
    this.fetchPsychologists();
  },
};
</script>

<style scoped>
.schedules-view-container {
  max-width: 1400px;
  margin: 0 auto;
}
</style>
