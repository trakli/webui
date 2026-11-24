<template>
  <LedgerWorkspace
    class="imports-ledger"
    :title="t('Imports')"
    :subtitle="ledgerSubtitle"
    :inspector-label="t('Row details')"
    data-testid="imports"
  >
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

        <ImportSessionsList
          v-if="!isAnalyzing && !currentSession && sessions.length"
          :sessions="sessions"
          @open="openSession"
          @delete="handleDeleteSession"
        />
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

        <table v-if="currentSession.status === 'confirmed'" class="readonly-table">
          <thead>
            <tr>
              <th>{{ t('Date') }}</th>
              <th>{{ t('Description') }}</th>
              <th class="num">{{ t('Amount') }}</th>
              <th>{{ t('Type') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in suggestions" :key="s.index">
              <td>{{ s.date }}</td>
              <td>{{ s.description }}</td>
              <td class="num">{{ s.amount }}</td>
              <td>{{ s.type ? t(s.type === 'income' ? 'Income' : 'Expense') : '' }}</td>
            </tr>
          </tbody>
        </table>

        <div v-if="currentSession.status !== 'confirmed'" class="il-chips">
          <span class="il-chip il-chip--good">{{ t('{count} ready', { count: readyCount }) }}</span>
          <span v-if="needCategoryCount" class="il-chip il-chip--bad">
            {{ t('{count} need a category', { count: needCategoryCount }, needCategoryCount) }}
          </span>
          <span v-if="duplicateCount" class="il-chip il-chip--warn">
            {{ t('{count} look like duplicates', { count: duplicateCount }, duplicateCount) }}
          </span>
        </div>
        <SuggestionReviewTable
          v-if="currentSession.status !== 'confirmed'"
          :selected-index="selectedIndex"
          :suggestions="suggestions"
          :wallets="wallets"
          :categories="categories"
          :parties="parties"
          :accepted-count="acceptedCount"
          :rejected-count="rejectedCount"
          :pending-count="pendingCount"
          @select="selectedIndex = $event"
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

    <template #inspector>
      <template v-if="selectedRow">
        <h2 class="il-h"><FileText />{{ t('On the statement') }}</h2>
        <div class="il-title">{{ selectedRow.description || t('No description') }}</div>
        <dl class="il-kv">
          <dt>{{ t('Date') }}</dt>
          <dd>{{ selectedRow.date || t('None') }}</dd>
          <dt>{{ t('Amount') }}</dt>
          <dd class="il-num" :class="{ 'il-in': selectedRow.type === 'income' }">
            {{
              selectedRow.amount == null
                ? t('None')
                : money(
                    selectedRow.type === 'income' ? selectedRow.amount : -selectedRow.amount,
                    selectedRow.currency || 'EUR',
                    locale,
                    { sign: true }
                  )
            }}
          </dd>
          <dt>{{ t('Read as') }}</dt>
          <dd :class="{ 'il-neg': !rowCategory }">{{ rowCategory || t('No category yet') }}</dd>
          <dt>{{ t('Wallet') }}</dt>
          <dd>{{ rowWallet || t('None') }}</dd>
          <dt>{{ t('Confidence') }}</dt>
          <dd class="il-num">{{ Math.round((selectedRow.confidence || 0) * 100) }}%</dd>
        </dl>

        <label v-if="!rowCategory" class="il-field">
          {{ t('Category') }}
          <select @change="setRowCategory(($event.target as HTMLSelectElement).value)">
            <option value="">{{ t('Choose a category') }}</option>
            <option v-for="category in rowCategoryOptions" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
        </label>

        <div v-if="selectedRow.duplicate" class="il-ins">
          <Copy />
          <div>
            {{
              t('Matches {description} on {date}, {amount}.', {
                description: selectedRow.duplicate.transaction_description || t('an entry'),
                date: selectedRow.duplicate.transaction_date || '',
                amount:
                  selectedRow.duplicate.transaction_amount == null
                    ? ''
                    : money(
                        selectedRow.duplicate.transaction_amount,
                        selectedRow.currency || 'EUR',
                        locale
                      )
              })
            }}
            <b>{{ t('Skip it unless you really paid twice.') }}</b>
          </div>
        </div>
        <div v-if="selectedRow.duplicate" class="il-actions">
          <button
            v-if="selectedRow.status !== 'rejected'"
            type="button"
            class="il-btn"
            @click="toggleSuggestion(selectedRow.index)"
          >
            {{ t('Skip') }}
          </button>
          <button
            v-if="selectedRow.status !== 'accepted'"
            type="button"
            class="il-btn il-btn--o"
            @click="toggleSuggestion(selectedRow.index)"
          >
            {{ t('Keep it') }}
          </button>
        </div>

        <NuxtLink :to="rowAskLink" class="il-btn il-btn--o"
          ><MessageCircle />{{ t('Ask the assistant about this row') }}</NuxtLink
        >
      </template>
      <template v-else>
        <h2 class="il-h"><FileText />{{ t('Imports') }}</h2>
        <p class="il-muted">
          {{
            currentSession
              ? t('Pick a row to check how it was read.')
              : t(
                  'Upload a bank statement, receipt or spreadsheet. Nothing is saved until you confirm.'
                )
          }}
        </p>
      </template>
    </template>
  </LedgerWorkspace>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Copy, FileText, MessageCircle } from 'lucide-vue-next';
import LedgerWorkspace from '@/components/ledger/LedgerWorkspace.vue';
import { money } from '@/utils/ledgerMoney';
import ImportUpload from '~/components/imports/ImportUpload.vue';
import ImportAnalyzing from '~/components/imports/ImportAnalyzing.vue';
import ImportSessionsList from '~/components/imports/ImportSessionsList.vue';
import SuggestionReviewTable from '~/components/imports/SuggestionReviewTable.vue';
import ImportConfirmDialog from '~/components/imports/ImportConfirmDialog.vue';
import type { AutoCreateOptions } from '~/types/import';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  ledgerFrame: true
});

