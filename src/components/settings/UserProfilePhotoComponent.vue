<template>
  <div class="photo-settings-container py-2">
    <div class="d-flex flex-column flex-sm-row align-center">
      <!-- Avatar con Preview / Foto actual -->
      <v-avatar size="90" color="#07254A" class="elevation-2 mb-3 mb-sm-0 flex-shrink-0">
        <v-img v-if="previewUrl || currentPhotoUrl" :src="previewUrl || currentPhotoUrl" cover></v-img>
        <span v-else class="text-white font-weight-bold text-h6">{{ userInitials }}</span>
      </v-avatar>

      <!-- Instrucciones y Controles -->
      <div class="ml-sm-6 text-center text-sm-left flex-grow-1">
        <div class="font-weight-bold text-slate-800 text-body-2 mb-1">
          Fotografía de Perfil Institucional
        </div>
        <div class="text-caption text-grey mb-3">
          Sube una foto clara en formato JPG, PNG o WEBP (máximo 2 MB).
        </div>

        <!-- Input de archivo oculto -->
        <input
          type="file"
          ref="fileInput"
          accept="image/png, image/jpeg, image/webp"
          class="d-none"
          @change="handleFileChange"
        />

        <div class="d-flex flex-wrap align-center justify-center justify-sm-start gap-2">
          <!-- Botón Seleccionar -->
          <v-btn
            size="small"
            variant="outlined"
            color="#07254A"
            prepend-icon="mdi-camera-outline"
            class="text-none font-weight-bold action-btn"
            @click="$refs.fileInput.click()"
          >
            Seleccionar Foto
          </v-btn>

          <!-- Botón Guardar (se activa al seleccionar archivo) -->
          <v-btn
            v-if="selectedFile"
            size="small"
            variant="flat"
            color="#07254A"
            prepend-icon="mdi-check"
            class="text-none font-weight-bold text-white action-btn"
            :loading="uploading"
            @click="uploadPhoto"
          >
            Guardar Cambio
          </v-btn>

          <!-- Botón Cancelar Preview -->
          <v-btn
            v-if="selectedFile"
            size="small"
            variant="text"
            color="grey-darken-1"
            class="text-none action-btn"
            :disabled="uploading"
            @click="cancelSelection"
          >
            Cancelar
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Feedback Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="top right" timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'UserProfilePhotoComponent',
  data() {
    return {
      selectedFile: null,
      previewUrl: null,
      currentPhotoUrl: null,
      userInitials: 'OP',
      uploading: false,
      snackbar: {
        show: false,
        text: '',
        color: 'success',
      },
    };
  },
  methods: {
    notify(text, color = 'success') {
      this.snackbar.text = text;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },

    handleFileChange(event) {
      const file = event.target.files[0];
      if (!file) return;

      // Validación de tamaño (2 MB)
      if (file.size > 2 * 1024 * 1024) {
        this.notify('El archivo seleccionado excede el límite de 2 MB.', 'error');
        return;
      }

      this.selectedFile = file;
      this.previewUrl = URL.createObjectURL(file);
    },

    cancelSelection() {
      this.selectedFile = null;
      if (this.previewUrl) {
        URL.revokeObjectURL(this.previewUrl);
        this.previewUrl = null;
      }
      this.$refs.fileInput.value = '';
    },

    async uploadPhoto() {
      if (!this.selectedFile) return;

      this.uploading = true;
      const formData = new FormData();
      formData.append('photo', this.selectedFile);

      try {
        const response = await api.post('/user/photo', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        this.currentPhotoUrl = response.data.photo_url;
        this.notify(response.data.message || 'Fotografía de perfil actualizada con éxito.');
        this.cancelSelection();
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Error al actualizar la foto de perfil.';
        this.notify(errorMsg, 'error');
      } finally {
        this.uploading = false;
      }
    },
  },
};
</script>

<style scoped>
.action-btn {
  border-radius: 8px !important;
  font-size: 0.78rem !important;
  height: 32px !important;
}
</style>
