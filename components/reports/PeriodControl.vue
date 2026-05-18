<template>
  <div class="period-control">
    <div class="period-chips">
      <button
        v-for="p in periods"
        :key="p.value"
        class="chip"
        :class="{ 'chip--active': selectedPeriod === p.value }"
        @click="$emit('select', p.value)"
      >
        {{ t(p.label) }}
      </button>
      <button
        class="chip chip--custom"
        :class="{ 'chip--active': selectedPeriod === 'custom' }"
        @click="customOpen = !customOpen"
      >
        <Calendar class="chip-ico" :size="14" />
        <span>{{
          selectedPeriod === 'custom' && customRange
            ? `${customRange.start} → ${customRange.end}`
            : t('Custom')
        }}</span>
        <ChevronDown class="chip-ico" :size="14" />
      </button>
      <Transition name="pop">
        <div v-if="customOpen" class="custom-popover" @click.stop>
          <label class="popover-row">
            <span>{{ t('From') }}</span>
            <input v-model="draftStart" type="date" />
          </label>
          <label class="popover-row">
            <span>{{ t('To') }}</span>
            <input v-model="draftEnd" type="date" />
          </label>
          <div class="popover-actions">
            <button class="ghost-btn" @click="customOpen = false">{{ t('Cancel') }}</button>
            <button class="primary-btn" :disabled="!draftStart || !draftEnd" @click="applyCustom">
              {{ t('Apply') }}
            </button>
          </div>
        </div>
      </Transition>
    </div>

    <div class="period-actions">
      <button
        class="toggle"
        :class="{ 'toggle--on': compareEnabled }"
        :title="t('Compare to previous period')"
        @click="$emit('toggle-compare')"
      >
        <GitCompareArrows :size="14" />
        <span>{{ t('Compare') }}</span>
      </button>
      <button class="primary-btn" :title="t('Open monthly recap')" @click="$emit('open-review')">
        <Sparkles :size="14" />
        <span>{{ t('Recap') }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { Calendar, ChevronDown, GitCompareArrows, Sparkles } from 'lucide-vue-next';

const { t } = useI18n();

const props = defineProps({
  periods: { type: Array, required: true },
  selectedPeriod: { type: String, required: true },
  compareEnabled: { type: Boolean, default: false },
  customRange: { type: Object, default: null }
});

const emit = defineEmits(['select', 'toggle-compare', 'open-review', 'apply-custom']);

const customOpen = ref(false);
const draftStart = ref(props.customRange?.start || '');
const draftEnd = ref(props.customRange?.end || '');

watch(
  () => props.customRange,
  (r) => {
    draftStart.value = r?.start || '';
    draftEnd.value = r?.end || '';
  }
);

const applyCustom = () => {
  if (!draftStart.value || !draftEnd.value) return;
  emit('apply-custom', { start: draftStart.value, end: draftEnd.value });
  customOpen.value = false;
};
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.period-control {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-3;
  padding: $spacing-2 $spacing-3;
  background: transparent;
  border-bottom: 1px solid $border-color;
}

.period-chips {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: $spacing-1;
  position: relative;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 32px;
  padding: 0 $spacing-3;
  border: 1px solid transparent;
  border-radius: 999px;
  background: transparent;
  color: $text-secondary;
  font-size: $font-size-sm;
  font-weight: $font-medium;
  cursor: pointer;
  transition: $transition-fast;

  &:hover {
    background: $bg-light;
    color: $text-primary;
  }

  &--active {
    background: $primary-light;
    color: $primary;

    &:hover {
      background: $primary-light;
      color: $primary;
    }
  }

  &--custom {
    border-color: $border-color;
  }
}

.chip-ico {
  flex-shrink: 0;
}

.period-actions {
  display: inline-flex;
  align-items: center;
  gap: $spacing-2;
  flex-wrap: wrap;
}

.toggle,
.ghost-btn,
.primary-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 $spacing-3;
  border-radius: 999px;
  font-size: $font-size-sm;
  font-weight: $font-medium;
  cursor: pointer;
  transition: $transition-fast;
  border: 1px solid $border-color;
  background: $bg-white;
  color: $text-secondary;

  &:hover {
    background: $bg-light;
    color: $text-primary;
  }
}

.toggle--on {
  background: $primary-light;
  color: $primary;
  border-color: $primary-light;

  &:hover {
    background: $primary-light;
    color: $primary;
  }
}

.primary-btn {
  background: $primary-light;
  color: $primary;
  border-color: $primary-light;

  &:hover {
    background: $primary-light;
    color: $primary;
    filter: brightness(0.97);
  }
}

.custom-popover {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: $z-index-popover;
  background: $bg-white;
  border: 1px solid $border-color;
  border-radius: 12px;
  padding: $spacing-3;
  box-shadow: $elevation-3;
  min-width: 240px;
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
}

.popover-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-2;
  font-size: $font-size-sm;
  color: $text-secondary;

  input {
    border: 1px solid $border-color;
    border-radius: 8px;
    padding: 4px 8px;
    font: inherit;
    background: $input-bg;
    color: $text-primary;
  }
}

.popover-actions {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-2;
  margin-top: $spacing-1;
}

.pop-enter-active,
.pop-leave-active {
  transition:
    opacity $duration-fast $easing-standard,
    transform $duration-fast $easing-decelerate;
}
.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}

@media (max-width: $breakpoint-sm) {
  .period-control {
    flex-direction: column;
    align-items: stretch;
  }
  .period-actions,
  .period-chips {
    justify-content: flex-start;
  }
}
</style>
