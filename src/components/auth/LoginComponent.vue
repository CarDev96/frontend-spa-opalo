<template>
	<div class="login-wrapper">
		<!-- 1. Barra Superior Corporativa Oficial -->
		<header class="top-corporate-bar d-flex align-center justify-center px-4">
			<div class="d-flex align-center">
				<v-icon icon="mdi-shield-check" color="#ffffff" size="20" class="mr-2"></v-icon>
				<span class="company-legal-name text-uppercase font-weight-bold text-white tracking-wide">
					GCD ÓPALO CERTIFICACIÓN, S.A. DE C.V.
				</span>
			</div>
		</header>

		<!-- 2. Contenedor Principal Dividido -->
		<main class="login-main-container">
			<v-container fluid class="fill-height pa-0">
				<v-row no-gutters class="fill-height">

					<!-- Lado Izquierdo: Patrón Institucional con Escudo Central -->
					<v-col cols="12" md="6" lg="7" class="brand-hero-column d-none d-md-flex align-center justify-center">
						<div class="brand-pattern-grid"></div>

						<!-- Escudo central con corte geométrico -->
						<div class="brand-center-stage text-center">
							<div class="logo-shield-container mb-3">
								<img
									src="@/assets/opalo-logo.svg"
									alt="GCD Ópalo Certificación"
									class="brand-main-logo"
								/>
							</div>

							<div class="badge-institutional mb-2">
								<v-icon icon="mdi-certificate" size="14" class="mr-1"></v-icon>
								Control de Confianza & Evaluación Integral
							</div>

							<p class="brand-stage-subtitle text-slate-500 mb-0">
								Sistema Institucional de Expedientes Digitales
							</p>
						</div>

						<!-- Badges de seguridad inferior -->
						<div class="brand-bottom-badges d-flex align-center gap-4">
							<span class="secure-badge">
								<v-icon icon="mdi-lock-check" size="14" class="mr-1 text-emerald-600"></v-icon>
								Cifrado SSL 256-Bit
							</span>
							<span class="secure-badge">
								<v-icon icon="mdi-shield-account" size="14" class="mr-1 text-blue-600"></v-icon>
								Acceso Restringido
							</span>
						</div>
					</v-col>

					<!-- Lado Derecho: Tarjeta de Acceso y Formulario -->
					<v-col cols="12" md="6" lg="5" class="d-flex align-center justify-center pa-6 pa-sm-10 bg-slate-50">
						<v-card flat class="login-form-card rounded-2xl pa-8 pa-sm-10 w-100 border">

							<!-- Logo visible solo en pantallas móviles -->
							<div class="text-center d-md-none mb-6">
								<img
									src="@/assets/opalo-logo.svg"
									alt="GCD Ópalo"
									style="max-height: 70px;"
								/>
							</div>

							<!-- Encabezado del Formulario -->
							<div class="form-header mb-8 text-center text-sm-start">
								<div class="d-inline-flex align-center mb-2 px-3 py-1 rounded-pill bg-blue-50 border-blue-subtle">
									<v-icon icon="mdi-account-key" size="15" color="#07254A" class="mr-1"></v-icon>
									<span class="portal-badge-text font-weight-bold text-slate-700">Portal Institucional</span>
								</div>
								<h1 class="text-h5 font-weight-bold text-slate-900 mb-1">Bienvenido</h1>
								<p class="text-body-2 text-slate-500 mb-0">
									Ingresa tus credenciales corporativas para continuar
								</p>
							</div>

							<!-- Formulario Funcional con Pinia -->
							<v-form ref="form" @submit.prevent="check" autocomplete="off">

								<!-- Input Usuario / Email -->
								<div class="input-block mb-4">
									<label class="custom-label">Usuario / Correo Electrónico</label>
									<v-text-field
										v-model="f.user"
										:rules="rules.user"
										placeholder="usuario@opalo.com"
										prepend-inner-icon="mdi-account-outline"
										variant="outlined"
										density="comfortable"
										rounded="lg"
										color="#07254A"
										bg-color="#ffffff"
										class="custom-field"
										:disabled="loading"
										autofocus
									></v-text-field>
								</div>

								<!-- Input Contraseña -->
								<div class="input-block mb-6">
									<label class="custom-label">Contraseña</label>
									<v-text-field
										v-model="f.password"
										:rules="rules.password"
										:type="showPassword ? 'text' : 'password'"
										placeholder="••••••••••••"
										prepend-inner-icon="mdi-lock-outline"
										:append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
										@click:append-inner="showPassword = !showPassword"
										variant="outlined"
										density="comfortable"
										rounded="lg"
										color="#07254A"
										bg-color="#ffffff"
										class="custom-field"
										:disabled="loading"
									></v-text-field>
								</div>

								<!-- Botón de Ingreso Oficial Ópalo -->
								<v-btn
									type="submit"
									block
									color="#07254A"
									rounded="lg"
									size="large"
									class="login-btn text-none font-weight-bold text-white elevation-2"
									:loading="loading"
								>
									<span class="mr-2">Ingresar a la Plataforma</span>
									<v-icon icon="mdi-arrow-right" size="18"></v-icon>
								</v-btn>
							</v-form>

							<!-- Pie del Formulario -->
							<div class="form-footer mt-8 pt-6 border-top text-center">
								<p class="text-caption text-slate-400 mb-0">
									¿Problemas para acceder? Contacta al administrador de <strong>Ópalo</strong>.
								</p>
								<div class="legal-notice text-caption text-slate-400 mt-2">
									GCD Ópalo Certificación © {{ new Date().getFullYear() }}
								</div>
							</div>
						</v-card>
					</v-col>

				</v-row>
			</v-container>
		</main>

		<!-- Notificación Snackbar -->
		<v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3500" location="top right" rounded="lg">
			{{ snackbar.text }}
		</v-snackbar>
	</div>
