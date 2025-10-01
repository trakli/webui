<template>
  <div class="transaction-form">
    <div class="form">
      <div class="form-transaction">
        <!-- Date Input Field -->
        <div class="transaction-date">
          <span>Transaction Date</span>
          <input type="date" v-model="formDate" required />
          <div v-if="dateError" class="error-text">Date is required.</div>
        </div>

        <!-- Time Input Field -->
        <div class="transaction-date">
          <span>Transaction Time</span>
          <input type="time" v-model="formTime" required />
          <div v-if="timeError" class="error-text">Time is required.</div>
        </div>
      </div>

      <!-- Amount Input Field -->
      <div class="transaction-date">
        <span>Amount</span>
        <div class="transaction-amount">
          <input
            type="number"
            placeholder="Ex: 250 000"
            v-model="formAmount"
            min="1"
            step="any"
            required
          />
          <button class="amount-currency-button">XAF</button>
        </div>
        <div v-if="amountError" class="error-text">Enter a valid amount greater than 0.</div>
      </div>

      <!-- Party Dropdown -->
      <div class="transaction-party">
        <span>Party</span>
        <div class="party-search">
          <MagnifyingGlassIcon class="search-icon" />
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search party..."
            @focus="showDropdown = true"
            @blur="hideDropdownWithDelay"
            @input="filterParties"
          />
          <ChevronDownIcon class="dropdown-icon" />
        </div>
        <ul v-if="showDropdown && filteredParties.length" class="party-dropdown">
          <li v-for="party in filteredParties" :key="party" @mousedown.prevent="selectParty(party)">
            <span>
              <template v-for="(part, index) in getHighlightedParts(party)" :key="index">
                <span :class="part.isMatch ? 'text-highlight' : 'text-secondary'">
                  {{ part.text }}
                </span>
              </template>
            </span>
          </li>
        </ul>
      </div>

      <!-- Wallet Selection -->
      <div class="transaction-wallet">
        <span>Wallet</span>
        <div class="wallet-search">
          <MagnifyingGlassIcon class="search-icon" />
          <input
            type="text"
            v-model="walletSearchQuery"
            placeholder="Search wallet..."
            @focus="showWalletDropdown = true"
            @blur="hideWalletDropdownWithDelay"
            @input="filterWallets"
          />
          <ChevronDownIcon class="dropdown-icon" />
        </div>
        <ul v-if="showWalletDropdown && filteredWallets.length" class="wallet-dropdown">
          <li
            v-for="wallet in filteredWallets"
            :key="wallet"
            @mousedown.prevent="selectWallet(wallet)"
          >
            <span>
              <template v-for="(part, index) in getHighlightedWalletParts(wallet)" :key="index">
                <span :class="part.isMatch ? 'text-highlight' : 'text-secondary'">
                  {{ part.text }}
                </span>
              </template>
            </span>
          </li>
        </ul>
        <div v-if="walletError" class="error-text">Wallet is required.</div>
      </div>

      <!-- Group Selection (primary category) -->
      <div class="transaction-category">
        <span>Group</span>
        <div class="category-search">
          <MagnifyingGlassIcon class="search-icon" />
          <input
            type="text"
            v-model="groupSearchQuery"
            placeholder="Search group..."
            @focus="showGroupDropdown = true"
            @blur="hideGroupDropdownWithDelay"
            @input="filterGroups"
          />
          <ChevronDownIcon class="dropdown-icon" />
        </div>
        <ul v-if="showGroupDropdown && filteredGroups.length" class="category-dropdown">
          <li v-for="group in filteredGroups" :key="group" @mousedown.prevent="selectGroup(group)">
            <span>
              <template v-for="(part, index) in getHighlightedGroupParts(group)" :key="index">
                <span :class="part.isMatch ? 'text-highlight' : 'text-secondary'">
                  {{ part.text }}
                </span>
              </template>
            </span>
          </li>
        </ul>
        <div v-if="categoryError" class="error-text">Group is required.</div>
      </div>

      <!-- Additional Categories (optional) - Multi-select dropdown -->
      <div class="transaction-category">
        <span>Categories (optional)</span>
        <div class="category-search">
          <MagnifyingGlassIcon class="search-icon" />
          <input
            type="text"
            v-model="categorySearchQuery"
            placeholder="Search categories..."
            @focus="showCategoryDropdown = true"
            @blur="hideCategoryDropdownWithDelay"
            @input="filterCategories"
          />
          <ChevronDownIcon class="dropdown-icon" />
        </div>
        <ul v-if="showCategoryDropdown && filteredCategories.length" class="category-dropdown">
          <li
            v-for="category in filteredCategories"
            :key="category"
            @mousedown.prevent="toggleAdditionalCategory(category)"
            :class="{
              'selected-option': isAdditionalCategorySelected(category),
              disabled: isSameAsGroup(category)
            }"
          >
            <span>
              <template v-for="(part, index) in getHighlightedCategoryParts(category)" :key="index">
                <span :class="part.isMatch ? 'text-highlight' : 'text-secondary'">
                  {{ part.text }}
                </span>
              </template>
            </span>
          </li>
        </ul>
        <div v-if="selectedAdditionalCategoryIds.length" class="selected-categories">
          <span v-for="cat in selectedAdditionalCategoryNames" :key="cat" class="chip">{{
            cat
          }}</span>
        </div>
      </div>

      <!-- Attachments -->
      <div class="transaction-files">
        <span>Attachments</span>
        <div class="upload-box">
          <input id="file-input" type="file" multiple @change="onFilesSelected" />
          <label for="file-input" class="upload-button">Browse files</label>
          <span class="hint">Images, PDFs or docs. Max 5 files.</span>
        </div>
        <div v-if="selectedFileNames.length" class="file-list">
          <span v-for="(f, i) in selectedFileNames" :key="f.name + i" class="chip">
            {{ f.name }}
            <button type="button" class="remove" @click="removeFile(i)">×</button>
          </span>
        </div>
      </div>

      <!-- Description Field -->
      <div class="transaction-description">
        <span>Description</span>
        <textarea v-model="formDescription" placeholder="Type here ..." required />
        <div v-if="descriptionError" class="error-text">Description is required.</div>
      </div>
    </div>
    <TButton
      :text="
        props.editingItem
          ? isOutcomeSelected
            ? 'Update Expense'
            : 'Update Income'
          : isOutcomeSelected
            ? 'Add Expense +'
            : 'Add Income +'
      "
      class="submit-button"
      :class="{ 'submit-button--expense': isOutcomeSelected }"
      @click="onSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { defineProps, toRefs, ref, computed, defineEmits, watch, onMounted } from 'vue';
