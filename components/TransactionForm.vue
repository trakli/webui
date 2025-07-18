<template>
  <div class="transaction-form">
    <div class="form">
      <div class="form-transaction">
        <!-- Date Input Field -->
        <div class="transaction-date">
          <span>Transaction Date</span>
          <input type="date" />
        </div>

        <!-- Time Input Field -->
        <div class="transaction-date">
          <span>Transaction Time</span>
          <input type="time" />
        </div>
      </div>

      <!-- Amount Input Field -->
      <div class="transaction-date">
        <span>Amount</span>
        <div class="transaction-amount">
          <input type="number" placeholder="Ex: 250 000" />
          <button class="amount-currency-button">XAF</button>
        </div>
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

      <!-- Category Selection -->
      <div class="transaction-category">
        <span>Category</span>
        <div class="category-options">
          <div
            v-for="category in categories"
            :key="category"
            class="category-option"
            :class="{ selected: selectedCategory === category }"
            @click="selectedCategory = category"
          >
            <span class="category-label">{{ category }}</span>
            <span class="radio-indicator" />
          </div>
        </div>

        <!-- Description -->
        <div class="transaction-description">
          <span>Description</span>
          <textarea placeholder="Type here ..." />
        </div>

        <!-- Attachment -->
        <div class="transaction-attachment">
          <span>Attachment</span>
          <div class="upload-box">
            <ArrowUpOnSquareIcon class="upload-icon" />
            <p class="upload-text">Upload Here</p>
            <p class="upload-subtext">File type : jpg, jpeg, png, pdf<br />Max size: 5Mo</p>
          </div>
        </div>
      </div>
    </div>
    <TButton
      :text="isOutcomeSelected ? 'Add Outcome +' : 'Add Income +'"
      class="submit-button"
      :class="{ 'submit-button--outcome': isOutcomeSelected }"
    />
  </div>
</template>

<script setup>
import { defineProps, toRefs, ref, computed } from 'vue';
import TButton from './TButton.vue';
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ArrowUpOnSquareIcon
} from '@heroicons/vue/24/outline';

// Props to receive the selected transaction type from parent
const props = defineProps({
  isOutcomeSelected: {
    type: Boolean,
    default: false
  }
});

// Destructure props for easier access
const { isOutcomeSelected } = toRefs(props);

// Computed properties for dynamic colors
const focusColor = computed(() => (isOutcomeSelected.value ? '#EB5757' : '#4caf50'));
const primaryColor = computed(() => (isOutcomeSelected.value ? '#EB5757' : '#047844'));
const lightBgColor = computed(() => (isOutcomeSelected.value ? '#fce8e8' : '#e9f5ec'));

// Party dropdown functionality
const searchQuery = ref('');
const showDropdown = ref(false);
const allParties = ['Isaac Fomo', 'Erica Isabela', 'Isa Dora Decca'];
const filteredParties = ref([...allParties]);

function filterParties() {
  const query = searchQuery.value.toLowerCase();
  filteredParties.value = allParties.filter((p) => p.toLowerCase().includes(query));
}

function selectParty(party) {
  searchQuery.value = party;
  showDropdown.value = false;
}

