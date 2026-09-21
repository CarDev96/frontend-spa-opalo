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
						roles: ['admin', 'sales'] // 👈 Solo administración y ventas pueden entrar aquí
					},
				component: () => import('@/views/clients/CreateClient.vue'),
			},
			{
				path: 'users',
				name: 'Users',
				meta: {
						requiresAuth: true,
						roles: ['admin'] // 👈 Solo administración puede entrar aquí
					},
				component: () => import('@/views/users/UserView.vue'),
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

router.beforeEach((to, from, next) => {
  const auth = useAuthStore();

  // 1. Si la ruta requiere autenticación y no hay sesión iniciada
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next({ name: 'Login', query: { redirect: to.fullPath } });
  }

  // 2. Si el usuario ya está autenticado e intenta ir al Login
  if (to.meta.guestOnly && auth.isAuthenticated) {
    return next({ path: auth.user?.default_route || '/home' });
  }

  // 3. Validación de Roles por URL
  if (to.meta.roles && to.meta.roles.length > 0) {
    const userRole = auth.user?.role; // ej. 'client', 'admin'

    if (!to.meta.roles.includes(userRole)) {
      // No tiene permiso: lo redirigimos a su ruta por defecto (/home o su default_route)
      return next({ path: auth.user?.default_route || '/home' });
    }
  }

  next();
});

export default router;
