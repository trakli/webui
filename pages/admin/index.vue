<template>
  <div class="console">
    <aside class="rail">
      <div class="rail__brand">
        <Logo size="small" />
        <span class="rail__badge"><ShieldCheck class="rail__badge-icon" />{{ t('Admin') }}</span>
      </div>

      <nav class="rail__nav">
        <button
          v-for="section in sections"
          :key="section.id"
          class="nav-item"
          :class="{ 'nav-item--active': activeSection === section.id }"
          @click="activeSection = section.id"
        >
          <component :is="section.icon" class="nav-item__icon" />
          <span>{{ section.label }}</span>
        </button>
      </nav>

      <div class="rail__foot">
        <div v-if="user" class="rail__user">
          <span class="rail__user-name">{{ user.first_name }} {{ user.last_name }}</span>
          <span class="rail__user-email">{{ user.email }}</span>
        </div>
        <button class="rail__exit" @click="exit">
          <ArrowLeft class="rail__exit-icon" />
          <span>{{ t('Back to app') }}</span>
        </button>
      </div>
    </aside>

    <main class="panel">
      <section v-if="activeSection === 'overview'">
        <header class="panel__head">
          <div>
            <h1 class="panel__title">{{ t('Overview') }}</h1>
            <p class="panel__sub">{{ heroSummary }}</p>
          </div>
          <div class="range">
            <button
              v-for="opt in rangeOptions"
              :key="opt.days"
              class="range-pill"
              :class="{ 'range-pill--active': days === opt.days }"
              @click="setDays(opt.days)"
            >
              {{ t(opt.label) }}
            </button>
          </div>
        </header>

        <div v-if="loading" class="state">{{ t('Loading...') }}</div>
        <p v-else-if="metricsError" class="state state--note">{{ metricsError }}</p>

        <template v-else>
          <div class="kpis">
            <div v-for="kpi in kpis" :key="kpi.key" class="kpi" :class="`tone-${kpi.tone}`">
              <span class="kpi__icon"><component :is="kpi.icon" /></span>
              <span class="kpi__value">{{ kpi.value }}</span>
              <span class="kpi__label">{{ kpi.label }}</span>
              <span v-if="kpi.sub" class="kpi__sub">{{ kpi.sub }}</span>
            </div>
          </div>

          <div class="grid-2">
            <TCard>
              <template #header>{{ t('New users') }}</template>
              <ClientOnly>
                <ApexChart
                  type="area"
                  height="220"
                  :options="areaOptions(usersChart.categories, chartColors.primary)"
                  :series="[{ name: t('New users'), data: usersChart.data }]"
                  @data-point-selection="showSignupsForPoint"
                />
              </ClientOnly>
            </TCard>
            <TCard>
              <template #header>{{ t('Transactions') }}</template>
              <ClientOnly>
                <ApexChart
                  type="area"
                  height="220"
                  :options="areaOptions(txChart.categories, chartColors.income)"
                  :series="[{ name: t('Transactions'), data: txChart.data }]"
                />
              </ClientOnly>
            </TCard>
          </div>

          <div class="grid-2">
            <TCard v-for="rank in rankings" :key="rank.key">
              <template #header>{{ rank.label }}</template>
              <ol v-if="rank.rows.length" class="ranking">
                <li v-for="(row, k) in rank.rows" :key="k" class="ranking-row">
                  <span class="ranking-rank">{{ k + 1 }}</span>
                  <span class="ranking-label">{{ row.label }}</span>
                  <span class="ranking-bar"
                    ><span class="ranking-fill" :style="{ width: rowWidth(rank.rows, row.value) }"
                  /></span>
                  <span class="ranking-value">{{ row.value }}</span>
                </li>
              </ol>
              <p v-else class="state">{{ t('No data yet') }}</p>
            </TCard>
          </div>
        </template>
      </section>

      <section v-else-if="activeSection === 'demographics'">
        <header class="panel__head">
          <div>
            <h1 class="panel__title">{{ t('Demographics') }}</h1>
            <p class="panel__sub">{{ t('Where your users are and what they prefer.') }}</p>
          </div>
        </header>
        <div v-if="loading" class="state">{{ t('Loading...') }}</div>
        <div v-else class="grid-2">
          <TCard v-for="metric in demographicsMetrics" :key="metric.key">
            <template #header>{{ metric.label }}</template>
            <ol v-if="metric.rows.length" class="ranking">
              <li v-for="(row, k) in metric.rows" :key="k" class="ranking-row">
                <span class="ranking-rank">{{ k + 1 }}</span>
                <span class="ranking-label">{{ row.label }}</span>
                <span class="ranking-bar"
                  ><span class="ranking-fill" :style="{ width: rowWidth(metric.rows, row.value) }"
                /></span>
                <span class="ranking-value">{{ row.value }}</span>
              </li>
            </ol>
            <p v-else class="state">{{ t('No data yet') }}</p>
          </TCard>
        </div>
      </section>

      <section v-else-if="activeSection === 'users'">
        <UserDetail v-if="selectedUserId" :user-id="selectedUserId" @back="selectedUserId = null" />
        <template v-else>
          <header class="panel__head">
            <div>
              <h1 class="panel__title">{{ t('Users') }}</h1>
              <button v-if="joinedOn" class="filter-chip" @click="clearJoinDate">
                {{ t('Joined on {date}', { date: formatDate(joinedOn) }) }} ×
              </button>
            </div>
            <div class="search">
              <Search class="search__icon" />
              <input v-model="userQuery" class="search__input" :placeholder="t('Search users')" />
            </div>
          </header>
          <TCard>
            <TDataTable
              v-if="users.length"
              :columns="userColumns"
              :rows="users"
              clickable
              @row-click="selectedUserId = $event.id"
            >
              <template #cell-name="{ row: u }">
                <strong>{{ u.first_name }} {{ u.last_name }}</strong>
              </template>
              <template #cell-created_at="{ row: u }">{{ formatDate(u.created_at) }}</template>
              <template #cell-last_seen_at="{ row: u }">
                {{ u.last_seen_at ? formatDateTime(u.last_seen_at) : t('Never') }}
              </template>
              <template #cell-last_transaction_at="{ row: u }">
                {{ u.last_transaction_at ? formatDateTime(u.last_transaction_at) : t('Never') }}
              </template>
              <template #cell-tokens_used="{ row: u }">{{ fmt(u.tokens_used) }}</template>
              <template #cell-actions="{ row: u }">
                <div @click.stop>
                  <TDropdown>
                    <template #trigger>
                      <button class="row-action" :aria-label="t('Actions')">
                        <MoreHorizontal />
                      </button>
                    </template>
                    <TDropdownItem @click="selectedUserId = u.id"
                      ><Eye class="item-icon" />{{ t('View profile') }}</TDropdownItem
                    >
                    <TDropdownItem><Send class="item-icon" />{{ t('Reach out') }}</TDropdownItem>
                    <TDropdownItem
                      ><Gift class="item-icon" />{{ t('Grant discount') }}</TDropdownItem
                    >
                  </TDropdown>
                </div>
              </template>
            </TDataTable>
            <p v-else-if="!usersLoading" class="state">{{ t('No users found') }}</p>
            <TPagination
              v-if="userPagination.total"
              :current-page="userPagination.current_page"
              :total-pages="userPagination.last_page"
              :disabled="usersLoading"
              @page-change="changeUserPage"
            >
              <template #info>
                <span class="pagination-info">
                  {{
                    t('Page {page} of {pages} · {total} users', {
                      page: userPagination.current_page,
                      pages: userPagination.last_page,
                      total: userPagination.total
                    })
                  }}
                </span>
              </template>
            </TPagination>
          </TCard>
        </template>
      </section>

      <section v-else-if="activeSection === 'outreach'">
        <header class="panel__head">
          <div>
            <h1 class="panel__title">{{ t('User outreach') }}</h1>
            <p class="panel__sub">
              {{ composing ? t('Compose a new outreach.') : t('Emails you have sent to users.') }}
            </p>
          </div>
          <TButton
            v-if="!composing"
            :text="t('New outreach')"
            :full-width="false"
            @click="composing = true"
          />
          <button v-else class="link-back" @click="composing = false">
            <ArrowLeft class="link-back__icon" />{{ t('Back') }}
          </button>
        </header>

        <TCard v-if="composing">
          <OutreachComposer @sent="onOutreachSent" />
        </TCard>
        <TCard v-else>
          <TDataTable v-if="outreaches.length" :columns="outreachColumns" :rows="outreaches">
            <template #cell-subject="{ value }"
              ><strong>{{ value }}</strong></template
            >
            <template #cell-created_at="{ row }">{{ formatDate(row.created_at) }}</template>
          </TDataTable>
          <p v-else class="state">{{ t('No outreaches yet') }}</p>
        </TCard>
      </section>

      <section v-else-if="activeSection === 'discounts'">
        <SectionPlaceholder
          :icon="IconDiscount"
          :title="t('Discounts and offers')"
          :body="
            t(
              'Create and target offers from pluggable offer providers, so promotions are configured, never hard-coded.'
            )
          "
        />
      </section>

      <section v-else-if="activeSection === 'usage'">
        <header class="panel__head">
          <div>
            <h1 class="panel__title">{{ t('AI usage') }}</h1>
            <p class="panel__sub">
              {{ t('Assistant token consumption for the selected period.') }}
            </p>
          </div>
        </header>
        <div v-if="loading" class="state">{{ t('Loading...') }}</div>
        <template v-else>
          <div class="kpis kpis--single">
            <div class="kpi tone-primary">
              <span class="kpi__icon"><Cpu /></span>
              <span class="kpi__value">{{ fmt(metricByKey('ai_tokens_used')?.value) }}</span>
              <span class="kpi__label">{{ t('AI tokens used') }}</span>
            </div>
          </div>
          <div class="grid-2">
            <TCard>
              <template #header>{{ t('Token usage') }}</template>
              <ClientOnly>
                <ApexChart
                  type="area"
                  height="240"
                  :options="areaOptions(tokenChart.categories, chartColors.primary)"
                  :series="[{ name: t('AI tokens'), data: tokenChart.data }]"
                />
              </ClientOnly>
            </TCard>
            <TCard>
              <template #header>{{ t('Tokens by user') }}</template>
              <ol v-if="tokenRanking.length" class="ranking">
                <li v-for="(row, k) in tokenRanking" :key="k" class="ranking-row">
                  <span class="ranking-rank">{{ k + 1 }}</span>
                  <span class="ranking-label">{{ row.label }}</span>
                  <span class="ranking-value">{{ fmt(row.value) }}</span>
                </li>
              </ol>
              <p v-else class="state">{{ t('No token usage yet') }}</p>
            </TCard>
          </div>
        </template>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  watch,
  h,
  defineAsyncComponent,
  type Component
} from 'vue';
import { useRouter } from 'vue-router';
import {
  LayoutDashboard,
  Globe,
  Users,
  UserPlus,
  CalendarDays,
  Activity,
  Send,
  Tag,
  Cpu,
  Search,
  ShieldCheck,
  ArrowLeft,
  MoreHorizontal,
  Eye,
  Gift
} from 'lucide-vue-next';
import IconDiscount from '~icons/solar/tag-price-bold-duotone';
import Logo from '@/components/Logo.vue';
import TCard from '@/components/TCard.vue';
import TButton from '@/components/TButton.vue';
import TDropdown from '@/components/TDropdown.vue';
import TDropdownItem from '@/components/TDropdownItem.vue';
import TDataTable, { type DataTableColumn } from '@/components/TDataTable.vue';
import TPagination from '@/components/TPagination.vue';
import OutreachComposer from '@/components/admin/OutreachComposer.vue';
import UserDetail from '@/components/admin/UserDetail.vue';
import {
  adminApi,
  type EngagementReport,
  type Metric,
  type AdminUser,
  type AdminUserPage,
  type OutreachSummary
} from '@/services/api/adminApi';

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin']
});

