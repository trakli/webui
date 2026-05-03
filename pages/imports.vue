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
              :disabled="acceptedCount === 0 || currentSession.status === 'confirmed'"
              @click="showConfirmDialog = true"
            >
              {{ t('Import {count} transactions', { count: acceptedCount }) }}
            </button>
            <span v-if="missingWalletCount > 0" class="validation-warning">
              {{
                t('{count} accepted rows need a wallet (or auto-create)', {
                  count: missingWalletCount
                })
              }}
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
          :new-wallet-count="newWalletCount"
          :new-party-count="newPartyCount"
          :new-category-count="newCategoryCount"
          :missing-wallet-count="missingWalletCount"
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
import type { AutoCreateOptions } from '~/types/import';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
});

const { t } = useI18n();
const { showSuccess, showError, showWarning } = useNotifications();
const { wallets, categories, parties, loadWallets, loadCategories, loadParties } = useSharedData();

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

// The review table needs wallets/parties/categories to pre-link suggestions to
// existing records by name match. Make sure the caches are warm before upload.
onMounted(() => {
  loadWallets();
  loadCategories();
  loadParties();
});

const duplicatesInAccepted = computed(
  () => suggestions.value.filter((s) => s.status === 'accepted' && s.duplicate !== null).length
);

const missingWalletCount = computed(
  () => suggestions.value.filter((s) => s.status === 'accepted' && !s.wallet_id).length
);

const walletNames = computed(() => new Set(wallets.value.map((w) => w.name)));
const partyNames = computed(() => new Set(parties.value.map((p) => p.name)));
const categoryNames = computed(() => new Set(categories.value.map((c) => c.name)));

const acceptedSuggestions = computed(() =>
  suggestions.value.filter((s) => s.status === 'accepted')
);

// Count unique suggestion names that would need to be created if the user enables
// the matching auto-create flag. "New" = the suggestion has a name that doesn't
// match any existing record, and no ID has been picked in the review table.
const newWalletCount = computed(() => {
  const names = new Set<string>();
  for (const s of acceptedSuggestions.value) {
    if (!s.wallet_id && s.wallet && !walletNames.value.has(s.wallet)) names.add(s.wallet);
  }
  return names.size;
});

const newPartyCount = computed(() => {
  const names = new Set<string>();
  for (const s of acceptedSuggestions.value) {
    if (!s.party_id && s.party && !partyNames.value.has(s.party)) names.add(s.party);
  }
  return names.size;
});

const newCategoryCount = computed(() => {
  const names = new Set<string>();
  for (const s of acceptedSuggestions.value) {
    if (!s.category_id && s.category && !categoryNames.value.has(s.category)) names.add(s.category);
  }
  return names.size;
});

const lowConfidencePercent = computed(() => {
  if (suggestions.value.length === 0) return 0;
  const lowCount = suggestions.value.filter((s) => s.confidence < 0.6).length;
  return Math.round((lowCount / suggestions.value.length) * 100);
});

const handleUpload = (file: File, documentType?: string) => {
  uploadedFileName.value = file.name;
  analyzeFile(file, documentType);
};

// Suggestions arrive with null IDs. Whenever the wallets/parties/categories
// caches update OR new suggestions land, fill in any null ID by exact name
// match. A snapshot at upload time would miss late cache loads.
watch(
  [suggestions, wallets, parties, categories],
  () => {
    for (const s of suggestions.value) {
      if (!s.wallet_id && s.wallet) {
        const match = wallets.value.find((w) => w.name === s.wallet);
        if (match) s.wallet_id = match.id;
      }
      if (!s.party_id && s.party) {
        const match = parties.value.find((p) => p.name === s.party);
        if (match) s.party_id = match.id;
      }
      if (!s.category_id && s.category) {
        const match = categories.value.find((c) => c.name === s.category);
        if (match) s.category_id = match.id;
      }
    }
  },
  { deep: true }
);

const handleConfirm = async (autoCreate: AutoCreateOptions) => {
  const result = await confirmImport(autoCreate);
  showConfirmDialog.value = false;

  if (result) {
    // Keep wallet/party/category caches fresh after a successful import so the
    // dashboard sees the just-linked entities (transaction counts, etc.).
    if (result.created_count > 0) {
      loadWallets(true);
      loadCategories(true);
      loadParties(true);
    }

    if (result.errors.length > 0 && result.created_count === 0) {
      const uniqueReasons = [
        ...new Set(result.errors.map((e) => e.replace(/at index \d+:\s*/, '')))
      ];
      showError(
        t('{count} transactions failed to import', { count: result.errors.length }),
        uniqueReasons.join('; ')
      );
    } else if (result.errors.length > 0) {
      const uniqueReasons = [
        ...new Set(result.errors.map((e) => e.replace(/at index \d+:\s*/, '')))
      ];
      showWarning(
        t('{count} imported, {failed} failed', {
          count: result.created_count,
          failed: result.errors.length
        }),
        uniqueReasons.join('; ')
      );
    } else {
      showSuccess(
        t('{count} transactions imported successfully.', { count: result.created_count })
      );
    }
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
