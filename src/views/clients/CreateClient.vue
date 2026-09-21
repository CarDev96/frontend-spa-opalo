<template>
  <div class="create-client">
    <create-client-component></create-client-component>
    <client-list-component></client-list-component>
  </div>
</template>

<script>
// @ is an alias to /src
import CreateClientComponent from '@/components/clients/CreateClientComponent.vue'
import ClientListComponent from '@/components/clients/ClientListComponent.vue'
// import SnackbarComponent from '@/components/layout/SnackbarComponent.vue'

export default {
  name: 'CreateClient',
  components: {
    CreateClientComponent,
		ClientListComponent,
  }
}
</script>
