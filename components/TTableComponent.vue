<template>
  <div class="table-container">
    <div class="table-heading">
      <h1 class="table-heading-text">All Transactions</h1>
      <div class="input-controls">
        <div class="search-container">
          <input type="text" placeholder="Search..." class="search-input" v-model="searchQuery" />
          <MagnifyingGlassIcon class="search-icon" />
        </div>
        <div class="filter-container">
          <input type="text" placeholder="Filter..." class="filter-input" v-model="filterQuery" />
          <FunnelIcon class="filter-icon" />
        </div>
      </div>
    </div>

    <div class="table-wrapper">
      <div class="table">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Date Time</th>
              <th>Type</th>
              <th>Party</th>
              <th>Amount</th>
              <th>Category</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody class="table-body">
            <tr v-for="(txn, index) in transactions" :key="index">
              <td>
                <div class="date-main">{{ txn.date }}</div>
                <div class="date-sub">2 min ago</div>
              </td>
              <td>
                <span :class="['type-badge', txn.type === 'INCOME' ? 'income' : 'outcome']">
                  {{ txn.type }}
                </span>
              </td>
              <td>
                <span class="party">{{ txn.party }}</span>
              </td>
              <td>
                <span :class="txn.type === 'INCOME' ? 'amount-income' : 'amount-outcome'">
                  {{ txn.amount }}
                </span>
              </td>
              <td>{{ txn.category }}</td>
              <td>
                <div class="actions">
                  <button class="action-btn">
                    <PencilSquareIcon class="action-icon" />
                  </button>
                  <button class="action-btn">
                    <TrashIcon class="action-icon" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilSquareIcon,
  TrashIcon
} from '@heroicons/vue/24/outline';

const searchQuery = ref('');
const filterQuery = ref('');

const transactions = ref([
  {
    date: 'Feb 02, 2021',
    type: 'OUTCOME',
    party: 'Paul Erica',
    amount: '254,000 XAF',
    category: 'Food'
  },
  {
    date: 'Feb 02, 2021',
    type: 'INCOME',
    party: 'Eric Mbia',
    amount: '50,701 XAF',
    category: 'Rent'
  },
  {
    date: 'Feb 02, 2021',
    type: 'OUTCOME',
    party: 'Paul Tchoua',
    amount: '64,709 XAF',
    category: 'Food'
  },
  {
    date: 'Feb 02, 2021',
    type: 'INCOME',
    party: 'Michel Ngwane',
    amount: '77,732 XAF',
    category: 'Girls 🤣'
  },
  {
    date: 'Feb 02, 2021',
    type: 'INCOME',
    party: 'Laure Tchouamou',
    amount: '71,934 XAF',
    category: 'Rent'
  },
  {
    date: 'Feb 02, 2021',
    type: 'INCOME',
    party: 'Isabelle Njomo',
    amount: '60,049 XAF',
    category: 'Food'
  },
  {
    date: 'Feb 02, 2021',
    type: 'OUTCOME',
    party: 'Thierry Ndifor',
    amount: '94,744 XAF',
    category: 'Girls 🤣'
  },
  {
    date: 'Feb 02, 2021',
    type: 'OUTCOME',
    party: 'Jacqueline Nkelle',
    amount: '70,068 XAF',
    category: 'Food'
  },
  {
    date: 'Feb 02, 2021',
    type: 'INCOME',
    party: 'David Ngwa',
    amount: '89,245 XAF',
    category: 'School'
  }
]);
</script>

<style lang="scss" scoped>
@use '~/assets/_variables' as *;

.table-container {
  width: 100%;
  max-width: 100%;
  gap: 8px;
  overflow: hidden;
}

.table-heading {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 0.5rem;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.table-heading-text {
  font-weight: $font-bold;
  font-size: $font-size-2xl;
  margin-bottom: 0;
}

.input-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;

  @media (min-width: 640px) {
    flex-wrap: nowrap;
    gap: 1rem;
  }
  align-items: center;
}

.search-container,
.filter-container {
  position: relative;
  width: 100%;
  height: 50px;
  min-width: 160px;

  @media (min-width: 640px) {
    width: 184px;
  }
}

.search-input,
.filter-input {
  width: 100%;
  height: 44px;
  background-color: #f5f6f7;
  padding: 8px 36px 8px 16px;
  border: 1px solid $bg-gray;
  border-radius: $radius-lg;
  font-size: $font-size-sm;
  outline: none;
  transition: border-color 0.2s ease;
  box-sizing: border-box;

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
}

.search-icon,
.filter-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #798588;
  pointer-events: none;
}

.table-wrapper {
  width: 100%;
  border-radius: 8px;
  overflow-x: auto;
  background-color: #ebedec;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
}

.table {
  width: 100%;
  min-width: 100%;
  table-layout: auto;
}

.custom-table {
  width: 100%;
  min-width: 100%;
  border-collapse: collapse;
  font-family: $font-family-sans;
  table-layout: auto;
  th,
  td {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
  }

  th {
    background-color: #057a55;
    color: white;
    text-align: left;
    padding: 12px;
  }

  td {
    padding: 12px;
    background-color: #f9f9f9;
    border-bottom: 1px solid #ddd;
    vertical-align: top;
  }

  .date-main {
    color: #1d3229;
    font-weight: $font-bold;
  }

  .date-sub {
    font-size: 9px;
    font-weight: $font-normal;
    color: #646b6b;
  }

  .type-badge {
    padding: 4px 12px;
    border-radius: 6px;
    font-weight: bold;
    font-size: 12px;
    display: inline-block;
  }

  .income {
    background-color: #d1fae5;
    color: #065f46;
  }

  .outcome {
    background-color: #fee2e2;
    color: #b91c1c;
  }

  .party {
    background-color: #f5f6f7;
    padding: 4px 8px;
    border-radius: 6px;
    display: inline-block;
  }

  .amount-income {
    color: #059669;
    font-weight: bold;
  }

  .amount-outcome {
    color: #ef4444;
    font-weight: bold;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 16px;
    color: #047857;
    cursor: pointer;
  }

  .action-icon-eye {
    width: 20px;
    height: 20px;
    color: #047844;

    svg {
      width: 100%;
      height: 100%;
      stroke: currentColor;
      fill: none;
    }
  }

  .action-icon-attach {
    width: 20px;
    height: 20px;
    color: #2d9cdb;

    svg {
      width: 100%;
      height: 100%;
      stroke: currentColor;
      fill: none;
    }
  }
}
</style>
