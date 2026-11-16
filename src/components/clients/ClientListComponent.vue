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

    <!-- Data Table -->
    <v-card-text class="pa-0">
      <v-data-table
        v-model:page="page"
        v-model:items-per-page="itemsPerPage"
        class="custom-opalo-table"
        :headers="dt.headers"
        :items="clients"
        :search="dt.search"
        :loading="loading"
        hover
        density="comfortable"
        mobile-breakpoint="0"
      >
        <!-- RENDERIZADO DE FILA -->
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

            <!-- 2. RFC y Régimen Fiscal -->
            <td>
              <div class="d-flex flex-column align-start">
                <span class="badge-rfc font-mono">
                  {{ item.rfc }}
                </span>
                <span v-if="item.fiscal_regime || item.tax_regime" class="text-caption text-slate-500 mt-1 font-weight-medium">
                  {{ item.fiscal_regime || item.tax_regime }}
                </span>
              </div>
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

            <!-- 4. Constancia de Situación Fiscal -->
            <td class="text-center">
              <v-btn
                v-if="getCsfUrl(item)"
                variant="tonal"
                size="small"
                color="error"
                rounded="lg"
                prepend-icon="mdi-file-pdf-box"
                class="text-none font-weight-bold px-3 csf-btn"
                @click="openPdf(getCsfUrl(item))"
              >
                Ver CSF
              </v-btn>
              <span v-else class="text-caption text-grey-darken-1 font-italic">
                Sin CSF
              </span>
            </td>

            <!-- 5. O.C. Requerida -->
            <td class="text-center">
              <v-chip
                size="x-small"
                :color="item.requires_purchase_order ? '#D97706' : 'grey-lighten-2'"
                :variant="item.requires_purchase_order ? 'flat' : 'outlined'"
                class="font-weight-bold"
                :class="{ 'text-white': item.requires_purchase_order }"
              >
                <v-icon start size="12" :icon="item.requires_purchase_order ? 'mdi-file-check' : 'mdi-minus'"></v-icon>
                {{ item.requires_purchase_order ? 'PO Obligatoria' : 'No' }}
              </v-chip>
            </td>

            <!-- 6. Estatus -->
            <td class="text-center">
              <v-chip
                size="small"
                :color="!item.is_active ? 'error' : 'success'"
                variant="flat"
                class="font-weight-bold status-chip"
              >
                <v-icon start :icon="!item.is_active ? 'mdi-close-circle' : 'mdi-check-circle'" size="14"></v-icon>
                {{ !item.is_active ? 'Bloqueado' : 'Activo' }}
              </v-chip>
            </td>

            <!-- 7. Acciones -->
            <td class="text-end pr-4">
              <div class="d-flex align-center justify-end gap-1">
                <!-- Botón Editar -->
                <v-tooltip text="Editar datos de empresa" location="top">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon
                      size="small"
                      variant="tonal"
                      color="primary"
                      class="action-btn"
                      @click="openEditDialog(item)"
                    >
                      <v-icon icon="mdi-pencil-outline" size="18"></v-icon>
                    </v-btn>
                  </template>
                </v-tooltip>

                <!-- Botón Restablecer Contraseña -->
                <v-tooltip text="Restablecer contraseña y enviar por correo" location="top">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon
                      size="small"
                      variant="tonal"
                      color="amber-darken-3"
                      class="action-btn"
                      @click="openResetDialog(item)"
                    >
                      <v-icon icon="mdi-key-variant" size="18"></v-icon>
                    </v-btn>
                  </template>
                </v-tooltip>

                <!-- Botón Estatus -->
                <v-tooltip :text="!item.is_active ? 'Reactivar acceso' : 'Suspender acceso'" location="top">
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

                <!-- Botón Eliminar -->
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

        <!-- Paginación -->
        <template v-slot:bottom="{ pageCount }">
          <div class="d-flex align-center justify-end px-4 py-2 border-top gap-3 flex-wrap bg-white custom-footer">
            <div class="d-flex align-center gap-2">
              <span class="text-caption text-slate-600 font-weight-medium">Filas por página:</span>
              <v-select
                v-model="itemsPerPage"
                :items="[5, 10, 25, 50]"
                density="compact"
                variant="outlined"
                hide-details
                class="footer-select"
              ></v-select>
            </div>

            <span class="text-caption text-slate-600 font-weight-medium">
              {{ paginationText }}
            </span>

            <div class="d-flex align-center">
              <v-btn
                icon="mdi-page-first"
                variant="text"
                size="small"
                density="comfortable"
                :disabled="page <= 1"
                @click="page = 1"
              ></v-btn>
              <v-btn
                icon="mdi-chevron-left"
                variant="text"
                size="small"
                density="comfortable"
                :disabled="page <= 1"
                @click="page--"
              ></v-btn>
              <v-btn
                icon="mdi-chevron-right"
                variant="text"
                size="small"
                density="comfortable"
                :disabled="page >= pageCount"
                @click="page++"
              ></v-btn>
              <v-btn
                icon="mdi-page-last"
                variant="text"
                size="small"
                density="comfortable"
                :disabled="page >= pageCount"
                @click="page = pageCount"
              ></v-btn>
            </div>
          </div>
        </template>
      </v-data-table>
    </v-card-text>

    <!-- MODAL DE CONFIRMACIÓN RESTABLECER CONTRASEÑA -->
    <v-dialog v-model="resetDialog" max-width="460px" persistent>
      <v-card class="edit-modal-card">
        <div class="modal-header px-6 py-4 d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-icon icon="mdi-key-chain" color="#ffffff" size="22" class="mr-2"></v-icon>
            <h3 class="text-subtitle-1 font-weight-bold text-white mb-0">Restablecer Contraseña</h3>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" color="#ffffff" :disabled="resettingPassword" @click="resetDialog = false"></v-btn>
        </div>

        <v-card-text class="pa-6" v-if="resetTarget">
          <p class="text-body-2 text-slate-700 mb-3">
            Se generará una <strong>nueva contraseña temporal</strong> para la empresa <strong>{{ resetTarget.company_name }}</strong> y se enviará automáticamente al correo de acceso:
          </p>
          <div class="pa-3 rounded-lg bg-slate-50 border d-flex align-center gap-2">
            <v-icon icon="mdi-email-fast-outline" color="#07254A" size="20"></v-icon>
            <span class="font-weight-bold text-slate-800 text-body-2">{{ resetTarget.contact_email }}</span>
          </div>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="px-6 py-3 justify-end gap-2 bg-slate-50">
          <v-btn
            variant="plain"
            color="grey-darken-1"
            class="text-none font-weight-bold"
            :disabled="resettingPassword"
            @click="resetDialog = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            variant="flat"
            color="#D97706"
            prepend-icon="mdi-send"
            class="text-none font-weight-bold text-white px-5"
            :loading="resettingPassword"
            @click="confirmResetPassword"
          >
            Generar y Enviar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- MODAL DE EDICIÓN CORPORATIVO ÓPALO -->
    <v-dialog v-model="editDialog" max-width="680px" persistent>
      <v-card class="edit-modal-card">
        <div class="modal-header px-6 py-4 d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-icon icon="mdi-office-building-cog" color="#ffffff" size="22" class="mr-2"></v-icon>
            <h3 class="text-subtitle-1 font-weight-bold text-white mb-0">Editar Empresa Cliente</h3>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" color="#ffffff" @click="editDialog = false"></v-btn>
        </div>

        <v-card-text class="pa-6">
          <v-form ref="editForm" v-model="isFormValid" @submit.prevent="submitEdit">
            <v-row dense>
              <!-- Razón Social -->
              <v-col cols="12">
                <label class="form-label">Razón Social *</label>
                <v-text-field
                  v-model="editData.company_name"
                  variant="outlined"
                  density="comfortable"
                  placeholder="Ej. Servicios Integrales S.A. de C.V."
                  :rules="[v => !!v || 'La razón social es obligatoria']"
                  color="#07254A"
                ></v-text-field>
              </v-col>

              <!-- Nombre Comercial -->
              <v-col cols="12" md="6">
                <label class="form-label">Nombre Comercial</label>
                <v-text-field
                  v-model="editData.trade_name"
                  variant="outlined"
                  density="comfortable"
                  placeholder="Ej. Ópalo Solutions"
                  color="#07254A"
                ></v-text-field>
              </v-col>

              <!-- RFC -->
              <v-col cols="12" md="6">
                <label class="form-label">RFC *</label>
                <v-text-field
                  v-model="editData.rfc"
                  variant="outlined"
                  density="comfortable"
                  placeholder="Ej. SIS210410AA1"
                  :rules="[v => !!v || 'El RFC es obligatorio']"
                  color="#07254A"
                  @input="editData.rfc = editData.rfc.toUpperCase()"
                ></v-text-field>
              </v-col>

              <!-- Régimen Fiscal SAT -->
              <v-col cols="12">
                <label class="form-label">Régimen Fiscal (SAT)</label>
                <v-autocomplete
                  v-model="editData.fiscal_regime"
                  :items="taxRegimes"
                  variant="outlined"
                  density="comfortable"
                  placeholder="Selecciona el régimen fiscal..."
                  color="#07254A"
                  clearable
                ></v-autocomplete>
              </v-col>

              <!-- Correo Electrónico (Login) -->
              <v-col cols="12" md="6">
                <label class="form-label">Correo de Contacto (Login) *</label>
                <v-text-field
                  v-model="editData.contact_email"
                  type="email"
                  variant="outlined"
                  density="comfortable"
                  placeholder="contacto@empresa.com"
                  :rules="[
                    v => !!v || 'El correo es obligatorio',
                    v => /.+@.+\..+/.test(v) || 'Correo no válido'
                  ]"
                  color="#07254A"
                ></v-text-field>
              </v-col>

              <!-- Teléfono -->
              <v-col cols="12" md="6">
                <label class="form-label">Teléfono de Contacto</label>
                <v-text-field
                  v-model="editData.contact_phone"
                  variant="outlined"
                  density="comfortable"
                  placeholder="33 1234 5678"
                  color="#07254A"
                ></v-text-field>
              </v-col>

              <!-- Switch Orden de Compra -->
              <v-col cols="12" class="mt-2">
                <v-switch
                  v-model="editData.requires_purchase_order"
                  color="#07254A"
                  inset
                  density="compact"
                  hide-details
                >
                  <template #label>
                    <span class="text-body-2 text-slate-800 font-weight-medium">
                      Exigir Orden de Compra (PO Obligatoria para evaluaciones)
                    </span>
                  </template>
                </v-switch>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="px-6 py-3 justify-end gap-2 bg-slate-50">
          <v-btn
            variant="plain"
            color="grey-darken-1"
            class="text-none font-weight-bold"
            :disabled="updating"
            @click="editDialog = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            variant="flat"
            color="#07254A"
            class="text-none font-weight-bold text-white px-5"
            :loading="updating"
            @click="submitEdit"
          >
            Guardar Cambios
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="top right" timeout="4000">
      {{ snackbar.text }}
    </v-snackbar>
  </v-card>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useClientsStore } from '@/store/clients';
