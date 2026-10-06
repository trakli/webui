<template>
  <div class="premium-page">
    <h1>{{ t('Your plan') }}</h1>
    <ComponentLoader :is-loading="loading" :error="error" :has-data="!!status" :on-retry="load">
      <TCard v-if="status">
        <h2>{{ status.paid_access ? t('Paid access active') : t('Free plan') }}</h2>
        <p>{{ t('Subscription status') }}: {{ status.status }}</p>
        <p v-if="status.paid_through">
          {{ t('Paid through') }}: {{ formatDate(status.paid_through) }}
        </p>
        <p v-if="returned && !status.paid_access" role="status">
          {{ t('Payment confirmation is pending. Refresh your status before connecting a bank.') }}
        </p>
        <p v-if="cancelled" role="status">
          {{ t('Checkout cancelled. Your current plan is unchanged.') }}
        </p>
        <p>{{ t('Wallet limit') }}: {{ limit(status.limits.wallets) }}</p>
        <p>{{ t('New custom category limit') }}: {{ limit(status.limits.categories) }}</p>
        <p>{{ t('Bank connection limit') }}: {{ limit(status.limits.bank_connections) }}</p>
        <div v-if="status.paid_access">
          <h3>{{ t('Monthly model usage') }}</h3>
          <p>
            {{ status.ai_usage.used.toLocaleString() }} /
            {{ status.ai_usage.allowance.toLocaleString() }} {{ t('tokens') }}
          </p>
          <progress
            :value="Math.min(status.ai_usage.used, status.ai_usage.allowance)"
            :max="status.ai_usage.allowance"
          />
          <p>{{ t('Resets') }}: {{ formatDate(status.ai_usage.period_end) }} (UTC)</p>
          <div class="premium-actions">
            <TButton
              :text="t('Manage billing')"
              :loading="busy"
              :full-width="false"
              @click="portal"
            />
            <TButton :text="t('Manage banks')" to="/banks" variant="outline" :full-width="false" />
          </div>
        </div>
        <div v-else>
          <p>
            {{
              t(
                'Upgrade for unlimited wallets, categories and bank connections, plus 100,000 model tokens each month.'
              )
            }}
          </p>
          <p>{{ t('A three-day trial is available once per account.') }}</p>
          <div class="premium-fields">
            <label
              >{{ t('Pricing region') }}
              <select v-model="region">
                <option value="us">US</option>
                <option value="eu">EU</option>
                <option value="uk">UK</option>
              </select>
            </label>
            <label
              >{{ t('Billing period') }}
              <select v-model="plan">
                <option value="monthly">{{ t('Monthly') }}</option>
                <option value="yearly">{{ t('Yearly') }}</option>
              </select>
            </label>
          </div>
          <p v-if="selectedPrice">
            {{ selectedPrice }} / {{ plan === 'monthly' ? t('Month') : t('Year') }}
          </p>
          <TButton
            :text="t('Upgrade')"
            :disabled="!selectedPrice"
            :loading="busy"
            :full-width="false"
            @click="checkout"
          />
          <TButton
            v-if="status.has_billing_account"
            :text="t('Manage billing')"
            variant="outline"
            :loading="busy"
            :full-width="false"
            @click="portal"
          />
        </div>
        <TButton
          :text="t('Refresh status')"
          variant="text"
          :loading="loading"
          :full-width="false"
          @click="load"
        />
      </TCard>
    </ComponentLoader>
  </div>
</template>
<script setup lang="ts">
import type { BillingStatus, CloudPlans, PremiumResponse } from '~/types/premium';
import { computed, onMounted, ref } from 'vue';
import { useApi } from '~/composables/useApi';
import { extractApiErrors } from '~/utils/apiErrors';
definePageMeta({ layout: 'dashboard', middleware: 'auth' });
const { t } = useI18n();
const api = useApi();
const route = useRoute();
const status = ref<BillingStatus | null>(null);
const loading = ref(true);
const busy = ref(false);
const error = ref<string | null>(null);
const region = ref('us');
const plan = ref('monthly');
const pricing = ref<CloudPlans | null>(null);
const selectedPrice = computed(
  () => pricing.value?.regions[region.value]?.prices[plan.value]?.price_formatted
);
const returned = computed(() => route.query.checkout === 'success');
const cancelled = computed(() => route.query.checkout === 'cancelled');
const limit = (value: number | null) => (value === null ? t('Unlimited') : value);
const formatDate = (value: string) => new Date(value).toLocaleDateString();
async function load() {
  loading.value = true;
  error.value = null;
  try {
    const [current, plans] = await Promise.all([
      api<PremiumResponse<BillingStatus>>('/cloud/billing/status'),
      api<PremiumResponse<CloudPlans>>('/cloud/plans')
    ]);
    status.value = current.data;
    pricing.value = plans.data;
  } catch (e) {
    error.value = extractApiErrors(e);
  } finally {
    loading.value = false;
  }
}
async function redirect(path: string, body?: object) {
  busy.value = true;
  error.value = null;
  try {
    const result = await api<PremiumResponse<{ url: string }>>(path, { method: 'POST', body });
    await navigateTo(result.data.url, { external: true });
  } catch (e) {
    error.value = extractApiErrors(e);
  } finally {
    busy.value = false;
  }
}
const checkout = () =>
  redirect('/cloud/billing/checkout', { region: region.value, plan: plan.value });
const portal = () => redirect('/cloud/billing/portal');
onMounted(load);
</script>
<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;
.premium-page {
  display: grid;
  gap: $spacing-4;
}
.premium-actions,
.premium-fields {
  display: flex;
  gap: $spacing-3;
  flex-wrap: wrap;
  margin: $spacing-4 0;
}
label {
  display: grid;
  gap: $spacing-2;
}
select {
  background: $bg-white;
  color: $text-primary;
  border: 1px solid $border-light;
  border-radius: $radius-md;
  padding: $spacing-2;
}
progress {
  width: 100%;
  accent-color: $primary;
}
@media (max-width: 640px) {
  .premium-actions,
  .premium-fields {
    flex-direction: column;
  }
}
</style>
