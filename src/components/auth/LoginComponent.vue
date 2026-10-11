<template>
	<div class="login-wrapper">
		<!-- Canvas interactivo de partículas -->
		<canvas ref="particleCanvas" class="particles-canvas"></canvas>

		<!-- Orbes de luz de fondo (Efecto Aurora/Glow moderno) -->
		<div class="glow-orb orb-1"></div>
		<div class="glow-orb orb-2"></div>

		<v-container class="fill-height d-flex align-center justify-center">
			<v-row justify="center">
				<v-col cols="12" sm="8" md="5" lg="4" xl="3">
					<!-- Tarjeta con Glassmorphism -->
					<v-card class="glass-card pa-4 pa-sm-6" rounded="xl" elevation="0">
						<v-card-text>
							<!-- Header / Logo -->
							<div class="text-center mb-6">
								<div class="logo-circle mx-auto mb-3">
									<img src="@/assets/opalo-logo.svg" class="center-block" alt="Logo">
								</div>
								<h1 class="login-title">Bienvenido</h1>
								<p class="login-subtitle">Ingresa tus credenciales para continuar</p>
							</div>

							<v-form ref="form" @submit.prevent="check" autocomplete="off">
								<!-- Usuario / Email -->
								<v-text-field v-model="f.user" :rules="rules.user" label="Usuario / Correo"
									prepend-inner-icon="mdi-account-outline" variant="outlined" density="comfortable" color="#b5a08f"
									class="custom-field mb-2"></v-text-field>

								<!-- Contraseña con botón de mostrar/ocultar -->
								<v-text-field v-model="f.password" :rules="rules.password" :type="showPassword ? 'text' : 'password'"
									label="Contraseña" prepend-inner-icon="mdi-lock-outline"
									:append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
									@click:append-inner="showPassword = !showPassword" variant="outlined" density="comfortable"
									color="#b5a08f" class="custom-field mb-4"></v-text-field>

								<!-- Botón de Ingreso con gradiente -->
								<v-btn block rounded="lg" size="large" class="login-btn text-white" type="submit" :loading="loading">
									Ingresar
								</v-btn>
							</v-form>
						</v-card-text>
					</v-card>
				</v-col>
			</v-row>
		</v-container>

		<!-- Notificación Snackbar -->
		<v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3500" location="top right">
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
					v => !!v || 'Usuario es requerido',
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
			// Control de animación Canvas
			animationFrameId: null,
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
					const redirectPath = this.$route.query.redirect || '/home';
					this.$router.push('/home');
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

		// --- Motor de partículas interactivo nativo ---
		initParticles() {
			const canvas = this.$refs.particleCanvas;
			if (!canvas) return;

			const ctx = canvas.getContext('2d');
			let width = (canvas.width = window.innerWidth);
			let height = (canvas.height = window.innerHeight);

			const mouse = { x: null, y: null, radius: 120 };

			window.addEventListener('mousemove', (e) => {
				mouse.x = e.x;
				mouse.y = e.y;
			});

			window.addEventListener('mouseout', () => {
				mouse.x = null;
				mouse.y = null;
			});

			window.addEventListener('resize', () => {
				width = canvas.width = window.innerWidth;
				height = canvas.height = window.innerHeight;
			});

			// Creación de partículas
			const particlesCount = Math.min(Math.floor((width * height) / 12000), 75);
			const particles = [];

			class Particle {
				constructor() {
					this.x = Math.random() * width;
					this.y = Math.random() * height;
					this.size = Math.random() * 2 + 1;
					this.baseX = this.x;
					this.baseY = this.y;
					this.speedX = (Math.random() - 0.5) * 0.8;
					this.speedY = (Math.random() - 0.5) * 0.8;
					this.density = Math.random() * 20 + 5;
				}

				update() {
					// Movimiento constante
					this.x += this.speedX;
					this.y += this.speedY;

					// Rebote en bordes
					if (this.x < 0 || this.x > width) this.speedX = -this.speedX;
					if (this.y < 0 || this.y > height) this.speedY = -this.speedY;

					// Interacción con cursor
					if (mouse.x != null && mouse.y != null) {
						const dx = mouse.x - this.x;
						const dy = mouse.y - this.y;
						const distance = Math.sqrt(dx * dx + dy * dy);

						if (distance < mouse.radius) {
							const force = (mouse.radius - distance) / mouse.radius;
							const directionX = (dx / distance) * force * this.density;
							const directionY = (dy / distance) * force * this.density;
							this.x -= directionX;
							this.y -= directionY;
						}
					}
				}

				draw() {
					ctx.fillStyle = 'rgba(213, 195, 178, 0.7)';
					ctx.beginPath();
					ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
					ctx.fill();
				}
			}

			for (let i = 0; i < particlesCount; i++) {
				particles.push(new Particle());
			}

			// Conexión entre partículas cercanas
			const connect = () => {
				for (let a = 0; a < particles.length; a++) {
					for (let b = a; b < particles.length; b++) {
						const dx = particles[a].x - particles[b].x;
						const dy = particles[a].y - particles[b].y;
						const distance = Math.sqrt(dx * dx + dy * dy);

						if (distance < 110) {
							const opacity = 1 - distance / 110;
							ctx.strokeStyle = `rgba(181, 160, 143, ${opacity * 0.25})`;
							ctx.lineWidth = 1;
							ctx.beginPath();
							ctx.moveTo(particles[a].x, particles[a].y);
							ctx.lineTo(particles[b].x, particles[b].y);
							ctx.stroke();
						}
					}
				}
			};

			const animate = () => {
				ctx.clearRect(0, 0, width, height);
				particles.forEach(p => {
					p.update();
					p.draw();
				});
				connect();
				this.animationFrameId = requestAnimationFrame(animate);
			};

			animate();
		},
	},
	mounted() {
		this.initParticles();

		if (this.$route.query.expired) {
			this.showSnackbar('Tu sesión ha expirado. Por favor, ingresa nuevamente.', 'warning');
		}
	},
	beforeUnmount() {
		// Evitar fugas de memoria al cambiar de vista
		if (this.animationFrameId) {
			cancelAnimationFrame(this.animationFrameId);
		}
	},
};
</script>

