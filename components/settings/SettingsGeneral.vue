<template>
  <div>
    <div class="section-grid">
      <div class="form-group">
        <label class="form-label">{{ t('Default Language') }}</label>
        <select v-if="isEditMode" v-model="languageCode" class="form-select">
          <option v-for="lang in languages" :key="lang.code" :value="lang.code">
            {{ lang.code.toUpperCase() }} - {{ lang.label }}
          </option>
        </select>
        <p v-else class="text-display">{{ languageLabel }}</p>
      </div>

      <div class="form-group">
        <label class="form-label">{{ t('Current Currency') }}</label>
        <select v-if="isEditMode" v-model="currencyCode" class="form-select">
          <option v-for="c in currencies" :key="c.code" :value="c.code">
            {{ c.code }} - {{ c.label }}
          </option>
        </select>
        <p v-else class="text-display">{{ currencyLabel }}</p>
      </div>
    </div>

    <div v-if="isEditMode" class="actions">
      <button type="button" class="submit-btn" @click="handleSave">
        <Save class="inline-icon" />
        <span>{{ t('Update General Settings') }}</span>
      </button>
      <p v-if="message" class="success-text">{{ message }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { Save } from 'lucide-vue-next';
import configurationsApi from '@/services/api/configurationsApi';
import { CONFIGURATION_KEYS } from '@/utils/configurationKeys';
import { CURRENCIES } from '@/utils/currencies';

const { t } = useI18n();

const props = defineProps({
  isEditMode: { type: Boolean, default: false }
});

const languages = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'pt', label: 'Português' },
  { code: 'it', label: 'Italiano' }
];

const currencies = CURRENCIES.map((c) => ({ code: c.code, label: c.name }));

const languageCode = ref('en');
const currencyCode = ref('USD');
const message = ref('');

const languageLabel = computed(() => {
  const found = languages.find((l) => l.code === languageCode.value);
  return found ? found.label : languageCode.value;
});

const currencyLabel = computed(() => {
  const found = currencies.find((c) => c.code === currencyCode.value);
  return found ? found.label : currencyCode.value;
});

watch(
  () => props.isEditMode,
  () => {
    message.value = '';
  }
);

onMounted(async () => {
  try {
    const res = await configurationsApi.fetchAll();
    const items = res?.data || [];

    const langItem = items.find((i) => i.key === CONFIGURATION_KEYS.LANGUAGE);
    const curItem = items.find((i) => i.key === CONFIGURATION_KEYS.CURRENCY);

    const extractCode = (val) => {
      if (typeof val === 'string') return val;
      if (val && typeof val === 'object' && 'code' in val) return val.code;
      return null;
    };

    const langCode = extractCode(langItem?.value);
    const curCode = extractCode(curItem?.value);

    if (langCode) languageCode.value = langCode;
    if (curCode) currencyCode.value = curCode;
  } catch (e) {
    console.error('Failed to load configurations', e);
  }
});

const handleSave = async () => {
  try {
    await configurationsApi.update(CONFIGURATION_KEYS.LANGUAGE, {
      value: languageCode.value,
      type: 'string'
    });
    await configurationsApi.update(CONFIGURATION_KEYS.CURRENCY, {
      value: currencyCode.value,
      type: 'string'
    });
    message.value = t('General settings updated successfully!');
  } catch (e) {
    console.error('Failed to update general settings', e);
  } finally {
    setTimeout(() => {
      message.value = '';
    }, 2000);
  }
};
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.section-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;

  @media (min-width: $breakpoint-md) {
    grid-template-columns: 1fr 1fr;
  }
}

.text-display {
  padding: 0.75rem 1rem;
  border-radius: $radius-lg;
  background: $bg-gray;
  color: $text-primary;
  font-weight: $font-medium;
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
