<template>
  <v-card flat class="main-card elevation-0">
    <!-- Header Institucional Ópalo -->
    <div class="card-header px-6 py-4 d-flex align-center justify-space-between text-white flex-wrap gap-3">
      <div class="d-flex align-center">
        <div class="header-icon-box mr-3 flex-shrink-0">
          <v-icon icon="mdi-file-document-multiple-outline" color="#ffffff" size="22"></v-icon>
        </div>
        <div>
          <h2 class="card-title text-white mb-0">Catálogo de Pruebas Psicométricas</h2>
          <span class="card-subtitle text-white opacity-80">
            Formatos y plantillas oficiales descargables para los clientes
          </span>
        </div>
      </div>
      <div class="d-flex gap-2">
        <v-btn
          variant="flat"
          color="rgba(255,255,255,0.15)"
          rounded="lg"
          size="small"
          prepend-icon="mdi-refresh"
          class="text-none font-weight-bold text-white"
          :loading="loading"
          @click="fetchTests"
        >
          Recargar
        </v-btn>
        <v-btn
          variant="flat"
          color="#10B981"
          rounded="lg"
          size="small"
          prepend-icon="mdi-plus"
          class="text-none font-weight-bold text-white"
          @click="openDialog()"
        >
          Nueva Prueba
        </v-btn>
      </div>
    </div>

    <!-- Buscador -->
    <div class="px-6 py-4 border-bottom bg-slate-50">
      <v-text-field
        v-model="search"
        placeholder="Buscar prueba por nombre o descripción..."
        prepend-inner-icon="mdi-magnify"
        density="compact"
        variant="outlined"
        rounded="lg"
        hide-details
        bg-color="#ffffff"
        style="max-width: 400px;"
      ></v-text-field>
    </div>

    <!-- Tabla -->
    <v-card-text class="pa-0 bg-white">
      <v-data-table
        :headers="headers"
        :items="tests"
        :search="search"
        :loading="loading"
        hover
        density="comfortable"
        no-data-text="No hay pruebas registradas en el catálogo"
        items-per-page-text="Pruebas por página:"
        page-text="{0}-{1} de {2}"
      >
        <template v-slot:item="{ item }">
          <tr class="table-row">
            <!-- Nombre y Descripción -->
            <td class="py-3">
              <div class="font-weight-bold text-slate-800">{{ item.name }}</div>
              <div class="text-caption text-slate-500 text-truncate" style="max-width: 300px;">
                {{ item.description || 'Sin descripción o instrucciones adicionales' }}
              </div>
            </td>

            <!-- Archivo Adjunto -->
            <td>
              <v-btn
                v-if="item.file_url"
                variant="tonal"
                color="#07254A"
                size="small"
                prepend-icon="mdi-file-download-outline"
                class="text-none font-weight-bold"
                :href="item.file_url"
                target="_blank"
              >
                Descargar Formato
              </v-btn>
              <span v-else class="text-caption text-slate-400 font-italic">Sin documento</span>
            </td>

            <!-- Estatus -->
            <td class="text-center">
              <v-chip
                size="small"
                :color="item.is_active ? '#10B981' : '#64748B'"
                variant="flat"
                class="font-weight-bold text-white px-3"
              >
                {{ item.is_active ? 'Activa' : 'Inactiva' }}
              </v-chip>
            </td>

            <!-- Acciones -->
            <td class="text-end pr-4">
              <v-btn
                icon="mdi-pencil-outline"
                variant="text"
                color="#0284C7"
                size="small"
                @click="openDialog(item)"
              ></v-btn>
              <v-btn
                :icon="item.is_active ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                variant="text"
                :color="item.is_active ? '#F59E0B' : '#10B981'"
                size="small"
                @click="handleToggleStatus(item)"
              ></v-btn>
              <v-btn
                icon="mdi-trash-can-outline"
                variant="text"
                color="#EF4444"
                size="small"
                @click="confirmDelete(item)"
              ></v-btn>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card-text>

    <!-- Modal Formulario -->
    <v-dialog v-model="dialog" max-width="580px" persistent>
      <v-card class="rounded-xl elevation-6">
        <div class="card-header px-4 py-3 d-flex align-center justify-space-between text-white">
          <div class="d-flex align-center">
            <v-icon icon="mdi-file-document-edit" color="#ffffff" size="20" class="mr-2"></v-icon>
            <span class="text-subtitle-1 font-weight-bold">
              {{ isEditing ? 'Editar Prueba Psicométrica' : 'Nueva Prueba Psicométrica' }}
            </span>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" color="#ffffff" @click="closeDialog" :disabled="saving"></v-btn>
        </div>

        <v-card-text class="pa-6 bg-slate-50">
          <v-form ref="form" v-model="valid" @submit.prevent="submitForm">
            <v-row dense>
              <v-col cols="12" class="mb-2">
                <label class="field-label">Nombre de la Prueba *</label>
                <v-text-field
                  v-model="form.name"
                  placeholder="Ej. Test de Cleaver, Figura Humana, Raven..."
                  density="compact"
                  variant="outlined"
                  rounded="lg"
                  color="#07254A"
                  bg-color="#ffffff"
                  :rules="[v => !!v || 'El nombre es obligatorio']"
                ></v-text-field>
              </v-col>

              <v-col cols="12" class="mb-2">
                <label class="field-label">Instrucciones o Descripción (Opcional)</label>
                <v-textarea
                  v-model="form.description"
                  placeholder="Instrucciones de llenado para el candidato..."
                  density="compact"
                  variant="outlined"
                  rounded="lg"
                  color="#07254A"
                  bg-color="#ffffff"
                  rows="3"
                  auto-grow
                ></v-textarea>
              </v-col>

              <v-col cols="12" class="mb-2">
                <label class="field-label">Documento en Blanco (PDF / Word) <span v-if="!isEditing">*</span></label>
                <v-file-input
                  v-model="file"
                  accept=".pdf,.doc,.docx"
                  placeholder="Selecciona el formato..."
                  prepend-inner-icon="mdi-paperclip"
                  prepend-icon=""
                  density="compact"
                  variant="outlined"
                  rounded="lg"
                  color="#07254A"
                  bg-color="#ffffff"
                  :rules="isEditing ? [] : [v => !!v || 'Debes adjuntar el formato en blanco']"
                  show-size
                >
                  <template v-slot:selection="{ fileNames }">
                    <template v-for="fileName in fileNames" :key="fileName">
                      <v-chip size="small" color="#07254A" class="font-weight-bold text-white">
                        {{ fileName }}
                      </v-chip>
                    </template>
                  </template>
                </v-file-input>
                <div v-if="isEditing && form.file_url" class="text-caption text-slate-500 mt-1">
                  Archivo actual:
                  <a :href="form.file_url" target="_blank" class="text-primary font-weight-bold ml-1">Ver plantilla</a>
                  <span class="ml-1">(Selecciona otro únicamente si deseas sustituirlo)</span>
                </div>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="px-6 py-4 bg-slate-50 border-top d-flex justify-end gap-3">
          <v-btn variant="tonal" color="#64748B" class="text-none font-weight-bold" rounded="lg" @click="closeDialog" :disabled="saving">
            Cancelar
          </v-btn>
          <v-btn
            variant="flat"
            color="#07254A"
            class="text-none font-weight-bold text-white px-6"
            rounded="lg"
            :loading="saving"
            @click="submitForm"
          >
            {{ isEditing ? 'Guardar Cambios' : 'Subir Plantilla' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialogo Eliminar -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card class="rounded-xl elevation-4">
        <v-card-title class="text-h6 font-weight-bold text-center pt-6 pb-2 text-slate-800">
          ¿Eliminar Prueba?
        </v-card-title>
        <v-card-text class="text-center text-slate-600 pb-6">
          Se eliminará la plantilla del catálogo y ya no estará disponible para nuevas asignaciones.
        </v-card-text>
        <v-card-actions class="px-6 pb-6 d-flex justify-center gap-3">
          <v-btn variant="tonal" color="#64748B" class="text-none font-weight-bold" rounded="lg" @click="deleteDialog = false">
            Regresar
          </v-btn>
          <v-btn variant="flat" color="#EF4444" class="text-none font-weight-bold text-white px-6" rounded="lg" @click="executeDelete">
            Sí, Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="top right" timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </v-card>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useAdminPsychometricTestsStore } from '@/store/adminPsychometricTests';

export default {
  name: 'AdminTestsCatalogComponent',
  data() {
    return {
      search: '',
      dialog: false,
      deleteDialog: false,
      selectedItem: null,
      valid: false,
      file: null,

      form: {
        id: null,
        name: '',
        description: '',
        file_url: null,
      },

      headers: [
        { title: 'Prueba / Instrucciones', key: 'name', align: 'start' },
        { title: 'Formato en Blanco', key: 'file_url', align: 'start', sortable: false },
        { title: 'Estatus', key: 'is_active', align: 'center' },
        { title: 'Acciones', key: 'actions', align: 'end', sortable: false },
      ],
      snackbar: { show: false, text: '', color: 'success' },
    };
  },

  computed: {
    ...mapState(useAdminPsychometricTestsStore, ['tests', 'loading', 'saving']),
    isEditing() {
      return !!this.form.id;
    },
  },

  mounted() {
    this.fetchTests();
  },

  methods: {
    ...mapActions(useAdminPsychometricTestsStore, [
      'fetchTests',
      'saveTest',
      'toggleStatus',
      'deleteTest',
    ]),

    notify(text, color = 'success') {
      this.snackbar.text = text;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },

    openDialog(item = null) {
      if (item) {
        this.form = {
          id: item.id,
          name: item.name,
          description: item.description || '',
          file_url: item.file_url,
        };
      } else {
        this.form = { id: null, name: '', description: '', file_url: null };
      }
      this.file = null;
      if (this.$refs.form) this.$refs.form.resetValidation();
      this.dialog = true;
    },

    closeDialog() {
      this.dialog = false;
      setTimeout(() => {
        this.form = { id: null, name: '', description: '', file_url: null };
        this.file = null;
        if (this.$refs.form) this.$refs.form.resetValidation();
      }, 300);
    },

    async submitForm() {
      const { valid } = await this.$refs.form.validate();
      if (!valid) return;

      const formData = new FormData();
      formData.append('name', this.form.name);
      formData.append('description', this.form.description || '');

      const actualFile = Array.isArray(this.file) ? this.file[0] : this.file;
      if (actualFile) {
        formData.append('file', actualFile);
      }

      const res = await this.saveTest(formData, this.form.id);

      if (res.success) {
        this.notify(res.message);
        this.closeDialog();
      } else {
        this.notify(res.message, 'error');
      }
    },

    async handleToggleStatus(item) {
      const res = await this.toggleStatus(item.id);
      if (res.success) {
        this.notify(res.message);
      } else {
        this.notify(res.message, 'error');
      }
    },

    confirmDelete(item) {
      this.selectedItem = item;
      this.deleteDialog = true;
    },

    async executeDelete() {
      if (!this.selectedItem) return;
      const res = await this.deleteTest(this.selectedItem.id);
      this.deleteDialog = false;

      if (res.success) {
        this.notify(res.message);
      } else {
        this.notify(res.message, 'error');
      }
      this.selectedItem = null;
    },
  },
};
</script>

<style scoped>
.main-card {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 16px !important;
  overflow: hidden;
}

.card-header {
  background: linear-gradient(135deg, #07254A 0%, #0e1726 100%) !important;
}

.header-icon-box {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-title {
  font-size: 1.15rem;
  font-weight: 700;
}

.card-subtitle {
  font-size: 0.8rem;
}

.bg-slate-50 {
  background-color: #f8fafc;
}

.border-bottom {
  border-bottom: 1px solid #e2e8f0;
}

.border-top {
  border-top: 1px solid #e2e8f0;
}

.field-label {
  display: block;
  font-size: 0.78rem;
  font-weight: 700;
  color: #475569;
  margin-bottom: 6px;
}

.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
</style>
