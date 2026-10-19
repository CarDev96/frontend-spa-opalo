<template>
  <div class="dashboard-client-component">
    <!-- Header Corporativo Ópalo -->
    <v-card flat class="welcome-card elevation-0 mb-6">
      <div class="card-header px-6 py-5 d-flex flex-wrap align-center justify-space-between gap-3">
        <div class="d-flex align-center">
          <div class="header-icon-box mr-4 flex-shrink-0">
            <v-icon icon="mdi-shield-crown-outline" color="#ffffff" size="26"></v-icon>
          </div>
          <div>
            <h1 class="card-title text-white mb-1">GCD Opalo certificaciones</h1>
            <p class="card-subtitle text-white opacity-80 mb-0">
              Portal Institucional de Control de Confianza y Evaluación Integral de Personal
            </p>
          </div>
        </div>

        <div class="d-flex align-center gap-2">
          <v-btn
            color="#ffffff"
            variant="flat"
            rounded="lg"
            size="small"
            prepend-icon="mdi-account-plus-outline"
            class="text-none font-weight-bold action-btn"
            @click="$router.push('/portal/examinees')"
          >
            Registrar Evaluado
          </v-btn>
          <v-btn
            color="rgba(255, 255, 255, 0.15)"
            variant="flat"
            rounded="lg"
            size="small"
            prepend-icon="mdi-cash-plus"
            class="text-none font-weight-bold text-white"
            @click="$router.push('/portal/orders')"
          >
            Generar Orden de Evaluación
          </v-btn>
        </div>
      </div>
    </v-card>

    <!-- GUÍA OFICIAL: LOS 4 PASOS DE EVALUACIÓN -->
    <v-card flat class="guide-card elevation-0 mb-6">
      <div class="px-6 py-4 d-flex align-center justify-space-between border-bottom bg-slate-50">
        <div class="d-flex align-center">
          <v-icon icon="mdi-clipboard-list-outline" color="#07254A" class="mr-2" size="20"></v-icon>
          <h2 class="text-subtitle-1 font-weight-bold text-slate-800 mb-0">
            Instrucciones para Agendar Cita de Evaluación
          </h2>
        </div>
        <span class="text-caption font-weight-bold text-slate-500 font-mono">
          Flujo Oficial de 4 Pasos
        </span>
      </div>

      <div class="pa-6 bg-slate-50">
        <v-row dense>
          <!-- Paso 1 -->
          <v-col cols="12" sm="6" md="3" class="pa-2">
            <div class="step-card pa-4 h-100 bg-white border rounded-xl d-flex flex-column justify-space-between">
              <div>
                <div class="d-flex align-center justify-space-between mb-3">
                  <span class="step-badge">1</span>
                  <v-icon icon="mdi-account-plus" color="#07254A" size="20"></v-icon>
                </div>
                <h3 class="text-body-2 font-weight-bold text-slate-900 mb-1">Registrar Candidato</h3>
                <p class="text-caption text-slate-500 mb-0">
                  Dar de alta los datos personales del evaluado en el módulo de evaluados.
                </p>
              </div>
              <v-btn
                variant="text"
                density="compact"
                color="#07254A"
                class="text-none font-weight-bold px-0 mt-3 align-self-start"
                @click="$router.push('/portal/examinees')"
              >
                Ir a Evaluados →
              </v-btn>
            </div>
          </v-col>

          <!-- Paso 2 -->
          <v-col cols="12" sm="6" md="3" class="pa-2">
            <div class="step-card pa-4 h-100 bg-white border rounded-xl d-flex flex-column justify-space-between">
              <div>
                <div class="d-flex align-center justify-space-between mb-3">
                  <span class="step-badge">2</span>
                  <v-icon icon="mdi-file-document-edit-outline" color="#07254A" size="20"></v-icon>
                </div>
                <h3 class="text-body-2 font-weight-bold text-slate-900 mb-1">Descargar Psicométricos</h3>
                <p class="text-caption text-slate-500 mb-0">
                  Descargar pruebas psicométricas, responderlas y subir expediente digital con fotos y cartas laborales.
                </p>
              </div>
              <v-btn
                variant="text"
                density="compact"
                color="#07254A"
                class="text-none font-weight-bold px-0 mt-3 align-self-start"
                @click="$router.push('/portal/examinees')"
              >
                Ver Expedientes →
              </v-btn>
            </div>
          </v-col>

          <!-- Paso 3 -->
          <v-col cols="12" sm="6" md="3" class="pa-2">
            <div class="step-card pa-4 h-100 bg-white border rounded-xl d-flex flex-column justify-space-between">
              <div>
                <div class="d-flex align-center justify-space-between mb-3">
                  <span class="step-badge">3</span>
                  <v-icon icon="mdi-file-upload-outline" color="#07254A" size="20"></v-icon>
                </div>
                <h3 class="text-body-2 font-weight-bold text-slate-900 mb-1">Subir Comprobante</h3>
                <p class="text-caption text-slate-500 mb-0">
                  Generar orden seleccionando el evaluado, tipo de prueba y adjuntar el comprobante de pago.
                </p>
              </div>
              <v-btn
                variant="text"
                density="compact"
                color="#07254A"
                class="text-none font-weight-bold px-0 mt-3 align-self-start"
                @click="$router.push('/portal/orders')"
              >
                Subir Pago →
              </v-btn>
            </div>
          </v-col>

          <!-- Paso 4 -->
          <v-col cols="12" sm="6" md="3" class="pa-2">
            <div class="step-card pa-4 h-100 bg-white border rounded-xl d-flex flex-column justify-space-between">
              <div>
                <div class="d-flex align-center justify-space-between mb-3">
                  <span class="step-badge">4</span>
                  <v-icon icon="mdi-calendar-check-outline" color="#07254A" size="20"></v-icon>
                </div>
                <h3 class="text-body-2 font-weight-bold text-slate-900 mb-1">Administración Agenda Cita</h3>
                <p class="text-caption text-slate-500 mb-0">
                  Una vez validado el pago, administración programa la entrevista formal del evaluado.
                </p>
              </div>
              <span class="text-caption text-success font-weight-bold mt-3 align-self-start">
                Validación Administrativa
              </span>
            </div>
          </v-col>
        </v-row>
      </div>

      <!-- POLÍTICAS Y TIEMPOS DE SERVICIO -->
      <div class="pa-5 bg-white border-top">
        <v-row dense align="center">
          <v-col cols="12" md="7">
            <div class="d-flex align-start mb-2">
              <v-icon icon="mdi-clock-outline" color="#07254A" size="20" class="mr-2 mt-1"></v-icon>
              <div>
                <span class="text-body-2 font-weight-bold text-slate-800">
                  Tiempos de Entrega de Resultados
                </span>
                <p class="text-caption text-slate-600 mb-0">
                  Entrega en <strong>5 días hábiles</strong> • Pruebas de polígrafo en <strong>3 días hábiles</strong>.
                </p>
              </div>
            </div>

            <div class="d-flex align-start">
              <v-icon icon="mdi-card-account-details-outline" color="#07254A" size="20" class="mr-2 mt-1"></v-icon>
              <div>
                <span class="text-body-2 font-weight-bold text-slate-800">
                  Acreditación del Evaluado
                </span>
                <p class="text-caption text-slate-600 mb-0">
                  Al finalizar el proceso satisfactoriamente se entrega la credencial oficial del evaluado.
                </p>
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="5">
            <v-alert
              density="comfortable"
              type="warning"
              variant="tonal"
              class="mb-0 text-caption rounded-xl border"
            >
              <div class="font-weight-bold mb-1">Políticas de Pago:</div>
              El pago de la certificación no es transferible para otro evaluado. No hay reembolso bajo ninguna circunstancia.
            </v-alert>
          </v-col>
        </v-row>
      </div>
    </v-card>
  </div>
</template>

<script>
export default {
  name: 'DashboardClientComponent',
};
</script>

<style scoped>
.welcome-card,
.guide-card {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 16px !important;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04) !important;
}

.card-header {
  background: linear-gradient(135deg, #07254A 0%, #0e1726 100%) !important;
}

.header-icon-box {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.3px;
}

.card-subtitle {
  font-size: 0.85rem;
}

.action-btn {
  color: #07254A !important;
}

.bg-slate-50 {
  background-color: #f8fafc;
}

.step-card {
  border: 1px solid #e2e8f0;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.step-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.08);
}

.step-badge {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background-color: #07254A;
  color: #ffffff;
  font-size: 0.78rem;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
</style>
