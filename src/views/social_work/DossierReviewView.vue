<template>
  <div class="dossier-review-view-container px-0 py-2">
    <!-- Componente de Auditoría y Validación de Expedientes -->
    <dossier-review-component />
  </div>
</template>

<script>
import DossierReviewComponent from '@/components/social_work/DossierReviewComponent.vue';

export default {
  name: 'DossierReviewView',
  components: {
    DossierReviewComponent,
  },
};
</script>

<style scoped>
.dossier-review-view-container {
  max-width: 1400px;
  margin: 0 auto;
}
</style>
