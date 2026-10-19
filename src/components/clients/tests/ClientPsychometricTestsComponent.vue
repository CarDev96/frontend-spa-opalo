<template>
  <div class="client-tests-container">
    <!-- Header Banner -->
    <div class="header-banner px-6 py-5 rounded-xl mb-6 text-white d-flex align-center justify-space-between flex-wrap gap-4">
      <div class="d-flex align-center">
        <div class="header-icon-box mr-3 flex-shrink-0">
          <v-icon icon="mdi-file-download-outline" color="#ffffff" size="24"></v-icon>
        </div>
        <div>
          <h1 class="text-h5 font-weight-bold mb-0">Formatos de Pruebas Psicométricas</h1>
          <p class="text-subtitle-2 opacity-80 mb-0">
            Descarga las evaluaciones oficiales para imprimirlas y aplicarlas a tus candidatos.
          </p>
        </div>
      </div>
      <v-btn
        variant="flat"
        color="rgba(255, 255, 255, 0.15)"
        rounded="lg"
        prepend-icon="mdi-refresh"
        class="text-none font-weight-bold text-white refresh-btn"
        :loading="loading"
        @click="fetchTests"
      >
        Actualizar Lista
      </v-btn>
    </div>

    <!-- Banner Informativo -->
    <v-alert
      color="#07254A"
      variant="tonal"
      rounded="xl"
      class="mb-6 border-blue-subtle"
      icon="mdi-information-outline"
    >
      <div class="text-body-2 text-slate-800">
        <strong>Instrucciones:</strong> Descarga el formato correspondiente, entrégaselo a tu candidato para su resolución y, posteriormente, sube el archivo contestado dentro de su <strong>Expediente Digital</strong> en la sección <em>Mis Evaluados</em>.
      </div>
    </v-alert>

    <!-- Estado de Carga -->
    <div v-if="loading" class="text-center py-12">
      <v-progress-circular indeterminate color="#07254A" size="36"></v-progress-circular>
      <div class="text-caption text-slate-500 font-weight-medium mt-3">Cargando formatos disponibles...</div>
    </div>

    <!-- Estado Vacío -->
    <v-card
      v-else-if="tests.length === 0"
      flat
      class="border rounded-xl pa-12 text-center bg-white"
    >
      <v-icon icon="mdi-file-document-outline" size="56" color="#94A3B8" class="mb-3"></v-icon>
      <h3 class="text-subtitle-1 font-weight-bold text-slate-700 mb-1">No hay formatos disponibles</h3>
      <p class="text-body-2 text-slate-500 mb-0">
        El equipo administrativo aún no ha publicado formatos descargables para tu cuenta.
      </p>
    </v-card>

    <!-- Grid de Pruebas Disponibles -->
    <v-row v-else dense>
      <v-col
        v-for="test in tests"
        :key="test.id"
        cols="12"
        md="6"
        lg="4"
        class="pa-2"
      >
        <v-card flat class="test-card border rounded-xl pa-5 bg-white h-100 d-flex flex-column justify-space-between elevation-0">
          <div>
            <div class="d-flex align-start justify-space-between mb-3">
              <div class="test-icon-box mr-3">
                <v-icon icon="mdi-file-document-edit-outline" color="#07254A" size="22"></v-icon>
              </div>
              <v-chip size="x-small" color="#10B981" variant="flat" class="font-weight-bold text-white px-2">
                Disponible
              </v-chip>
            </div>

            <h3 class="test-title text-slate-900 mb-2">{{ test.name }}</h3>
            <p class="test-description text-slate-600 mb-4">
              {{ test.description || 'Sin instrucciones adicionales adjuntas.' }}
            </p>
          </div>

          <div class="pt-3 border-top-subtle d-flex align-center justify-space-between flex-wrap gap-2">
            <div class="text-caption font-weight-medium text-slate-500 d-flex align-center">
              <v-icon icon="mdi-paperclip" size="14" class="mr-1"></v-icon>
              <span>{{ test.original_name || 'Formato Oficial' }}</span>
            </div>

            <v-btn
              v-if="test.file_url"
              :href="test.file_url"
              target="_blank"
              download
              variant="flat"
              color="#07254A"
              rounded="lg"
              size="small"
              prepend-icon="mdi-download"
              class="text-none font-weight-bold text-white px-4 download-btn"
            >
              Descargar Formato
            </v-btn>
            <span v-else class="text-caption text-slate-400 font-italic">No disponible</span>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useClientPsychometricTestsStore } from '@/store/clientPsychometricTests';

export default {
  name: 'ClientPsychometricTestsComponent',
  computed: {
    ...mapState(useClientPsychometricTestsStore, ['tests', 'loading']),
  },
  mounted() {
    this.fetchTests();
  },
  methods: {
    ...mapActions(useClientPsychometricTestsStore, ['fetchTests']),
  },
};
</script>

<style scoped>
.client-tests-container {
  width: 100%;
}

.header-banner {
  background: linear-gradient(135deg, #07254A 0%, #0e1726 100%) !important;
  box-shadow: 0 4px 14px rgba(7, 37, 74, 0.12);
}

.header-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}

.refresh-btn {
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.border-blue-subtle {
  border: 1px solid #cbd5e1 !important;
}

.test-card {
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
}

.test-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05) !important;
  border-color: #07254A !important;
}

.test-icon-box {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background-color: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
}

.test-title {
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: -0.2px;
  line-height: 1.3;
}

.test-description {
  font-size: 0.82rem;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.border-top-subtle {
  border-top: 1px solid #f1f5f9;
}

.download-btn {
  transition: transform 0.15s ease;
}

.download-btn:hover {
  transform: scale(1.02);
}

.gap-2 { gap: 8px; }
.gap-4 { gap: 16px; }
</style>
