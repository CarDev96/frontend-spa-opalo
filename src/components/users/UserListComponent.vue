<template>
  <v-card flat class="user-table-card elevation-0 mt-4">
    <!-- Cabecera Corporativa Ópalo -->
    <div class="card-table-header px-6 py-4 d-flex flex-wrap align-center justify-space-between gap-3">
      <div class="d-flex align-center">
        <div class="header-icon-box mr-3 flex-shrink-0">
          <v-icon icon="mdi-account-tie-outline" color="#ffffff" size="20"></v-icon>
        </div>
        <div>
          <h2 class="card-title text-white mb-0">Personal del Equipo</h2>
          <span class="card-subtitle text-white opacity-80">
            Total de registros: {{ totalUsers }}
          </span>
        </div>
      </div>

      <div class="d-flex align-center gap-2">
        <v-chip color="rgba(255,255,255,0.15)" text-color="#ffffff" size="small" class="font-weight-bold mr-2 text-white">
          {{ totalUsers }} Registrados
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
            placeholder="Buscar por colaborador, correo o rol..."
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

    <!-- Data Table con v-slot:item sincronizada -->
    <v-card-text class="pa-0">
      <v-data-table
        class="custom-opalo-table"
        :headers="dt.headers"
        :items="users"
        :search="dt.search"
        :loading="loading"
        hover
        density="comfortable"
        mobile-breakpoint="0"
      >
        <!-- RENDERIZADO DE FILA SINCRONIZADA -->
        <template v-slot:item="{ item }">
          <tr class="table-row">
            <!-- 1. Colaborador / Nombre -->
            <td class="py-3">
              <div class="d-flex align-center">
                <v-avatar size="32" :color="getRoleColor(item.role?.name)" class="mr-3 text-white font-weight-bold text-caption">
                  {{ getInitials(item.name) }}
                </v-avatar>
                <div>
                  <div class="user-name font-weight-bold text-slate-800">
                    {{ item.name }}
                  </div>
                  <div class="user-id text-caption text-grey">
                    ID: {{ item.id ? item.id.substring(0, 8) : '---' }}
                  </div>
                </div>
              </div>
            </td>

            <!-- 2. Correo Institucional -->
            <td>
              <div class="d-flex align-center contact-line">
                <v-icon icon="mdi-email-outline" size="15" class="mr-1 text-slate-400"></v-icon>
                <span class="text-body-2 text-slate-700 text-truncate">{{ item.email }}</span>
              </div>
            </td>

            <!-- 3. Rol / Perfil Operativo -->
            <td>
              <v-chip
                size="small"
                variant="tonal"
                :color="getRoleColor(item.role?.name)"
                class="font-weight-bold role-chip"
              >
                <v-icon start :icon="getRoleIcon(item.role?.name)" size="14"></v-icon>
                {{ item.role?.description || item.role?.name || 'Staff' }}
              </v-chip>
            </td>

            <!-- 4. Estatus -->
            <td class="text-center">
              <v-chip
                size="small"
                :color="item.deleted_at ? 'error' : 'success'"
                variant="flat"
                class="font-weight-bold status-chip"
              >
                <v-icon start :icon="item.deleted_at ? 'mdi-close-circle' : 'mdi-check-circle'" size="14"></v-icon>
                {{ item.deleted_at ? 'Inactivo' : 'Activo' }}
              </v-chip>
            </td>

            <!-- 5. Acciones -->
            <td class="text-end pr-4">
              <div class="d-flex align-center justify-end gap-1">
                <!-- Eliminar -->
                <v-tooltip text="Eliminar usuario" location="top">
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
            </td>
          </tr>
        </template>

        <!-- Sin registros -->
        <template v-slot:no-data>
          <div class="py-10 text-center">
            <v-avatar size="64" color="#f8fafc" class="mb-3 empty-avatar">
              <v-icon size="32" color="#opaloBrand">mdi-account-off-outline</v-icon>
            </v-avatar>
            <div class="text-subtitle-1 font-weight-bold text-slate-800">
              No hay colaboradores registrados aún
            </div>
            <div class="text-caption text-grey mb-3">
              Completa el formulario de arriba para dar de alta al equipo operativo.
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
import { useUserStore } from '@/store/users';

export default {
  name: 'UserListComponent',
  data() {
    return {
      snackbar: {
        show: false,
        text: '',
        color: 'success',
      },
      dt: {
        headers: [
          { title: 'COLABORADOR / NOMBRE', key: 'name', width: '35%' },
          { title: 'CORREO INSTITUCIONAL', key: 'email', width: '30%' },
          { title: 'PERFIL / ESPECIALIDAD', key: 'role', width: '17%' },
          { title: 'ESTATUS', key: 'status', align: 'center', width: '10%', sortable: false },
          { title: '', key: 'actions', align: 'end', width: '8%', sortable: false },
        ],
        search: '',
      },
    };
  },

  computed: {
    // Se mapean los estados y getters reactivos desde Pinia
    ...mapState(useUserStore, ['users', 'loading', 'totalUsers', 'activeUsers']),
  },

  methods: {
    // Se mapean las acciones del store
    ...mapActions(useUserStore, [
      'fetchUsers',
      'reloadList',
      'toggleStatus',
      'removeUser',
      'addUser',
    ]),

    notify(text, color = 'success') {
      this.snackbar.text = text;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },

    async handleRemove(id) {
      const res = await this.removeUser(id);
      this.notify(res.message, res.success ? 'success' : 'error');
    },

    async handleToggleStatus(user) {
      const res = await this.toggleStatus(user);
      this.notify(res.message, res.success ? 'success' : 'error');
    },

    getInitials(name) {
      if (!name) return 'OP';
      const parts = name.trim().split(' ');
      return parts.length > 1
        ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
        : parts[0].substring(0, 2).toUpperCase();
    },

    getRoleColor(roleName) {
      const map = {
        psychologist: '#5b21b6', // Púrpura (Psicología)
        social_work: '#0d9488',  // Teal (Trabajo Social)
        sales: '#d97706',        // Ámbar (Ventas)
        admin: '#07254A',        // Azul Ópalo (Administración)
      };
      return map[roleName] || '#475569';
    },

    getRoleIcon(roleName) {
      const map = {
        psychologist: 'mdi-brain',
        social_work: 'mdi-home-heart',
        sales: 'mdi-chart-line',
        admin: 'mdi-shield-crown-outline',
      };
      return map[roleName] || 'mdi-badge-account-outline';
    },
  },

  mounted() {
    this.fetchUsers();
  },
};
</script>

<style scoped>
.user-table-card {
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

.user-name {
  font-size: 0.88rem;
  line-height: 1.25;
}

.user-id {
  font-size: 0.75rem;
}

.contact-line {
  font-size: 0.82rem;
}

.role-chip {
  font-size: 0.75rem !important;
  height: 24px !important;
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
</style>
