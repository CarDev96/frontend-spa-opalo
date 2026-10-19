<template>
  <div class="tests-catalog-view-container pa-4">
    <AdminTestsCatalogComponent />
  </div>
</template>

<script>
import AdminTestsCatalogComponent from '@/components/admin/tests/AdminTestsCatalogComponent.vue';

export default {
  name: 'AdminTestsCatalogView',
  components: {
    AdminTestsCatalogComponent,
  },
};
</script>

<style scoped>
.tests-catalog-view-container {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}
</style>
