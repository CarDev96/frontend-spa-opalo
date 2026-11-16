<template>
  <v-card flat class="review-table-card elevation-0">
    <!-- Header -->
    <div class="card-table-header px-6 py-4 d-flex align-center justify-space-between flex-wrap gap-2">
      <div class="d-flex align-center">
        <div class="header-icon-box mr-3 flex-shrink-0">
          <v-icon icon="mdi-folder-check-outline" color="#ffffff" size="20"></v-icon>
        </div>
        <div>
          <h2 class="card-title text-white mb-0">Validación de Expedientes (Trabajo Social / Psicología)</h2>
          <span class="card-subtitle text-white opacity-80">
            Revisión documental integral, recordatorios al cliente, psicometría y cierre de evaluación
          </span>
        </div>
      </div>

      <div class="d-flex align-center gap-2">
        <v-chip size="small" color="rgba(255,255,255,0.16)" class="text-white font-weight-bold">
          {{ dossiers.length }} Evaluados
        </v-chip>
        <v-btn
          variant="flat"
          size="small"
          color="#ffffff"
          prepend-icon="mdi-refresh"
          class="text-none font-weight-bold reload-btn"
          :loading="loading"
          @click="fetchDossiers"
        >
          Recargar
        </v-btn>
      </div>
    </div>

    <!-- Buscador -->
    <div class="table-toolbar px-6 py-3 bg-slate-50">
      <v-row dense align="center">
        <v-col cols="12" sm="8" md="5">
          <v-text-field
            v-model="search"
            placeholder="Buscar por evaluado, CURP o empresa..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            rounded="lg"
            bg-color="#ffffff"
            color="#07254A"
          ></v-text-field>
        </v-col>
      </v-row>
    </div>

    <!-- Tabla -->
    <v-card-text class="pa-0">
      <v-data-table
        :headers="headers"
        :items="dossiers"
        :search="search"
        :loading="loading"
        hover
        density="comfortable"
      >
        <template v-slot:item="{ item }">
          <tr>
            <td class="py-3">
              <div class="font-weight-bold text-slate-800">{{ item.full_name }}</div>
              <div class="text-caption text-grey font-mono">{{ item.curp || 'SIN CURP' }}</div>
            </td>

            <td>
              <div class="text-body-2 font-weight-medium text-slate-800">
                {{ item.client?.trade_name || item.client?.company_name }}
              </div>
            </td>

            <!-- Estatus del Evaluado -->
            <td class="text-center">
              <v-chip
                size="small"
                :color="getExamineeStatusBadge(item.status).color"
                variant="tonal"
                class="font-weight-bold"
              >
                {{ getExamineeStatusBadge(item.status).label }}
              </v-chip>
            </td>

            <!-- Contador de Documentación Total -->
            <td class="text-center">
              <v-chip size="small" :color="getDocumentsBadgeColor(item.documents)" variant="flat" class="font-weight-bold text-white">
                {{ item.documents?.length || 0 }} Docs
              </v-chip>
            </td>

            <!-- Contador de Pruebas Psicométricas -->
            <td class="text-center">
              <v-chip size="small" :color="getPsychometricsBadgeColor(getPsychometrics(item))" variant="flat" class="font-weight-bold text-white">
                {{ getPsychometrics(item).length }} Psicométricas
              </v-chip>
            </td>

            <!-- Contador de Referencias -->
            <td class="text-center">
              <v-chip size="small" :color="item.references?.length === 3 ? 'success' : 'warning'" variant="flat" class="font-weight-bold text-white">
                {{ item.references?.length || 0 }} / 3 Refs
              </v-chip>
            </td>

            <!-- Acciones -->
            <td class="text-end pr-4">
              <div class="d-flex align-center justify-end gap-2">
                <!-- Botón Recordatorio si faltan docs o referencias -->
                <v-tooltip v-if="isDossierIncomplete(item)" text="Enviar recordatorio por correo al cliente" location="top">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      v-bind="props"
                      size="small"
                      variant="tonal"
                      color="#D97706"
                      rounded="lg"
                      prepend-icon="mdi-email-alert-outline"
                      class="text-none font-weight-bold"
                      :loading="remindingId === item.id"
                      @click="sendReminder(item)"
                    >
                      Recordar Docs
                    </v-btn>
                  </template>
                </v-tooltip>

                <v-btn
                  size="small"
                  variant="flat"
                  color="#07254A"
                  rounded="lg"
                  prepend-icon="mdi-shield-search"
                  class="text-none font-weight-bold text-white"
                  @click="openReview(item)"
                >
                  Auditar
                </v-btn>

                <v-btn
                  v-if="item.status !== 'completed'"
                  size="small"
                  variant="flat"
                  color="#10B981"
                  rounded="lg"
                  prepend-icon="mdi-check-decagram"
                  class="text-none font-weight-bold text-white"
                  :loading="completingId === item.id"
                  @click="promptCompleteEvaluation(item)"
                >
                  Evaluación Terminada
                </v-btn>

                <v-chip
                  v-else
                  size="small"
                  color="#059669"
                  variant="flat"
                  class="font-weight-bold text-white"
                >
                  <v-icon icon="mdi-check-circle" start size="14"></v-icon>
                  Terminada
                </v-chip>
              </div>
            </td>
          </tr>
        </template>

        <template v-slot:no-data>
          <div class="py-10 text-center">
            <v-avatar size="64" color="#f8fafc" class="mb-3 empty-avatar">
              <v-icon size="32" color="#07254A">mdi-folder-open-outline</v-icon>
            </v-avatar>
            <div class="text-subtitle-1 font-weight-bold text-slate-800">
              No hay evaluados registrados
            </div>
          </div>
        </template>
      </v-data-table>
    </v-card-text>

    <!-- MODAL DE AUDITORÍA INTEGRAL -->
    <v-dialog v-model="reviewDialog" max-width="1150px" persistent>
      <v-card v-if="selectedItem" class="rounded-xl overflow-hidden bg-white">
        <div class="card-table-header px-6 py-4 d-flex align-center justify-space-between flex-wrap gap-2">
          <div class="d-flex align-center">
            <v-icon icon="mdi-shield-check" color="#ffffff" size="20" class="mr-2"></v-icon>
            <div>
              <h3 class="text-subtitle-1 font-weight-bold text-white mb-0">
                Auditoría de Expediente: {{ selectedItem.full_name }}
              </h3>
              <span class="text-caption text-white opacity-80">
                Empresa Solicitante: {{ selectedItem.client?.trade_name || selectedItem.client?.company_name }}
              </span>
            </div>
          </div>

          <div class="d-flex align-center gap-2">
            <v-btn
              v-if="isDossierIncomplete(selectedItem)"
              size="small"
              variant="flat"
              color="#F59E0B"
              rounded="lg"
              prepend-icon="mdi-email-alert-outline"
              class="text-none font-weight-bold text-white"
              :loading="remindingId === selectedItem.id"
              @click="sendReminder(selectedItem)"
            >
              Enviar Recordatorio Docs
            </v-btn>

            <v-btn
              v-if="selectedItem.status !== 'completed'"
              size="small"
              variant="flat"
              color="#10B981"
              rounded="lg"
              prepend-icon="mdi-check-decagram"
              class="text-none font-weight-bold text-white"
              :loading="completingId === selectedItem.id"
              @click="promptCompleteEvaluation(selectedItem)"
            >
              Marcar Evaluación Terminada
            </v-btn>
            <v-chip v-else size="small" color="#10B981" variant="flat" class="text-white font-weight-bold">
              Evaluación Terminada
            </v-chip>

            <v-btn icon="mdi-close" variant="text" size="small" color="#ffffff" @click="reviewDialog = false"></v-btn>
          </div>
        </div>

        <v-card-text class="pa-6 bg-slate-50" style="max-height: 80vh; overflow-y: auto;">
          <!-- 1. DOCUMENTACIÓN OFICIAL -->
          <div class="d-flex align-center justify-space-between mb-3 border-bottom pb-2">
            <h4 class="text-subtitle-2 font-weight-bold text-slate-900 mb-0">
              1. Documentación Oficial y Laboral (PDF / Imágenes)
            </h4>
            <span class="text-caption text-slate-500 font-weight-medium">9 Documentos Base</span>
          </div>

          <v-row dense class="mb-5">
            <v-col cols="12" sm="6" md="4" lg="3" v-for="slot in officialDocSlots" :key="slot.type" class="pa-2">
              <v-card flat class="slot-audit-card pa-3">
                <div class="d-flex align-center justify-space-between mb-2">
                  <span class="font-weight-bold text-caption text-slate-800 text-truncate" :title="slot.title">
                    {{ slot.title }}
                  </span>
                  <v-chip
                    size="x-small"
                    :color="getStatusColor(getDocument(slot.type)?.status)"
                    variant="flat"
                    class="font-weight-bold text-white status-chip"
                  >
                    {{ formatStatus(getDocument(slot.type)?.status) }}
                  </v-chip>
                </div>

                <div v-if="getDocument(slot.type)?.file_url" class="img-box mb-2 cursor-pointer" @click="openFile(getDocument(slot.type).file_url)">
                  <div v-if="isPdf(getDocument(slot.type))" class="pa-3 text-center bg-white d-flex flex-column align-center justify-center pdf-box">
                    <v-icon icon="mdi-file-pdf-box" color="#EF4444" size="36"></v-icon>
                    <span class="text-caption text-primary font-weight-bold mt-1">Abrir PDF</span>
                  </div>
                  <v-img v-else :src="getDocument(slot.type).file_url" aspect-ratio="1.3" cover class="rounded-lg"></v-img>
                </div>
                <div v-else class="empty-img-box mb-2 d-flex align-center justify-center text-caption text-grey">
                  Sin subir
                </div>

                <v-alert
                  v-if="getDocument(slot.type)?.status === 'rejected'"
                  type="error"
                  density="compact"
                  variant="tonal"
                  class="mb-2 text-caption pa-1"
                >
                  <strong>Rechazo:</strong> {{ getDocument(slot.type).rejection_reason }}
                </v-alert>

                <div v-if="getDocument(slot.type)" class="d-flex gap-1 justify-center mt-2">
                  <v-btn
                    size="x-small"
                    variant="flat"
                    color="success"
                    class="font-weight-bold"
                    :disabled="getDocument(slot.type).status === 'approved'"
                    @click="approveDoc(getDocument(slot.type))"
                  >
                    Aprobar
                  </v-btn>
                  <v-btn
                    size="x-small"
                    variant="flat"
                    color="error"
                    class="font-weight-bold"
                    @click="promptReject(getDocument(slot.type), 'doc')"
                  >
                    Rechazar
                  </v-btn>
                </div>
              </v-card>
            </v-col>
          </v-row>

          <!-- 2. CARTAS LABORALES -->
          <div class="d-flex align-center justify-space-between mb-3 border-bottom pb-2">
            <div class="d-flex align-center gap-2">
              <h4 class="text-subtitle-2 font-weight-bold text-slate-900 mb-0">
                2. Cartas Laborales y de Recomendación
              </h4>
              <v-chip
                size="x-small"
                :color="getLaborLetters(selectedItem).length >= 2 ? 'success' : 'error'"
                variant="flat"
                class="font-weight-bold text-white"
              >
                {{ getLaborLetters(selectedItem).length }} subida(s) (Mínimo 2)
              </v-chip>
            </div>
          </div>

          <v-row dense class="mb-5">
            <v-col
              v-if="getLaborLetters(selectedItem).length === 0"
              cols="12"
              class="text-caption text-grey py-3 text-center"
            >
              No se han subido cartas laborales para este candidato.
            </v-col>
            <v-col
              v-else
              cols="12"
              sm="6"
              md="4"
              lg="3"
              v-for="(letter, index) in getLaborLetters(selectedItem)"
              :key="letter.id"
              class="pa-2"
            >
              <v-card flat class="slot-audit-card pa-3">
                <div class="d-flex align-center justify-space-between mb-2">
                  <span class="font-weight-bold text-caption text-slate-800 text-truncate" :title="letter.original_name">
                    Carta #{{ index + 1 }}
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

                <div class="img-box mb-2 cursor-pointer" @click="openFile(letter.file_url)">
                  <div v-if="isPdf(letter)" class="pa-3 text-center bg-white d-flex flex-column align-center justify-center pdf-box">
                    <v-icon icon="mdi-file-pdf-box" color="#EF4444" size="36"></v-icon>
                    <span class="text-caption text-primary font-weight-bold mt-1">Abrir Carta</span>
                  </div>
                  <v-img v-else :src="letter.file_url" aspect-ratio="1.3" cover class="rounded-lg"></v-img>
                </div>

                <v-alert
                  v-if="letter.status === 'rejected'"
                  type="error"
                  density="compact"
                  variant="tonal"
                  class="mb-2 text-caption pa-1"
                >
                  <strong>Rechazo:</strong> {{ letter.rejection_reason }}
                </v-alert>

                <div class="d-flex gap-1 justify-center mt-2">
                  <v-btn
                    size="x-small"
                    variant="flat"
                    color="success"
                    class="font-weight-bold"
                    :disabled="letter.status === 'approved'"
                    @click="approveDoc(letter)"
                  >
                    Aprobar
                  </v-btn>
                  <v-btn
                    size="x-small"
                    variant="flat"
                    color="error"
                    class="font-weight-bold"
                    @click="promptReject(letter, 'doc')"
                  >
                    Rechazar
                  </v-btn>
                </div>
              </v-card>
            </v-col>
          </v-row>

          <!-- 3. FOTOGRAFÍAS -->
          <div class="d-flex align-center justify-space-between mb-3 border-bottom pb-2">
            <h4 class="text-subtitle-2 font-weight-bold text-slate-900 mb-0">
              3. Fotografías de Identificación y Vivienda
            </h4>
            <span class="text-caption text-slate-500 font-weight-medium">4 Fotografías</span>
          </div>

          <v-row dense class="mb-5">
            <v-col cols="12" sm="6" md="3" v-for="slot in photoSlots" :key="slot.type" class="pa-2">
              <v-card flat class="slot-audit-card pa-3">
                <div class="d-flex align-center justify-space-between mb-2">
                  <span class="font-weight-bold text-caption text-slate-800">{{ slot.title }}</span>
                  <v-chip
                    size="x-small"
                    :color="getStatusColor(getDocument(slot.type)?.status)"
                    variant="flat"
                    class="font-weight-bold text-white status-chip"
                  >
                    {{ formatStatus(getDocument(slot.type)?.status) }}
                  </v-chip>
                </div>

                <div v-if="getDocument(slot.type)?.file_url" class="img-box mb-2 cursor-pointer" @click="openFile(getDocument(slot.type).file_url)">
                  <v-img :src="getDocument(slot.type).file_url" aspect-ratio="1.2" cover class="rounded-lg"></v-img>
                </div>
                <div v-else class="empty-img-box mb-2 d-flex align-center justify-center text-caption text-grey">
                  Sin subir
                </div>

                <v-alert
                  v-if="getDocument(slot.type)?.status === 'rejected'"
                  type="error"
                  density="compact"
                  variant="tonal"
                  class="mb-2 text-caption pa-1"
                >
                  <strong>Rechazo:</strong> {{ getDocument(slot.type).rejection_reason }}
                </v-alert>

                <div v-if="getDocument(slot.type)" class="d-flex gap-1 justify-center mt-2">
                  <v-btn
                    size="x-small"
                    variant="flat"
                    color="success"
                    class="font-weight-bold"
                    :disabled="getDocument(slot.type).status === 'approved'"
                    @click="approveDoc(getDocument(slot.type))"
                  >
                    Aprobar
                  </v-btn>
                  <v-btn
                    size="x-small"
                    variant="flat"
                    color="error"
                    class="font-weight-bold"
                    @click="promptReject(getDocument(slot.type), 'doc')"
                  >
                    Rechazar
                  </v-btn>
                </div>
              </v-card>
            </v-col>
          </v-row>

          <!-- 4. REFERENCIAS PERSONALES -->
          <div class="d-flex align-center justify-space-between mb-3 border-bottom pb-2">
            <h4 class="text-subtitle-2 font-weight-bold text-slate-900 mb-0">
              4. Referencias Personales para Cotejo Telefónico
            </h4>
            <span class="text-caption text-slate-500 font-weight-medium">3 Referencias</span>
          </div>

          <v-row dense class="mb-5">
            <v-col
              v-if="!selectedItem.references || selectedItem.references.length === 0"
              cols="12"
              class="text-caption text-grey py-3 text-center"
            >
              No se han registrado referencias personales para este candidato.
            </v-col>
            <v-col v-else cols="12" md="4" v-for="(ref, i) in selectedItem.references" :key="i" class="pa-2">
              <v-card flat class="pa-3 rounded-lg border bg-white">
                <div class="font-weight-bold text-caption text-slate-900 mb-1">
                  {{ i + 1 }}. {{ ref.full_name }}
                </div>
                <div class="text-caption text-slate-600 mb-1">
                  <strong>Relación:</strong> {{ ref.relationship }} ({{ ref.years_known }} años)
                </div>
                <div class="text-caption text-slate-600 mb-2">
                  <strong>Ocupación:</strong> {{ ref.occupation || 'N/A' }}
                </div>
                <v-btn
                  size="x-small"
                  variant="tonal"
                  color="#25D366"
                  prepend-icon="mdi-phone"
                  block
                  class="font-weight-bold"
                  :href="'tel:' + ref.phone"
                >
                  Llamar: {{ ref.phone }}
                </v-btn>
              </v-card>
            </v-col>
          </v-row>

          <!-- 5. PRUEBAS PSICOMÉTRICAS -->
          <div class="d-flex align-center justify-space-between mb-3 border-bottom pb-2">
            <div class="d-flex align-center gap-2">
              <h4 class="text-subtitle-2 font-weight-bold text-slate-900 mb-0">
                5. Pruebas Psicométricas Contestadas
              </h4>
              <v-chip
                size="x-small"
                color="#07254A"
                variant="flat"
                class="font-weight-bold text-white"
              >
                {{ getPsychometrics(selectedItem).length }} Prueba(s) Cargada(s)
              </v-chip>
            </div>
          </div>

          <v-row dense>
            <v-col
              v-if="getPsychometrics(selectedItem).length === 0"
              cols="12"
              class="text-caption text-grey py-3 text-center"
            >
              No se han cargado pruebas psicométricas contestadas para este candidato.
            </v-col>
            <v-col
              v-else
              cols="12"
              sm="6"
              md="4"
              lg="3"
              v-for="test in getPsychometrics(selectedItem)"
              :key="test.id"
              class="pa-2"
            >
              <v-card flat class="slot-audit-card pa-3">
                <div class="d-flex align-center justify-space-between mb-2">
                  <span class="font-weight-bold text-caption text-slate-800 text-truncate" :title="test.psychometric_test?.name || test.original_name">
                    {{ test.psychometric_test?.name || 'Prueba Psicométrica' }}
                  </span>
                  <v-chip
                    size="x-small"
                    :color="getStatusColor(test.status)"
                    variant="flat"
                    class="font-weight-bold text-white status-chip"
                  >
                    {{ formatStatus(test.status) }}
                  </v-chip>
                </div>

                <div class="slot-hint text-caption text-grey mb-2 text-truncate" :title="test.original_name">
                  {{ test.original_name }}
                </div>

                <div v-if="test.file_url" class="img-box mb-2 cursor-pointer" @click="openFile(test.file_url)">
                  <div v-if="isPdf(test)" class="pa-3 text-center bg-white d-flex flex-column align-center justify-center pdf-box">
                    <v-icon icon="mdi-file-pdf-box" color="#EF4444" size="36"></v-icon>
                    <span class="text-caption text-primary font-weight-bold mt-1">Abrir Formato</span>
                  </div>
                  <v-img v-else :src="test.file_url" aspect-ratio="1.3" cover class="rounded-lg"></v-img>
                </div>

                <v-alert
                  v-if="test.status === 'rejected'"
                  type="error"
                  density="compact"
                  variant="tonal"
                  class="mb-2 text-caption pa-1"
                >
                  <strong>Rechazo:</strong> {{ test.rejection_reason }}
                </v-alert>

                <div class="d-flex gap-1 justify-center mt-2">
                  <v-btn
                    size="x-small"
                    variant="flat"
                    color="success"
                    class="font-weight-bold"
                    :disabled="test.status === 'approved'"
                    :loading="processingTestId === test.id"
                    @click="approvePsychometricTest(test)"
                  >
                    Aprobar
                  </v-btn>
                  <v-btn
                    size="x-small"
                    variant="flat"
                    color="error"
                    class="font-weight-bold"
                    :loading="processingTestId === test.id"
                    @click="promptReject(test, 'psychometric')"
                  >
                    Rechazar
                  </v-btn>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- MODAL CONFIRMAR EVALUACIÓN TERMINADA -->
    <v-dialog v-model="completeDialog" max-width="440px">
      <v-card class="rounded-xl overflow-hidden bg-white pa-5">
        <div class="text-center">
          <v-avatar size="56" color="#ecfdf5" class="mb-3">
            <v-icon icon="mdi-check-decagram" color="#059669" size="32"></v-icon>
          </v-avatar>
          <h4 class="text-h6 font-weight-bold text-slate-900 mb-2">
            ¿Marcar Evaluación Terminada?
          </h4>
          <p class="text-body-2 text-slate-600 mb-3" v-if="candidateToComplete">
            Se registrará el cierre oficial del proceso para <strong>{{ candidateToComplete.full_name }}</strong> y se detendrá el contador de tiempo de certificación.
          </p>
        </div>

        <div class="d-flex justify-center gap-2 mt-2">
          <v-btn variant="outlined" color="grey" class="text-none font-weight-bold px-5" rounded="lg" @click="completeDialog = false">
            Cancelar
          </v-btn>
          <v-btn
            variant="flat"
            color="#10B981"
            class="text-none font-weight-bold text-white px-5"
            rounded="lg"
            :loading="completingId === candidateToComplete?.id"
            @click="confirmCompleteEvaluation"
          >
            Sí, Confirmar Cierre
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- MODAL MOTIVO DE RECHAZO UNIFICADO -->
    <v-dialog v-model="rejectDialog" max-width="450px" persistent>
      <v-card class="rounded-xl overflow-hidden bg-white pa-4">
        <h4 class="text-subtitle-1 font-weight-bold text-slate-900 mb-2">
          {{ rejectType === 'psychometric' ? 'Rechazar Prueba Psicométrica' : 'Rechazar Documento' }}
        </h4>
        <p class="text-caption text-slate-500 mb-3">
          Ingresa el motivo puntual. Se notificará por correo al cliente para que vuelva a subir el formato corregido.
        </p>

        <v-textarea
          v-model="rejectionReason"
          placeholder="Ej. Respuestas incompletas / Ilegible / Falta firma."
          variant="outlined"
          density="comfortable"
          rounded="lg"
          rows="3"
          color="#07254A"
        ></v-textarea>

        <div class="d-flex justify-end gap-2 mt-3">
          <v-btn variant="outlined" color="grey" size="small" class="text-none font-weight-bold" @click="rejectDialog = false" :disabled="submittingReject">
            Cancelar
          </v-btn>
          <v-btn variant="flat" color="error" size="small" class="text-none font-weight-bold text-white" :loading="submittingReject" @click="confirmReject">
            Confirmar Rechazo
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="top right" timeout="3500">
      {{ snackbar.text }}
    </v-snackbar>
  </v-card>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'DossierReviewComponent',
  data() {
    return {
      dossiers: [],
      loading: false,
      search: '',
      headers: [
        { title: 'Candidato / Evaluado', key: 'full_name', align: 'start' },
        { title: 'Empresa Cliente', key: 'client.trade_name', align: 'start' },
        { title: 'Estatus Proceso', key: 'status', align: 'center' },
        { title: 'Docs', key: 'documents', align: 'center', sortable: false },
        { title: 'Psicometría', key: 'psychometrics', align: 'center', sortable: false },
        { title: 'Refs', key: 'references', align: 'center', sortable: false },
        { title: 'Acciones', key: 'actions', align: 'end', sortable: false },
      ],
      reviewDialog: false,
      selectedItem: null,
      completeDialog: false,
      candidateToComplete: null,
      completingId: null,
      remindingId: null,
      rejectDialog: false,
      rejectionReason: '',
      targetItem: null,
      rejectType: 'doc',
      submittingReject: false,
      processingTestId: null,

      officialDocSlots: [
        { type: 'birth_certificate', title: 'Acta de Nacimiento' },
        { type: 'rfc_document', title: 'RFC / Cédula Fiscal' },
        { type: 'imss_nss', title: 'Nº Afiliación IMSS' },
        { type: 'ine_id', title: 'INE / Identificación' },
        { type: 'curp_document', title: 'CURP' },
        { type: 'afore_statement', title: 'AFORE' },
        { type: 'proof_of_address', title: 'Comprobante Domicilio' },
        { type: 'study_certificate', title: 'Certificado de Estudios' },
        { type: 'drivers_license', title: 'Licencia de Conducir' },
      ],

      photoSlots: [
        { type: 'candidate_photo', title: 'Foto Rostro' },
        { type: 'house_facade', title: 'Fachada' },
        { type: 'house_living_room', title: 'Sala / Comedor' },
        { type: 'house_kitchen', title: 'Cocina' },
      ],

      snackbar: { show: false, text: '', color: 'success' },
    };
  },

  mounted() {
    this.fetchDossiers();
  },

  methods: {
    notify(text, color = 'success') {
      this.snackbar.text = text;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },

    isDossierIncomplete(item) {
      if (!item || item.status === 'completed') return false;
      const docsCount = item.documents?.length || 0;
      const refsCount = item.references?.length || 0;
      return docsCount < 15 || refsCount < 3;
    },

    async sendReminder(item) {
      this.remindingId = item.id;
      try {
        const res = await api.post(`/examinees/${item.id}/remind-dossier`);
        this.notify(res.data?.message || 'Recordatorio enviado por correo al cliente.');
      } catch (e) {
        this.notify(e.response?.data?.message || 'Error al enviar recordatorio.', 'error');
      } finally {
        this.remindingId = null;
      }
    },

    getExamineeStatusBadge(status) {
      const map = {
        pending: { label: 'Perfil Creado', color: '#475569' },
        registered: { label: 'Perfil Creado', color: '#475569' },
        order_created: { label: 'Orden Generada', color: '#4F46E5' },
        scheduled: { label: 'Cita Agendada', color: '#2563EB' },
        awaiting_results: { label: 'En Espera Resultados', color: '#D97706' },
        attended: { label: 'En Espera Resultados', color: '#D97706' },
        completed: { label: 'Evaluación Terminada', color: '#059669' },
        cancelled: { label: 'Cancelada', color: '#DC2626' },
        no_show: { label: 'No se presentó', color: '#DC2626' },
      };
      return map[status] || map.pending;
    },

    promptCompleteEvaluation(item) {
      this.candidateToComplete = item;
      this.completeDialog = true;
    },

    async confirmCompleteEvaluation() {
      if (!this.candidateToComplete) return;
      this.completingId = this.candidateToComplete.id;
      try {
        const res = await api.patch(`/examinees/${this.candidateToComplete.id}/complete`);
        this.notify(res.data?.message || 'Evaluación marcada como Terminada.');
        this.completeDialog = false;
        this.reviewDialog = false;
        await this.fetchDossiers();
      } catch (e) {
        this.notify(e.response?.data?.message || 'Error al cerrar evaluación.', 'error');
      } finally {
        this.completingId = null;
        this.candidateToComplete = null;
      }
    },

    async fetchDossiers() {
      this.loading = true;
      try {
        const res = await api.get('/social-work/dossiers/dt');
        this.dossiers = res.data || [];
        if (this.selectedItem) {
          const updated = this.dossiers.find((d) => d.id === this.selectedItem.id);
          if (updated) this.selectedItem = updated;
        }
      } catch (e) {
        this.notify('Error al cargar expedientes.', 'error');
      } finally {
        this.loading = false;
      }
    },

    openReview(item) {
      this.selectedItem = item;
      this.reviewDialog = true;
    },

    getDocument(type) {
      if (!this.selectedItem || !this.selectedItem.documents) return null;
      return this.selectedItem.documents.find((d) => d.document_type === type);
    },

    getLaborLetters(item) {
      if (!item || !item.documents) return [];
      return item.documents.filter((d) => d.document_type === 'labor_letters');
    },

    getPsychometrics(item) {
      if (!item) return [];
      return item.psychometric_tests || item.psychometricTests || [];
    },

    getDocumentsBadgeColor(docs) {
      if (!docs || docs.length === 0) return 'grey';
      if (docs.length >= 15) return 'success';
      return '#0284C7';
    },

    getPsychometricsBadgeColor(tests) {
      if (!tests || tests.length === 0) return 'grey';
      const allApproved = tests.every((t) => t.status === 'approved');
      if (allApproved) return 'success';
      return '#07254A';
    },

    getStatusColor(status) {
      const map = {
        pending: '#0284C7',
        approved: '#10B981',
        rejected: '#EF4444',
      };
      return map[status] || 'grey';
    },

    formatStatus(status) {
      const map = {
        pending: 'Pendiente',
        approved: 'Aprobado',
        rejected: 'Rechazado',
      };
      return map[status] || 'Sin subir';
    },

    isPdf(doc) {
      if (!doc) return false;
      if (doc.mime_type && doc.mime_type.includes('pdf')) return true;
      if (doc.file_path && doc.file_path.toLowerCase().endsWith('.pdf')) return true;
      if (doc.original_name && doc.original_name.toLowerCase().endsWith('.pdf')) return true;
      if (doc.file_url && doc.file_url.toLowerCase().includes('.pdf')) return true;
      return false;
    },

    openFile(url) {
      if (url) {
        window.open(url, '_blank');
      }
    },

    async approveDoc(doc) {
      try {
        await api.patch(`/examinee-documents/${doc.id}/status`, { status: 'approved' });
        doc.status = 'approved';
        doc.rejection_reason = null;
        this.notify('Documento aprobado correctamente.');
      } catch (e) {
        this.notify('Error al aprobar documento.', 'error');
      }
    },

    async approvePsychometricTest(test) {
      this.processingTestId = test.id;
      try {
        await api.patch(`/examinee-psychometric-tests/${test.id}/status`, { status: 'approved' });
        test.status = 'approved';
        test.rejection_reason = null;
        this.notify('Prueba psicométrica aprobada y notificada por correo.');
        await this.fetchDossiers();
      } catch (e) {
        this.notify(e.response?.data?.message || 'Error al aprobar prueba psicométrica.', 'error');
      } finally {
        this.processingTestId = null;
      }
    },

    promptReject(item, type) {
      this.targetItem = item;
      this.rejectType = type;
      this.rejectionReason = '';
      this.rejectDialog = true;
    },

    async confirmReject() {
      if (!this.rejectionReason.trim()) {
        this.notify('Debes especificar el motivo de rechazo.', 'error');
        return;
      }

      this.submittingReject = true;
      try {
        if (this.rejectType === 'psychometric') {
          await api.patch(`/examinee-psychometric-tests/${this.targetItem.id}/status`, {
            status: 'rejected',
            rejection_reason: this.rejectionReason.trim(),
          });
          this.targetItem.status = 'rejected';
          this.targetItem.rejection_reason = this.rejectionReason.trim();
          this.notify('Prueba rechazada y cliente notificado por correo.');
        } else {
          await api.patch(`/examinee-documents/${this.targetItem.id}/status`, {
            status: 'rejected',
            rejection_reason: this.rejectionReason.trim(),
          });
          this.targetItem.status = 'rejected';
          this.targetItem.rejection_reason = this.rejectionReason.trim();
          this.notify('Documento marcado como rechazado.');
        }
        this.rejectDialog = false;
        await this.fetchDossiers();
      } catch (e) {
        this.notify(e.response?.data?.message || 'Error al registrar rechazo.', 'error');
      } finally {
        this.submittingReject = false;
      }
    },
  },
};
</script>

<style scoped>
.review-table-card {
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

.slot-audit-card {
  border: 1px solid #e2e8f0 !important;
  border-radius: 10px !important;
  background: #ffffff !important;
  height: 100%;
}

.slot-hint {
  font-size: 0.72rem;
}

.img-box {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.pdf-box {
  min-height: 90px;
}

.empty-img-box {
  height: 90px;
  background: #f1f5f9;
  border-radius: 8px;
  border: 1px dashed #cbd5e1;
}

.empty-avatar {
  border: 1px solid #e2e8f0;
}

.status-chip {
  padding: 0 8px !important;
  height: 20px !important;
  font-size: 0.7rem !important;
}

.cursor-pointer {
  cursor: pointer;
}

.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
</style>