<style scoped>
/* Fondo general moderno en tono carbón / cálido elegante */
.login-wrapper {
	position: relative;
	width: 100vw;
	height: 100vh;
	overflow: hidden;
	background: radial-gradient(circle at 50% 20%, #07254A 0%, #140032 100%);
}

/* Canvas en segundo plano absoluto */
.particles-canvas {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: 1;
	pointer-events: none;
}

/* Orbes difusos que generan profundidad (Efecto Glow) */
.glow-orb {
	position: absolute;
	border-radius: 50%;
	filter: blur(100px);
	z-index: 0;
	opacity: 0.25;
	pointer-events: none;
}

.orb-1 {
	top: 15%;
	left: 20%;
	width: 350px;
	height: 350px;
	background: #07254A;
}

.orb-2 {
	bottom: 10%;
	right: 25%;
	width: 400px;
	height: 400px;
	background: #07254A;
}

/* Tarjeta de Vidrio (Glassmorphism) */
.glass-card {
	position: relative;
	z-index: 2;
	background: #07254A !important;
	backdrop-filter: blur(20px);
	-webkit-backdrop-filter: blur(20px);
	border: 1px solid rgba(254, 252, 252, 0.08) !important;
	box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45) !important;
}

/* Detalle del icono superior */
.logo-circle {
	width: 64px;
	height: 64px;
	border-radius: 50%;
	background: rgba(249, 246, 246, 0.898);
	border: 1px solid rgba(181, 160, 143, 0.25);
	display: flex;
	align-items: center;
	justify-content: center;
}

.login-title {
	font-size: 1.65rem;
	font-weight: 600;
	color: #f5f2ee;
	letter-spacing: -0.5px;
}

.login-subtitle {
	font-size: 0.88rem;
	color: #f7f8f8;
	margin-top: 4px;
}

/* Estilo de los inputs en modo oscuro */
:deep(.v-field) {
	background-color: rgba(255, 255, 255, 0.03) !important;
	border-radius: 10px !important;
	color: #f3ece6 !important;
}

:deep(.v-field--variant-outlined .v-field__outline) {
	color: rgba(255, 255, 255, 0.15) !important;
}

:deep(.v-field--focused .v-field__outline) {
	color: #ffffff !important;
}

:deep(input) {
	color: #ffffff !important;
}

/* Botón con degradado de tu paleta #b5a08f */
.login-btn {
	background: linear-gradient(135deg, #14022d 0%, #1c013f 100%) !important;
	font-weight: 600;
	letter-spacing: 0.5px;
	text-transform: none;
	box-shadow: 0 8px 20px rgba(181, 160, 143, 0.25) !important;
	transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.login-btn:hover {
	transform: translateY(-2px);
	box-shadow: 0 12px 24px rgba(181, 160, 143, 0.35) !important;
}
</style>