const { t } = useI18n();
const router = useRouter();
const { user } = useAuth();

const ApexChart = defineAsyncComponent(() => import('vue3-apexcharts'));
const chartColors = { primary: '#047844', income: '#16a34a' };

const SectionPlaceholder = (props: { icon: Component; title: string; body: string }) =>
  h('div', { class: 'placeholder' }, [
    h(props.icon, { class: 'placeholder__icon' }),
    h('h2', { class: 'placeholder__title' }, props.title),
    h('p', { class: 'placeholder__body' }, props.body),
    h('span', { class: 'placeholder__tag' }, t('Coming soon'))
  ]);

const sections = [
  { id: 'overview', label: t('Overview'), icon: LayoutDashboard },
  { id: 'demographics', label: t('Demographics'), icon: Globe },
  { id: 'users', label: t('Users'), icon: Users },
  { id: 'outreach', label: t('Outreach'), icon: Send },
  { id: 'discounts', label: t('Discounts'), icon: Tag },
  { id: 'usage', label: t('AI usage'), icon: Cpu }
];
const activeSection = ref('overview');
const userQuery = ref('');
const selectedUserId = ref<number | null>(null);
const composing = ref(false);
const outreaches = ref<OutreachSummary[]>([]);

const loading = ref(true);
const metricsError = ref('');
const report = ref<EngagementReport | null>(null);
const users = ref<AdminUser[]>([]);
const usersLoading = ref(false);
const joinedOn = ref<string | null>(null);
const userPagination = ref<AdminUserPage>({
  data: [],
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0
});
const days = ref(30);

