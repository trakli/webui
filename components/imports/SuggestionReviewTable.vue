<template>
  <div class="review-table">
    <div class="review-table__actions">
      <button class="action-btn action-btn--accept" @click="$emit('acceptAll')">
        {{ t('Accept all') }}
      </button>
      <button class="action-btn action-btn--reject" @click="$emit('rejectAll')">
        {{ t('Reject all') }}
      </button>
      <span class="review-table__summary">
        {{
          t('{accepted} accepted, {rejected} rejected, {pending} pending', {
            accepted: acceptedCount,
            rejected: rejectedCount,
            pending: pendingCount
          })
        }}
      </span>
    </div>

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th class="col-status"></th>
            <th>{{ t('Date') }}</th>
            <th>{{ t('Description') }}</th>
            <th>{{ t('Amount') }}</th>
            <th>{{ t('Type') }}</th>
            <th>{{ t('Party') }}</th>
            <th>{{ t('Category') }}</th>
            <th>{{ t('Wallet') }}</th>
            <th>{{ t('Confidence') }}</th>
            <th>{{ t('Duplicate') }}</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="suggestion in suggestions" :key="suggestion.index">
            <tr :class="rowClass(suggestion)">
              <td class="col-status">
                <input
                  type="checkbox"
                  :checked="suggestion.status === 'accepted'"
                  @change="$emit('toggle', suggestion.index)"
                />
              </td>
              <td>
                <input
                  type="text"
                  class="inline-edit"
                  :value="suggestion.date"
                  @change="
                    handleEdit(suggestion.index, 'date', ($event.target as HTMLInputElement).value)
                  "
                />
              </td>
              <td>
                <input
                  type="text"
                  class="inline-edit inline-edit--wide"
                  :value="suggestion.description"
                  @change="
                    handleEdit(
                      suggestion.index,
                      'description',
                      ($event.target as HTMLInputElement).value
                    )
                  "
                />
              </td>
              <td class="col-amount">
                <input
                  type="number"
                  class="inline-edit inline-edit--number"
                  step="0.01"
                  :value="suggestion.amount"
                  @change="
                    handleEdit(
                      suggestion.index,
                      'amount',
                      parseFloat(($event.target as HTMLInputElement).value)
                    )
                  "
                />
              </td>
              <td>
                <select
                  class="inline-edit"
                  :value="suggestion.type"
                  @change="
                    handleEdit(suggestion.index, 'type', ($event.target as HTMLSelectElement).value)
                  "
                >
                  <option value="expense">{{ t('Expense') }}</option>
                  <option value="income">{{ t('Income') }}</option>
                </select>
              </td>
              <td>
                <select
                  class="inline-edit"
                  :class="{ 'inline-edit--new': isNewParty(suggestion.party) }"
                  :value="suggestion.party || ''"
                  @change="
                    handleEdit(
                      suggestion.index,
                      'party',
                      ($event.target as HTMLSelectElement).value
                    )
                  "
                >
                  <option value="">--</option>
                  <option v-if="isNewParty(suggestion.party)" :value="suggestion.party!">
                    {{ suggestion.party }} ({{ t('new') }})
                  </option>
                  <option v-for="p in parties" :key="p.id" :value="p.name">{{ p.name }}</option>
                </select>
              </td>
              <td>
                <select
                  class="inline-edit"
                  :class="{ 'inline-edit--new': isNewCategory(suggestion.category) }"
                  :value="suggestion.category || ''"
                  @change="
                    handleEdit(
                      suggestion.index,
                      'category',
                      ($event.target as HTMLSelectElement).value
                    )
                  "
                >
                  <option value="">--</option>
                  <option v-if="isNewCategory(suggestion.category)" :value="suggestion.category!">
                    {{ suggestion.category }} ({{ t('new') }})
                  </option>
                  <option v-for="c in categories" :key="c.id" :value="c.name">{{ c.name }}</option>
                </select>
              </td>
              <td>
                <select
                  class="inline-edit"
                  :class="{ 'inline-edit--new': isNewWallet(suggestion.wallet) }"
                  :value="suggestion.wallet || ''"
                  @change="
                    handleEdit(
                      suggestion.index,
                      'wallet',
                      ($event.target as HTMLSelectElement).value
                    )
                  "
                >
                  <option value="">--</option>
                  <option v-if="isNewWallet(suggestion.wallet)" :value="suggestion.wallet!">
                    {{ suggestion.wallet }} ({{ t('new') }})
                  </option>
                  <option v-for="w in wallets" :key="w.id" :value="w.name">
                    {{ w.name }} ({{ w.currency }})
                  </option>
                </select>
              </td>
              <td class="col-confidence">
                <span class="confidence-badge" :class="confidenceClass(suggestion.confidence)">
                  {{ Math.round(suggestion.confidence * 100) }}%
                </span>
              </td>
              <td class="col-duplicate">
                <button
                  v-if="suggestion.duplicate"
                  class="duplicate-badge"
                  :class="`duplicate-badge--${suggestion.duplicate.match_type}`"
                  @click="toggleExpanded(suggestion.index)"
                >
                  {{ t(duplicateLabel(suggestion.duplicate.match_type)) }}
                  <ChevronDownIcon
                    class="duplicate-badge__chevron"
                    :class="{
                      'duplicate-badge__chevron--open': expandedRows.has(suggestion.index)
                    }"
                  />
                </button>
              </td>
            </tr>
            <!-- Expanded duplicate detail row -->
            <tr
              v-if="suggestion.duplicate && expandedRows.has(suggestion.index)"
              :key="`dup-${suggestion.index}`"
              class="row--duplicate-detail"
            >
              <td colspan="10">
                <div class="duplicate-detail">
                  <span class="duplicate-detail__label">{{ t('Existing transaction') }}:</span>
                  <span class="duplicate-detail__date">{{
                    suggestion.duplicate.transaction_date
                  }}</span>
                  <span class="duplicate-detail__desc">{{
                    suggestion.duplicate.transaction_description
                  }}</span>
                  <span class="duplicate-detail__amount">
                    {{ suggestion.duplicate.transaction_amount }}
                  </span>
                  <span class="duplicate-detail__type">{{
                    suggestion.duplicate.transaction_type
                  }}</span>
                  <div class="duplicate-detail__actions">
                    <button
                      class="duplicate-detail__btn"
                      @click="$emit('toggle', suggestion.index)"
                    >
                      {{
                        suggestion.status === 'accepted'
                          ? t('Skip this import')
                          : t('Import anyway')
                      }}
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SuggestionWithDuplicate } from '~/types/import';
import type { Wallet } from '~/types/wallet';
import type { Category } from '~/types/category';
import type { Party } from '~/types/party';
import { ChevronDownIcon } from '@heroicons/vue/24/outline';

