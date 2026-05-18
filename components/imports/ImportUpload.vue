<template>
  <section class="import-upload surface surface--brand-soft">
    <svg
      class="upload-backdrop"
      viewBox="0 0 1200 600"
      preserveAspectRatio="xMaxYMid slice"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="upload-bloom" cx="100%" cy="30%" r="60%">
          <stop offset="0%" stop-color="var(--surface-accent)" stop-opacity="0.4" />
          <stop offset="100%" stop-color="var(--surface-accent)" stop-opacity="0" />
        </radialGradient>
      </defs>
      <circle cx="1100" cy="100" r="280" fill="url(#upload-bloom)" />
    </svg>

    <div class="upload-grid">
      <div class="upload-art">
        <div class="doc-rotator">
          <svg class="doc-orbit" viewBox="0 0 240 240" aria-hidden="true">
            <defs>
              <radialGradient id="doc-glow" cx="50%" cy="50%" r="55%">
                <stop offset="0%" stop-color="var(--surface-accent)" stop-opacity="0.45" />
                <stop offset="100%" stop-color="var(--surface-accent)" stop-opacity="0" />
              </radialGradient>
            </defs>
            <circle cx="120" cy="120" r="110" fill="url(#doc-glow)" />
            <circle
              cx="120"
              cy="120"
              r="92"
              fill="none"
              stroke="var(--surface-accent)"
              stroke-opacity="0.45"
              stroke-width="1"
              stroke-dasharray="3 4"
            />
            <circle
              cx="120"
              cy="120"
              r="68"
              fill="none"
              stroke="var(--surface-accent)"
              stroke-opacity="0.6"
              stroke-width="1"
            />
          </svg>

          <Transition name="doc-swap">
            <div :key="activeDoc.key" class="doc-card" :class="`doc-card--${activeDoc.key}`">
              <div class="doc-icon">
                <img
                  :src="`/icons/imports/${activeDoc.key}.svg`"
                  :alt="activeDoc.name"
                  width="22"
                  height="22"
                  class="doc-glyph-img"
                />
              </div>
              <div class="doc-meta">
                <span class="doc-name">{{ activeDoc.name }}</span>
                <span class="doc-format">{{ activeDoc.format }}</span>
              </div>
              <span class="doc-badge">{{ activeDoc.badge }}</span>
            </div>
          </Transition>

          <div class="doc-dots">
            <button
              v-for="(d, i) in docTypes"
              :key="d.key"
              type="button"
              class="doc-dot"
              :class="{ 'doc-dot--active': i === activeIndex }"
              :aria-label="t('Show {name}', { name: d.name })"
              @click="goTo(i)"
            />
          </div>
        </div>
      </div>

      <div class="upload-content">
        <span class="upload-eyebrow">{{ t('Smart import') }}</span>
        <h2 class="upload-title">{{ t('Bring your statements and receipts to life') }}</h2>
        <p class="upload-subtitle">
          {{
            t(
              'Drop a CSV, PDF, or photo. We extract the transactions, match wallets and categories, and let you review before saving.'
            )
          }}
        </p>

        <div
          class="drop-zone"
          :class="{ 'drop-zone--active': isDragging }"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleDrop"
          @click="fileInputRef?.click()"
        >
          <ArrowUpTrayIcon class="drop-zone__icon" />
          <div class="drop-zone__text">
            <p class="drop-zone__title">{{ t('Drop your file here or click to browse') }}</p>
            <p class="drop-zone__subtitle">{{ t('Supports CSV, PDF, PNG, JPG, TIFF, BMP') }}</p>
          </div>
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
          <button class="selected-file__remove" :aria-label="t('Remove')" @click="clearFile">
            <XMarkIcon class="selected-file__remove-icon" />
          </button>
        </div>

        <div class="upload-row">
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

          <button
            class="upload-button"
            :disabled="!selectedFile || isAnalyzing"
            @click="handleUpload"
          >
            {{ isAnalyzing ? t('Analyzing...') : t('Analyze document') }}
          </button>
        </div>
      </div>
    </div>
  </section>
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