const userColumns = computed<DataTableColumn[]>(() => [
  { key: 'name', label: t('Name') },
  { key: 'email', label: t('Email') },
  { key: 'last_seen_at', label: t('Last seen') },
  { key: 'last_transaction_at', label: t('Last transaction') },
  { key: 'created_at', label: t('Joined') },
  { key: 'tokens_used', label: t('AI tokens') },
  { key: 'actions', label: t('Actions'), align: 'right', width: '1%' }
]);

const outreachColumns = computed<DataTableColumn[]>(() => [
  { key: 'subject', label: t('Subject') },
  { key: 'audience', label: t('Audience') },
  { key: 'sent', label: t('Sent') },
  { key: 'created_at', label: t('Date') }
]);

const rangeOptions = [
  { days: 7, label: '7 days' },
  { days: 30, label: '30 days' },
  { days: 90, label: '90 days' }
];

const metricByKey = (key: string): Metric | undefined =>
  (report.value?.groups || []).flatMap((g) => g.metrics).find((m) => m.key === key);

const fmt = (n: number | null | undefined): string => new Intl.NumberFormat().format(n ?? 0);

const heroSummary = computed(() =>
  t('{users} users · {tx} transactions', {
    users: metricByKey('total_users')?.value ?? 0,
    tx: metricByKey('total_transactions')?.value ?? 0
  })
);