</template>

<script>
import { mapActions } from 'pinia';
import { useAuthStore } from '@/store/auth';

export default {
	name: 'LoginComponent',
	data() {
		return {
			loading: false,
			showPassword: false,
			f: {
				user: '',
				password: '',
			},
			rules: {
				user: [
					v => !!v || 'Usuario o correo es requerido',
				],
				password: [
					v => !!v || 'Contraseña es requerida',
				],
			},
			snackbar: {
				show: false,
				text: '',
				color: 'error',
			},
		};
	},
	methods: {
		...mapActions(useAuthStore, {
			authLogin: 'login',
			authLogout: 'logout',
		}),

		showSnackbar(message, color = 'error') {
			this.snackbar.text = message;
			this.snackbar.color = color;
			this.snackbar.show = true;
		},

		async check() {
			const isValid = await this.validate();
			if (!isValid) return;

			this.login();
		},

		login() {
			this.loading = true;

			this.authLogin({
				email: this.f.user,
				password: this.f.password,
			})
				.then(() => {
					const authStore = useAuthStore();
					const redirectPath = this.$route.query.redirect || authStore.user?.role?.default_route || '/home';
					this.$router.push(redirectPath);
				})
				.catch((error) => {
					this.authLogout();
					const msg = error.response?.data?.message || 'Estas credenciales no coinciden con nuestros registros.';
					this.showSnackbar(msg);
				})
				.finally(() => {
					this.loading = false;
				});
		},

		async validate() {
			const { valid } = await this.$refs.form.validate();
			return valid;
		},
	},
	mounted() {
		if (this.$route.query.expired) {
			this.showSnackbar('Tu sesión ha expirado. Por favor, ingresa nuevamente.', 'warning');
		}
	},
};
</script>

<style scoped>
.login-wrapper {
	min-height: 100vh;
	display: flex;
	flex-direction: column;
	background-color: #ffffff;
}

