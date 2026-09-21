<template>
  <v-card flat class="client-table-card elevation-0 mt-4">
    <!-- Cabecera Corporativa Ópalo -->
    <div class="card-table-header px-6 py-4 d-flex flex-wrap align-center justify-space-between gap-3">
      <div class="d-flex align-center">
        <div class="header-icon-box mr-3 flex-shrink-0">
          <v-icon icon="mdi-domain" color="#ffffff" size="20"></v-icon>
        </div>
        <div>
          <h2 class="card-title text-white mb-0">Directorio de Empresas Clientes</h2>
          <span class="card-subtitle text-white opacity-80">
            Total de registros: {{ clients.length }}
          </span>
        </div>
      </div>

      <div class="d-flex align-center gap-2">
        <v-chip color="rgba(255,255,255,0.15)" text-color="#ffffff" size="small" class="font-weight-bold mr-2 text-white">
          {{ clients.length }} Registrados
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

    <!-- Barra de Filtro / Búsqueda -->
    <div class="table-toolbar px-6 py-3 border-bottom bg-slate-50">
      <v-row dense align="center">
        <v-col cols="12" sm="7" md="5">
          <v-text-field
            v-model="dt.search"
            placeholder="Buscar por razón social, RFC o correo..."
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

    <!-- Data Table con v-slot:item para alinear columnas perfectamente -->
    <v-card-text class="pa-0">
      <v-data-table
        class="custom-opalo-table"
        :headers="dt.headers"
        :items="clients"
        :search="dt.search"
        :loading="loading"
        hover
        density="comfortable"
        mobile-breakpoint="0"
      >
        <!-- RENDERIZADO DE FILA SINCRONIZADA -->
        <template v-slot:item="{ item }">
          <tr class="table-row">
            <!-- 1. Empresa / Razón Social -->
            <td class="py-3">
              <div class="company-name font-weight-bold text-slate-800">
                {{ item.company_name }}
              </div>
              <div class="trade-name text-caption text-grey">
                {{ item.trade_name || 'Sin nombre comercial' }}
              </div>
            </td>

            <!-- 2. RFC -->
            <td>
              <span class="badge-rfc font-mono">
                {{ item.rfc }}
              </span>
            </td>

            <!-- 3. Contacto / Login -->
            <td>
              <div class="d-flex align-center contact-line">
                <v-icon icon="mdi-email-outline" size="15" class="mr-1 text-slate-400"></v-icon>
                <span class="text-body-2 text-slate-700 text-truncate">{{ item.contact_email }}</span>
              </div>
              <div v-if="item.contact_phone" class="d-flex align-center contact-line mt-1 text-caption text-grey">
                <v-icon icon="mdi-phone-outline" size="14" class="mr-1 text-slate-400"></v-icon>
                <span>{{ item.contact_phone }}</span>
              </div>
            </td>

            <!-- 4. Régimen Fiscal -->
            <td>
              <span class="regime-text">
                {{ formatRegime(item.fiscal_regime) }}
              </span>
            </td>

            <!-- 5. Estatus -->
            <td class="text-center">
              <v-chip
                size="small"
                :color="!!!item.is_active ? 'error' : 'success'"
                variant="flat"
                class="font-weight-bold status-chip"
              >
                <v-icon start :icon="!!!item.is_active ? 'mdi-close-circle' : 'mdi-check-circle'" size="14"></v-icon>
                {{ !!!item.is_active ? 'Bloqueado' : 'Activo' }}
              </v-chip>
            </td>

            <!-- 6. Acciones -->
            <td class="text-end pr-4">
              <div class="d-flex align-center justify-end gap-1">
                <v-tooltip :text="!!!item.is_active ? 'Reactivar acceso' : 'Suspender acceso'" location="top">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon
                      size="small"
                      variant="tonal"
                      :color="item.is_active ? 'success' : 'grey-darken-1'"
                      class="action-btn"
                      @click="toggleStatus(item)"
                    >
                      <v-icon :icon="item.is_active ? 'mdi-lock-open-outline' : 'mdi-lock-outline'" size="18"></v-icon>
                    </v-btn>
                  </template>
                </v-tooltip>

                <v-tooltip text="Eliminar empresa" location="top">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon
                      size="small"
                      variant="tonal"
                      color="error"
                      class="action-btn"
                      @click="remove(item.id)"
                    >
                      <v-icon icon="mdi-delete-outline" size="18"></v-icon>
                    </v-btn>
                  </template>
                </v-tooltip>
              </div>
            </td>
          </tr>
        </template>

        <!-- Sin registros -->
        <template v-slot:no-data>
          <div class="py-10 text-center">
            <v-avatar size="64" color="#f8fafc" class="mb-3 empty-avatar">
              <v-icon size="32" color="#b5a08f">mdi-folder-open-outline</v-icon>
            </v-avatar>
            <div class="text-subtitle-1 font-weight-bold text-slate-800">
              No hay empresas registradas aún
            </div>
            <div class="text-caption text-grey mb-3">
              Completa el formulario de arriba para dar de alta un nuevo cliente.
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
import api from '@/services/api';