const { t } = useI18n();

const props = defineProps<{
  suggestions: SuggestionWithDuplicate[];
  wallets: readonly Wallet[];
  categories: readonly Category[];
  parties: readonly Party[];
  acceptedCount: number;
  rejectedCount: number;
  pendingCount: number;
}>();

const walletNames = computed(() => new Set(props.wallets.map((w) => w.name)));
const partyNames = computed(() => new Set(props.parties.map((p) => p.name)));
const categoryNames = computed(() => new Set(props.categories.map((c) => c.name)));

const isNewWallet = (name: string | null) => !!name && !walletNames.value.has(name);
const isNewParty = (name: string | null) => !!name && !partyNames.value.has(name);
const isNewCategory = (name: string | null) => !!name && !categoryNames.value.has(name);

const emit = defineEmits<{
  toggle: [index: number];
  edit: [index: number, edits: Partial<SuggestionWithDuplicate>];
  acceptAll: [];
  rejectAll: [];
}>();

const expandedRows = ref(new Set<number>());

const toggleExpanded = (index: number) => {
  if (expandedRows.value.has(index)) {
    expandedRows.value.delete(index);
  } else {
    expandedRows.value.add(index);
  }
};

const handleEdit = (index: number, field: string, value: any) => {
  emit('edit', index, { [field]: value });
};

const isRowInvalid = (s: SuggestionWithDuplicate) => !s.wallet || isNewWallet(s.wallet);

const rowClass = (s: SuggestionWithDuplicate) => ({
  'row--accepted': s.status === 'accepted' && !isRowInvalid(s),
  'row--rejected': s.status === 'rejected',
  'row--invalid': s.status === 'accepted' && isRowInvalid(s)
});

const confidenceClass = (confidence: number) => ({
  'confidence-badge--high': confidence >= 0.8,
  'confidence-badge--medium': confidence >= 0.5 && confidence < 0.8,
  'confidence-badge--low': confidence < 0.5
});

