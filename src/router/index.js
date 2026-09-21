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
					roles: ['admin', 'sales'], // 👈 Solo administración y ventas pueden entrar aquí
				},
				component: () => import('@/views/clients/CreateClient.vue'),
			},
			{
				path: 'users',
				name: 'Users',
				meta: {
					requiresAuth: true,
					roles: ['admin'], // 👈 Solo administración puede entrar aquí
				},
				component: () => import('@/views/users/UserView.vue'),
			},
			{
				path: 'portal/payment-methods',
				name: 'ClientPayments',
				meta: {
					requiresAuth: true,
					roles: ['client'], // 👈 Restricción de acceso exclusivo para clientes
					title: 'Cuentas y Pagos - Ópalo',
				},
				component: () => import('@/views/clients/ClientPaymentsView.vue'),
			},
			{
				path: 'portal/payment-receipts',
				name: 'ClientPaymentReceipts',
				meta: {
					requiresAuth: true,
					roles: ['client'], // 👈 Restricción de acceso exclusivo para clientes
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
			{
				path: '/portal/examinees',
				name: 'ClientExaminees',
				meta: {
					requiresAuth: true,
					roles: ['client'],
					title: 'Mis Evaluados - Ópalo',
				},
				component: () => import('@/views/clients/examinees/ExamineesView.vue'),
			},
			{
				path: '/clinical/psychologists-schedules',
				name: 'PsychologistsSchedules',
				meta: {
					requiresAuth: true,
					roles: ['admin'],
					title: 'Agenda de Psicólogos - Ópalo',
				},
				component: () => import('@/views/clinical/PsychologistsScheduleView.vue'),
			},
			{
				path: '/portal/appointments',
				name: 'ClientAppointments',
				meta: {
					requiresAuth: true,
					roles: ['client'],
					title: 'Agendar Citas - Ópalo',
				},
				component: () => import('@/views/clients/BookAppointmentView.vue'),
			},
			{
				path: '/appointments',
				name: 'ClinicalAppointments',
				meta: {
					requiresAuth: true,
					roles: ['psychology', 'admin'],
					title: 'Citas de Evaluación - Ópalo',
				},
				component: () => import('@/views/clinical/ClinicalAppointmentsView.vue'),
			},
			{
				path: 'settings',
				name: 'Settings',
				meta: {
					requiresAuth: true,
					roles: ['admin', 'psychology', 'social_work', 'sales', 'client'], // 👈 Staff operativo para foto/clave y admin completo
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