const kpis = computed(() => [
  {
    key: 'total_users',
    label: t('Total users'),
    value: fmt(metricByKey('total_users')?.value),
    icon: Users,
    tone: 'primary'
  },
  {
    key: 'today',
    label: t('Registered today'),
    value: fmt(metricByKey('registrations_today')?.value),
    icon: UserPlus,
    tone: 'income'
  },
  {
    key: 'month',
    label: t('Registered this month'),
    value: fmt(metricByKey('registrations_month')?.value),
    icon: CalendarDays,
    tone: 'info'
  },
  {
    key: 'avg',
    label: t('Avg transactions / user'),
    value: fmt(metricByKey('avg_transactions_per_user')?.value),
    icon: Activity,
    tone: 'accent'
  },
  {
    key: 'tokens',
    label: t('AI tokens used'),
    value: fmt(metricByKey('ai_tokens_used')?.value),
    icon: Cpu,
    tone: 'primary'
  }
]);

const chartFor = (key: string) => {
  const series = metricByKey(key)?.series || [];
  return { data: series.map((p) => p.value), categories: series.map((p) => p.date) };
};
const usersChart = computed(() => chartFor('new_users_series'));
const txChart = computed(() => chartFor('transactions_series'));
const tokenChart = computed(() => chartFor('ai_tokens_series'));
const tokenRanking = computed(() => metricByKey('ai_tokens_by_user')?.rows ?? []);

