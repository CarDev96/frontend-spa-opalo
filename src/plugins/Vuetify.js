import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

// 👉 IMPORTANTE: Importar el paquete oficial de traducciones en español de Vuetify
import { es } from 'vuetify/locale';

export default createVuetify({
  components,
  directives,
  locale: {
    locale: 'es',
    fallback: 'es',
    messages: { es }, // 👈 AQUÍ: Esto resuelve las variables $vuetify.dataFooter...
  },
  date: {
    locale: {
      es: 'es-MX',
    },
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#07254A',
          secondary: '#0284C7',
          accent: '#b5a08f',
          error: '#EF4444',
          info: '#0284C7',
          success: '#10B981',
          warning: '#F59E0B',
        },
      },
    },
  },
});