import TButton from './TButton.vue';
import { MagnifyingGlassIcon, ChevronDownIcon } from '@heroicons/vue/24/outline';
import { useTransactions } from '~/composables/useTransactions';
import { useGroups } from '~/composables/useGroups';

const emit = defineEmits(['submit', 'error']);

// Props to receive the selected transaction type from parent
const props = defineProps({
  isOutcomeSelected: {
    type: Boolean,
    default: false
  },
  editingItem: {
    type: Object,
    default: null
  }
});

// Destructure props for easier access
const { isOutcomeSelected } = toRefs(props);

// Minimal local state used for submit payload (defaults to now, still editable)
const now = new Date();
const formDate = ref(now.toISOString().slice(0, 10));
const formTime = ref(now.toTimeString().slice(0, 5));
const formAmount = ref('');
const formParty = ref('');
const formCategory = ref('');
const formDescription = ref('');

// Store IDs for API submission
const selectedPartyId = ref('');
const selectedCategoryIds = ref([]);
const selectedWalletId = ref(''); // For future wallet dropdown
// Group and additional categories
const selectedGroupId = ref(null);
const selectedAdditionalCategoryIds = ref([]);
// Files to upload as base64 strings
const filesBase64 = ref([]);

// Validation state
const dateError = ref(false);
const timeError = ref(false);
const amountError = ref(false);
const partyError = ref(false);
const categoryError = ref(false);
const walletError = ref(false);
const descriptionError = ref(false);
const apiError = ref(null);