function hideDropdownWithDelay() {
  setTimeout(() => {
    showDropdown.value = false;
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

// Category selection
const categories = ['Food', 'Girls 🤣', 'Rent', 'School', 'Tuition', 'Other'];
const selectedCategory = ref('Food');
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.transaction-form {
  --focus-color: v-bind(focusColor);
  --primary-color: v-bind(primaryColor);
  --light-bg-color: v-bind(lightBgColor);

  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 40px;
}

// Global input focus styles
input:focus,
textarea:focus {
  outline: none;
  border-color: var(--focus-color) !important;
}

.form {
  display: flex;
  flex-direction: column;
  width: 576px;
  gap: 20px;
}

.form-transaction {
  display: flex;
  flex-direction: row;
  gap: 16px;
}

.transaction-date {
  display: flex;
  flex-direction: column;
  gap: 8px;

  span {
    font-weight: $font-medium;
  }

  input {
    padding: 12px;
    border: 1px solid #fff;
    border-radius: 8px;
    font-size: 16px;
    width: 280px;
    height: 50px;

    &:focus {
      border-color: var(--focus-color);
      outline: none;
    }
  }

  input::placeholder {
    color: #79828e;
  }
}

.transaction-amount {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;

  input {
    width: 510px;
    height: 50px;
    border-radius: $radius-lg;
    padding: 12px;
    border: 1px solid #fff;

    &:focus {
      border-color: var(--focus-color);
      outline: none;
    }
  }

  .amount-currency-button {
    width: 58px;
    height: 50px;
    background-color: #fafafa;
    border-radius: $radius-lg;
    font-weight: $font-normal;
    font-size: $font-size-sm;
    line-height: 100%;
    border: 1px solid #e0e0e0;
    cursor: pointer;
  }
}

.transaction-party {
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;

  span {
    font-weight: $font-medium;
  }

  .party-search {
    display: flex;
    align-items: center;
    position: relative;

    input {
      width: 100%;
      padding: 12px 40px 12px 36px;
      height: 50px;
      border: 1px solid var(--focus-color);
      border-radius: 8px;
      font-size: 16px;
      color: #1a1a1a;
      background-color: #fff;

      &:focus {
        border-color: var(--focus-color);
        outline: none;
      }
    }

    .search-icon,
    .dropdown-icon {
      position: absolute;
      width: 20px;
      height: 20px;
      color: var(--primary-color);
    }

    .search-icon {
      left: 10px;
    }

    .dropdown-icon {
      right: 10px;
    }
  }

  .party-dropdown {
    position: absolute;
    top: 85px;
    width: 100%;
    background-color: white;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    list-style: none;
    padding: 8px 0;
    z-index: 10;

    li {
      padding: 10px 16px;
      cursor: pointer;
      transition: background 0.2s ease;

      .text-highlight {
        color: #464b5c;
        font-weight: 500;
      }

      .text-secondary {
        color: #8f929c;
      }

      &:hover {
        background-color: #f5f5f5;
      }
    }
  }
}

.transaction-category {
  display: flex;
  flex-direction: column;
  gap: 8px;

  span {
    font-weight: $font-medium;
    margin-bottom: 8px;
  }

  .category-options {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .category-option {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 16px;
    border-radius: 12px;
    border: 2px solid transparent;
    background-color: #fff;
    cursor: pointer;
    transition: all 0.2s ease-in-out;

    .category-label {
      font-weight: 500;
      color: #1a1a1a;
    }

    .radio-indicator {
      width: 16px;
      height: 16px;
      border: 2px solid #d2d5db;
      border-radius: 9999px;
      background-color: transparent;
    }

    &.selected {
      border-color: var(--primary-color);
      background-color: var(--light-bg-color);

      .category-label {
        color: var(--primary-color);
      }

      .radio-indicator {
        background-color: var(--primary-color);
        border-color: var(--primary-color);
      }
    }
  }
}

.transaction-description {
  display: flex;
  flex-direction: column;
  gap: 8px;

  span {
    font-weight: $font-medium;
    margin-bottom: 8px;
  }

  textarea {
    width: 576px;
    border-radius: 12px;
    padding: 16px;
    font-size: 16px;
    border: 1px solid #e0e0e0;
    background-color: #ffffff;
    resize: none;
    color: #1a1a1a;

    &:focus {
      border: 1px solid var(--focus-color) !important;
      outline: none;
    }

    &::placeholder {
      color: #79828e;
    }
  }
}

.transaction-attachment {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;

  span {
    font-weight: $font-medium;
    margin-bottom: 8px;
  }

  .upload-box {
    width: 576px;
    height: 120px;
    border: 1px dashed #acb7b8;
    border-radius: $radius-lg;
    background-color: #ffffff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 16px;
    cursor: pointer;
    transition: border-color 0.2s ease;

    &:hover {
      border-color: var(--primary-color);
    }

    .upload-icon {
      width: 24px;
      height: 24px;
      color: var(--primary-color);
    }

    .upload-text {
      margin-top: 10px;
      font-weight: $font-normal;
      font-size: $font-size-sm;
      color: var(--primary-color);
    }

    .upload-subtext {
      font-size: 9px;
      color: #8f929c;
      margin-top: 4px;
    }
  }
}

.submit-button {
  width: 179px;
  height: 53px;
  border-radius: $radius-lg;
  padding: 16px 32px 16px 32px;
  gap: 8px;

  &--outcome {
    background-color: #eb5757 !important;
    border-color: #eb5757 !important;
  }
}
</style>
