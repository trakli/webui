<template>
  <div class="feedback-page">
    <header class="hero surface surface--brand">
      <div>
        <span class="eyebrow">{{ t('Feedback') }}</span>
        <h1>{{ t('Help shape Trakli') }}</h1>
        <p>
          {{ t('Report a problem, ask a question, or tell us what would make Trakli better.') }}
        </p>
      </div>
      <MessageSquare class="hero__icon" />
    </header>
    <div class="feedback-grid">
      <TCard>
        <template #header>{{ t('Send feedback') }}</template>
        <form class="form" @submit.prevent="submit">
          <label
            ><span>{{ t('Type') }}</span
            ><select v-model="form.type">
              <option value="general">{{ t('General') }}</option>
              <option value="bug">{{ t('Bug') }}</option>
              <option value="feature">{{ t('Feature request') }}</option>
              <option value="question">{{ t('Question') }}</option>
            </select></label
          >
          <label
            ><span>{{ t('Subject') }}</span
            ><input v-model="form.subject" maxlength="200"
          /></label>
          <label
            ><span>{{ t('Message') }}</span
            ><textarea v-model="form.message" required rows="7" maxlength="5000" />
          </label>
          <TButton type="submit" :text="t('Send feedback')" :loading="sending" />
        </form>
      </TCard>
      <TCard>
        <template #header>{{ t('Your feedback') }}</template>
        <ComponentLoader
          :is-loading="loading"
          :error="error"
          :has-data="items.length > 0"
          :on-retry="load"
        >
          <template #empty
            ><div class="empty">
              <MessageSquare />
              <h2>{{ t('Nothing sent yet') }}</h2>
              <p>{{ t('Your messages and their status will appear here.') }}</p>
            </div></template
          >
          <div class="history">
            <article v-for="item in items" :key="item.id">
              <span class="status">{{ item.status.replaceAll('_', ' ') }}</span>
              <h3 v-if="item.subject">{{ item.subject }}</h3>
              <p>{{ item.message }}</p>
              <small>{{ new Date(item.created_at).toLocaleString() }}</small>
            </article>
          </div>
        </ComponentLoader>
      </TCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import { MessageSquare } from 'lucide-vue-next';
import TCard from '@/components/TCard.vue';
import TButton from '@/components/TButton.vue';
import ComponentLoader from '@/components/ComponentLoader.vue';
import { useFeedback, type FeedbackItem } from '@/composables/useFeedback';
import { useNotifications } from '@/composables/useNotifications';

definePageMeta({ middleware: ['auth'] });
const { t } = useI18n();
const { showSuccess, showError } = useNotifications();
const feedback = useFeedback();
const form = reactive({ type: 'general', subject: '', message: '' });
const items = ref<FeedbackItem[]>([]);
const loading = ref(true);
const sending = ref(false);
const error = ref<unknown>(null);

async function load() {
  loading.value = true;
  error.value = null;
  try {
    items.value = await feedback.list();
  } catch (cause) {
    error.value = cause;
  } finally {
    loading.value = false;
  }
}
async function submit() {
  sending.value = true;
  try {
    const item = await feedback.send(form);
    items.value.unshift(item);
    form.subject = '';
    form.message = '';
    showSuccess(t('Thanks, your feedback reached the team.'));
  } catch {
    showError(t('Could not send your feedback.'));
  } finally {
    sending.value = false;
  }
}
onMounted(load);
</script>

<style scoped lang="scss">
@use '@/assets/scss/_variables.scss' as *;
.feedback-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: $spacing-6;
}
.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-6;
  padding: $spacing-6;
  border-radius: $radius-xl;
  box-shadow: var(--elevation-1);
}
.hero h1 {
  margin: $spacing-1 0;
  color: var(--surface-ink);
}
.hero p {
  margin: 0;
  color: $text-secondary;
}
.hero__icon {
  width: 64px;
  height: 64px;
  color: var(--surface-deep);
}
.feedback-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: $spacing-5;
}
.form,
.form label {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
}
.form {
  gap: $spacing-4;
}
.form label span {
  color: $text-secondary;
  font-size: $font-size-sm;
  font-weight: $font-semibold;
}
.form input,
.form textarea,
.form select {
  padding: 0.7rem 0.8rem;
  color: $text-primary;
  background: $input-bg;
  border: 1px solid $border-color;
  border-radius: $radius-md;
  font: inherit;
}
.history {
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
}
.history article {
  padding: $spacing-3;
  background: $bg-light;
  border-radius: $radius-lg;
}
.history h3,
.history p {
  margin: $spacing-2 0;
}
.history p {
  color: $text-secondary;
  white-space: pre-wrap;
}
.history small {
  color: $text-muted;
}
.status {
  padding: 0.2rem 0.55rem;
  color: $primary-dark;
  background: $primary-light;
  border-radius: 999px;
  font-size: $font-size-xs;
  text-transform: capitalize;
}
.empty {
  padding: $spacing-6;
  color: $text-muted;
  text-align: center;
}
.empty svg {
  color: $primary;
}
@media (max-width: $breakpoint-md) {
  .feedback-page {
    padding: $spacing-4;
  }
  .feedback-grid {
    grid-template-columns: 1fr;
  }
  .hero__icon {
    width: 42px;
    height: 42px;
  }
}
</style>
