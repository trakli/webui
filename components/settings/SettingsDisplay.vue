<template>
  <div>
    <div class="toggle-row">
      <div class="toggle-label">
        <component :is="darkMode ? Sun : Moon" class="inline-icon" />
        <span>{{ darkMode ? t('Light') : t('Dark') }} {{ t('Mode') }}</span>
      </div>
      <button
        type="button"
        class="toggle"
        :class="{ 'toggle--on': darkMode }"
        @click="darkMode = !darkMode"
      >
        <span class="toggle-circle" />
      </button>
    </div>

    <div v-if="isEditMode" class="actions">
      <button type="button" class="submit-btn" @click="handleSave">
        <Save class="inline-icon" />
        <span>{{ t('Update Display Settings') }}</span>
      </button>
      <p v-if="message" class="success-text">{{ message }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { Save, Sun, Moon } from 'lucide-vue-next';

const { t } = useI18n();

const props = defineProps({
  isEditMode: { type: Boolean, default: false }
});

const darkMode = ref(false);
const message = ref('');

watch(
  () => props.isEditMode,
  () => {
    message.value = '';
  }
);

const handleSave = () => {
  message.value = t('Display settings updated successfully!');
  setTimeout(() => {
    message.value = '';
  }, 2000);
};
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;
@use 'sass:color';

.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-radius: $radius-lg;
  background: $bg-gray;
}

.toggle-label {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: $font-semibold;
  color: $text-primary;
}

.toggle {
  position: relative;
  display: inline-flex;
  align-items: center;
  height: 24px;
  width: 44px;
  border-radius: 999px;
  background: color.adjust($primary, $lightness: 25%);
  transition: $transition-base;

  &--on {
    background: $primary;
  }
}

.toggle-circle {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: $bg-white;
  border-radius: 50%;
  box-shadow: $shadow-sm;
  transition: transform 0.2s ease-in-out;
}

.toggle.toggle--on .toggle-circle {
  transform: translateX(20px);
}

.inline-icon {
  width: 18px;
  height: 18px;
}

.actions {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.success-text {
  margin-top: 0.75rem;
  color: $primary;
  font-weight: $font-semibold;
}
</style>
