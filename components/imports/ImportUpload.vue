<template>
  <div class="import-upload">
    <div
      class="drop-zone"
      :class="{ 'drop-zone--active': isDragging }"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      @click="fileInputRef?.click()"
    >
      <ArrowUpTrayIcon class="drop-zone__icon" />
      <p class="drop-zone__title">{{ t('Drop your file here or click to browse') }}</p>
      <p class="drop-zone__subtitle">{{ t('Supports CSV, PDF, PNG, JPG, TIFF, BMP') }}</p>
    </div>

    <input
      ref="fileInputRef"
      type="file"
      accept=".csv,.pdf,.png,.jpg,.jpeg,.tiff,.tif,.bmp"
      class="hidden-input"
      @change="handleFileSelect"
    />

    <div v-if="selectedFile" class="selected-file">
      <DocumentIcon class="selected-file__icon" />
      <span class="selected-file__name">{{ selectedFile.name }}</span>
      <button class="selected-file__remove" @click="clearFile">
        <XMarkIcon class="selected-file__remove-icon" />
      </button>
    </div>

    <div class="upload-options">
      <label class="upload-options__label">{{ t('Document type') }}</label>
      <select v-model="documentType" class="upload-options__select">
        <option value="">{{ t('Auto-detect') }}</option>
        <option value="bank_statement">{{ t('Bank statement') }}</option>
        <option value="receipt">{{ t('Receipt') }}</option>
        <option value="invoice">{{ t('Invoice') }}</option>
        <option value="pay_stub">{{ t('Pay stub') }}</option>
        <option value="utility_bill">{{ t('Utility bill') }}</option>
      </select>
    </div>

    <button class="upload-button" :disabled="!selectedFile || isAnalyzing" @click="handleUpload">
      {{ isAnalyzing ? t('Analyzing...') : t('Analyze document') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ArrowUpTrayIcon, DocumentIcon, XMarkIcon } from '@heroicons/vue/24/outline';

const { t } = useI18n();

const emit = defineEmits<{
  upload: [file: File, documentType?: string];
}>();

defineProps<{
  isAnalyzing: boolean;
}>();

const fileInputRef = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const documentType = ref('');
const isDragging = ref(false);

const handleDrop = (event: DragEvent) => {
  isDragging.value = false;
  const file = event.dataTransfer?.files[0];
  if (file) selectedFile.value = file;
};

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) selectedFile.value = file;
};

const clearFile = () => {
  selectedFile.value = null;
  if (fileInputRef.value) fileInputRef.value.value = '';
};

const handleUpload = () => {
  if (!selectedFile.value) return;
  emit('upload', selectedFile.value, documentType.value || undefined);
};
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.import-upload {
  max-width: 560px;
  margin: 0 auto;
}

.drop-zone {
  border: 2px dashed $border-color;
  border-radius: $radius-xl;
  padding: 48px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover,
  &--active {
    border-color: $primary;
    background-color: rgba(var(--color-primary-rgb), 0.05);
  }

  &__icon {
    width: 48px;
    height: 48px;
    color: $text-muted;
    margin-bottom: 12px;
  }

  &__title {
    font-size: $font-size-base;
    color: $text-primary;
    margin: 0 0 4px;
  }

  &__subtitle {
    font-size: $font-size-sm;
    color: $text-muted;
    margin: 0;
  }
}

.hidden-input {
  display: none;
}

.selected-file {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding: 12px;
  background-color: $bg-slate;
  border-radius: $radius-lg;

  &__icon {
    width: 20px;
    height: 20px;
    color: $primary;
    flex-shrink: 0;
  }

  &__name {
    font-size: $font-size-sm;
    color: $text-primary;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__remove {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    border-radius: $radius-sm;

    &:hover {
      background-color: rgba(var(--color-error-rgb), 0.1);
    }
  }

  &__remove-icon {
    width: 16px;
    height: 16px;
    color: $text-muted;
  }
}

.upload-options {
  margin-top: 16px;

  &__label {
    display: block;
    font-size: $font-size-sm;
    color: $text-secondary;
    margin-bottom: 4px;
  }

  &__select {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid $border-color;
    border-radius: $radius-lg;
    font-size: $font-size-sm;
    background-color: $input-bg;
    color: $text-primary;
  }
}

.upload-button {
  width: 100%;
  margin-top: 20px;
  padding: 12px;
  background-color: $primary;
  color: $text-inverse;
  border: none;
  border-radius: $radius-lg;
  font-size: $font-size-base;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover:not(:disabled) {
    background-color: $primary-hover;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