const rankings = computed(() =>
  ['most_active_users', 'most_used_features']
    .map((k) => metricByKey(k))
    .filter((m): m is Metric => !!m)
);

const demographicsMetrics = computed(
  () => (report.value?.groups || []).find((g) => g.key === 'demographics')?.metrics ?? []
);

const areaOptions = (categories: string[], color: string) => ({
  chart: { toolbar: { show: false }, zoom: { enabled: false }, fontFamily: 'inherit' },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 2 },
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.02 } },
  colors: [color],
  xaxis: {
    categories,
    labels: { show: false },
    axisTicks: { show: false },
    axisBorder: { show: false },
    tooltip: { enabled: false }
  },
  yaxis: { labels: { show: false } },
  grid: { borderColor: 'rgba(15,23,42,0.06)', padding: { left: 8, right: 8 } },
  tooltip: { x: { show: true } }
});

const exit = () => router.push('/dashboard');

const loadUsers = async (page = 1) => {
  usersLoading.value = true;
  try {
    const result = await adminApi.users({
      page,
      perPage: userPagination.value.per_page,
      search: userQuery.value.trim() || undefined,
      joinedOn: joinedOn.value || undefined
    });
    userPagination.value = result;
    users.value = result.data;
  } catch {
    users.value = [];
    userPagination.value = {
      ...userPagination.value,
      data: [],
      current_page: 1,
      last_page: 1,
      total: 0
    };
  } finally {
    usersLoading.value = false;
  }
};

const changeUserPage = (page: number) => loadUsers(page);

const clearJoinDate = () => {
  joinedOn.value = null;
  loadUsers();
};

const showSignupsForPoint = (
  _event: unknown,
  _chart: unknown,
  options: { dataPointIndex: number }
) => {
  const date = usersChart.value.categories[options.dataPointIndex];
  if (!date) return;
  joinedOn.value = date;
  activeSection.value = 'users';
  loadUsers();
};

const load = async () => {
  loading.value = true;
  metricsError.value = '';

  const [metricsResult] = await Promise.allSettled([
    adminApi.metrics({ days: days.value }),
    loadUsers()
  ]);

  if (metricsResult.status === 'fulfilled') {
    report.value = metricsResult.value;
  } else {
    report.value = null;
    metricsError.value = t('Metrics are not available yet.');
  }

  loading.value = false;
};

const setDays = (value: number) => {
  if (days.value === value) return;
  days.value = value;
  load();
};

const loadOutreaches = async () => {
  try {
    outreaches.value = await adminApi.outreachHistory();
  } catch {
    outreaches.value = [];
  }
};

const onOutreachSent = () => {
  composing.value = false;
  loadOutreaches();
};

const rowWidth = (rows: { value: number }[], value: number): string => {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return `${Math.max(4, Math.round((value / max) * 100))}%`;
};

const formatDate = (iso: string): string => (iso ? new Date(iso).toLocaleDateString() : '');
const formatDateTime = (iso: string): string =>
  iso ? new Date(iso).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '';

onMounted(() => {
  load();
  loadOutreaches();
});

