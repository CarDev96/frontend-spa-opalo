<template>
	<v-card flat class="client-card mb-6">
		<!-- Cabecera Responsive con Botón Limpiar en Blanco -->
		<div class="card-top-bar px-4 px-sm-6 py-4 d-flex flex-wrap align-center justify-space-between gap-2">
			<div class="d-flex align-center header-left-box">
				<!-- flex-shrink-0 evita que el icono se deforme o se corte en pantallas chicas -->
				<div class="header-icon-box flex-shrink-0 mr-3">
					<v-icon icon="mdi-domain-plus" color="#ffffff" size="20"></v-icon>
				</div>
				<div class="header-text-container">
					<h2 class="card-title text-white mb-0">Alta de Empresa Cliente</h2>
					<span class="card-subtitle text-white opacity-80 d-block text-truncate">
						Completa la información fiscal y los datos de contacto
					</span>
				</div>
			</div>

			<!-- Botón Limpiar estilizado en blanco sólido -->
			<v-btn variant="flat" size="small" color="#ffffff" prepend-icon="mdi-broom"
				class="text-none clear-btn-white font-weight-bold" @click="resetForm">
				Limpiar
			</v-btn>
		</div>

		<!-- Contenido del Formulario -->
		<v-card-text class="pa-4 pa-sm-6 pa-md-8">
			<v-form ref="form" @submit.prevent="submitClient">

				<!-- Sección 1: Datos Fiscales -->
				<div class="section-indicator mb-4">
					<span class="step-circle">1</span>
					<span class="step-label">Datos Fiscales y Comerciales</span>
				</div>

				<v-row dense class="mb-4">
					<v-col cols="12" md="7">
						<div class="input-label">Razón Social <span class="required">*</span></div>
						<v-text-field v-model="f.company_name" placeholder="Ej. Logística y Transportes del Norte S.A. de C.V."
							:rules="[v => !!v || 'La razón social es obligatoria']" variant="outlined" density="comfortable"
							prepend-inner-icon="mdi-office-building-outline" color="#07254A" class="enterprise-field"></v-text-field>
					</v-col>

					<v-col cols="12" md="5">
						<div class="input-label">Nombre Comercial</div>
						<v-text-field v-model="f.trade_name" placeholder="Ej. TransNorte" variant="outlined" density="comfortable"
							:rules="[v => !!v || 'El nombre comercial es obligatorio']" prepend-inner-icon="mdi-storefront-outline" color="#07254A" class="enterprise-field"></v-text-field>
					</v-col>

					<v-col cols="12" sm="6" md="4">
						<div class="input-label">RFC <span class="required">*</span></div>
						<v-text-field v-model="f.rfc" placeholder="LTN180512AB3" :rules="[v => !!v || 'El RFC es obligatorio']"
							variant="outlined" density="comfortable" prepend-inner-icon="mdi-card-account-details-outline"
							color="#07254A" maxlength="13" class="enterprise-field"></v-text-field>
					</v-col>

					<!-- RÉGIMEN FISCAL COMO V-SELECT -->
					<v-col cols="12" sm="6" md="5">
						<div class="input-label">Régimen Fiscal</div>
						<v-select v-model="f.fiscal_regime" :items="fiscalRegimes" item-title="label" item-value="value"
							placeholder="Seleccionar régimen..." variant="outlined" density="comfortable"
							prepend-inner-icon="mdi-file-document-outline" color="#07254A" class="enterprise-field"
							no-data-text="No se encontraron regímenes"></v-select>
					</v-col>

					<v-col cols="12" sm="6" md="3">
						<div class="input-label">Código Postal</div>
						<v-text-field v-model="f.fiscal_zip_code" placeholder="45100" variant="outlined" density="comfortable"
							prepend-inner-icon="mdi-map-marker-outline" color="#07254A" maxlength="5"
							class="enterprise-field"></v-text-field>
					</v-col>
				</v-row>

				<v-divider class="my-6 border-subtle"></v-divider>

				<!-- Sección 2: Contacto y Documentación -->
				<div class="section-indicator mb-4">
					<span class="step-circle">2</span>
					<span class="step-label">Contacto y Expediente</span>
				</div>

				<v-row dense class="mb-4">
					<v-col cols="12" sm="6" md="6">
						<div class="input-label">Correo de Notificaciones <span class="required">*</span></div>
						<v-text-field v-model="f.contact_email" placeholder="contacto@empresa.com" :rules="[
							v => !!v || 'El correo es obligatorio',
							v => /.+@.+\..+/.test(v) || 'Correo no válido'
						]" variant="outlined" density="comfortable" prepend-inner-icon="mdi-email-outline" color="#07254A"
							class="enterprise-field"></v-text-field>
					</v-col>

					<v-col cols="12" sm="6" md="6">
						<div class="input-label">Teléfono de Contacto</div>
						<v-text-field v-model="f.contact_phone" placeholder="33 1234 5678" variant="outlined" density="comfortable"
							prepend-inner-icon="mdi-phone-outline" color="#07254A" class="enterprise-field"></v-text-field>
					</v-col>
				</v-row>

				<!-- Botón de Guardado -->
				<div class="d-flex justify-end pt-2">
					<v-btn type="submit" color="#07254A" size="large" rounded="lg" elevation="0"
						class="px-8 font-weight-bold text-white submit-btn" :loading="loading">
						<v-icon start icon="mdi-check-circle-outline"></v-icon>
						Registrar Empresa
					</v-btn>
				</div>
			</v-form>
		</v-card-text>

		<!-- Snackbar -->
		<v-snackbar v-model="snackbar.show" :color="snackbar.color" location="top right" timeout="3500">
			{{ snackbar.text }}
		</v-snackbar>
	</v-card>
