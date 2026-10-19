import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/store/auth';

const routes = [
	{
		path: '/login',
		name: 'Login',
		component: () => import('@/views/Login.vue'),
		meta: { guestOnly: true, title: 'Iniciar Sesión - Ópalo' },
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
				meta: {
					requiresAuth: true,
					roles: ['admin', 'psychology', 'social_work', 'sales', 'client'],
					title: 'Inicio - Ópalo',
				},
				component: () => import('@/views/home/HomeView.vue'),
			},

			// =============================================================
			// GESTIÓN COMERCIAL Y CLIENTES (Staff Ópalo)
			// =============================================================
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
				path: 'examinees',
				name: 'Examinees',
				meta: {
					requiresAuth: true,
					roles: ['client'],
					title: 'Directorio de Evaluados - Ópalo',
				},
				component: () => import('@/views/clients/examinees/ExamineesView.vue'),
			},
			{
				path: 'users',
				name: 'Users',
				meta: {
					requiresAuth: true,
					roles: ['admin'],
					title: 'Control de Usuarios - Ópalo',
				},
				component: () => import('@/views/users/UserView.vue'),
			},

			// =============================================================
			// ATENCIÓN, CITAS Y EXPEDIENTES (Operación Especialistas & Admin)
			// =============================================================
			{
				path: 'appointments',
				name: 'ClinicalAppointments',
				meta: {
					requiresAuth: true,
					roles: ['psychology', 'social_work', 'admin'],
					title: 'Mi Agenda de Citas - Ópalo',
				},
				component: () => import('@/views/clinical/ClinicalAppointmentsView.vue'),
			},
			{
				path: 'social-work/dossiers',
				name: 'DossierReview',
				meta: {
					requiresAuth: true,
					roles: ['admin', 'social_work', 'psychology'],
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

			// =============================================================
			// ADMINISTRACIÓN CORPORATIVA (Citas, Pruebas y Órdenes)
			// =============================================================
			{
				path: 'admin/appointments',
				name: 'AdminAppointments',
				meta: {
					requiresAuth: true,
					roles: ['admin'],
					title: 'Gestión General de Citas - Ópalo',
				},
				component: () => import('@/views/admin/appointments/AdminAppointmentsView.vue'),
			},
			{
				path: 'admin/appointments/book-order/:id',
				name: 'AdminOrderBookAppointment',
				meta: {
					requiresAuth: true,
					roles: ['admin'],
					title: 'Agendar Cita de Orden - Ópalo',
				},
				component: () => import('@/views/admin/appointments/AdminOrderBookAppointmentView.vue'),
			},
			{
				path: 'admin/tests-catalog',
				name: 'AdminTestsCatalog',
				meta: {
					requiresAuth: true,
					roles: ['admin', 'psychology'],
					title: 'Catálogo de Pruebas Psicométricas - Ópalo',
				},
				component: () => import('@/views/admin/AdminTestsCatalogView.vue'),
			},
			{
				path: 'admin/orders-validation',
				name: 'AdminOrdersValidation',
				meta: {
					requiresAuth: true,
					roles: ['admin', 'sales'],
					title: 'Revisión de Órdenes y Pagos - Ópalo',
				},
				component: () => import('@/views/admin/AdminOrdersValidationView.vue'),
			},
			{
				path: 'admin/payment-receipts',
				name: 'AdminPaymentReceipts',
				meta: {
					requiresAuth: true,
					roles: ['admin', 'sales'],
					title: 'Validación de Comprobantes - Ópalo',
				},
				component: () => import('@/views/admin/payments/AdminPaymentReceiptsView.vue'),
			},

			// =============================================================
			// PORTAL CLIENTE / EMPRESAS
			// =============================================================
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
			{
				path: 'portal/psychometric-tests',
				name: 'ClientPsychometricTests',
				meta: {
					requiresAuth: true,
					roles: ['client'],
					title: 'Formatos de Pruebas Psicométricas - Ópalo',
				},
				component: () => import('@/views/clients/ClientPsychometricTestsView.vue'),
			},
			{
				path: 'portal/orders',
				name: 'ClientOrders',
				meta: {
					requiresAuth: true,
					roles: ['client'],
					title: 'Generar Orden de Evaluación - Ópalo',
				},
				component: () => import('@/views/clients/orders/ClientOrdersView.vue'),
			},
			{
				path: 'portal/payment-methods',
				name: 'ClientPayments',
				meta: {
					requiresAuth: true,
					roles: ['client'],
					title: 'Cuentas Bancarias - Ópalo',
				},
				component: () => import('@/views/clients/ClientPaymentsView.vue'),
			},
			{
				path: 'portal/payment-receipts',
				name: 'ClientPaymentReceipts',
				meta: {
					requiresAuth: true,
					roles: ['client'],
					title: 'Historial de Pagos - Ópalo',
				},
				component: () => import('@/views/clients/ClientPaymentReceiptsView.vue'),
			},
			{
				path: 'portal/fiscal-data',
				name: 'ClientFiscalData',
				meta: {
					requiresAuth: true,
					roles: ['client'],
					title: 'Datos Fiscales (CSF) - Ópalo',
				},
				component: () => import('@/views/clients/fiscal/ClientFiscalDataView.vue'),
			},

			// =============================================================
			// AJUSTES GENERALES
			// =============================================================
			{
				path: 'settings',
				name: 'Settings',
				meta: {
					requiresAuth: true,
					roles: ['admin', 'psychology', 'social_work', 'sales', 'client'],
					title: 'Configuración de Cuenta - Ópalo',
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

	// Actualización dinámica del título de la pestaña del navegador
	if (to.meta?.title) {
		document.title = to.meta.title;
	}

	// 1. Redirección al login si la ruta requiere auth y no hay sesión
	if (to.matched.some((record) => record.meta.requiresAuth) && !isAuthenticated) {
		return '/login';
	}

	// 2. Redirección si ya está autenticado e intenta entrar a login
	if (to.path === '/login' && isAuthenticated) {
		return '/home';
	}

	// 3. Resolución homogénea del rol del usuario autenticado
	const currentRole =
		typeof authStore.user?.role === 'string'
			? authStore.user.role
			: authStore.user?.role?.name || authStore.role;

	// 4. Verificación estricta de permisos por rol
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