function validateRequiredFields() {
  let valid = true;
  dateError.value = !formDate.value;
  timeError.value = !formTime.value;

  const amountNum = Number(formAmount.value);
  amountError.value = !Number.isFinite(amountNum) || amountNum <= 0;

  // Accept either selected party or typed text
  const partyValue = (formParty.value || searchQuery.value || '').trim();
  partyError.value = partyValue.length === 0;
  if (!partyError.value) formParty.value = partyValue;

  // Group (primary category) is required
  categoryError.value = !selectedGroupId.value;

  // Wallet validation
  walletError.value = !selectedWalletId.value;

  descriptionError.value = !formDescription.value || formDescription.value.trim().length === 0;

  if (
    dateError.value ||
    timeError.value ||
    amountError.value ||
    partyError.value ||
    categoryError.value ||
    walletError.value ||
    descriptionError.value
  ) {
    valid = false;
  }
  return valid;
}

function onSubmit() {
  console.log('[TransactionForm] onSubmit called');
  const isValid = validateRequiredFields();
  console.log('[TransactionForm] Validation result:', isValid);
  if (!isValid) {
    console.warn('[TransactionForm] Validation failed. Errors:', {
      date: dateError.value,
      time: timeError.value,
      amount: amountError.value,
      party: partyError.value,
      category: categoryError.value,
      wallet: walletError.value,
      description: descriptionError.value
    });
    return;
  }

  const now = new Date();
  const date = formDate.value || now.toISOString().slice(0, 10);
  const time = formTime.value || now.toTimeString().slice(0, 5);

  const amountNum = Number(formAmount.value);

  const payload = {
    id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
    date, // ISO (YYYY-MM-DD) for consistent sorting
    time, // HH:mm
    type: isOutcomeSelected.value ? 'EXPENSE' : 'INCOME',
    party: formParty.value,
    partyId: selectedPartyId.value, // UUID for API
    amount: `${amountNum} XAF`,
    category: formCategory.value,
    // Send only additional categories here; group is separate
    categoryIds: selectedAdditionalCategoryIds.value,
    // Explicit group id for API
    groupId: selectedGroupId.value ?? undefined,
    walletId: selectedWalletId.value, // UUID for API
    description: formDescription.value.trim(),
    // Files (base64 strings) to be uploaded via API
    filesToUpload: filesBase64.value
  };

  console.log('[TransactionForm] Form payload:', payload);
  console.log('[TransactionForm] Debug - selectedWalletId:', selectedWalletId.value);
  console.log('[TransactionForm] Debug - walletSearchQuery:', walletSearchQuery.value);
  console.log('[TransactionForm] Debug - apiWallets count:', apiWallets.value.length);

  emit('submit', payload);
}

// Computed properties for dynamic colors
const focusColor = computed(() => (isOutcomeSelected.value ? '#EB5757' : '#4caf50'));
const primaryColor = computed(() => (isOutcomeSelected.value ? '#EB5757' : '#047844'));
const lightBgColor = computed(() => (isOutcomeSelected.value ? '#fce8e8' : '#e9f5ec'));

// Get real parties, categories, and wallets from composable
const { parties: apiParties, categories: apiCategories, wallets: apiWallets } = useTransactions();
// Get groups from API
const { groups: apiGroups, fetchGroups } = useGroups();

