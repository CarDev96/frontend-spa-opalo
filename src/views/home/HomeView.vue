<template>
  <div class="login">
    <home-component></home-component>
  </div>
</template>

<script>
// @ is an alias to /src
import HomeComponent from '@/components/home/HomeComponent.vue'
// import SnackbarComponent from '@/components/layout/SnackbarComponent.vue'

export default {
  name: 'HomeView',
  components: {
    HomeComponent,
    // SnackbarComponent,
  }
}
</script>