const { t, locale } = useI18n();
const { showSuccess, showError, showWarning, confirmDelete } = useNotifications();
const { wallets, categories, parties, loadWallets, loadCategories, loadParties } = useSharedData();

const route = useRoute();
const router = useRouter();

const {
  currentSession,
  sessions,
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
  loadSessions,
  openSession,
  removeSession,
  reset
} = useImports();

const selectedIndex = ref<number | null>(null);
const selectedRow = computed(
  () => suggestions.value.find((row) => row.index === selectedIndex.value) ?? null
);
const nameOf = (list: readonly { id: number; name: string }[], id: number | null) =>
  id == null ? null : (list.find((item) => item.id === id)?.name ?? null);
const rowCategory = computed(() =>
  selectedRow.value
    ? (nameOf(categories.value, selectedRow.value.category_id) ?? selectedRow.value.category)
    : null
);
const rowWallet = computed(() =>
  selectedRow.value
    ? (nameOf(wallets.value, selectedRow.value.wallet_id) ?? selectedRow.value.wallet)
    : null
);
const rowCategoryOptions = computed(() =>
  categories.value.filter(
    (category) => !selectedRow.value?.type || category.type === selectedRow.value.type
  )
);
const setRowCategory = (value: string) => {
  if (selectedRow.value && value)
    editSuggestion(selectedRow.value.index, { category_id: Number(value) });
};
const needCategoryCount = computed(
  () =>
    suggestions.value.filter(
      (row) => row.status !== 'rejected' && row.category_id == null && !row.category
    ).length
);
const readyCount = computed(
  () =>
    suggestions.value.filter(
      (row) =>
        row.status === 'accepted' && !row.duplicate && (row.category_id != null || !!row.category)
    ).length
);
const ledgerSubtitle = computed(() =>
  currentSession.value
    ? `${currentSession.value.file_name} · ${t('{count} rows read', { count: suggestions.value.length }, suggestions.value.length)}`
    : ''
);
const rowAskLink = computed(() => ({
  path: '/assistant',
  query: {
    ask: selectedRow.value
      ? t('In my import, how should I record "{description}" for {amount}?', {
          description: selectedRow.value.description ?? '',
          amount: selectedRow.value.amount ?? ''
        })
      : ''
  }
}));
watch(suggestions, (rows) => {
  if (!rows.some((row) => row.index === selectedIndex.value))
    selectedIndex.value = rows[0]?.index ?? null;
});