/* 1. Barra Superior Corporativa */
.top-corporate-bar {
	height: 52px;
	background: linear-gradient(90deg, #07254A 0%, #0d1e36 100%);
	border-bottom: 2px solid #0284C7;
	z-index: 10;
	box-shadow: 0 2px 10px rgba(7, 37, 74, 0.2);
}

.company-legal-name {
	font-size: 0.95rem;
	letter-spacing: 1.2px;
}

/* 2. Estructura Principal */
.login-main-container {
	flex: 1;
	display: flex;
}

/* Columna Izquierda (Branding Hero) */
.brand-hero-column {
	position: relative;
	background-color: #f8fafc;
	overflow: hidden;
}

/* Patrón de fondo tipo marca de agua con logos tenues */
.brand-pattern-grid {
	position: absolute;
	inset: 0;
	background-image: radial-gradient(#cbd5e1 1.2px, transparent 1.2px), radial-gradient(#94a3b8 1px, #f8fafc 1px);
	background-size: 36px 36px;
	background-position: 0 0, 18px 18px;
	opacity: 0.6;
}

/* Centro geométrico / Escudo */
.brand-center-stage {
	position: relative;
	z-index: 2;
	background: #ffffff;
	padding: 44px 36px;
	border-radius: 24px;
	max-width: 440px;
	width: 88%;
	border: 1px solid #e2e8f0;
	box-shadow: 0 20px 45px rgba(7, 37, 74, 0.08);
}

.brand-main-logo {
	max-height: 120px;
	max-width: 220px;
	object-fit: contain;
}

.badge-institutional {
	display: inline-flex;
	align-items: center;
	font-size: 0.74rem;
	font-weight: 700;
	text-transform: uppercase;
	color: #07254A;
	background: #e0f2fe;
	padding: 4px 12px;
	border-radius: 50px;
	letter-spacing: 0.3px;
}

.brand-stage-subtitle {
	font-size: 0.82rem;
	line-height: 1.4;
}

.brand-bottom-badges {
	position: absolute;
	bottom: 24px;
	z-index: 2;
}

.secure-badge {
	font-size: 0.74rem;
	font-weight: 600;
	color: #64748b;
	background: rgba(255, 255, 255, 0.9);
	backdrop-filter: blur(4px);
	padding: 6px 14px;
	border-radius: 20px;
	border: 1px solid #e2e8f0;
}

/* Columna Derecha (Formulario) */
.login-form-card {
	background-color: #ffffff !important;
	max-width: 460px;
	box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04) !important;
	border-color: #e2e8f0 !important;
}

.border-blue-subtle {
	border: 1px solid #bfdbfe;
}

.portal-badge-text {
	font-size: 0.72rem;
	letter-spacing: 0.3px;
	text-transform: uppercase;
}

.custom-label {
	display: block;
	font-size: 0.78rem;
	font-weight: 700;
	color: #334155;
	margin-bottom: 6px;
	letter-spacing: 0.2px;
}

:deep(.custom-field .v-field) {
	border-radius: 10px !important;
	font-size: 0.88rem !important;
}

:deep(.custom-field .v-field--focused) {
	border-color: #07254A !important;
	box-shadow: 0 0 0 3px rgba(7, 37, 74, 0.1) !important;
}

.login-btn {
	height: 48px !important;
	background: linear-gradient(135deg, #07254A 0%, #0e1e38 100%) !important;
	transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.login-btn:hover {
	transform: translateY(-1px);
	box-shadow: 0 6px 20px rgba(7, 37, 74, 0.25) !important;
}

.border-top {
	border-top: 1px solid #f1f5f9;
}

.legal-notice {
	font-size: 0.7rem;
}

.gap-4 {
	gap: 16px;
}

@media (max-width: 960px) {
	.company-legal-name {
		font-size: 0.78rem;
		letter-spacing: 0.5px;
	}
}
</style>
