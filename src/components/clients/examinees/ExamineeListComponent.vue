<template>
  <v-card flat class="examinee-table-card elevation-0 mt-4">
    <!-- Cabecera Corporativa -->
    <div class="card-table-header px-6 py-4 d-flex flex-wrap align-center justify-space-between gap-3">
      <div class="d-flex align-center">
        <div class="header-icon-box mr-3 flex-shrink-0">
          <v-icon icon="mdi-badge-account-horizontal-outline" color="#ffffff" size="20"></v-icon>
        </div>
        <div>
          <h2 class="card-title text-white mb-0">Listado de Evaluados Registrados</h2>
          <span class="card-subtitle text-white opacity-80">
            Total de registros: {{ totalExaminees }}
          </span>
        </div>
      </div>

      <div class="d-flex align-center gap-2">
        <v-chip color="rgba(255,255,255,0.15)" text-color="#ffffff" size="small" class="font-weight-bold mr-2 text-white">
          {{ totalExaminees }} Evaluados
        </v-chip>
        <v-btn
          variant="flat"
          size="small"
          color="#ffffff"
          prepend-icon="mdi-refresh"
          class="text-none font-weight-bold reload-btn"
          :loading="loading"
          @click="reloadList"
        >
          Recargar
        </v-btn>
      </div>
    </div>

    <!-- Barra de Búsqueda -->
    <div class="table-toolbar px-6 py-3 border-bottom bg-slate-50">
      <v-row dense align="center">
        <v-col cols="12" sm="7" md="5">
          <v-text-field
            v-model="dt.search"
            placeholder="Buscar por evaluado, puesto, teléfono o CURP..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            hide-details
            rounded="lg"
            bg-color="#ffffff"
            color="#07254A"
            class="search-input"
            clearable
          ></v-text-field>
        </v-col>
      </v-row>
    </div>

    <!-- Data Table de Vuetify 3 -->
    <v-card-text class="pa-0">
      <v-data-table
        class="custom-opalo-table"
        :headers="dt.headers"
        :items="examinees"
        :search="dt.search"
        :custom-filter="customFilter"
        :loading="loading"
        hover
        density="comfortable"
        mobile-breakpoint="0"
      >
        <!-- 1. Evaluado / Nombre + Expediente -->
        <template v-slot:[`item.full_name`]="{ item }">
          <div class="d-flex align-center py-2">
            <v-avatar size="32" color="#07254A" class="mr-3 text-white font-weight-bold text-caption flex-shrink-0">
              {{ getInitials(item.full_name) }}
            </v-avatar>
            <div class="min-w-0">
              <div class="item-name font-weight-bold text-slate-800 text-truncate" style="max-width: 250px;">
                {{ item.full_name }}
              </div>
              <div class="item-sub text-caption text-grey font-mono">
                Exp: {{ item.file_number || '---' }}
              </div>
            </div>
          </div>
        </template>

        <!-- 2. Puesto / Categoría -->
        <template v-slot:[`item.position`]="{ item }">
          <div class="text-body-2 font-weight-medium text-slate-700 text-truncate" style="max-width: 200px;">
            {{ item.position }}
          </div>
        </template>

        <!-- 3. Contacto (Teléfono y Correo) -->
        <template v-slot:[`item.contact`]="{ item }">
          <div>
            <div class="d-flex align-center font-mono text-body-2 font-weight-medium text-slate-800">
              <v-icon icon="mdi-phone-outline" size="14" class="mr-1 text-slate-500"></v-icon>
              {{ item.phone }}
            </div>
            <div v-if="item.email" class="d-flex align-center item-sub text-caption text-grey mt-0 text-truncate" style="max-width: 200px;">
              <v-icon icon="mdi-email-outline" size="12" class="mr-1"></v-icon>
              {{ item.email }}
            </div>
          </div>
        </template>

        <!-- 4. CURP -->
        <template v-slot:[`item.curp`]="{ item }">
          <span class="font-mono text-caption text-slate-700">
            {{ item.curp || 'No registrada' }}
          </span>
        </template>

        <!-- 5. Estatus -->
        <template v-slot:[`item.status`]="{ item }">
          <div class="text-center">
            <v-chip
              size="small"
              :color="getStatusColor(item.status)"
              variant="flat"
              class="font-weight-bold status-chip"
            >
              <v-icon start :icon="getStatusIcon(item.status)" size="14"></v-icon>
              {{ formatStatus(item.status) }}
            </v-chip>
          </div>
        </template>

        <!-- 6. Acciones -->
        <template v-slot:[`item.actions`]="{ item }">
          <div class="d-flex align-center justify-end gap-1 pr-2">
            <v-tooltip text="Eliminar evaluado" location="top">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon
                  size="small"
                  variant="tonal"
                  color="error"
                  class="action-btn"
                  @click="handleRemove(item.id)"
                >
                  <v-icon icon="mdi-delete-outline" size="18"></v-icon>
                </v-btn>
              </template>
            </v-tooltip>
          </div>
        </template>

        <!-- Sin registros -->
        <template v-slot:no-data>
          <div class="py-10 text-center">
            <v-avatar size="64" color="#f8fafc" class="mb-3 empty-avatar">
              <v-icon size="32" color="#07254A">mdi-account-off-outline</v-icon>
            </v-avatar>
            <div class="text-subtitle-1 font-weight-bold text-slate-800">
              No tienes evaluados registrados aún
            </div>
            <div class="text-caption text-grey mb-3">
              Completa el formulario superior para registrar tus candidatos a evaluación.
            </div>
          </div>
        </template>
      </v-data-table>
    </v-card-text>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="top right" timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </v-card>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useExamineesStore } from '@/store/examinees';

