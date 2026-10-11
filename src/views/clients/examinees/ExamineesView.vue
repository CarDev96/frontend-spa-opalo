<template>
  <div class="examinees-view-container px-0 py-2">
    <!-- Vista del Expediente Digital -->
    <examinee-dossier-component
      v-if="selectedExaminee"
      :examinee-id="selectedExaminee.id"
      :candidate-name="selectedExaminee.full_name"
      @back="selectedExaminee = null"
    />

    <!-- Vista habitual: Formulario de Alta y Directorio -->
    <div v-else>
      <!-- Formulario de Alta -->
      <create-examinee-component @examinee-created="onExamineeCreated" />

      <!-- Tabla con Buscador y botón de Expediente -->
      <examinee-list-component
        ref="examineeListRef"
        @open-dossier="onOpenDossier"
      />
    </div>
  </div>
</template>

<script>
import CreateExamineeComponent from '@/components/clients/examinees/CreateExamineeComponent.vue';
import ExamineeListComponent from '@/components/clients/examinees/ExamineeListComponent.vue';
import ExamineeDossierComponent from '@/components/clients/examinees/ExamineeDossierComponent.vue';

export default {
  name: 'ExamineesView',
  components: {
    CreateExamineeComponent,
    ExamineeListComponent,
    ExamineeDossierComponent,
  },
  data() {
    return {
      selectedExaminee: null,
    };
  },
  methods: {
    onExamineeCreated(newExaminee) {
      if (this.$refs.examineeListRef) {
        if (newExaminee) {
          this.$refs.examineeListRef.addExamineeToTop(newExaminee);
        } else {
          this.$refs.examineeListRef.fetchExaminees();
        }
      }
    },
    onOpenDossier(examinee) {
      this.selectedExaminee = examinee;
    },
  },
};
</script>

<style scoped>
.examinees-view-container {
  max-width: 1400px;
  margin: 0 auto;
}
</style>