// Diagnostic check on mount
onMounted(() => {
  console.log('[TransactionForm] Component mounted');
  console.log('[TransactionForm] apiWallets.value.length:', apiWallets.value.length);
  console.log('[TransactionForm] apiParties.value.length:', apiParties.value.length);
  console.log('[TransactionForm] apiCategories.value.length:', apiCategories.value.length);
  console.log('[TransactionForm] selectedWalletId.value:', selectedWalletId.value);
  console.log('[TransactionForm] walletSearchQuery.value:', walletSearchQuery.value);

  if (apiWallets.value.length > 0) {
    console.log(
      '[TransactionForm] First wallet structure:',
      JSON.stringify(apiWallets.value[0], null, 2)
    );
  } else {
    console.error('[TransactionForm] NO WALLETS LOADED! Form cannot auto-select wallet.');
  }
  // Load groups
  fetchGroups().catch((e) => console.error('[TransactionForm] Failed to load groups', e));
});

// Party dropdown functionality
const searchQuery = ref('');
const showDropdown = ref(false);

// Group dropdown functionality
const groupSearchQuery = ref('');
const showGroupDropdown = ref(false);
const allGroups = computed(() => apiGroups.value.map((g) => g.name));
const filteredGroups = ref([]);

function filterGroups() {
  const query = groupSearchQuery.value.toLowerCase();
  filteredGroups.value = allGroups.value.filter((g) => g.toLowerCase().includes(query));
}

// Initialize filtered groups and auto-select first
watch(
  allGroups,
  (groups) => {
    if (groups.length > 0) {
      filteredGroups.value = [...groups];
      if (!selectedGroupId.value) {
        const first = apiGroups.value[0];
        selectedGroupId.value = first.id;
        groupSearchQuery.value = first.name;
        console.log('[Group Watcher] Auto-selected group:', first.name, 'ID:', first.id);
      }
    }
  },
  { immediate: true }
);

function selectGroup(groupName) {
  groupSearchQuery.value = groupName;
  showGroupDropdown.value = false;
  const groupObj = apiGroups.value.find((g) => g.name === groupName);
  if (groupObj) {
    selectedGroupId.value = groupObj.id;
    // ensure group is not selected among additional categories
    selectedAdditionalCategoryIds.value = selectedAdditionalCategoryIds.value.filter(
      (id) => id !== groupObj.id
    );
    categoryError.value = false;
    // reflect in form display string
    selectedCategory.value = groupName;
    formCategory.value = groupName;
    console.log('[selectGroup] Selected:', groupName, 'ID:', groupObj.id);
  }
}

function hideGroupDropdownWithDelay() {
  setTimeout(() => {
    showGroupDropdown.value = false;
  }, 200);
}

function getHighlightedGroupParts(name) {
  const query = groupSearchQuery.value.trim();
  if (!query) return [{ text: name, isMatch: false }];
  const regex = new RegExp(query, 'gi');
  const matches = [...name.matchAll(regex)];
  if (matches.length === 0) return [{ text: name, isMatch: false }];
  const result = [];
  let lastIndex = 0;
  for (const match of matches) {
    const start = match.index ?? 0;
    const end = start + match[0].length;
    if (start > lastIndex) result.push({ text: name.slice(lastIndex, start), isMatch: false });
    result.push({ text: name.slice(start, end), isMatch: true });
    lastIndex = end;
  }
  if (lastIndex < name.length) result.push({ text: name.slice(lastIndex), isMatch: false });
  return result;
}

// Additional Categories dropdown functionality
const categorySearchQuery = ref('');
const showCategoryDropdown = ref(false);

// Wallet dropdown functionality
const walletSearchQuery = ref('');
const showWalletDropdown = ref(false);

// Use real parties from API, or fallback to empty if not loaded yet
const allParties = computed(() => apiParties.value.map((p) => p.name));
const filteredParties = ref([]);

function filterParties() {
  const query = searchQuery.value.toLowerCase();
  filteredParties.value = allParties.value.filter((p) => p.toLowerCase().includes(query));
}