const docTypes = [
  { key: 'csv', name: t('Spreadsheet'), format: t('CSV / XLSX'), badge: 'CSV' },
  { key: 'pdf', name: t('Bank statement'), format: t('PDF document'), badge: 'PDF' },
  { key: 'image', name: t('Receipt photo'), format: t('PNG · JPG · TIFF'), badge: 'IMG' },
  { key: 'receipt', name: t('Paper receipt'), format: t('Scanned image'), badge: 'OCR' }
];
const activeIndex = ref(0);
const activeDoc = computed(() => docTypes[activeIndex.value]);
let rotateTimer: ReturnType<typeof setInterval> | null = null;

const goTo = (i: number) => {
  activeIndex.value = i;
  if (rotateTimer) {
    clearInterval(rotateTimer);
    startRotate();
  }
};

const startRotate = () => {
  rotateTimer = setInterval(() => {
    activeIndex.value = (activeIndex.value + 1) % docTypes.length;
  }, 2800);
};

onMounted(() => startRotate());
onBeforeUnmount(() => {
  if (rotateTimer) clearInterval(rotateTimer);
});

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
  position: relative;
  width: 100%;
  border: 1px solid $border-light;
  border-radius: 18px;
  box-shadow: $elevation-1;
  overflow: hidden;
  padding: 2rem 2.25rem;

  @media (max-width: $breakpoint-md) {
    padding: 1.5rem;
  }
  @media (max-width: $breakpoint-sm) {
    padding: 1.25rem 1rem;
    border-radius: 14px;
  }
}

.upload-backdrop {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.upload-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr;
  gap: $spacing-5;
  align-items: center;

  @media (min-width: $breakpoint-md) {
    grid-template-columns: minmax(0, 4fr) minmax(0, 6fr);
    gap: $spacing-8;
  }
}

.upload-art {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 24px;
}

.doc-rotator {
  position: relative;
  width: 320px;
  height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: $breakpoint-md) {
    width: 240px;
    height: 240px;
  }

  @media (max-width: $breakpoint-sm) {
    width: 200px;
    height: 200px;
  }
}

.doc-orbit {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  animation: doc-orbit-spin 24s linear infinite;
}

@keyframes doc-orbit-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.doc-card {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  display: grid;
  grid-template-columns: 48px 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  width: min(86%, 260px);
  background: $bg-white;
  border: 1px solid $border-light;
  border-radius: 14px;
  box-shadow: $elevation-2;

  @media (max-width: $breakpoint-sm) {
    padding: 10px 12px;
    grid-template-columns: 36px 1fr auto;
    gap: 8px;
  }
}

.doc-icon {
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--surface-bg);
  border: 1px solid $border-light;
  color: var(--surface-deep);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  @media (max-width: $breakpoint-sm) {
    width: 36px;
    height: 36px;
    border-radius: 10px;
  }
}

.doc-glyph-img {
  display: block;
  width: 22px;
  height: 22px;
}

.doc-meta {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
  line-height: 1.2;
}

.doc-name {
  font-size: $font-size-sm;
  font-weight: $font-bold;
  color: $text-primary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.005em;
}

.doc-format {
  font-size: 10px;
  color: $text-muted;
  font-weight: $font-medium;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.doc-badge {
  font-size: 9px;
  font-weight: $font-bold;
  letter-spacing: 0.08em;
  padding: 3px 7px;
  border-radius: 6px;
  background: var(--surface-deep);
  color: var(--color-text-inverse);
  font-variant-numeric: tabular-nums;
}

.doc-dots {
  position: absolute;
  bottom: -18px;
  left: 50%;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.doc-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  border: none;
  background: var(--surface-accent);
  opacity: 0.35;
  cursor: pointer;
  padding: 0;
  transition:
    opacity $duration-fast $easing-standard,
    width $duration-base $easing-emphasized;

  &:hover {
    opacity: 0.6;
  }

  &--active {
    opacity: 1;
    width: 18px;
    border-radius: 999px;
  }
}

// Opacity-only crossfade so the transition doesn't clobber the card's
// translate(-50%, -50%) centering transform.
.doc-swap-enter-active,
.doc-swap-leave-active {
  transition: opacity $duration-base $easing-standard;
}
.doc-swap-enter-from,
.doc-swap-leave-to {
  opacity: 0;
}

.upload-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.upload-eyebrow {
  font-size: 11px;
  font-weight: $font-bold;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--surface-deep);
  opacity: 0.85;
}