export default {
  name: 'ExamineeListComponent',
  data() {
    return {
      snackbar: { show: false, text: '', color: 'success' },
      dt: {
        headers: [
          { title: 'EVALUADO / NOMBRE', key: 'full_name', width: '30%', sortable: true },
          { title: 'PUESTO / CATEGORÍA', key: 'position', width: '22%', sortable: true },
          { title: 'CONTACTO', key: 'contact', value: item => `${item.phone} ${item.email || ''}`, width: '20%', sortable: false },
          { title: 'CURP', key: 'curp', width: '15%', sortable: true },
          { title: 'ESTATUS', key: 'status', align: 'center', width: '10%', sortable: true },
          { title: '', key: 'actions', align: 'end', width: '3%', sortable: false },
        ],
        search: '',
      },
    };
  },

  computed: {
    ...mapState(useExamineesStore, ['examinees', 'loading', 'totalExaminees']),
  },

  mounted() {
    this.fetchExaminees();
  },

  methods: {
    ...mapActions(useExamineesStore, ['fetchExaminees', 'reloadList', 'removeExaminee']),

    notify(text, color = 'success') {
      this.snackbar.text = text;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },

    customFilter(value, query, item) {
      if (!query) return true;
      const q = query.toLowerCase().trim();
      const raw = item?.raw || item;
      const name = raw.full_name?.toLowerCase() || '';
      const pos = raw.position?.toLowerCase() || '';
      const phone = raw.phone?.toLowerCase() || '';
      const email = raw.email?.toLowerCase() || '';
      const curp = raw.curp?.toLowerCase() || '';
      const file = raw.file_number?.toLowerCase() || '';

      return (
        name.includes(q) ||
        pos.includes(q) ||
        phone.includes(q) ||
        email.includes(q) ||
        curp.includes(q) ||
        file.includes(q)
      );
    },

    getInitials(name) {
      if (!name) return 'EV';
      const parts = name.trim().split(' ');
      return parts.length > 1
        ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
        : parts[0].substring(0, 2).toUpperCase();
    },

    async handleRemove(id) {
      const res = await this.removeExaminee(id);
      this.notify(res.message, res.success ? 'success' : 'error');
    },

    getStatusColor(status) {
      const map = {
        registered: '#475569',
        scheduled: '#0284C7',
        in_process: '#F59E0B',
        completed: '#10B981',
      };
      return map[status] || '#475569';
    },

    getStatusIcon(status) {
      const map = {
        registered: 'mdi-account-check-outline',
        scheduled: 'mdi-calendar-clock',
        in_process: 'mdi-progress-clock',
        completed: 'mdi-check-circle-outline',
      };
      return map[status] || 'mdi-account-outline';
    },

    formatStatus(status) {
      const map = {
        registered: 'Registrado',
        scheduled: 'Cita Agendada',
        in_process: 'En Proceso',
        completed: 'Evaluado',
      };
      return map[status] || status;
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
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
}

.table-toolbar {
  border-bottom: 1px solid #e2e8f0;
  background-color: #f8fafc;
}

.bg-slate-50 {
  background-color: #f8fafc;
}

:deep(.search-input .v-field) {
  border-radius: 8px !important;
  border: 1px solid #cbd5e1 !important;
  font-size: 0.85rem !important;
}

:deep(.custom-opalo-table thead th) {
  font-size: 0.73rem !important;
  font-weight: 700 !important;
  color: #64748b !important;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background-color: #ffffff !important;
  border-bottom: 1px solid #e2e8f0 !important;
  padding: 12px 16px !important;
}

:deep(.custom-opalo-table tbody td) {
  padding: 12px 16px !important;
  border-bottom: 1px solid #f1f5f9 !important;
  vertical-align: middle !important;
}

:deep(.custom-opalo-table tbody tr:hover) {
  background-color: #f8fafc !important;
}

.item-name {
  font-size: 0.88rem;
  line-height: 1.25;
}

.item-sub {
  font-size: 0.75rem;
}

.status-chip {
  padding: 0 10px !important;
  height: 24px !important;
  font-size: 0.75rem !important;
}

.action-btn {
  border-radius: 8px !important;
  width: 32px !important;
  height: 32px !important;
}

.empty-avatar {
  border: 1px solid #e2e8f0;
}

.font-mono {
  font-family: monospace;
}

.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
</style>
