<template>
  <div>
    <ContentTopCard page-name="Import" page-name-plural="Imports" :show-add-button="false" />

    <div class="content-area">
      <!-- Upload + analyzing + error state -->
      <div
        v-if="
          !currentSession ||
          ['analyzing', 'extracting', 'enriching', 'checking'].includes(currentSession.status)
        "
      >
        <ImportUpload v-if="!isAnalyzing" :is-analyzing="isAnalyzing" @upload="handleUpload" />

        <ImportAnalyzing
          v-if="isAnalyzing"
          :file-name="currentSession?.file_name || uploadedFileName"
          :status="currentSession?.status || 'analyzing'"
        />

        <div v-if="error" class="error-message">
          <p class="error-message__title">{{ error }}</p>
          <p class="error-message__hint">
            {{ t('extraction_help_text') }}
          </p>
        </div>
      </div>

      <!-- Review state -->
      <div v-if="currentSession && !isAnalyzing">
        <div class="review-header">
          <div class="review-header__info">
            <span class="review-header__file">{{ currentSession.file_name }}</span>
            <span class="review-header__meta">
              {{ currentSession.processor }} &middot; {{ suggestions.length }}
              {{ t('suggestions') }}
              <template v-if="duplicateCount > 0">
                &middot; {{ duplicateCount }} {{ t('duplicates') }}
              </template>
            </span>
          </div>
          <div class="review-header__actions">
            <button class="btn btn--secondary" @click="handleReset">
              {{ t('Upload another') }}
            </button>
            <button
              class="btn btn--primary"
              :disabled="
                acceptedCount === 0 ||
                currentSession.status === 'confirmed' ||
                missingWalletCount > 0
              "
              :title="
                missingWalletCount > 0
                  ? t('Some accepted transactions have no wallet assigned')
                  : ''
              "
              @click="showConfirmDialog = true"
            >
              {{ t('Import {count} transactions', { count: acceptedCount }) }}
            </button>
            <span v-if="missingWalletCount > 0" class="validation-warning">
              {{ t('{count} accepted transactions need a wallet', { count: missingWalletCount }) }}
            </span>
          </div>
        </div>

        <div v-if="lowConfidencePercent >= 30" class="warning-banner">
          <span class="warning-banner__icon">!</span>
          <p>
            {{ t('low_confidence_warning', { percent: lowConfidencePercent }) }}
          </p>
        </div>

        <div v-if="currentSession.status === 'confirmed'" class="success-message">
          {{ t('Import completed successfully.') }}
        </div>

        <SuggestionReviewTable
          v-if="currentSession.status !== 'confirmed'"
          :suggestions="suggestions"
          :wallets="wallets"
          :categories="categories"
          :parties="parties"
          :accepted-count="acceptedCount"
          :rejected-count="rejectedCount"
          :pending-count="pendingCount"
          @toggle="toggleSuggestion"
          @edit="editSuggestion"
          @accept-all="acceptAll"
          @reject-all="rejectAll"
        />

        <ImportConfirmDialog
          :show="showConfirmDialog"
          :accepted-count="acceptedCount"
          :rejected-count="rejectedCount"
          :duplicates-in-accepted="duplicatesInAccepted"
          :is-confirming="isConfirming"
          @confirm="handleConfirm"
          @cancel="showConfirmDialog = false"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ContentTopCard from '@/components/TTopCard.vue';
import ImportUpload from '~/components/imports/ImportUpload.vue';
import ImportAnalyzing from '~/components/imports/ImportAnalyzing.vue';
import SuggestionReviewTable from '~/components/imports/SuggestionReviewTable.vue';
import ImportConfirmDialog from '~/components/imports/ImportConfirmDialog.vue';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
});

const { t } = useI18n();
const { showSuccess } = useNotifications();
const { wallets, categories, parties } = useSharedData();

const {
  currentSession,
  suggestions,
  isAnalyzing,
  isConfirming,
  error,
  acceptedCount,
  rejectedCount,
  pendingCount,
  duplicateCount,
  analyzeFile,
  toggleSuggestion,
  acceptAll,
  rejectAll,
  editSuggestion,
  confirmImport,
  reset
} = useImports();

const showConfirmDialog = ref(false);
const uploadedFileName = ref('');

const duplicatesInAccepted = computed(
  () => suggestions.value.filter((s) => s.status === 'accepted' && s.duplicate !== null).length
);

const missingWalletCount = computed(
  () => suggestions.value.filter((s) => s.status === 'accepted' && !s.wallet).length
);

const lowConfidencePercent = computed(() => {
  if (suggestions.value.length === 0) return 0;
  const lowCount = suggestions.value.filter((s) => s.confidence < 0.6).length;
  return Math.round((lowCount / suggestions.value.length) * 100);
});

const handleUpload = (file: File, documentType?: string) => {
  uploadedFileName.value = file.name;
  analyzeFile(file, documentType);
};

const handleConfirm = async () => {
  const result = await confirmImport();
  showConfirmDialog.value = false;

  if (result) {
    showSuccess(t('{count} transactions imported successfully.', { count: result.created_count }));
  }
};

const handleReset = () => {
  reset();
};
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.content-area {
  margin-top: 1rem;
  padding: 0;
}

.review-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;

  &__info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__file {
    font-size: $font-size-base;
    font-weight: 600;
    color: $text-primary;
  }

  &__meta {
    font-size: $font-size-sm;
    color: $text-muted;
  }

  &__actions {
    display: flex;
    gap: 8px;
  }
}

.btn {
  padding: 8px 20px;
  border-radius: $radius-lg;
  font-size: $font-size-sm;
  cursor: pointer;
  border: none;
  transition: all 0.2s;

  &--secondary {
    background-color: $bg-gray;
    color: $text-secondary;

    &:hover {
      background-color: $border-color;
    }
  }

  &--primary {
    background-color: $primary;
    color: $text-inverse;

    &:hover:not(:disabled) {
      background-color: $primary-hover;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

.validation-warning {
  font-size: $font-size-xs;
  color: $warning-text;
  background-color: $warning-bg;
  padding: 4px 8px;
  border-radius: $radius-sm;
}

.error-message {
  margin-top: 16px;
  padding: 16px;
  background-color: rgba(var(--color-error-rgb), 0.06);
  border: 1px solid rgba(var(--color-error-rgb), 0.15);
  border-radius: $radius-lg;

  &__title {
    font-size: $font-size-sm;
    font-weight: 600;
    color: $error-color;
    margin: 0 0 8px;
  }

  &__hint {
    font-size: $font-size-xs;
    color: $text-muted;
    margin: 0;
    line-height: 1.5;
  }
}

.warning-banner {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 16px;
  padding: 12px 16px;
  background-color: $warning-bg;
  border: 1px solid rgba(var(--color-warning-rgb), 0.25);
  border-radius: $radius-lg;

  &__icon {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: rgba(var(--color-warning-rgb), 0.3);
    color: $warning-text;
    font-size: $font-size-xs;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 1px;
  }

  p {
    font-size: $font-size-sm;
    color: $warning-text;
    margin: 0;
    line-height: 1.4;
  }
}

.success-message {
  margin-bottom: 16px;
  padding: 12px;
  background-color: rgba(var(--color-success-rgb), 0.1);
  color: $success;
  border-radius: $radius-lg;
  font-size: $font-size-sm;
}
</style>