// Initialize filtered parties when allParties loads
watch(
  allParties,
  (parties) => {
    console.log('[Party Watcher] Triggered, parties.length:', parties.length);
    if (parties.length > 0) {
      filteredParties.value = [...parties];
      // Auto-select first party if none selected
      if (!selectedPartyId.value) {
        console.log('[Party Watcher] Auto-selecting first party...');
        const firstParty = apiParties.value[0];
        console.log('[Party Watcher] First party object:', firstParty);

        // Try to get UUID from sync_state, fall back to using party ID as string
        const partyUUID = firstParty?.sync_state?.client_generated_id || String(firstParty?.id);

        if (partyUUID) {
          selectedPartyId.value = partyUUID;
          searchQuery.value = firstParty.name;
          formParty.value = firstParty.name;
          console.log(
            '[Party Watcher] Auto-selected party:',
            firstParty.name,
            'ID/UUID:',
            partyUUID
          );
        } else {
          console.error('[Party Watcher] First party has no usable ID:', firstParty);
        }
      } else {
        console.log('[Party Watcher] Party already selected:', selectedPartyId.value);
      }
    } else {
      console.log('[Party Watcher] No parties available to auto-select');
    }
  },
  { immediate: true }
);

function selectParty(partyName) {
  searchQuery.value = partyName;
  formParty.value = partyName;
  showDropdown.value = false;

  // Store party ID for API
  const partyObj = apiParties.value.find((p) => p.name === partyName);
  if (partyObj) {
    // Try to get UUID from sync_state, fall back to numeric ID as string
    const partyId = partyObj.sync_state?.client_generated_id || String(partyObj.id);
    selectedPartyId.value = partyId;
    partyError.value = false;
    console.log('[selectParty] Selected:', partyName, 'ID:', partyId);
  } else {
    console.error('[selectParty] Party not found:', partyName);
  }
}

function hideDropdownWithDelay() {
  setTimeout(() => {
    showDropdown.value = false;
  }, 200);
}

function hideCategoryDropdownWithDelay() {
  setTimeout(() => {
    showCategoryDropdown.value = false;
  }, 200);
}

function hideWalletDropdownWithDelay() {
  setTimeout(() => {
    showWalletDropdown.value = false;
  }, 200);
}

function getHighlightedParts(name) {
  const query = searchQuery.value.trim();
  if (!query) return [{ text: name, isMatch: false }];

  const regex = new RegExp(query, 'gi');
  const matches = [...name.matchAll(regex)];

  if (matches.length === 0) return [{ text: name, isMatch: false }];

  const result = [];
  let lastIndex = 0;

  for (const match of matches) {
    const start = match.index;
    const end = start + match[0].length;

    if (start > lastIndex) {
      result.push({ text: name.slice(lastIndex, start), isMatch: false });
    }

    result.push({ text: name.slice(start, end), isMatch: true });
    lastIndex = end;
  }

  if (lastIndex < name.length) {
    result.push({ text: name.slice(lastIndex), isMatch: false });
  }

  return result;
}

function getHighlightedCategoryParts(name) {
  const query = categorySearchQuery.value.trim();
  if (!query) return [{ text: name, isMatch: false }];

  const regex = new RegExp(query, 'gi');
  const matches = [...name.matchAll(regex)];

  if (matches.length === 0) return [{ text: name, isMatch: false }];

  const result = [];
  let lastIndex = 0;

  for (const match of matches) {
    const start = match.index ?? 0;
    const end = start + match[0].length;

    if (start > lastIndex) {
      result.push({ text: name.slice(lastIndex, start), isMatch: false });
    }

    result.push({ text: name.slice(start, end), isMatch: true });
    lastIndex = end;
  }

  if (lastIndex < name.length) {
    result.push({ text: name.slice(lastIndex), isMatch: false });
  }

  return result;
}

function getHighlightedWalletParts(name) {
  const query = walletSearchQuery.value.trim();
  if (!query) return [{ text: name, isMatch: false }];

  const regex = new RegExp(query, 'gi');
  const matches = [...name.matchAll(regex)];

  if (matches.length === 0) return [{ text: name, isMatch: false }];

  const result = [];
  let lastIndex = 0;

  for (const match of matches) {
    const start = match.index ?? 0;
    const end = start + match[0].length;

    if (start > lastIndex) {
      result.push({ text: name.slice(lastIndex, start), isMatch: false });
    }

    result.push({ text: name.slice(start, end), isMatch: true });
    lastIndex = end;
  }

  if (lastIndex < name.length) {
    result.push({ text: name.slice(lastIndex), isMatch: false });
  }

  return result;
}

