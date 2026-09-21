<template>
  <div class="dashboard-page">
    <!-- Header con resumen y botón de acción -->
    <div class="d-flex flex-column flex-md-row justify-space-between align-start align-md-center mb-6">
      <div>
        <h1 class="page-title">Panel General</h1>
        <p class="page-subtitle mb-0">
          Seguimiento de candidatos y certificaciones para <strong>{{ clientName }}</strong>
        </p>
      </div>

      <div class="mt-3 mt-md-0 d-flex gap-2">
        <v-btn
          to="/portal/appointments"
          color="#07254A"
          prepend-icon="mdi-calendar-plus"
          rounded="lg"
          elevation="2"
          class="text-none font-weight-bold text-white px-4"
        >
          Agendar Nueva Cita
        </v-btn>
      </div>
    </div>

    <!-- 1. KPIs Operativos con Semáforos Visuales -->
    <v-row class="mb-4">
      <v-col cols="12" sm="6" md="3">
        <v-card flat class="kpi-card">
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="kpi-label">Total Evaluados</div>
              <div class="kpi-value text-navy">24</div>
            </div>
            <div class="kpi-icon-box bg-navy-light">
              <v-icon icon="mdi-account-group" color="#07254A" size="24"></v-icon>
            </div>
          </div>
          <div class="kpi-footer text-caption text-grey">
            <span class="text-success font-weight-bold">+3</span> este mes
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card flat class="kpi-card">
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="kpi-label">En Evaluación</div>
              <div class="kpi-value text-warning-dark">8</div>
            </div>
            <div class="kpi-icon-box bg-warning-light">
              <v-icon icon="mdi-progress-clock" color="#d97706" size="24"></v-icon>
            </div>
          </div>
          <div class="kpi-footer text-caption text-grey">
            Psicometría y Socioeconómico
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card flat class="kpi-card">
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="kpi-label">Certificados Emitidos</div>
              <div class="kpi-value text-success">14</div>
            </div>
            <div class="kpi-icon-box bg-success-light">
              <v-icon icon="mdi-shield-check" color="#16a34a" size="24"></v-icon>
            </div>
          </div>
          <div class="kpi-footer text-caption text-grey">
            Listos para descarga
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card flat class="kpi-card">
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="kpi-label">Próximas Citas</div>
              <div class="kpi-value text-navy">2</div>
            </div>
            <div class="kpi-icon-box bg-sand-light">
              <v-icon icon="mdi-calendar-clock" color="#8c7868" size="24"></v-icon>
            </div>
          </div>
          <div class="kpi-footer text-caption text-grey">
            Programadas para esta semana
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- 2. Tabla de Avance y Estatus Reciente (Lo que realmente quiere ver el cliente) -->
    <v-card flat class="content-table-card pa-5">
      <div class="d-flex justify-space-between align-center mb-4">
        <div>
          <h2 class="section-title">Últimos Evaluados en Proceso</h2>
          <p class="section-subtitle mb-0">Estatus en tiempo real del dictamen de confianza</p>
        </div>
        <v-btn to="/portal/examinees" variant="text" color="#07254A" class="text-none font-weight-bold">
          Ver todos <v-icon icon="mdi-chevron-right" size="18"></v-icon>
        </v-btn>
      </div>

      <v-table density="comfortable" hover>
        <thead>
          <tr>
            <th class="text-left font-weight-bold text-grey-darken-2">CANDIDATO</th>
            <th class="text-left font-weight-bold text-grey-darken-2">PUESTO SOLICITADO</th>
            <th class="text-left font-weight-bold text-grey-darken-2">FECHA CITA</th>
            <th class="text-left font-weight-bold text-grey-darken-2">ESTATUS PROCESO</th>
            <th class="text-right font-weight-bold text-grey-darken-2">DICTAMEN</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, i) in sampleExaminees" :key="i">
            <td class="font-weight-bold text-slate-800">
              <div class="d-flex align-center">
                <v-avatar size="30" color="#eef2f6" class="mr-2 text-caption font-weight-bold text-navy">
                  {{ item.name.charAt(0) }}
                </v-avatar>
                {{ item.name }}
              </div>
            </td>
            <td class="text-grey-darken-2">{{ item.position }}</td>
            <td class="text-grey-darken-1">{{ item.date }}</td>
            <td>
              <v-chip size="small" :color="item.statusColor" variant="tonal" class="font-weight-bold">
                {{ item.status }}
              </v-chip>
            </td>
            <td class="text-right">
              <v-btn
                v-if="item.completed"
                size="small"
                variant="outlined"
                color="#07254A"
                prepend-icon="mdi-download"
                class="text-none"
              >
                Certificado
              </v-btn>
              <span v-else class="text-caption text-grey font-italic">En dictamen</span>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </div>
</template>

<script>
import { mapState } from 'pinia';
import { useAuthStore } from '@/store/auth';

export default {
  name: 'HomeView',
  data() {
    return {
      sampleExaminees: [
        { name: 'Carlos Morales Díaz', position: 'Operador de Quinta Rueda', date: '17 Sep 2026', status: 'En Psicometría', statusColor: 'warning', completed: false },
        { name: 'Ana Laura Gómez Ramos', position: 'Auditor de Seguridad', date: '16 Sep 2026', status: 'Concluido', statusColor: 'success', completed: true },
        { name: 'Roberto Méndez Castillo', position: 'Custodio de Carga', date: '15 Sep 2026', status: 'Concluido', statusColor: 'success', completed: true },
        { name: 'Fernanda Ortiz Luna', position: 'Auxiliar Administrativo', date: '18 Sep 2026', status: 'Cita Programada', statusColor: 'info', completed: false },
      ],
    };
  },
  computed: {
    ...mapState(useAuthStore, ['user']),
    clientName() {
      return this.user?.client?.company_name || 'Tu Empresa';
    },
  },
};
</script>

<style scoped>
.dashboard-page {
  max-width: 1280px;
  margin: 0 auto;
}

.page-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.5px;
}

.page-subtitle {
  font-size: 0.88rem;
  color: #64748b;
}

.text-navy {
  color: #07254A;
}

.text-warning-dark {
  color: #b45309;
}

/* Tarjetas KPI limpias con borde fino y sombra sutil */
.kpi-card {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 14px !important;
  padding: 18px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04) !important;
}

.kpi-label {
  font-size: 0.76rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.kpi-value {
  font-size: 1.75rem;
  font-weight: 800;
  line-height: 1.2;
  margin-top: 2px;
}

.kpi-footer {
  margin-top: 10px;
  font-size: 0.75rem;
}

.kpi-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-navy-light { background: #eef2f6; }
.bg-warning-light { background: #fef3c7; }
.bg-success-light { background: #dcfce7; }
.bg-sand-light { background: #f4ede6; }

/* Tarjeta contenedora de la tabla */
.content-table-card {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 14px !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04) !important;
}

.section-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f172a;
}

.section-subtitle {
  font-size: 0.8rem;
  color: #64748b;
}
</style>