</template>

<script>
import { useClientStore } from '@/store/clients';
import api from '@/services/api';

export default {
	name: 'CreateClientComponent',
	emits: ['client-created'],
	data() {
		return {
			loading: false,
			fileCsf: null,
			f: {
				company_name: '',
				trade_name: '',
				rfc: '',
				contact_email: '',
				contact_phone: '',
				fiscal_regime: null,
				fiscal_zip_code: '',
			},
			// Catálogo oficial SAT
			fiscalRegimes: [
				{ value: '601', label: '601 - General de Ley Personas Morales' },
				{ value: '603', label: '603 - Personas Morales con Fines no Lucrativos' },
				{ value: '612', label: '612 - Personas Físicas con Actividades Empresariales y Profesionales' },
				{ value: '620', label: '620 - Sociedades Cooperativas de Producción' },
				{ value: '626', label: '626 - Régimen Simplificado de Confianza (RESICO)' },
			],
			snackbar: {
				show: false,
				text: '',
				color: 'success',
			},
		};
	},
	methods: {
		resetForm() {
			this.$refs.form.reset();
			this.fileCsf = null;
			this.f.fiscal_regime = null;
		},
		async submitClient() {
      const { valid } = await this.$refs.form.validate();
      if (!valid) return;

      this.loading = true;

      try {
        const response = await api.post('/clients/store', this.f);
        const resData = response.data.data;

        // Modal de credenciales
        this.credentialsDialog = {
          show: true,
          email: resData.user_email,
          password: resData.initial_password,
        };

				this.$store.commit('clientSec/pushClient', resData.client);

        this.resetForm();
        this.$emit('client-created', resData.client);
      } catch (error) {
        this.snackbar = {
          show: true,
          text: error.response?.data?.message || 'Error al registrar.',
          color: 'error',
        };
      } finally {
        this.loading = false;
      }
    }
	},
};
</script>

<style scoped>
.client-card {
	background: #ffffff !important;
	border: 1px solid #e2e8f0 !important;
	border-radius: 14px !important;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04) !important;
	overflow: hidden;
}

/* Cabecera oscura consistente */
.card-top-bar {
	background: linear-gradient(135deg, #07254A 0%, #0e1726 100%);
}

.header-left-box {
	min-width: 0;
	max-width: calc(100% - 100px);
}

.header-icon-box {
	width: 40px;
	height: 40px;
	border-radius: 10px;
	background: rgba(255, 255, 255, 0.12);
	border: 1px solid rgba(255, 255, 255, 0.2);
	display: flex;
	align-items: center;
	justify-content: center;
}

.header-text-container {
	min-width: 0;
}

.card-title {
	font-size: 1.05rem;
	font-weight: 700;
	letter-spacing: -0.2px;
}

.card-subtitle {
	font-size: 0.78rem;
}

/* Botón limpiar blanco */
.clear-btn-white {
	background-color: #ffffff !important;
	color: #07254A !important;
	border-radius: 8px !important;
	box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15) !important;
	letter-spacing: 0.2px;
}

.clear-btn-white:hover {
	background-color: #f8fafc !important;
}

.border-subtle {
	border-color: #f1f5f9 !important;
}

.section-indicator {
	display: flex;
	align-items: center;
}

.step-circle {
	width: 22px;
	height: 22px;
	border-radius: 50%;
	background: #eef2f6;
	color: #07254A;
	font-size: 0.75rem;
	font-weight: 800;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	margin-right: 8px;
}

.step-label {
	font-size: 0.88rem;
	font-weight: 700;
	color: #1e293b;
}

.input-label {
	font-size: 0.8rem;
	font-weight: 600;
	color: #475569;
	margin-bottom: 6px;
}

.required {
	color: #dc2626;
	font-weight: bold;
}

/* Inputs y Selects */
:deep(.enterprise-field .v-field) {
	border-radius: 10px !important;
	background-color: #f8fafc !important;
	transition: border-color 0.2s ease, background-color 0.2s ease;
}

:deep(.enterprise-field .v-field__outline) {
	--v-field-border-opacity: 0.12;
}

:deep(.enterprise-field .v-field:hover) {
	background-color: #ffffff !important;
}

:deep(.enterprise-field .v-field--focused) {
	background-color: #ffffff !important;
	box-shadow: 0 0 0 3px rgba(7, 37, 74, 0.08) !important;
}

:deep(.enterprise-field input),
:deep(.enterprise-field .v-select__selection-text) {
	font-size: 0.88rem;
	color: #0f172a;
}

:deep(.enterprise-field .v-field__prepend-inner .v-icon) {
	color: #94a3b8 !important;
	opacity: 1;
}

:deep(.enterprise-field .v-field--focused .v-field__prepend-inner .v-icon) {
	color: #07254A !important;
}

.submit-btn {
	text-transform: none;
	letter-spacing: 0.3px;
	background-color: #07254A !important;
	transition: transform 0.15s ease;
}

.submit-btn:hover {
	transform: translateY(-1px);
}
</style>