let searchTimer: ReturnType<typeof setTimeout> | undefined;
watch(userQuery, () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => loadUsers(), 300);
});

onBeforeUnmount(() => clearTimeout(searchTimer));
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.console {
  display: grid;
  grid-template-columns: 256px 1fr;
  min-height: 100vh;

  @media (max-width: $breakpoint-md) {
    grid-template-columns: 1fr;
  }
}

.rail {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.25rem 1rem;
  background: $bg-white;
  border-right: 1px solid $border-color;
  position: sticky;
  top: 0;
  height: 100vh;

  @media (max-width: $breakpoint-md) {
    position: static;
    height: auto;
    border-right: none;
    border-bottom: 1px solid $border-color;
    gap: 1rem;
  }
}

.rail__brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.25rem 0.5rem;
}

.rail__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.15rem 0.5rem;
  border-radius: $radius-md;
  background: $primary-light;
  color: $primary-dark;
  font-size: $font-size-xs;
  font-weight: $font-semibold;
}

.rail__badge-icon {
  width: 13px;
  height: 13px;
}

.rail__nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  @media (max-width: $breakpoint-md) {
    flex-direction: row;
    overflow-x: auto;
  }
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.6rem 0.75rem;
  border: none;
  background: transparent;
  border-radius: $radius-lg;
  color: $text-secondary;
  font-size: $font-size-sm;
  font-weight: $font-medium;
  cursor: pointer;
  white-space: nowrap;
  transition: $transition-fast;

  &:hover {
    background: $bg-light;
  }

  &--active {
    background: $primary-light;
    color: $primary-dark;
    font-weight: $font-semibold;
  }
}

.nav-item__icon {
  width: 18px;
  height: 18px;
}

.rail__foot {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  @media (max-width: $breakpoint-md) {
    margin-top: 0;
  }
}

.rail__user {
  display: flex;
  flex-direction: column;
  padding: 0 0.5rem;
}

.rail__user-name {
  font-size: $font-size-sm;
  font-weight: $font-semibold;
  color: $text-primary;
}

.rail__user-email {
  font-size: $font-size-xs;
  color: $text-muted;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rail__exit {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 0.75rem;
  border: 1px solid $border-color;
  background: $bg-white;
  border-radius: $radius-lg;
  color: $text-primary;
  font-size: $font-size-sm;
  font-weight: $font-medium;
  cursor: pointer;

  &:hover {
    background: $bg-light;
  }
}

.rail__exit-icon {
  width: 16px;
  height: 16px;
}

.panel {
  padding: 1.75rem 2rem;
  min-width: 0;
  display: flex;
  flex-direction: column;

  @media (max-width: $breakpoint-sm) {
    padding: 1.25rem;
  }
}

.panel__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
}

.panel__title {
  margin: 0;
  font-size: 1.4rem;
  font-weight: $font-bold;
  color: $text-primary;
}

.panel__sub {
  margin: 0.25rem 0 0;
  font-size: $font-size-sm;
  color: $text-muted;
}

.range {
  display: flex;
  gap: 0.4rem;
}

.range-pill {
  border: 1px solid $border-color;
  background: $bg-white;
  border-radius: $radius-lg;
  padding: 0.4rem 0.8rem;
  font-size: $font-size-sm;
  color: $text-secondary;
  cursor: pointer;
  transition: $transition-fast;

  &--active {
    background: $primary;
    color: $text-inverse;
    border-color: $primary;
  }
}

.state {
  padding: 2rem;
  text-align: center;
  color: $text-muted;

  &--note {
    background: $bg-light;
    border-radius: $radius-xl;
  }
}

.pagination-info {
  font-variant-numeric: tabular-nums;
}

.kpis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.kpi {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto auto;
  column-gap: 0.75rem;
  align-items: center;
  padding: 1rem 1.1rem;
  background: $bg-white;
  border: 1px solid $border-color;
  border-radius: $radius-xl;
  box-shadow: $elevation-1;
}

