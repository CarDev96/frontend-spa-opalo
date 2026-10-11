<template>
  <v-card flat class="dossier-card elevation-0 mt-2">
    <!-- Header Corporativo Ópalo -->
    <div class="card-table-header px-6 py-4 d-flex flex-wrap align-center justify-space-between gap-3">
      <div class="d-flex align-center">
        <div class="header-icon-box mr-3 flex-shrink-0">
          <v-icon icon="mdi-folder-account-outline" color="#ffffff" size="20"></v-icon>
        </div>
        <div>
          <h2 class="card-title text-white mb-0">Expediente Digital del Evaluado</h2>
          <span class="card-subtitle text-white opacity-80">
            {{ candidateName }} • Documentación legal, cartas laborales y referencias
          </span>
        </div>
      </div>

      <div class="d-flex align-center gap-2">
        <v-chip color="rgba(255,255,255,0.15)" text-color="#ffffff" size="small" class="font-weight-bold mr-2 text-white">
          {{ totalUploadedCount }} Archivos Cargados
        </v-chip>
        <v-btn
          variant="flat"
          size="small"
          color="#ffffff"
          prepend-icon="mdi-arrow-left"
          class="text-none font-weight-bold return-btn"
          @click="$emit('back')"
        >
          Volver a Evaluados
        </v-btn>
      </div>
    </div>

    <!-- Pestañas de Navegación -->
    <v-tabs v-model="activeTab" bg-color="#ffffff" color="#07254A" class="border-bottom px-4">
      <v-tab value="documents" class="text-none font-weight-bold">
        <v-icon start icon="mdi-file-document-multiple-outline"></v-icon>
        1. Documentos y Cartas Laborales
      </v-tab>
      <v-tab value="photos" class="text-none font-weight-bold">
        <v-icon start icon="mdi-camera-outline"></v-icon>
        2. Fotografías y Vivienda (4)
      </v-tab>
      <v-tab value="references" class="text-none font-weight-bold">
        <v-icon start icon="mdi-account-multiple-check-outline"></v-icon>
        3. Referencias Personales (3)
      </v-tab>
    </v-tabs>

    <v-window v-model="activeTab" class="bg-slate-50 pa-6">
      <!-- ========================================== -->
      <!-- PESTAÑA 1: DOCUMENTOS + CARTAS LABORALES   -->
      <!-- ========================================== -->
      <v-window-item value="documents">
        <!-- 1.1 Documentos Individuales -->
        <div class="d-flex align-center justify-space-between mb-3">
          <div>
            <h3 class="text-subtitle-1 font-weight-bold text-slate-800 mb-0">Documentación Oficial del Candidato</h3>
            <p class="text-caption text-slate-500 mb-0">Formatos permitidos: PDF o imagen legible (JPG, PNG).</p>
          </div>
          <span class="text-caption font-weight-bold text-slate-600 font-mono">9 Documentos base</span>
        </div>

        <v-row dense class="mb-6">
          <v-col cols="12" sm="6" md="4" lg="3" v-for="slot in officialDocSlots" :key="slot.type" class="pa-2">
            <v-card flat class="slot-card pa-4 d-flex flex-column justify-space-between">
              <div>
                <div class="d-flex align-center justify-space-between mb-2">
                  <span class="slot-name font-weight-bold text-slate-800 text-truncate" :title="slot.title">
                    {{ slot.title }}
                  </span>
                  <v-chip
                    v-if="docs[slot.type]"
                    size="x-small"
                    :color="getStatusColor(docs[slot.type].status)"
                    variant="flat"
                    class="font-weight-bold text-white status-chip"
                  >
                    {{ formatStatus(docs[slot.type].status) }}
                  </v-chip>
                  <v-chip v-else size="x-small" color="grey" variant="flat" class="text-white status-chip">
                    Pendiente
                  </v-chip>
                </div>

                <div class="slot-hint text-caption text-grey mb-3">
                  {{ slot.desc }}
                </div>

                <!-- Preview -->
                <div v-if="docs[slot.type]?.file_url" class="preview-container mb-3">
                  <div
                    v-if="isPdf(docs[slot.type])"
                    class="pdf-preview-box pa-3 text-center d-flex flex-column align-center justify-center cursor-pointer"
                    @click="openFile(docs[slot.type].file_url)"
                  >
                    <v-icon icon="mdi-file-pdf-box" color="#EF4444" size="38" class="mb-1"></v-icon>
                    <span class="text-caption text-slate-700 text-truncate max-w-full font-weight-semibold">
                      {{ docs[slot.type].original_name || 'Documento PDF' }}
                    </span>
                    <span class="text-caption text-primary font-weight-bold mt-1">Ver Archivo</span>
                  </div>

                  <div v-else class="cursor-pointer" @click="openFile(docs[slot.type].file_url)">
                    <v-img :src="docs[slot.type].file_url" aspect-ratio="1.4" cover class="rounded-lg">
                      <template v-slot:placeholder>
                        <div class="d-flex align-center justify-center fill-height bg-slate-100">
                          <v-progress-circular indeterminate color="#07254A" size="20"></v-progress-circular>
                        </div>
                      </template>
                    </v-img>
                  </div>
                </div>

                <!-- Alerta Rechazo -->
                <v-alert
                  v-if="docs[slot.type]?.status === 'rejected'"
                  type="error"
                  density="compact"
                  variant="tonal"
                  class="mb-3 text-caption pa-2"
                >
                  <strong>Motivo de rechazo:</strong>
                  <div>{{ docs[slot.type].rejection_reason }}</div>
                </v-alert>
              </div>

              <!-- Input File -->
              <div>
                <input
                  type="file"
                  :ref="'file_' + slot.type"
                  class="d-none"
                  accept="application/pdf,image/jpeg,image/png,image/webp"
                  @change="onFileChange($event, slot.type)"
                />
                <v-btn
                  block
                  variant="outlined"
                  size="small"
                  color="#07254A"
                  rounded="lg"
                  :prepend-icon="docs[slot.type] ? 'mdi-file-replace-outline' : 'mdi-file-upload-outline'"
                  class="text-none font-weight-bold"
                  :loading="uploadingSlot === slot.type"
                  @click="$refs['file_' + slot.type][0].click()"
                >
                  {{ docs[slot.type] ? 'Reemplazar Archivo' : 'Cargar Documento' }}
                </v-btn>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <v-divider class="my-6"></v-divider>

        <!-- 1.2 Sección Múltiple: Cartas Laborales -->
        <div class="d-flex align-center justify-space-between mb-3">
          <div>
            <div class="d-flex align-center gap-2">
              <h3 class="text-subtitle-1 font-weight-bold text-slate-800 mb-0">Cartas Laborales (Ultimos 5 años)</h3>

            </div>
            <p class="text-caption text-slate-500 mb-0">
              Adjunta constancias laborales o cartas de recomendación membretadas de empleos anteriores (PDF o imagen).
            </p>
          </div>

          <div>
            <input
              type="file"
              ref="laborLetterFileInput"
              class="d-none"
              accept="application/pdf,image/jpeg,image/png,image/webp"
              @change="onLaborLetterUpload($event)"
            />
            <v-btn
              color="#07254A"
              variant="flat"
              rounded="lg"
              size="small"
              prepend-icon="mdi-plus"
              class="text-none font-weight-bold text-white px-4"
              :loading="uploadingSlot === 'labor_letters'"
              @click="$refs.laborLetterFileInput.click()"
            >
              Agregar Otra Carta Laboral
            </v-btn>
          </div>
        </div>

        <!-- Alerta si faltan cartas -->
        <v-alert
          v-if="laborLetters.length < 2"
          type="warning"
          density="compact"
          variant="tonal"
          class="mb-4 text-caption"
        >
          En caso de no contar con cartas laborales, proporcionar contacto de empleadores
        </v-alert>

        <!-- Grid de Cartas Laborales Subidas -->
        <v-row dense>
          <v-col cols="12" sm="6" md="4" lg="3" v-for="(letter, index) in laborLetters" :key="letter.id" class="pa-2">
            <v-card flat class="slot-card pa-4 d-flex flex-column justify-space-between">
              <div>
                <div class="d-flex align-center justify-space-between mb-2">
                  <span class="slot-name font-weight-bold text-slate-800">
                    Carta Laboral #{{ index + 1 }}
                  </span>
                  <v-chip
                    size="x-small"
                    :color="getStatusColor(letter.status)"
                    variant="flat"
                    class="font-weight-bold text-white status-chip"
                  >
                    {{ formatStatus(letter.status) }}
                  </v-chip>
                </div>

                <div class="slot-hint text-caption text-grey mb-3 text-truncate">
                  {{ letter.original_name }}
                </div>

                <!-- Preview de la carta -->
                <div class="preview-container mb-3">
                  <div
                    v-if="isPdf(letter)"
                    class="pdf-preview-box pa-3 text-center d-flex flex-column align-center justify-center cursor-pointer"
                    @click="openFile(letter.file_url)"
                  >
                    <v-icon icon="mdi-file-pdf-box" color="#EF4444" size="38" class="mb-1"></v-icon>
                    <span class="text-caption text-primary font-weight-bold">Ver Documento</span>
                  </div>

                  <div v-else class="cursor-pointer" @click="openFile(letter.file_url)">
                    <v-img :src="letter.file_url" aspect-ratio="1.4" cover class="rounded-lg"></v-img>
                  </div>
                </div>

                <!-- Motivo si fue rechazada -->
                <v-alert
                  v-if="letter.status === 'rejected'"
                  type="error"
                  density="compact"
                  variant="tonal"
                  class="mb-3 text-caption pa-2"
                >
                  <strong>Motivo de rechazo:</strong>
                  <div>{{ letter.rejection_reason }}</div>
                </v-alert>
              </div>

              <!-- Botones de Acción: Ver y Eliminar -->
              <div class="d-flex gap-2">
                <v-btn
                  variant="outlined"
                  size="small"
                  color="#07254A"
                  rounded="lg"
                  class="text-none flex-grow-1 font-weight-bold"
                  prepend-icon="mdi-eye-outline"
                  @click="openFile(letter.file_url)"
                >
                  Ver
                </v-btn>
                <v-btn
                  variant="outlined"
                  size="small"
                  color="error"
                  rounded="lg"
                  icon="mdi-trash-can-outline"
                  :loading="deletingDocId === letter.id"
                  @click="deleteLaborLetter(letter.id)"
                ></v-btn>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-window-item>

      <!-- ========================================== -->
      <!-- PESTAÑA 2: FOTOGRAFÍAS (4)                 -->
      <!-- ========================================== -->
      <v-window-item value="photos">
        <div class="d-flex align-center justify-space-between mb-4">
          <div>
            <h3 class="text-subtitle-1 font-weight-bold text-slate-800 mb-0">Fotografías Domiciliares y de Identificación</h3>
            <p class="text-caption text-slate-500 mb-0">Rostro formal y 3 áreas principales del domicilio.</p>
          </div>
          <span class="text-caption font-weight-bold text-slate-600 font-mono">4 Fotografías requeridas</span>
        </div>

        <v-row dense>
          <v-col cols="12" sm="6" md="3" v-for="slot in photoSlots" :key="slot.type" class="pa-2">
            <v-card flat class="slot-card pa-4 d-flex flex-column justify-space-between">
              <div>
                <div class="d-flex align-center justify-space-between mb-2">
                  <span class="slot-name font-weight-bold text-slate-800">{{ slot.title }}</span>
                  <v-chip
                    v-if="docs[slot.type]"
                    size="x-small"
                    :color="getStatusColor(docs[slot.type].status)"
                    variant="flat"
                    class="font-weight-bold text-white status-chip"
                  >
                    {{ formatStatus(docs[slot.type].status) }}
                  </v-chip>
                  <v-chip v-else size="x-small" color="grey" variant="flat" class="text-white status-chip">
                    Pendiente
                  </v-chip>
                </div>

                <div class="slot-hint text-caption text-grey mb-3">
                  {{ slot.desc }}
                </div>

                <div v-if="docs[slot.type]?.file_url" class="preview-container mb-3 cursor-pointer" @click="openFile(docs[slot.type].file_url)">
                  <v-img :src="docs[slot.type].file_url" aspect-ratio="1.3" cover class="rounded-lg"></v-img>
                </div>

                <v-alert
                  v-if="docs[slot.type]?.status === 'rejected'"
                  type="error"
                  density="compact"
                  variant="tonal"
                  class="mb-3 text-caption pa-2"
                >
                  <strong>Motivo de rechazo:</strong>
                  <div>{{ docs[slot.type].rejection_reason }}</div>
                </v-alert>
              </div>

              <div>
                <input
                  type="file"
                  :ref="'file_' + slot.type"
                  class="d-none"
                  accept="image/jpeg,image/png,image/webp"
                  @change="onFileChange($event, slot.type)"
                />
                <v-btn
                  block
                  variant="outlined"
                  size="small"
                  color="#07254A"
                  rounded="lg"
                  prepend-icon="mdi-camera-outline"
                  class="text-none font-weight-bold"
                  :loading="uploadingSlot === slot.type"
                  @click="$refs['file_' + slot.type][0].click()"
                >
                  {{ docs[slot.type] ? 'Reemplazar Foto' : 'Cargar Foto' }}
                </v-btn>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-window-item>

      <!-- ========================================== -->
      <!-- PESTAÑA 3: 3 REFERENCIAS PERSONALES         -->
      <!-- ========================================== -->
      <v-window-item value="references">
        <div class="d-flex align-center justify-space-between mb-4">
          <div>
            <h3 class="text-subtitle-1 font-weight-bold text-slate-800 mb-0">Referencias Personales y Laborales</h3>
            <p class="text-caption text-slate-500 mb-0">Ingresa los datos verídicos de 3 personas para cotejo telefónico.</p>
          </div>
          <span class="text-caption font-weight-bold text-slate-600 font-mono">3 Referencias requeridas</span>
        </div>

        <v-form ref="refFormRef" @submit.prevent="saveReferences">
          <v-row dense>
            <v-col cols="12" md="4" v-for="(ref, index) in references" :key="index" class="pa-2">
              <v-card flat class="slot-card pa-4">
                <div class="d-flex align-center justify-space-between mb-3 border-bottom pb-2">
                  <span class="font-weight-bold text-slate-800 text-caption text-uppercase">
                    Referencia #{{ index + 1 }}
                  </span>
                  <v-icon icon="mdi-account-check-outline" size="18" color="#07254A"></v-icon>
                </div>

                <label class="field-label">Nombre Completo *</label>
                <v-text-field
                  v-model="ref.full_name"
                  placeholder="Ej. Ing. Juan Pérez"
                  density="compact"
                  variant="outlined"
                  rounded="lg"
                  color="#07254A"
                  class="custom-field bg-white mb-2"
                  :rules="[(v) => !!v || 'Requerido']"
                ></v-text-field>

                <v-row dense>
                  <v-col cols="6">
                    <label class="field-label">Parentesco *</label>
                    <v-select
                      v-model="ref.relationship"
                      :items="['Amigo(a)', 'Excompañero(a)', 'Vecino(a)', 'Conocido(a)', 'Jefe Anterior']"
                      density="compact"
                      variant="outlined"
                      rounded="lg"
                      color="#07254A"
                      class="custom-field bg-white mb-2"
                      :rules="[(v) => !!v || 'Requerido']"
                    ></v-select>
                  </v-col>
                  <v-col cols="6">
                    <label class="field-label">Años Conocerlo *</label>
                    <v-text-field
                      v-model="ref.years_known"
                      type="number"
                      placeholder="Ej. 4"
                      density="compact"
                      variant="outlined"
                      rounded="lg"
                      color="#07254A"
                      class="custom-field bg-white mb-2"
                      :rules="[(v) => !!v || 'Requerido']"
                    ></v-text-field>
                  </v-col>
                </v-row>

                <label class="field-label">Teléfono (10 dígitos) *</label>
                <v-text-field
                  v-model="ref.phone"
                  placeholder="3312345678"
                  density="compact"
                  variant="outlined"
                  rounded="lg"
                  maxlength="10"
                  color="#07254A"
                  class="custom-field bg-white mb-2"
                  :rules="[(v) => (!v || /^[0-9]{10}$/.test(v)) || '10 dígitos numéricos']"
                ></v-text-field>

                <label class="field-label">Ocupación / Puesto</label>
                <v-text-field
                  v-model="ref.occupation"
                  placeholder="Ej. Contador, Supervisor"
                  density="compact"
                  variant="outlined"
                  rounded="lg"
                  color="#07254A"
                  class="custom-field bg-white"
                ></v-text-field>
              </v-card>
            </v-col>
          </v-row>

          <div class="d-flex justify-end mt-4">
            <v-btn
              type="submit"
              color="#07254A"
              variant="flat"
              rounded="lg"
              size="default"
              prepend-icon="mdi-content-save-check"
              class="text-none font-weight-bold text-white px-6"
              :loading="savingRefs"
            >
              Guardar Referencias
            </v-btn>
          </div>
        </v-form>
      </v-window-item>
    </v-window>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="top right" timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </v-card>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'ExamineeDossierComponent',
  props: {
    examineeId: { type: String, required: true },
    candidateName: { type: String, default: 'Candidato' },
  },
  emits: ['back'],
  data() {
    return {
      activeTab: 'documents',
      docs: {},
      laborLetters: [],
      references: [
        { full_name: '', relationship: '', phone: '', years_known: '', occupation: '' },
        { full_name: '', relationship: '', phone: '', years_known: '', occupation: '' },
        { full_name: '', relationship: '', phone: '', years_known: '', occupation: '' },
      ],
      uploadingSlot: null,
      deletingDocId: null,
      savingRefs: false,

      // 9 Documentos base (individuales)
      officialDocSlots: [
        { type: 'birth_certificate', title: 'Acta de Nacimiento', desc: 'Copia certificada legible o formato digital.' },
        { type: 'rfc_document', title: 'RFC / Cédula Fiscal', desc: 'Constancia de Situación Fiscal actualizada.' },
        { type: 'imss_nss', title: 'Nº Afiliación al IMSS', desc: 'Comprobante de Número de Seguro Social (NSS).' },
        { type: 'ine_id', title: 'INE / Identificación', desc: 'Credencial para votar vigente por ambos lados.' },
        { type: 'curp_document', title: 'CURP', desc: 'Formato descargado oficial RENAPO actualizado.' },
        { type: 'afore_statement', title: 'AFORE', desc: 'Estado de cuenta o constancia de afiliación. (En caso de tener)' },
        { type: 'proof_of_address', title: 'Comprobante Domicilio', desc: 'CFE, Agua o Teléfono (menor a 3 meses).' },
        { type: 'study_certificate', title: 'Certificado de Estudios', desc: 'Último grado académico cursado o título.' },
        { type: 'drivers_license', title: 'Licencia de Conducir', desc: 'Ambos lados si el puesto lo requiere.' },
      ],

      // 4 Fotografías
      photoSlots: [
        { type: 'candidate_photo', title: 'Foto del Evaluado', desc: 'Fotografía formal a color, fondo claro, sin gorra ni lentes.' },
        { type: 'house_facade', title: 'Vivienda: Fachada', desc: 'Vista exterior con número exterior de la vivienda visible.' },
        { type: 'house_living_room', title: 'Vivienda: Sala / Comedor', desc: 'Área social común interior de la vivienda.' },
        { type: 'house_kitchen', title: 'Vivienda: Cocina', desc: 'Área general interior de cocina.' },
      ],

      snackbar: { show: false, text: '', color: 'success' },
    };
  },

  computed: {
    totalUploadedCount() {
      return Object.keys(this.docs).length + this.laborLetters.length;
    },
  },

  mounted() {
    this.fetchData();
  },

  methods: {
    notify(text, color = 'success') {
      this.snackbar.text = text;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },

    async fetchData() {
      try {
        const [docsRes, refsRes] = await Promise.all([
          api.get(`/examinees/${this.examineeId}/documents`),
          api.get(`/examinees/${this.examineeId}/references`),
        ]);

        if (docsRes.data) {
          this.docs = docsRes.data.singles || docsRes.data || {};
          this.laborLetters = docsRes.data.labor_letters || [];
        }

        if (refsRes.data && refsRes.data.length === 3) {
          this.references = refsRes.data;
        }
      } catch (e) {
        this.notify('Error al cargar expediente.', 'error');
      }
    },

    isPdf(doc) {
      if (!doc) return false;
      if (doc.mime_type && doc.mime_type.includes('pdf')) return true;
      if (doc.file_path && doc.file_path.toLowerCase().endsWith('.pdf')) return true;
      if (doc.original_name && doc.original_name.toLowerCase().endsWith('.pdf')) return true;
      return false;
    },

    openFile(url) {
      if (url) {
        window.open(url, '_blank');
      }
    },

    async onFileChange(event, type) {
      const file = event.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('document_type', type);
      formData.append('file', file);

      this.uploadingSlot = type;
      try {
        const res = await api.post(`/examinees/${this.examineeId}/documents`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        this.docs[type] = res.data.document;
        this.notify(res.data.message || 'Documento guardado exitosamente.');
      } catch (e) {
        const serverError =
          e.response?.data?.errors?.file?.[0] ||
          e.response?.data?.message ||
          'Error al subir el archivo.';
        this.notify(serverError, 'error');
      } finally {
        this.uploadingSlot = null;
        if (event.target) event.target.value = '';
      }
    },

    async onLaborLetterUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('document_type', 'labor_letters');
      formData.append('file', file);

      this.uploadingSlot = 'labor_letters';
      try {
        const res = await api.post(`/examinees/${this.examineeId}/documents`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        this.laborLetters.push(res.data.document);
        this.notify('Carta laboral agregada exitosamente.');
      } catch (e) {
        const serverError =
          e.response?.data?.errors?.file?.[0] ||
          e.response?.data?.message ||
          'Error al subir carta laboral.';
        this.notify(serverError, 'error');
      } finally {
        this.uploadingSlot = null;
        if (event.target) event.target.value = '';
      }
    },

    async deleteLaborLetter(id) {
      this.deletingDocId = id;
      try {
        await api.delete(`/examinee-documents/${id}`);
        this.laborLetters = this.laborLetters.filter((l) => l.id !== id);
        this.notify('Carta laboral eliminada.');
      } catch (e) {
        this.notify('Error al eliminar carta laboral.', 'error');
      } finally {
        this.deletingDocId = null;
      }
    },

    async saveReferences() {
      const { valid } = await this.$refs.refFormRef.validate();
      if (!valid) {
        this.notify('Completa todos los campos obligatorios de las 3 referencias.', 'error');
        return;
      }

      this.savingRefs = true;
      try {
        const res = await api.post(`/examinees/${this.examineeId}/references`, {
          references: this.references,
        });
        this.references = res.data.references;
        this.notify(res.data.message);
      } catch (e) {
        this.notify('Error al guardar referencias.', 'error');
      } finally {
        this.savingRefs = false;
      }
    },

    getStatusColor(status) {
      const map = {
        pending: '#0284C7',
        approved: '#10B981',
        rejected: '#EF4444',
      };
      return map[status] || '#475569';
    },

    formatStatus(status) {
      const map = {
        pending: 'En Revisión',
        approved: 'Aprobado',
        rejected: 'Rechazado',
      };
      return map[status] || 'Pendiente';
    },
  },
};
</script>

<style scoped>
.dossier-card {
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

.return-btn {
  color: #07254A !important;
  border-radius: 8px !important;
}

.bg-slate-50 {
  background-color: #f8fafc;
}

.slot-card {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 10px !important;
  height: 100%;
}

.slot-name {
  font-size: 0.82rem;
  max-width: 170px;
}

.slot-hint {
  font-size: 0.72rem;
  min-height: 32px;
}

.preview-container {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  background: #f8fafc;
}

.pdf-preview-box {
  min-height: 105px;
  background-color: #ffffff;
}

.field-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  color: #475569;
  margin-bottom: 4px;
}

.status-chip {
  padding: 0 8px !important;
  height: 20px !important;
  font-size: 0.7rem !important;
}

.cursor-pointer {
  cursor: pointer;
}

.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
</style>
