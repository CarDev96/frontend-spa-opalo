<template>
  <div class="examinees-view-container px-0 py-2">
    <!-- Formulario de Alta -->
    <create-examinee-component />

    <!-- Tabla con Buscador -->
    <examinee-list-component />
  </div>
</template>

<script>
import CreateExamineeComponent from '@/components/clients/examinees/CreateExamineeComponent.vue';
import ExamineeListComponent from '@/components/clients/examinees/ExamineeListComponent.vue';

export default {
  name: 'ExamineesView',
  components: {
    CreateExamineeComponent,
    ExamineeListComponent,
  },
};
</script>

<style scoped>
.examinees-view-container {
  max-width: 1400px;
  margin: 0 auto;
}
</style>
