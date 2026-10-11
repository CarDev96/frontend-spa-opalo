import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/store/auth';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/',
    component: () => import('@/views/layout/Sidebar.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/home',
      },
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/home/HomeView.vue'),
      },
      {
        path: 'clients',
        name: 'Clients',
        meta: {
          requiresAuth: true,
          roles: ['admin', 'sales'],
          title: 'Empresas Clientes - Ópalo',
        },
        component: () => import('@/views/clients/CreateClient.vue'),
      },
      {
        path: 'users',
        name: 'Users',
        meta: {
          requiresAuth: true,
          roles: ['admin'],
          title: 'Usuarios - Ópalo',
        },
        component: () => import('@/views/users/UserView.vue'),
      },
      {
        path: 'portal/payment-methods',
        name: 'ClientPayments',
        meta: {
          requiresAuth: true,
          roles: ['client'],
          title: 'Cuentas y Pagos - Ópalo',
        },
        component: () => import('@/views/clients/ClientPaymentsView.vue'),
      },
      {
        path: 'portal/payment-receipts',
        name: 'ClientPaymentReceipts',
        meta: {
          requiresAuth: true,
          roles: ['client'],
          title: 'Comprobantes de Pago - Ópalo',
        },
        component: () => import('@/views/clients/ClientPaymentReceiptsView.vue'),
      },
      {
        path: 'admin/payment-receipts',
        name: 'AdminPaymentReceipts',
        meta: {
          requiresAuth: true,
          roles: ['admin', 'sales'],
          title: 'Validación de Pagos - Ópalo',
        },
        component: () => import('@/views/admin/payments/AdminPaymentReceiptsView.vue'),
      },

      // -------------------------------------------------------------
      // 👉 RUTA CLIENTE: MIS EVALUADOS (Con acceso al Expediente Digital)
      // -------------------------------------------------------------
      {
        path: 'portal/examinees',
        name: 'ClientExaminees',
        meta: {
          requiresAuth: true,
          roles: ['client'],
          title: 'Mis Evaluados - Ópalo',
        },
        component: () => import('@/views/clients/examinees/ExamineesView.vue'),
      },

      // -------------------------------------------------------------
      // 👉 NUEVA RUTA TRABAJO SOCIAL & ADMIN: VALIDACIÓN DE EXPEDIENTES
      // -------------------------------------------------------------
      {
        path: 'social-work/dossiers',
        name: 'DossierReview',
        meta: {
          requiresAuth: true,
          roles: ['admin', 'social_work'],
          title: 'Validación de Expedientes - Ópalo',
        },
        component: () => import('@/views/social_work/DossierReviewView.vue'),
      },

      {
        path: 'clinical/psychologists-schedules',
        name: 'PsychologistsSchedules',
        meta: {
          requiresAuth: true,
          roles: ['admin'],
          title: 'Agenda de Psicólogos - Ópalo',
        },
        component: () => import('@/views/clinical/PsychologistsScheduleView.vue'),
      },
      {
        path: 'admin/appointments',
        name: 'AdminAppointments',
        meta: {
          requiresAuth: true,
          roles: ['admin'],
          title: 'Gestión de Citas - Ópalo',
        },
        component: () => import('@/views/admin/appointments/AdminAppointmentsView.vue'),
      },
      {
        path: 'appointments',
        name: 'ClinicalAppointments',
        meta: {
          requiresAuth: true,
          roles: ['psychology', 'social_work', 'admin'],
          title: 'Citas de Evaluación - Ópalo',
        },
        component: () => import('@/views/clinical/ClinicalAppointmentsView.vue'),
      },
      {
        path: 'settings',
        name: 'Settings',
        meta: {
          requiresAuth: true,
          roles: ['admin', 'psychology', 'social_work', 'sales', 'client'],
          title: 'Configuración - Ópalo',
        },
        component: () => import('@/views/settings/SettingsView.vue'),
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/home',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;

  // 1. Si la ruta requiere autenticación y no hay sesión activa
  if (to.matched.some((record) => record.meta.requiresAuth) && !isAuthenticated) {
    return '/login';
  }

  // 2. Si ya está autenticado e intenta ir a /login
  if (to.path === '/login' && isAuthenticated) {
    return '/home';
  }

  // 3. Resolución segura del rol (string directo u objeto anidado)
  const currentRole =
    typeof authStore.user?.role === 'string'
      ? authStore.user.role
      : authStore.user?.role?.name || authStore.role;

  // 4. Validación de roles con protección de ciclo infinito
  if (to.meta.roles && Array.isArray(to.meta.roles)) {
    if (!currentRole || !to.meta.roles.includes(currentRole)) {
      if (to.path !== '/home') {
        return '/home';
      }
    }
  }

  return true;
});

export default router;