const duplicateLabel = (type: string) => {
  switch (type) {
    case 'exact':
      return 'Exact match';
    case 'near':
      return 'Near match';
    case 'similar':
      return 'Similar';
    default:
      return type;
  }
};
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.review-table {
  &__actions {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }

  &__summary {
    font-size: $font-size-sm;
    color: $text-muted;
    margin-left: auto;
  }
}

.action-btn {
  padding: 6px 16px;
  border-radius: $radius-lg;
  font-size: $font-size-sm;
  border: 1px solid $border-color;
  cursor: pointer;
  transition: all 0.2s;
  background-color: $bg-white;

  &--accept:hover {
    background-color: rgba(var(--color-success-rgb), 0.1);
    border-color: $success;
    color: $success;
  }

  &--reject:hover {
    background-color: rgba(var(--color-error-rgb), 0.1);
    border-color: $error-color;
    color: $error-color;
  }
}

.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: $font-size-sm;
}

thead {
  background-color: $bg-gray;

  th {
    padding: $table-header-padding;
    text-align: left;
    font-weight: 600;
    color: $text-secondary;
    white-space: nowrap;
    border-bottom: 2px solid $border-color;
  }
}

tbody tr {
  border-bottom: 1px solid $border-light;
  transition: background-color 0.15s;

  &:hover {
    background-color: $bg-slate;
  }
}

td {
  padding: $table-cell-padding;
  vertical-align: middle;
}

.col-status {
  width: 36px;
  text-align: center;
}

.col-amount {
  white-space: nowrap;
}

.col-confidence,
.col-duplicate {
  white-space: nowrap;
}

.row--accepted {
  background-color: rgba(var(--color-success-rgb), 0.04);
}

.row--rejected {
  background-color: rgba(var(--color-error-rgb), 0.04);
  opacity: 0.6;
}

.row--invalid {
  background-color: rgba(var(--color-error-rgb), 0.08);
  border-left: 3px solid $error-color;
}

.inline-edit {
  width: 100%;
  min-width: 80px;
  padding: 4px 6px;
  border: 1px solid transparent;
  border-radius: $radius-sm;
  font-size: $font-size-sm;
  background: transparent;
  color: $text-primary;

  &:hover,
  &:focus {
    border-color: $border-color;
    background-color: $bg-white;
    outline: none;
  }

  &--wide {
    min-width: 160px;
  }

  &--number {
    min-width: 90px;
    text-align: right;
  }

  &--new {
    border-color: $warning-text;
    background-color: rgba(var(--color-warning-rgb), 0.06);
  }
}

select.inline-edit {
  min-width: 90px;
  cursor: pointer;
}

.confidence-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: $radius-sm;
  font-size: $font-size-xs;
  font-weight: 500;

  &--high {
    background-color: rgba(var(--color-success-rgb), 0.15);
    color: $success;
  }

  &--medium {
    background-color: rgba(var(--color-warning-rgb), 0.15);
    color: $warning-text;
  }

  &--low {
    background-color: rgba(var(--color-error-rgb), 0.15);
    color: $error-color;
  }
}

.duplicate-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: $radius-sm;
  font-size: $font-size-xs;
  font-weight: 500;
  border: none;
  cursor: pointer;
  background: none;

  &--exact {
    background-color: rgba(var(--color-error-rgb), 0.15);
    color: $error-color;
  }

  &--near {
    background-color: rgba(var(--color-warning-rgb), 0.15);
    color: $warning-text;
  }

  &--similar {
    background-color: rgba(var(--color-info-rgb), 0.15);
    color: $info;
  }

  &__chevron {
    width: 12px;
    height: 12px;
    transition: transform 0.2s;

    &--open {
      transform: rotate(180deg);
    }
  }
}

.row--duplicate-detail {
  background-color: $bg-slate;

  td {
    padding: 0;
  }
}

.duplicate-detail {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px 8px 44px;
  font-size: $font-size-xs;
  color: $text-secondary;
  flex-wrap: wrap;

  &__label {
    font-weight: 600;
    color: $text-muted;
  }

  &__date {
    color: $text-secondary;
  }

  &__desc {
    flex: 1;
    min-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__amount {
    font-weight: 500;
  }

  &__type {
    text-transform: capitalize;
    color: $text-muted;
  }

  &__actions {
    margin-left: auto;
  }

  &__btn {
    padding: 3px 10px;
    border-radius: $radius-sm;
    font-size: $font-size-xs;
    border: 1px solid $border-color;
    background: $bg-white;
    cursor: pointer;
    color: $text-secondary;

    &:hover {
      background-color: $bg-gray;
    }
  }
}
</style>