// Category selection - use real categories from API
const allCategories = computed(() => {
  // Filter categories based on transaction type
  const type = isOutcomeSelected.value ? 'expense' : 'income';
  return apiCategories.value.filter((cat) => cat.type === type).map((cat) => cat.name);
});

// Full category objects for current type
const allCategoryObjects = computed(() => {
  const type = isOutcomeSelected.value ? 'expense' : 'income';
  return apiCategories.value.filter((cat) => cat.type === type);
});

// Additional category options (full objects)
const additionalCategoryOptions = computed(() => allCategoryObjects.value);

const filteredCategories = ref([]);

function filterCategories() {
  const query = categorySearchQuery.value.toLowerCase();
  filteredCategories.value = allCategories.value.filter((c) => c.toLowerCase().includes(query));
}

// Initialize filtered categories when allCategories loads
watch(
  allCategories,
  (cats) => {
    if (cats.length > 0) {
      filteredCategories.value = [...cats];
    }
  },
  { immediate: true }
);

// Set default category to first available
const selectedCategory = ref('');
watch(
  allCategories,
  (cats) => {
    if (cats.length > 0 && !selectedCategory.value) {
      selectedCategory.value = cats[0];
    }
  },
  { immediate: true }
);

function toggleAdditionalCategory(categoryName) {
  const categoryObj = apiCategories.value.find((c) => c.name === categoryName);
  if (!categoryObj) return;
  // Prevent selecting the same as group
  if (selectedGroupId.value && categoryObj.id === selectedGroupId.value) return;
  const idx = selectedAdditionalCategoryIds.value.indexOf(categoryObj.id);
  if (idx === -1)
    selectedAdditionalCategoryIds.value = [...selectedAdditionalCategoryIds.value, categoryObj.id];
  else
    selectedAdditionalCategoryIds.value = selectedAdditionalCategoryIds.value.filter(
      (id) => id !== categoryObj.id
    );
}

// Keep additional categories list clean when group changes
watch(selectedGroupId, (gid) => {
  if (gid) {
    selectedAdditionalCategoryIds.value = selectedAdditionalCategoryIds.value.filter(
      (id) => id !== gid
    );
  }
});

// Helper: is a given category name currently selected as additional?
function isAdditionalCategorySelected(categoryName) {
  const categoryObj = apiCategories.value.find((c) => c.name === categoryName);
  if (!categoryObj) return false;
  return selectedAdditionalCategoryIds.value.includes(categoryObj.id);
}

// Helper: category is the same as the selected group
function isSameAsGroup(categoryName) {
  const categoryObj = apiCategories.value.find((c) => c.name === categoryName);
  if (!categoryObj || !selectedGroupId.value) return false;
  return categoryObj.id === selectedGroupId.value;
}

// Computed: names of selected additional categories
const selectedAdditionalCategoryNames = computed(() => {
  return selectedAdditionalCategoryIds.value
    .map((id) => apiCategories.value.find((c) => c.id === id)?.name)
    .filter((n) => !!n);
});

// Selected file names for display
const selectedFileNames = ref([]);

// Handle file input selection -> base64 strings
function onFilesSelected(event) {
  const input = event.target;
  const files = input.files;
  if (!files) return;
  filesBase64.value = [];
  selectedFileNames.value = [];
  const tasks = [];
  for (const file of Array.from(files)) {
    tasks.push(
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result;
          const base64 = result.includes(',') ? result.split(',')[1] : result;
          filesBase64.value.push(base64);
          selectedFileNames.value.push({ name: file.name, size: file.size });
          resolve();
        };
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
      })
    );
  }
  Promise.all(tasks)
    .then(() =>
      console.log('[TransactionForm] Prepared', filesBase64.value.length, 'file(s) for upload')
    )
    .catch((err) => console.error('[TransactionForm] Failed to read files', err));
}