.kpi__icon {
  grid-row: 1 / 3;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: $radius-lg;
  background: $bg-light;
  color: var(--tone, #{$primary});

  svg {
    width: 19px;
    height: 19px;
  }
}

.kpi__value {
  font-size: 1.45rem;
  font-weight: $font-bold;
  color: $text-primary;
  line-height: 1.1;
}

.kpi__label {
  font-size: $font-size-xs;
  color: $text-muted;
}

.kpi__sub {
  grid-column: 2;
  font-size: 0.65rem;
  font-weight: $font-semibold;
  color: var(--tone, #{$primary});
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.kpi.tone-primary {
  --tone: #{$primary};
}
.kpi.tone-income {
  --tone: #{$income};
}
.kpi.tone-info {
  --tone: #{$info};
}
.kpi.tone-accent {
  --tone: #{$accent-color};
}

.grid-2 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.25rem;
}

.ranking {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.ranking-row {
  display: grid;
  grid-template-columns: 1.25rem minmax(90px, 1fr) 2fr auto;
  align-items: center;
  gap: 0.6rem;
  font-size: $font-size-sm;
}

.ranking-rank {
  color: $text-muted;
  font-weight: $font-semibold;
  font-size: $font-size-xs;
}

.ranking-label {
  color: $text-primary;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ranking-bar {
  height: 7px;
  border-radius: 4px;
  background: $bg-gray;
  overflow: hidden;
}

.ranking-fill {
  display: block;
  height: 100%;
  border-radius: 4px;
  background: $primary;
}

.ranking-value {
  font-weight: $font-semibold;
  color: $text-primary;
  justify-self: end;
}

.search {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.7rem;
  background: $bg-white;
  border: 1px solid $border-color;
  border-radius: $radius-lg;

  &:focus-within {
    border-color: $primary;
  }
}

.search__icon {
  width: 15px;
  height: 15px;
  color: $text-muted;
}

.search__input {
  border: none;
  outline: none;
  background: transparent;
  font-size: $font-size-sm;
  color: $text-primary;
  width: 200px;
  max-width: 100%;
}

.row-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: 1px solid transparent;
  border-radius: $radius-md;
  background: transparent;
  color: $text-secondary;
  cursor: pointer;

  &:hover {
    background: $bg-light;
    border-color: $border-color;
  }

  svg {
    width: 18px;
    height: 18px;
  }
}

.item-icon {
  width: 16px;
  height: 16px;
}

.filter-chip {
  margin-top: 0.5rem;
  padding: 0.3rem 0.65rem;
  border: 1px solid $border-color;
  border-radius: $radius-lg;
  background: $primary-light;
  color: $primary-dark;
  font-size: $font-size-xs;
  cursor: pointer;
}

.kpis--single {
  grid-template-columns: minmax(220px, 320px);
}

.link-back {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border: none;
  background: transparent;
  color: $text-secondary;
  font-size: $font-size-sm;
  font-weight: $font-medium;
  cursor: pointer;

  &:hover {
    color: $primary;
  }
}

.link-back__icon {
  width: 16px;
  height: 16px;
}

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.6rem;
  padding: 3.5rem 1.5rem;
  background: $bg-white;
  border: 1px solid $border-color;
  border-radius: $radius-xl;
}

.placeholder__icon {
  width: 64px;
  height: 64px;
  color: $primary;
}

.placeholder__title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: $font-bold;
  color: $text-primary;
}

.placeholder__body {
  margin: 0;
  max-width: 460px;
  color: $text-muted;
  font-size: $font-size-sm;
  line-height: 1.5;
}

.placeholder__tag {
  margin-top: 0.5rem;
  padding: 0.3rem 0.8rem;
  border-radius: $radius-md;
  background: $primary-light;
  color: $primary-dark;
  font-size: $font-size-xs;
  font-weight: $font-semibold;
}
</style>
