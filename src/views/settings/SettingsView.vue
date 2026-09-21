<template>
  <div class="settings-view-container px-0 py-2">
    <settings-component />
  </div>
</template>

<script>
import SettingsComponent from '@/components/settings/SettingsComponent.vue';

export default {
  name: 'SettingsView',
  components: {
    SettingsComponent,
  },
};
</script>

<style scoped>
.settings-view-container {
  max-width: 1400px;
  margin: 0 auto;
}
</style>
