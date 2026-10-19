<template>
  <div class="client-psychometric-tests-view pa-4">
    <ClientPsychometricTestsComponent />
  </div>
</template>

<script>
import ClientPsychometricTestsComponent from '@/components/clients/tests/ClientPsychometricTestsComponent.vue';

export default {
  name: 'ClientPsychometricTestsView',
  components: {
    ClientPsychometricTestsComponent,
  },
};
</script>

<style scoped>
.client-psychometric-tests-view {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}
</style>