export default {
  name: 'ClientListComponent',
  data() {
    return {
      clients: [],
      loading: false,
      snackbar: {
        show: false,
        text: '',
        color: 'success',
      },
      dt: {
        headers: [
          { title: 'EMPRESA / RAZÓN SOCIAL', key: 'company_name', width: '32%' },
          { title: 'RFC', key: 'rfc', width: '15%' },
          { title: 'CONTACTO / LOGIN', key: 'contact_email', width: '23%' },
          { title: 'RÉGIMEN FISCAL', key: 'fiscal_regime', width: '14%' },
          { title: 'ESTATUS', key: 'status', align: 'center', width: '8%', sortable: false },
          { title: '', key: 'actions', align: 'end', width: '8%', sortable: false },
        ],
        search: '',
      },
    };
  },
  methods: {
    notify(text, color = 'success') {
      this.snackbar.text = text;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },

    formatRegime(code) {
      if (!code) return 'N/A';
      const map = {
        '601': '601 - General PM',
        '603': '603 - Sin Fines Lucrativos',
        '612': '612 - Personas Físicas',
        '620': '620 - Cooperativas',
        '626': '626 - RESICO',
      };
      return map[code] || code;
    },

    addClient(newClient) {
      this.clients.unshift(newClient);
    },

    async reloadList() {
      this.loading = true;
      try {
        const response = await api.get('/clients');
        this.clients = response.data;
      } catch (err) {
        this.notify('Error al cargar la lista de empresas.', 'error');
      } finally {
        this.loading = false;
      }
    },

    async toggleStatus(client) {
			console.log('toggleStatus called for client:', client);
				try {
					const response = await api.post(`/clients/${client.id}/toggle-status`);
					client.is_active = client.is_active ? false : true;
					this.notify(response.data.message || 'Estatus actualizado.');
				} catch (err) {
					this.notify('Error al actualizar estatus.', 'error');
				}
    },

    async remove(id) {
      try {
        const response = await api.delete(`/clients/${id}`);
        this.clients = this.clients.filter((c) => c.id !== id);
        this.notify(response.data.message || 'Empresa eliminada.');
      } catch (err) {
        this.notify('Error al eliminar empresa.', 'error');
      }
    },
  },
  mounted() {
    this.reloadList();
  },
};
</script>

<style scoped>
.client-table-card {
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

/* Cabeceras */
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

/* Celdas */
.table-row td {
  padding: 12px 16px !important;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.table-row:hover {
  background-color: #f8fafc !important;
}

.company-name {
  font-size: 0.88rem;
  line-height: 1.25;
}

.badge-rfc {
  display: inline-block;
  background-color: #f1f5f9;
  color: #07254A;
  border: 1px solid #cbd5e1;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 700;
}

.contact-line {
  font-size: 0.82rem;
}

.regime-text {
  font-size: 0.8rem;
  color: #475569;
  font-weight: 500;
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
</style>
