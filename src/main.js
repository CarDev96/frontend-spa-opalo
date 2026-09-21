import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import vuetify from './plugins/Vuetify';
import './assets/main.scss';

// Forzar el atributo lang del HTML para que los componentes nativos e Intl usen español
document.documentElement.setAttribute('lang', 'es-MX');

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(vuetify);

app.mount('#app');
