<template>
  <div class="icon-picker">
    <!-- Search Section with Input, Selected Icon, and Dropdown Button -->
    <div class="icon-search-section">
      <div class="input-container">
        <component
          v-if="modelValue"
          :is="selectedIconComponent"
          class="selected-icon"
        />
        <input
          id="iconSearch"
          v-model="search"
          type="text"
          class="icon-search"
          :placeholder="modelValue ? '' : 'Search an icon here'"
          @input="showDropdown = true"
        />
        <button class="dropdown-btn" @click="toggleDropdown" type="button">
          <ChevronDown class="dropdown-icon" />
        </button>
      </div>
    </div>

    <!-- Icon Grid (Part of Form Flow) -->
    <div v-if="showDropdown" class="icon-grid-wrapper">
      <div class="icon-grid">
        <button
          v-for="icon in filteredIcons"
          :key="icon.name"
          :class="['icon-btn', { selected: modelValue === icon.name }]"
          @click.prevent="selectIcon(icon.name)"
          type="button"
        >
          <component :is="icon.component" class="icon-svg" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import {
  Home, User, Wallet, Settings, Plus, Minus, ArrowUp, ArrowDown, Bell, Book, Calendar, Camera,
  Check, ChevronDown, ChevronUp, Clipboard, Cloud, CreditCard, DollarSign, Edit, Eye, EyeOff,
  File, Filter, Gift, Globe, Heart, Image, Info, Key, Link, List, Lock, Mail, Map, Menu,
  MessageCircle, Monitor, MoreHorizontal, MoreVertical, Package, Paperclip, Pause, PenTool,
  Percent, Phone, PieChart, Play, PlusCircle, Printer, RefreshCw, Repeat, Save, Search, Send,
  Share, Shield, ShoppingCart, Shuffle, Sliders, Star, Sun, Tag, Target, ThumbsUp, Trash,
  TrendingUp, Truck, Unlock, Upload, UserCheck, Users, X, Zap
} from 'lucide-vue-next';

const props = defineProps({
  modelValue: String
});
const emit = defineEmits(['update:modelValue']);

const search = ref('');
const showDropdown = ref(false);

const icons = [
  { name: 'Home', component: Home },
  { name: 'User', component: User },
  { name: 'Wallet', component: Wallet },
  { name: 'Settings', component: Settings },
  { name: 'Plus', component: Plus },
  { name: 'Minus', component: Minus },
  { name: 'ArrowUp', component: ArrowUp },
  { name: 'ArrowDown', component: ArrowDown },
  { name: 'Bell', component: Bell },
  { name: 'Book', component: Book },
  { name: 'Calendar', component: Calendar },
  { name: 'Camera', component: Camera },
  { name: 'Check', component: Check },
  { name: 'ChevronDown', component: ChevronDown },
  { name: 'ChevronUp', component: ChevronUp },
  { name: 'Clipboard', component: Clipboard },
  { name: 'Cloud', component: Cloud },
  { name: 'CreditCard', component: CreditCard },
  { name: 'DollarSign', component: DollarSign },
  { name: 'Edit', component: Edit },
  { name: 'Eye', component: Eye },
  { name: 'EyeOff', component: EyeOff },
  { name: 'File', component: File },
  { name: 'Filter', component: Filter },
  { name: 'Gift', component: Gift },
  { name: 'Globe', component: Globe },
  { name: 'Heart', component: Heart },
  { name: 'Image', component: Image },
  { name: 'Info', component: Info },
  { name: 'Key', component: Key },
  { name: 'Link', component: Link },
  { name: 'List', component: List },
  { name: 'Lock', component: Lock },
  { name: 'Mail', component: Mail },
  { name: 'Map', component: Map },
  { name: 'Menu', component: Menu },
  { name: 'MessageCircle', component: MessageCircle },
  { name: 'Monitor', component: Monitor },
  { name: 'MoreHorizontal', component: MoreHorizontal },
  { name: 'MoreVertical', component: MoreVertical },
  { name: 'Package', component: Package },
  { name: 'Paperclip', component: Paperclip },
  { name: 'Pause', component: Pause },
  { name: 'PenTool', component: PenTool },
  { name: 'Percent', component: Percent },
  { name: 'Phone', component: Phone },
  { name: 'PieChart', component: PieChart },
  { name: 'Play', component: Play },
  { name: 'PlusCircle', component: PlusCircle },
  { name: 'Printer', component: Printer },
  { name: 'RefreshCw', component: RefreshCw },
  { name: 'Repeat', component: Repeat },
  { name: 'Save', component: Save },
  { name: 'Search', component: Search },
  { name: 'Send', component: Send },
  { name: 'Share', component: Share },
  { name: 'Shield', component: Shield },
  { name: 'ShoppingCart', component: ShoppingCart },
  { name: 'Shuffle', component: Shuffle },
  { name: 'Sliders', component: Sliders },
  { name: 'Star', component: Star },
  { name: 'Sun', component: Sun },
  { name: 'Tag', component: Tag },
  { name: 'Target', component: Target },
  { name: 'ThumbsUp', component: ThumbsUp },
  { name: 'Trash', component: Trash },
  { name: 'TrendingUp', component: TrendingUp },
  { name: 'Truck', component: Truck },
  { name: 'Unlock', component: Unlock },
  { name: 'Upload', component: Upload },
  { name: 'UserCheck', component: UserCheck },
  { name: 'Users', component: Users },
  { name: 'X', component: X },
  { name: 'Zap', component: Zap }
];

const filteredIcons = computed(() =>
  icons.filter(icon =>
    icon.name.toLowerCase().includes(search.value.toLowerCase())
  )
);

const selectedIconComponent = computed(() =>
  icons.find(icon => icon.name === props.modelValue)?.component || null
);

function selectIcon(name) {
  emit('update:modelValue', name);
  showDropdown.value = false; 
  search.value = ''; 
}

function toggleDropdown() {
  showDropdown.value = !showDropdown.value;
}
</script>

<style lang="scss" scoped>
@use '~/assets/_variables.scss' as *;
.icon-picker {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

/* Search Section */
.icon-search-section {
  background-color: #f4f8f6;
  padding: 0;
  width: 100%;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.selected-icon {
  position: absolute;
  left: 0.5rem;
  width: 20px;
  height: 20px;
  color: #047844; 
}

.icon-search {
  width: 100%;
  padding: 0.5rem 2.5rem 0.5rem 2.5rem; 
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  box-sizing: border-box;
}

.dropdown-btn {
  position: absolute;
  right: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dropdown-icon {
  width: 20px;
  height: 20px;
  color: #1d3229;
}

/* Grid Wrapper (Part of Form Flow) */
.icon-grid-wrapper {
  width: 100%;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 0 0 12px 12px;
  max-height: 25vh; 
  overflow-y: auto;
}

/* Icon Grid */
.icon-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.2rem;
  padding: 1rem;
}

/* Icon Button */
.icon-btn {
  border: 2px solid transparent;
  border-radius: 8px;
  padding: 6px;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn.selected {
  border-color: #047844;
  background-color: #e6f2ec;
}

.icon-svg {
  width: 24px;
  height: 24px;
  color: #1d3229;
}
</style>