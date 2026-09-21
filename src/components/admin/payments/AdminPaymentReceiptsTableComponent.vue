<template>
  <v-card flat class="user-table-card elevation-0 mt-4">
    <!-- Cabecera Corporativa Ópalo -->
    <div class="card-table-header px-6 py-4 d-flex flex-wrap align-center justify-space-between gap-3">
      <div class="d-flex align-center">
        <div class="header-icon-box mr-3 flex-shrink-0">
          <v-icon icon="mdi-cash-check" color="#ffffff" size="20"></v-icon>
        </div>
        <div>
          <h2 class="card-title text-white mb-0">Comprobantes de Pago</h2>
          <span class="card-subtitle text-white opacity-80">
            Total de registros: {{ receiptList.length }}
          </span>
        </div>
      </div>

      <div class="d-flex align-center gap-2">
        <v-chip
          v-if="pendingCount > 0"
          color="rgba(255,255,255,0.15)"
          text-color="#ffffff"
          size="small"
          class="font-weight-bold mr-2 text-white"
        >
          {{ pendingCount }} Pendientes
        </v-chip>
        <v-btn
          variant="flat"
          size="small"
          color="#ffffff"
          prepend-icon="mdi-refresh"
          class="text-none font-weight-bold reload-btn"
          :loading="loading"
          @click="fetchReceipts"
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
            v-model="search"
            placeholder="Buscar por colaborador, empresa, RFC o monto..."
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

        <v-col cols="12" sm="5" md="3">
          <v-select
            v-model="selectedStatus"
            :items="[
              { title: 'Todos los Estatus', value: 'all' },
              { title: 'Pendientes', value: 'pending' },
              { title: 'Aprobados', value: 'approved' },
              { title: 'Rechazados', value: 'rejected' },
            ]"
            variant="outlined"
            density="compact"
            hide-details
            rounded="lg"
            bg-color="#ffffff"
            color="#07254A"
            class="search-input"
          ></v-select>
        </v-col>
      </v-row>
    </div>

    <!-- Data Table con v-slot sincronizado -->
    <v-card-text class="pa-0">
      <v-data-table
        class="custom-opalo-table"
        :headers="dtHeaders"
        :items="receiptList"
        :search="search"
        :custom-filter="customSearchFilter"
        :loading="loading"
        hover
        density="comfortable"
        mobile-breakpoint="0"
      >
        <!-- 1. Columna EMPRESA / CLIENTE -->
        <template v-slot:[`item.client`]="{ item }">
          <div class="d-flex align-center py-2">
            <v-avatar size="32" :color="getClientAvatarColor(item.client)" class="mr-3 text-white font-weight-bold text-caption flex-shrink-0">
              {{ getInitials(item.client?.trade_name || item.client?.company_name) }}
            </v-avatar>
            <div class="min-w-0">
              <div class="user-name font-weight-bold text-slate-800 text-truncate" style="max-width: 240px;">
                {{ item.client?.trade_name || item.client?.company_name || 'Sin empresa' }}
              </div>
              <div class="user-id text-caption text-grey font-mono">
                RFC: {{ item.client?.rfc || '---' }}
              </div>
            </div>
          </div>
        </template>

        <!-- 2. Columna BANCO RECEPTOR -->
        <template v-slot:[`item.bank_account`]="{ item }">
          <div class="d-flex align-center">
            <v-chip
              size="small"
              variant="tonal"
              :color="item.account_type === 'fiscal' ? '#07254A' : '#475569'"
              class="font-weight-bold role-chip mr-2"
            >
              {{ item.account_type === 'fiscal' ? 'Fiscal' : 'No Fiscal' }}
            </v-chip>
            <span class="text-body-2 text-slate-700 text-truncate font-weight-medium">
              {{ item.bank_account?.bank_name || 'Banco' }}
            </span>
          </div>
        </template>

        <!-- 3. Columna MONTO Y FECHA -->
        <template v-slot:[`item.amount`]="{ item }">
          <div>
            <div class="user-name font-weight-bold text-slate-800 font-mono">
              {{ item.amount ? `$${Number(item.amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : 'N/A' }}
            </div>
            <div class="user-id text-caption text-grey">
              {{ formatDate(item.created_at) }}
            </div>
          </div>
        </template>

        <!-- 4. Columna COMPROBANTE -->
        <template v-slot:[`item.file`]="{ item }">
          <div class="text-center">
            <v-btn
              v-if="item.file_url"
              size="small"
              variant="tonal"
              color="#07254A"
              prepend-icon="mdi-file-document-outline"
              class="text-none font-weight-bold action-preview-btn"
              @click="openPreview(item)"
            >
              Ver Archivo
            </v-btn>
            <span v-else class="text-caption text-grey">Sin archivo</span>
          </div>
        </template>

        <!-- 5. Columna ESTATUS -->
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

        <!-- 6. Columna ACCIONES -->
        <template v-slot:[`item.actions`]="{ item }">
          <div class="d-flex align-center justify-end gap-1 pr-2">
            <!-- Aprobar -->
            <v-tooltip v-if="item.status !== 'approved'" text="Aprobar pago" location="top">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon
                  size="small"
                  variant="tonal"
                  color="success"
                  class="action-btn"
                  @click="promptApproval(item)"
                >
                  <v-icon icon="mdi-check" size="18"></v-icon>
                </v-btn>
              </template>
            </v-tooltip>

            <!-- Rechazar -->
            <v-tooltip v-if="item.status !== 'rejected'" text="Rechazar pago" location="top">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon
                  size="small"
                  variant="tonal"
                  color="error"
                  class="action-btn"
                  @click="promptRejection(item)"
                >
                  <v-icon icon="mdi-close" size="18"></v-icon>
                </v-btn>
              </template>
            </v-tooltip>
          </div>
        </template>

        <!-- Sin registros -->
        <template v-slot:no-data>
          <div class="py-10 text-center">
            <v-avatar size="64" color="#f8fafc" class="mb-3 empty-avatar">
              <v-icon size="32" color="#07254A">mdi-cash-remove</v-icon>
            </v-avatar>
            <div class="text-subtitle-1 font-weight-bold text-slate-800">
              No hay comprobantes de pago registrados
            </div>
            <div class="text-caption text-grey mb-3">
              Los pagos reportados por las empresas clientes aparecerán aquí para su validación.
            </div>
          </div>
        </template>
      </v-data-table>
    </v-card-text>

    <!-- Diálogo de Visualización de Documento -->
    <v-dialog v-model="previewDialog.show" max-width="900px">
      <v-card class="rounded-lg overflow-hidden">
        <v-toolbar density="compact" color="#07254A" class="text-white px-4">
          <v-toolbar-title class="text-body-2 font-weight-bold text-truncate">
            {{ previewDialog.receipt?.title }}
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-open-in-new" variant="text" size="small" :href="previewDialog.receipt?.file_url" target="_blank"></v-btn>
          <v-btn icon="mdi-close" variant="text" size="small" @click="previewDialog.show = false"></v-btn>
        </v-toolbar>
        <v-card-text class="pa-0 bg-grey-lighten-4 d-flex justify-center align-center" style="min-height: 550px;">
          <iframe
            v-if="previewDialog.receipt?.extension === 'pdf'"
            :src="previewDialog.receipt?.file_url"
            width="100%"
            height="600px"
            frameborder="0"
          ></iframe>
          <img
            v-else
            :src="previewDialog.receipt?.file_url"
            class="img-fluid pa-4"
            style="max-height: 600px; max-width: 100%; object-fit: contain;"
          />
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Diálogo de Confirmación (Aprobar / Rechazar) -->
    <v-dialog v-model="actionDialog.show" max-width="480px">
      <v-card class="rounded-lg">
        <v-card-title class="text-subtitle-1 font-weight-bold pa-4 pb-2 text-slate-800">
          {{ actionDialog.action === 'approved' ? 'Aprobar Comprobante' : 'Rechazar Comprobante' }}
        </v-card-title>
        <v-card-text class="pa-4 pt-0">
          <p class="text-caption text-slate-600 mb-3">
            {{ actionDialog.action === 'approved'
              ? '¿Confirmas que el monto transferido fue identificado y validado con éxito en la cuenta de Ópalo?'
              : 'Indica la razón por la que se rechaza el comprobante (ej: no se refleja en cuenta, monto incorrecto):' }}
          </p>
          <v-textarea
            v-model="actionDialog.notes"
            label="Notas / Observaciones"
            density="compact"
            variant="outlined"
            rounded="lg"
            rows="3"
            color="#07254A"
          ></v-textarea>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0 justify-end">
          <v-btn variant="text" size="small" class="text-none" @click="actionDialog.show = false">Cancelar</v-btn>
          <v-btn
            :color="actionDialog.action === 'approved' ? 'success' : 'error'"
            variant="flat"
            size="small"
            class="text-none font-weight-bold text-white px-4 rounded-lg"
            :loading="updating"
            @click="submitAction"
          >
            Confirmar {{ actionDialog.action === 'approved' ? 'Aprobación' : 'Rechazo' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="top right" timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </v-card>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useAdminPaymentsStore } from '@/store/adminPayments';

export default {
  name: 'AdminPaymentReceiptsTableComponent',
  data() {
    return {
      search: '',
      selectedStatus: 'all',
      snackbar: { show: false, text: '', color: 'success' },
      previewDialog: { show: false, receipt: null },
      actionDialog: { show: false, receipt: null, action: 'approved', notes: '' },
      dtHeaders: [
        {
          title: 'EMPRESA / CLIENTE',
          key: 'client',
          value: item => `${item.client?.trade_name || ''} ${item.client?.company_name || ''} ${item.client?.rfc || ''}`,
          width: '28%',
          sortable: true,
        },
        {
          title: 'BANCO RECEPTOR',
          key: 'bank_account',
          value: item => `${item.account_type || ''} ${item.bank_account?.bank_name || ''}`,
          width: '24%',
          sortable: true,
        },
        {
          title: 'MONTO Y FECHA',
          key: 'amount',
          value: item => Number(item.amount || 0),
          width: '18%',
          sortable: true,
        },
        {
          title: 'COMPROBANTE',
          key: 'file',
          align: 'center',
          width: '12%',
          sortable: false
        },
        {
          title: 'ESTATUS',
          key: 'status',
          align: 'center',
          width: '10%',
          sortable: true
        },
        {
          title: 'ACCIONES',
          key: 'actions',
          align: 'end',
          width: '8%',
          sortable: false
        },
      ],
    };
  },

  computed: {
    ...mapState(useAdminPaymentsStore, [
      'receipts',
      'pendingCount',
      'loading',
      'updating',
    ]),

    /**
     * Aplica únicamente el filtro por estatus en la lista base
     * para que el search del v-data-table haga el filtrado de texto nativo.
     */
    receiptList() {
      if (!this.selectedStatus || this.selectedStatus === 'all') {
        return this.receipts;
      }
      return this.receipts.filter(r => r.status === this.selectedStatus);
    },
  },

  mounted() {
    this.fetchReceipts();
  },

  methods: {
    ...mapActions(useAdminPaymentsStore, ['fetchReceipts', 'updateReceiptStatus']),

    /**
     * Función personalizada de búsqueda para inspeccionar objetos anidados (cliente, RFC, banco, monto)
     */
    customSearchFilter(value, query, item) {
      if (!query) return true;
      const q = query.toLowerCase().trim();
      const raw = item?.raw || item;

      const tradeName = raw.client?.trade_name?.toLowerCase() || '';
      const companyName = raw.client?.company_name?.toLowerCase() || '';
      const rfc = raw.client?.rfc?.toLowerCase() || '';
      const bank = raw.bank_account?.bank_name?.toLowerCase() || '';
      const amount = String(raw.amount || '');
      const notes = raw.notes?.toLowerCase() || '';

      return (
        tradeName.includes(q) ||
        companyName.includes(q) ||
        rfc.includes(q) ||
        bank.includes(q) ||
        amount.includes(q) ||
        notes.includes(q)
      );
    },

    notify(text, color = 'success') {
      this.snackbar.text = text;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },

    getInitials(name) {
      if (!name) return 'OP';
      const parts = name.trim().split(' ');
      return parts.length > 1
        ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
        : parts[0].substring(0, 2).toUpperCase();
    },

    getClientAvatarColor(client) {
      if (!client) return '#07254A';
      const colors = ['#07254A', '#0d9488', '#1e3a8a', '#334155', '#d97706'];
      const index = (client.trade_name?.length || client.company_name?.length || 0) % colors.length;
      return colors[index];
    },

    openPreview(receipt) {
      this.previewDialog.receipt = receipt;
      this.previewDialog.show = true;
    },

    promptApproval(receipt) {
      this.actionDialog.receipt = receipt;
      this.actionDialog.action = 'approved';
      this.actionDialog.notes = '';
      this.actionDialog.show = true;
    },

    promptRejection(receipt) {
      this.actionDialog.receipt = receipt;
      this.actionDialog.action = 'rejected';
      this.actionDialog.notes = '';
      this.actionDialog.show = true;
    },

    async submitAction() {
      if (!this.actionDialog.receipt) return;

      try {
        const res = await this.updateReceiptStatus(this.actionDialog.receipt.id, {
          status: this.actionDialog.action,
          notes: this.actionDialog.notes,
        });

        this.notify(res.message || 'Estatus actualizado');
        this.actionDialog.show = false;
      } catch (err) {
        this.notify(err.response?.data?.message || 'Error al actualizar estatus', 'error');
      }
    },

    getStatusColor(status) {
      if (status === 'approved') return 'success';
      if (status === 'rejected') return 'error';
      return 'warning';
    },

    getStatusIcon(status) {
      if (status === 'approved') return 'mdi-check-circle';
      if (status === 'rejected') return 'mdi-close-circle';
      return 'mdi-clock-outline';
    },

    formatStatus(status) {
      if (status === 'approved') return 'Aprobado';
      if (status === 'rejected') return 'Rechazado';
      return 'Pendiente';
    },

    formatDate(dateStr) {
      if (!dateStr) return '';
      return new Date(dateStr).toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    },
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

/* Cabeceras sincronizadas con la lista de usuarios */
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

/* Celdas sincronizadas con la lista de usuarios */
:deep(.custom-opalo-table tbody td) {
  padding: 12px 16px !important;
  border-bottom: 1px solid #f1f5f9 !important;
  vertical-align: middle !important;
}

:deep(.custom-opalo-table tbody tr:hover) {
  background-color: #f8fafc !important;
}

.user-name {
  font-size: 0.88rem;
  line-height: 1.25;
}

.user-id {
  font-size: 0.75rem;
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

.action-preview-btn {
  height: 26px !important;
  font-size: 0.75rem !important;
  border-radius: 6px !important;
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
