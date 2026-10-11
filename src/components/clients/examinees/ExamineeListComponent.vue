<template>
  <v-card flat class="examinee-table-card elevation-0 mt-4">
    <!-- Header Corporativo Ópalo -->
    <div class="card-table-header px-6 py-4 d-flex flex-wrap align-center justify-space-between gap-3">
      <div class="d-flex align-center">
        <div class="header-icon-box mr-3 flex-shrink-0">
          <v-icon icon="mdi-badge-account-horizontal-outline" color="#ffffff" size="20"></v-icon>
        </div>
        <div>
          <h2 class="card-title text-white mb-0">Directorio de Candidatos Evaluados</h2>
          <span class="card-subtitle text-white opacity-80">
            Control de aspirantes, agenda y expediente digital
          </span>
        </div>
      </div>

      <div class="d-flex align-center gap-2">
        <v-chip color="rgba(255,255,255,0.15)" text-color="#ffffff" size="small" class="font-weight-bold mr-2 text-white">
          {{ examinees.length }} Registrados
        </v-chip>
        <v-btn
          variant="flat"
          size="small"
          color="#ffffff"
          prepend-icon="mdi-refresh"
          class="text-none font-weight-bold reload-btn"
          :loading="loading"
          @click="fetchExaminees"
        >
          Recargar
        </v-btn>
      </div>
    </div>

    <!-- Barra de Filtros / Búsqueda -->
    <div class="table-toolbar px-6 py-3 border-bottom bg-slate-50">
      <v-row dense align="center">
        <v-col cols="12" sm="7" md="5">
          <v-text-field
            v-model="dt.search"
            placeholder="Buscar por candidato, puesto, CURP o teléfono..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            hide-details
            rounded="lg"
            bg-color="#ffffff"
            color="#07254A"
            class="search-input"
          ></v-text-field>
        </v-col>
      </v-row>
    </div>

    <!-- Data Table Corporativa -->
    <v-card-text class="pa-0">
      <v-data-table
        class="custom-opalo-table"
        :headers="dt.headers"
        :items="examinees"
        :search="dt.search"
        :loading="loading"
        hover
        density="comfortable"
        mobile-breakpoint="0"
      >
        <template v-slot:item="{ item }">
          <tr class="table-row">
            <!-- 1. Candidato con Avatar -->
            <td class="py-3">
              <div class="d-flex align-center">
                <v-avatar size="36" color="#07254A" class="mr-3 text-white font-weight-bold text-caption">
                  {{ getInitials(item.full_name) }}
                </v-avatar>
                <div>
                  <div class="font-weight-bold text-slate-800 text-body-2">
                    {{ item.full_name }}
                  </div>
                  <div class="badge-curp text-caption font-mono mt-1">
                    {{ item.curp }}
                  </div>
                </div>
              </div>
            </td>

            <!-- 2. Puesto Solicitado -->
            <td>
              <div class="text-body-2 font-weight-semibold text-slate-800">
                {{ item.position || 'No especificado' }}
              </div>
              <div class="text-caption text-slate-400">
                Aspirante de proceso
              </div>
            </td>

            <!-- 3. Contacto Directo -->
            <td>
              <div class="d-flex align-center contact-item">
                <v-icon icon="mdi-phone-outline" size="14" class="mr-1 text-slate-400"></v-icon>
                <span class="text-body-2 text-slate-700 font-mono font-weight-medium">
                  {{ item.phone || 'Sin número' }}
                </span>
              </div>
              <div v-if="item.email" class="d-flex align-center contact-item mt-1">
                <v-icon icon="mdi-email-outline" size="14" class="mr-1 text-slate-400"></v-icon>
                <span class="text-caption text-slate-500 text-truncate">
                  {{ item.email }}
                </span>
              </div>
            </td>

            <!-- 4. Estatus Operativo -->
            <td class="text-center">
              <v-chip
                size="small"
                :color="getStatusColor(item.status)"
                variant="flat"
                class="font-weight-bold status-chip text-white"
              >
                <v-icon start :icon="getStatusIcon(item.status)" size="14"></v-icon>
                {{ formatStatus(item.status) }}
              </v-chip>
            </td>

            <!-- 5. Acciones: WhatsApp y Expediente Digital -->
            <td class="text-end pr-4">
              <div class="d-flex align-center justify-end gap-1">
                <v-tooltip text="Contactar por WhatsApp" location="top">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon
                      size="small"
                      variant="tonal"
                      color="#25D366"
                      class="action-btn"
                      :disabled="!item.phone"
                      @click="openWhatsApp(item)"
                    >
                      <v-icon icon="mdi-whatsapp" size="18"></v-icon>
                    </v-btn>
                  </template>
                </v-tooltip>

                <v-tooltip text="Subir fotografías y referencias personales" location="top">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      size="small"
                      variant="flat"
                      color="#07254A"
                      rounded="lg"
                      prepend-icon="mdi-folder-upload-outline"
                      class="text-none font-weight-bold text-white px-3 ml-1"
                      @click="$emit('open-dossier', item)"
                    >
                      Expediente
                    </v-btn>
                  </template>
                </v-tooltip>
              </div>
            </td>
          </tr>
        </template>

        <!-- Estado vacío -->
        <template v-slot:no-data>
          <div class="py-10 text-center">
            <v-avatar size="64" color="#f8fafc" class="mb-3 empty-avatar">
              <v-icon size="32" color="#07254A">mdi-account-off-outline</v-icon>
            </v-avatar>
            <div class="text-subtitle-1 font-weight-bold text-slate-800">
              No hay candidatos registrados en este momento
            </div>
            <div class="text-caption text-grey">
              Registra un aspirante en el formulario de arriba para iniciar su evaluación.
            </div>
          </div>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'ExamineeListComponent',
  emits: ['open-dossier'],
  data() {
    return {
      examinees: [],
      loading: false,
      dt: {
        search: '',
        headers: [
          { title: 'Candidato / Evaluado', key: 'full_name', align: 'start' },
          { title: 'Puesto', key: 'position', align: 'start' },
          { title: 'Datos de Contacto', key: 'phone', align: 'start' },
          { title: 'Estatus', key: 'status', align: 'center' },
          { title: 'Acciones', key: 'actions', align: 'end', sortable: false },
        ],
      },
    };
  },

  mounted() {
    this.fetchExaminees();
  },

  methods: {
    async fetchExaminees() {
      this.loading = true;
      try {
        const res = await api.get('/portal/examinees');
        this.examinees = res.data || [];
      } catch (e) {
        console.error('Error cargando candidatos:', e);
      } finally {
        this.loading = false;
      }
    },

    addExamineeToTop(examinee) {
      if (examinee && examinee.id) {
        const exists = this.examinees.some((e) => e.id === examinee.id);
        if (!exists) {
          this.examinees.unshift(examinee);
        }
      }
    },

    getInitials(name) {
      if (!name) return 'EX';
      return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join('');
    },

    getStatusColor(status) {
      const map = {
        registered: '#0284C7',
        scheduled: '#10B981',
        in_process: '#F59E0B',
        completed: '#059669',
        cancelled: '#EF4444',
      };
      return map[status] || '#0284C7';
    },

    getStatusIcon(status) {
      const map = {
        registered: 'mdi-account-plus-outline',
        scheduled: 'mdi-calendar-check',
        in_process: 'mdi-progress-clock',
        completed: 'mdi-check-decagram',
        cancelled: 'mdi-cancel',
      };
      return map[status] || 'mdi-account-outline';
    },

    formatStatus(status) {
      const map = {
        registered: 'Registrado',
        scheduled: 'Cita Agendada',
        in_process: 'En Evaluación',
        completed: 'Completado',
        cancelled: 'Cancelado',
      };
      return map[status] || 'Registrado';
    },

    openWhatsApp(item) {
      const rawPhone = item.phone || '';
      const cleanPhone = rawPhone.replace(/\D/g, '');
      const name = item.full_name || 'Candidato';
      const msg = encodeURIComponent(`Hola ${name}, te contactamos para dar seguimiento a tu proceso de evaluación.`);
      window.open(`https://wa.me/52${cleanPhone}?text=${msg}`, '_blank');
    },
  },
};
</script>

<style scoped>
.examinee-table-card {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 14px !important;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04) !important;
}

.card-table-header {
  background: linear-gradient(135deg, #07254A 0%, #0e1726 100%) !important;
}

.header-icon-box {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-title {
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: -0.2px;
}

.card-subtitle {
  font-size: 0.78rem;
}

.reload-btn {
  color: #07254A !important;
  border-radius: 8px !important;
}

.table-toolbar {
  border-bottom: 1px solid #e2e8f0;
}

.bg-slate-50 {
  background-color: #f8fafc;
}

:deep(.search-input .v-field) {
  border-radius: 8px !important;
  font-size: 0.84rem !important;
}

.table-row:hover {
  background-color: #f8fafc;
}

.badge-curp {
  display: inline-block;
  background-color: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
  color: #475569;
  border: 1px solid #e2e8f0;
  font-size: 0.72rem;
}

.contact-item {
  font-size: 0.82rem;
}

.status-chip {
  padding: 0 8px !important;
  height: 22px !important;
  font-size: 0.72rem !important;
}

.action-btn {
  border-radius: 8px !important;
}

.empty-avatar {
  border: 1px solid #e2e8f0;
}

.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
</style>