.upload-title {
  font-size: 1.5rem;
  font-weight: $font-bold;
  letter-spacing: -0.025em;
  color: var(--surface-ink);
  margin: 0 0 4px;
  line-height: 1.15;

  @media (max-width: $breakpoint-sm) {
    font-size: 1.25rem;
  }
}

.upload-subtitle {
  font-size: $font-size-base;
  color: var(--surface-ink);
  opacity: 0.75;
  line-height: 1.5;
  margin: 0 0 12px;

  @media (max-width: $breakpoint-sm) {
    font-size: $font-size-sm;
  }
}

.drop-zone {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  padding: 16px 18px;
  border: 1.5px dashed var(--surface-accent);
  border-radius: 12px;
  background: var(--glass-bg);
  cursor: pointer;
  transition:
    background-color $duration-fast $easing-standard,
    border-color $duration-fast $easing-standard;
  backdrop-filter: blur(6px);

  &:hover,
  &--active {
    border-color: var(--surface-deep);
    background: var(--glass-bg-strong);
  }

  &__icon {
    width: 24px;
    height: 24px;
    color: var(--surface-deep);
    flex-shrink: 0;
  }

  &__text {
    min-width: 0;
  }

  &__title {
    font-size: $font-size-sm;
    font-weight: $font-semibold;
    color: var(--surface-ink);
    margin: 0;
  }

  &__subtitle {
    font-size: 11px;
    color: var(--surface-ink);
    opacity: 0.65;
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
  margin-top: 10px;
  padding: 8px 10px;
  background: var(--glass-bg);
  border: 1px solid $border-light;
  border-radius: 999px;
  backdrop-filter: blur(6px);

  &__icon {
    width: 16px;
    height: 16px;
    color: var(--surface-deep);
    flex-shrink: 0;
  }

  &__name {
    font-size: $font-size-sm;
    font-weight: $font-medium;
    color: var(--surface-ink);
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
    border-radius: 6px;
    display: inline-flex;
    transition: background-color $duration-fast $easing-standard;

    &:hover {
      background-color: rgba(var(--color-expense-rgb), 0.12);
    }
  }

  &__remove-icon {
    width: 14px;
    height: 14px;
    color: var(--surface-deep);
  }
}

.upload-row {
  display: flex;
  align-items: flex-end;
  gap: $spacing-3;
  margin-top: 12px;
  flex-wrap: wrap;
}

.upload-options {
  flex: 1;
  min-width: 180px;

  &__label {
    display: block;
    font-size: 11px;
    font-weight: $font-bold;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--surface-deep);
    opacity: 0.85;
    margin-bottom: 6px;
  }

  &__select {
    width: 100%;
    height: 40px;
    padding: 0 12px;
    border: 1px solid $border-medium;
    border-radius: 10px;
    font-size: $font-size-sm;
    background-color: $bg-white;
    color: $text-primary;
    transition:
      border-color $duration-fast $easing-standard,
      box-shadow $duration-fast $easing-standard;

    &:hover {
      border-color: $text-muted;
    }

    &:focus {
      outline: none;
      border-color: $primary;
      box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.18);
    }
  }
}

.upload-button {
  height: 40px;
  padding: 0 1.25rem;
  background-color: $primary;
  color: $text-inverse;
  border: none;
  border-radius: 10px;
  font-size: $font-size-sm;
  font-weight: $font-semibold;
  letter-spacing: -0.005em;
  cursor: pointer;
  box-shadow: $elevation-1;
  transition:
    background-color $duration-fast $easing-standard,
    box-shadow $duration-fast $easing-standard,
    transform $duration-fast $easing-standard;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background-color: $primary-hover;
    box-shadow: $elevation-2;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
  }
}
</style>
