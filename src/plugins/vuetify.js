import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';
import { createVuetify } from 'vuetify';

export default createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#07254A',       // Azul Marino Profundo
          secondary: '#140032',     // Púrpura Profundo
          opaloBrand: '#07254A',
          surface: '#ffffff',
          background: '#f8fafc',
        },
      },
    },
  },
});