function removeFile(index) {
  filesBase64.value.splice(index, 1);
  selectedFileNames.value.splice(index, 1);
}

// Wallet selection - use real wallets from API
const allWallets = computed(() => apiWallets.value.map((w) => w.name));
const filteredWallets = ref([]);

function filterWallets() {
  const query = walletSearchQuery.value.toLowerCase();
  filteredWallets.value = allWallets.value.filter((w) => w.toLowerCase().includes(query));
}

// Initialize filtered wallets when allWallets loads
watch(
  allWallets,
  (wallets) => {
    console.log('[Wallet Watcher] Triggered, wallets.length:', wallets.length);
    if (wallets.length > 0) {
      filteredWallets.value = [...wallets];
      // Auto-select first wallet if none selected
      if (!selectedWalletId.value) {
        console.log('[Wallet Watcher] Auto-selecting first wallet...');
        const firstWallet = apiWallets.value[0];
        console.log('[Wallet Watcher] First wallet object:', firstWallet);

        // Try to get UUID from sync_state, fall back to using wallet ID as string
        const walletUUID = firstWallet?.sync_state?.client_generated_id || String(firstWallet?.id);

        if (walletUUID) {
          selectedWalletId.value = walletUUID;
          walletSearchQuery.value = firstWallet.name;
          console.log(
            '[Wallet Watcher] Auto-selected wallet:',
            firstWallet.name,
            'ID/UUID:',
            walletUUID
          );
        } else {
          console.error('[Wallet Watcher] First wallet has no usable ID:', firstWallet);
        }
      } else {
        console.log('[Wallet Watcher] Wallet already selected:', selectedWalletId.value);
      }
    } else {
      console.log('[Wallet Watcher] No wallets available to auto-select');
    }
  },
  { immediate: true }
);

function selectWallet(walletName) {
  walletSearchQuery.value = walletName;
  showWalletDropdown.value = false;

  // Store wallet ID for API
  const walletObj = apiWallets.value.find((w) => w.name === walletName);
  if (walletObj) {
    // Try to get UUID from sync_state, fall back to numeric ID as string
    const walletId = walletObj.sync_state?.client_generated_id || String(walletObj.id);
    selectedWalletId.value = walletId;
    walletError.value = false;
    console.log('[selectWallet] Selected:', walletName, 'ID:', walletId);
  } else {
    console.error('[selectWallet] Wallet not found:', walletName);
  }
}

// Prefill fields when editing (moved here after all refs are declared)
watch(
  () => props.editingItem,
  (item) => {
    if (!item) return;
    console.log('Editing transaction:', item); // Debug log

    // reset errors
    dateError.value =
      timeError.value =
      amountError.value =
      partyError.value =
      categoryError.value =
      descriptionError.value =
        false;

    if (item.date) formDate.value = item.date;

    // Set time to current time instead of keeping old time
    const currentTime = new Date();
    formTime.value = currentTime.toTimeString().slice(0, 5);

    if (item.party) {
      formParty.value = item.party;
      searchQuery.value = item.party;
      // Restore party ID if available
      if (item.partyId) {
        selectedPartyId.value = item.partyId;
      }
    }
    if (item.category) {
      formCategory.value = item.category;
      selectedCategory.value = item.category;
      // Restore category IDs if available
      if (item.categoryIds) {
        selectedCategoryIds.value = item.categoryIds;
      }
    }
    if (item.walletId) {
      selectedWalletId.value = item.walletId;
    }
    if (item.description) formDescription.value = item.description;

    if (item.amount) {
      const num = parseFloat(String(item.amount).replace(/[^\d.]/g, ''));
      formAmount.value = Number.isFinite(num) ? String(num) : '';
    }
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;
@use '@/assets/scss/_transaction-form.scss' as *;

.transaction-form {
  --focus-color: v-bind(focusColor);
  --primary-color: v-bind(primaryColor);
  --light-bg-color: v-bind(lightBgColor);
}
</style>