const showConfirmDialog = ref(false);
const uploadedFileName = ref('');

// The review table needs wallets/parties/categories to pre-link suggestions to
// existing records by name match. Make sure the caches are warm before upload.
onMounted(() => {
  loadWallets();
  loadCategories();
  loadParties();
  loadSessions();

  // Deep-link from the chat's import-review card: open that session directly
  // (showing live progress if it's still analyzing). Drop the query param after
  // so a manual refresh lands back on the list instead of re-opening.
  const sessionId = Number(route.query.session);
  if (sessionId) {
    openSession(sessionId);
    router.replace({ query: {} });
  }
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
  loadSessions();
};

const handleDeleteSession = async (id: number) => {
  const session = sessions.value.find((s) => s.id === id);
  const confirmed = await confirmDelete(session?.file_name || t('this import'));
  if (!confirmed) return;

  try {
    await removeSession(id);
    showSuccess(t('Import deleted.'));
  } catch {
    showError(t('Could not delete the import.'));
  }
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

.readonly-table {
  width: 100%;
  border-collapse: collapse;
  font-size: $font-size-sm;

  th,
  td {
    text-align: left;
    padding: 8px 12px;
    border-bottom: 1px solid $border-light;
  }

  th {
    font-size: $font-size-xs;
    font-weight: $font-semibold;
    color: $text-muted;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  td {
    color: $text-secondary;
  }

  .num {
    text-align: right;
  }
}

.imports-ledger :deep(.review-header__info) {
  display: none;
}

.imports-ledger :deep(.table-wrapper) {
  overflow-x: auto;
}

.imports-ledger :deep(.table-wrapper table) {
  min-width: 1080px;
}

.il-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 10px 0;
}

.il-chip {
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 600;
}

.il-chip--good {
  background: var(--ledger-brand-soft);
  color: var(--ledger-brand);
}

.il-chip--bad {
  background: var(--ledger-expense-soft);
  color: var(--ledger-expense);
}

.il-chip--warn {
  background: var(--ledger-orange-soft);
  color: var(--ledger-orange-text);
}

.il-h {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--ledger-ink-3);
}

.il-h :deep(svg) {
  width: 14px;
  height: 14px;
}

.il-title {
  font-family: var(--ledger-mono);
  font-size: 13px;
  padding: 10px;
  border-radius: var(--ledger-r-sm);
  background: var(--ledger-surface-2);
  word-break: break-word;
}

.il-kv {
  display: grid;
  grid-template-columns: 96px minmax(0, 1fr);
  gap: 7px 10px;
  margin: 0;
  font-size: 13px;
}

.il-kv dt {
  color: var(--ledger-ink-3);
}

.il-kv dd {
  margin: 0;
}

.il-num {
  font-family: var(--ledger-mono);
  font-variant-numeric: tabular-nums;
}

.il-in {
  color: var(--ledger-income);
}

.il-neg {
  color: var(--ledger-expense);
}

.il-muted {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--ledger-ink-3);
}

.il-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: var(--ledger-ink-3);
}

.il-field select {
  font: inherit;
  font-size: 13.5px;
  color: var(--ledger-ink);
  background: var(--ledger-surface);
  border: 1px solid var(--ledger-line);
  border-radius: var(--ledger-r-sm);
  padding: 7px 8px;
}

.il-ins {
  display: flex;
  gap: 10px;
  padding: 10px;
  border-radius: var(--ledger-r);
  background: var(--ledger-surface-2);
  font-size: 13px;
  line-height: 1.45;
}

.il-ins :deep(svg) {
  width: 16px;
  height: 16px;
  flex: none;
  margin-top: 2px;
}

.il-actions {
  display: flex;
  gap: 6px;
}

.il-btn {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: var(--ledger-r-sm);
  border: 1px solid transparent;
  background: var(--ledger-brand);
  color: var(--ledger-on-brand);
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
}

.il-btn :deep(svg) {
  width: 14px;
  height: 14px;
}

.il-btn--o {
  background: var(--ledger-surface);
  color: var(--ledger-ink);
  border-color: var(--ledger-line);
}
</style>