import api from '@/services/api';

export default {
  name: 'ClientListComponent',
  data() {
    return {
      page: 1,
      itemsPerPage: 10,
      dt: {
        search: '',
        headers: [
          { title: 'Empresa / Razón Social', key: 'company_name', align: 'start' },
          { title: 'RFC / Régimen', key: 'rfc', align: 'start', sortable: false },
          { title: 'Contacto / Login', key: 'contact_email', align: 'start' },
          { title: 'Constancia Fiscal (CSF)', key: 'fiscal_document', align: 'center', sortable: false },
          { title: 'O.C. Requerida', key: 'requires_purchase_order', align: 'center', sortable: false },
          { title: 'Estatus', key: 'is_active', align: 'center' },
          { title: 'Acciones', key: 'actions', align: 'end', sortable: false },
        ],
      },
      resetDialog: false,
      resetTarget: null,
      resettingPassword: false,
      editDialog: false,
      isFormValid: true,
      editId: null,
      editData: {
        company_name: '',
        trade_name: '',
        rfc: '',
        fiscal_regime: null,
        contact_email: '',
        contact_phone: '',
        requires_purchase_order: false,
      },
      taxRegimes: [
        '601 - General de Ley Personas Morales',
        '603 - Personas Morales con Fines no Lucrativos',
        '612 - Personas Físicas con Actividades Empresariales y Profesionales',
        '621 - Incorporación Fiscal',
        '624 - Coordinados',
        '626 - Régimen Simplificado de Confianza (RESICO)',
        '605 - Sueldos y Salarios e Ingresos Asimilados a Salarios',
        '606 - Arrendamiento',
      ],
      snackbar: { show: false, text: '', color: 'success' },
    };
  },

  computed: {
    ...mapState(useClientsStore, ['clients', 'loading', 'updating']),

    paginationText() {
      const total = this.clients.length;
      if (total === 0) return '0 de 0';
      const start = (this.page - 1) * this.itemsPerPage + 1;
      const end = Math.min(this.page * this.itemsPerPage, total);
      return `${start}-${end} de ${total}`;
    },
  },

  mounted() {
    this.fetchClients();
  },

  methods: {
    ...mapActions(useClientsStore, ['fetchClients', 'updateClient', 'toggleClientStatus', 'destroyClient']),

    notify(text, color = 'success') {
      this.snackbar.text = text;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },

    async reloadList() {
      try {
        await this.fetchClients();
        this.notify('Listado de empresas actualizado.');
      } catch (e) {
        this.notify('Error al recargar el directorio.', 'error');
      }
    },

    openResetDialog(item) {
      this.resetTarget = item;
      this.resetDialog = true;
    },

    async confirmResetPassword() {
      if (!this.resetTarget) return;

      this.resettingPassword = true;
      try {
        const res = await api.post(`/clients/${this.resetTarget.id}/reset-password`);
        this.notify(res.data?.message || 'Contraseña restablecida y enviada por correo.');
        this.resetDialog = false;
      } catch (e) {
        this.notify(e.response?.data?.message || 'Error al restablecer la contraseña.', 'error');
      } finally {
        this.resettingPassword = false;
      }
    },

    openEditDialog(item) {
      this.editId = item.id;
      this.editData = {
        company_name: item.company_name || '',
        trade_name: item.trade_name || '',
        rfc: item.rfc || '',
        fiscal_regime: item.fiscal_regime || item.tax_regime || null,
        contact_email: item.contact_email || '',
        contact_phone: item.contact_phone || '',
        requires_purchase_order: Boolean(item.requires_purchase_order),
      };
      this.editDialog = true;
    },

    async submitEdit() {
      const { valid } = await this.$refs.editForm.validate();
      if (!valid) return;

      try {
        const res = await this.updateClient(this.editId, this.editData);
        if (res.success) {
          this.notify(res.message);
          this.editDialog = false;
        } else {
          this.notify(res.message, 'error');
        }
      } catch (e) {
        this.notify('Error al actualizar la empresa.', 'error');
      }
    },

    getCsfUrl(item) {
      if (!item) return null;

      if (item.fiscal_document?.file_url) {
        return item.fiscal_document.file_url;
      }

      if (Array.isArray(item.fiscal_documents) && item.fiscal_documents.length > 0) {
        return item.fiscal_documents[0].file_url;
      }

      if (item.file_url) {
        return item.file_url;
      }

      return null;
    },

    openPdf(url) {
      if (url) {
        window.open(url, '_blank');
      }
    },

    async toggleStatus(item) {
      try {
        const res = await this.toggleClientStatus(item.id);
        if (res.success) {
          this.notify(res.message);
        } else {
          this.notify(res.message, 'error');
        }
      } catch (e) {
        this.notify('Error al actualizar el estatus.', 'error');
      }
    },

    async remove(id) {
      const confirmed = confirm('¿Deseas eliminar esta empresa del directorio?');
      if (!confirmed) return;

      try {
        const res = await this.destroyClient(id);
        if (res.success) {
          this.notify(res.message);
        } else {
          this.notify(res.message, 'error');
        }
      } catch (e) {
        this.notify('Error al eliminar la empresa.', 'error');
      }
    },
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

.badge-rfc {
  background-color: #f1f5f9;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 700;
  color: #1e293b;
  border: 1px solid #e2e8f0;
}

.csf-btn {
  font-size: 0.74rem !important;
  height: 28px !important;
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

.footer-select {
  width: 80px;
}

:deep(.footer-select .v-field) {
  border-radius: 6px !important;
  font-size: 0.78rem !important;
  min-height: 32px !important;
  height: 32px !important;
}

:deep(.footer-select .v-field__input) {
  padding-top: 4px !important;
  padding-bottom: 4px !important;
}

.custom-footer {
  border-top: 1px solid #e2e8f0;
}

/* Modal */
.edit-modal-card {
  border-radius: 14px !important;
  overflow: hidden;
}

.modal-header {
  background: linear-gradient(135deg, #07254A 0%, #0e1726 100%) !important;
}

.form-label {
  display: block;
  font-size: 0.76rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
}

.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
</style>
