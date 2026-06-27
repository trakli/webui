<template>
  <div v-if="loading" class="landing-insights" aria-hidden="true">
    <div class="skeleton spotlight-skeleton" />
    <div class="skeleton panel-skeleton" />
  </div>

  <div v-else-if="!hasData" class="landing-insights">
    <p class="empty-hint">
      <Lightbulb :size="16" />
      <span>{{ t("Add a few transactions and I'll start spotting trends for you.") }}</span>
    </p>
  </div>

  <div v-else class="landing-insights">
    <button
      v-if="currentSpotlight"
      type="button"
      class="spotlight"
      :title="t('Ask about this')"
      @click="pickSpotlight"
    >
      <span class="spotlight-spark"><Lightbulb :size="16" /></span>
      <Transition name="fade" mode="out-in">
        <span :key="spotlightIndex" class="spotlight-text">
          {{ t(currentSpotlight.key, currentSpotlight.params || {}) }}
        </span>
      </Transition>
    </button>

    <div
      ref="track"
      class="carousel"
      :style="{ height: panelHeight }"
      @scroll.passive="onScroll"
      @mouseenter="pause"
      @mouseleave="resume"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <!-- Panel 1: three warm cards on one row -->
      <section class="panel">
        <div class="stat-row">
          <article class="stat green" style="--i: 0">
            <ArtNetFlow class="stat-art" />
            <header class="stat-head">
              <span class="stat-coin"><IconNetFlow /></span>
              <span class="stat-label">{{ t('Net flow') }}</span>
            </header>
            <span class="stat-value" :class="net >= 0 ? 'pos' : 'neg'">{{ money(net) }}</span>
            <span class="stat-viz">
              <SparkLine
                v-if="trend.length >= 2"
                :values="trend"
                color="var(--color-primary)"
                :width="150"
                :height="34"
              />
            </span>
            <span class="stat-sub">
              {{ t('In') }} {{ money(income) }} &middot; {{ t('Out') }} {{ money(expenses) }}
            </span>
          </article>

          <article class="stat amber" style="--i: 1">
            <ArtSaved class="stat-art" />
            <header class="stat-head">
              <span class="stat-coin"><IconSaved /></span>
              <span class="stat-label">{{ t('Saved') }}</span>
            </header>
            <span class="stat-value">{{ savingsRate }}<i>%</i></span>
            <span class="stat-viz">
              <span class="ring" :style="{ '--p': savingsRate }"><span class="ring-hole" /></span>
            </span>
            <span class="stat-sub">{{ t('of income kept') }}</span>
          </article>

          <article class="stat blue" style="--i: 2">
            <ArtCategory class="stat-art" />
            <header class="stat-head">
              <span class="stat-coin"><IconCategory /></span>
              <span class="stat-label">{{ t('Top category') }}</span>
            </header>
            <span class="stat-value cat-name">{{ topCategory.name }}</span>
            <span class="stat-viz bars">
              <span v-for="c in topCategories" :key="c.name" class="vbar" :title="c.name">
                <span class="vbar-fill" :style="{ height: c.height }" />
              </span>
            </span>
            <span class="stat-sub">{{ topCategory.pct }}% {{ t('of spend') }}</span>
          </article>
        </div>
      </section>

      <!-- Panel 2: same warm pattern, cashflow hero + three cards -->
      <section class="panel">
        <article class="stat green wide" style="--i: 0">
          <ArtTrend class="stat-art stat-art--wide" />
          <header class="stat-head spread">
            <span class="stat-head-left">
              <span class="stat-coin"><IconTrend /></span>
              <span class="stat-label">{{ t('Cashflow trend') }}</span>
            </span>
            <span class="stat-value sm" :class="net >= 0 ? 'pos' : 'neg'">{{ money(net) }}</span>
          </header>
          <span class="stat-viz wide-viz">
            <SparkLine
              v-if="trend.length >= 2"
              :values="trend"
              color="var(--color-primary)"
              :width="560"
              :height="58"
            />
            <span v-else class="stat-sub">{{ t('Not enough history yet') }}</span>
          </span>
        </article>

        <div class="stat-row">
          <article class="stat blue" style="--i: 1">
            <ArtTransactions class="stat-art" />
            <header class="stat-head">
              <span class="stat-coin"><IconTransactions /></span>
              <span class="stat-label">{{ t('Transactions') }}</span>
            </header>
            <span class="stat-value">{{ txCount }}</span>
            <span class="stat-sub">{{ t('this month') }}</span>
          </article>

          <article class="stat amber" style="--i: 2">
            <ArtAvg class="stat-art" />
            <header class="stat-head">
              <span class="stat-coin"><IconAvg /></span>
              <span class="stat-label">{{ t('Avg expense') }}</span>
            </header>
            <span class="stat-value">{{ money(avgExpense) }}</span>
            <span class="stat-sub">{{ t('per transaction') }}</span>
          </article>

          <article class="stat rose" style="--i: 3">
            <ArtBiggest class="stat-art" />
            <header class="stat-head">
              <span class="stat-coin"><IconBiggest /></span>
              <span class="stat-label">{{ t('Biggest expense') }}</span>
            </header>
            <span class="stat-value cat-name">{{ biggestExpense }}</span>
            <span class="stat-sub">{{ t('top destination') }}</span>
          </article>
        </div>
      </section>
    </div>

    <div class="dots" role="tablist">
      <button
        v-for="(label, i) in panelLabels"
        :key="i"
        type="button"
        class="dot"
        :class="{ active: activeIndex === i }"
        :aria-label="label"
        @click="goTo(i, true)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import { Lightbulb } from 'lucide-vue-next';
// Solid (-bold) glyphs for the small chips, duotone (-bold-duotone) for the
// large watermarks.
import IconNetFlow from '~icons/solar/transfer-vertical-bold';
import IconSaved from '~icons/solar/safe-2-bold';
import IconCategory from '~icons/solar/pie-chart-2-bold';
import IconTrend from '~icons/solar/graph-new-bold';
import IconTransactions from '~icons/solar/bill-list-bold';
import IconAvg from '~icons/solar/wad-of-money-bold';
import IconBiggest from '~icons/solar/shop-2-bold';
import ArtNetFlow from '~icons/solar/transfer-vertical-bold-duotone';
import ArtSaved from '~icons/solar/safe-2-bold-duotone';
import ArtCategory from '~icons/solar/pie-chart-2-bold-duotone';
import ArtTrend from '~icons/solar/graph-new-bold-duotone';
import ArtTransactions from '~icons/solar/bill-list-bold-duotone';
import ArtAvg from '~icons/solar/wad-of-money-bold-duotone';
import ArtBiggest from '~icons/solar/shop-2-bold-duotone';
import SparkLine from '@/components/reports/SparkLine.vue';
import { useStatistics, type WalletStatistics } from '@/composables/useStatistics';
import { useSharedData } from '@/composables/useSharedData';
import { buildSpotlightInsights, type SpotlightInsight } from '@/utils/landingInsights';

const emit = defineEmits<{ (e: 'pick', prompt: string): void }>();

const SPOTLIGHT_ROTATE_MS = 5000;
const PANEL_ADVANCE_MS = 6000;

const { t } = useI18n();
const { getStatistics, formatCompactCurrency } = useStatistics();
const { getDefaultCurrency, loadWallets } = useSharedData();

const stats = ref<WalletStatistics | null>(null);
const loading = ref(true);

const money = (amount: number): string =>
  formatCompactCurrency(amount || 0, getDefaultCurrency.value || 'USD');
const round = (n: number) => Math.round(n);

const hasData = computed(() => {
  const s = stats.value;
  if (!s) return false;
  return (s.transaction_count || 0) > 0 || (s.total_expenses || 0) > 0 || (s.total_income || 0) > 0;
});

const income = computed(() => stats.value?.total_income || 0);
const expenses = computed(() => stats.value?.total_expenses || 0);
const net = computed(() => income.value - expenses.value);

const savingsRate = computed(() =>
  Math.max(
    0,
    Math.min(100, round((stats.value?.expense_insights?.budget_analysis?.savings_rate || 0) * 100))
  )
);

const topCategory = computed(() => {
  const c = stats.value?.expense_insights?.biggest_category;
  return { name: c?.category || t('N/A'), pct: round(c?.percentage || 0) };
});

const topCategories = computed(() => {
  const list = stats.value?.expense_insights?.top_categories || [];
  const max = Math.max(...list.map((c) => c.percentage), 1);
  return list.slice(0, 4).map((c) => ({
    name: c.category,
    pct: round(c.percentage),
    height: `${Math.max(14, (c.percentage / max) * 100)}%`
  }));
});

const trend = computed(() => (stats.value?.time_analysis?.monthly_trends || []).map((m) => m.net));
const txCount = computed(() => stats.value?.transaction_count || 0);
const avgExpense = computed(() => stats.value?.expense_insights?.average_transaction || 0);
const biggestExpense = computed(
  () => stats.value?.expense_insights?.biggest_expense?.party || t('N/A')
);

/* Spotlight */
const spotlights = computed<SpotlightInsight[]>(() => buildSpotlightInsights(stats.value, money));
const spotlightIndex = ref(0);
const currentSpotlight = computed(() => spotlights.value[spotlightIndex.value] || null);
const pickSpotlight = () => {
  const s = currentSpotlight.value;
  if (s) emit('pick', t(s.prompt, s.promptParams || {}));
};

/* Carousel */
const track = ref<HTMLElement | null>(null);
const activeIndex = ref(0);
const panelLabels = computed(() => [t('Pulse'), t('Trends')]);
const reducedMotion = () =>
  typeof window !== 'undefined' &&
  !!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

const panelHeight = ref<string>('auto');
const measure = (i = activeIndex.value) => {
  const panel = track.value?.children[i] as HTMLElement | undefined;
  if (panel) panelHeight.value = `${panel.offsetHeight}px`;
};

let scrollRaf = 0;
const onScroll = () => {
  if (scrollRaf) return;
  scrollRaf = requestAnimationFrame(() => {
    scrollRaf = 0;
    const el = track.value;
    if (el) activeIndex.value = Math.round(el.scrollLeft / el.clientWidth);
  });
};
const goTo = (i: number, manual = false) => {
  const el = track.value;
  if (el) el.scrollTo({ left: i * el.clientWidth, behavior: reducedMotion() ? 'auto' : 'smooth' });
  measure(i);
  if (manual) bumpAuto();
};

watch(activeIndex, (i) => measure(i));

/* Auto-advance, paused while the user hovers or drags */
const paused = ref(false);
let autoTimer: ReturnType<typeof setInterval> | null = null;
const pause = () => (paused.value = true);
const resume = () => (paused.value = false);
const startAuto = () => {
  if (autoTimer || reducedMotion()) return;
  autoTimer = setInterval(() => {
    if (paused.value) return;
    goTo((activeIndex.value + 1) % panelLabels.value.length);
  }, PANEL_ADVANCE_MS);
};
const bumpAuto = () => {
  if (!autoTimer || reducedMotion()) return;
  clearInterval(autoTimer);
  autoTimer = null;
  startAuto();
};

/* Mouse drag-to-swipe (touch/trackpad already work natively) */
let dragging = false;
let startX = 0;
let startScroll = 0;
const onPointerDown = (e: PointerEvent) => {
  if (e.pointerType !== 'mouse') return;
  dragging = true;
  paused.value = true;
  startX = e.clientX;
  startScroll = track.value?.scrollLeft || 0;
};
const onPointerMove = (e: PointerEvent) => {
  if (!dragging || !track.value) return;
  track.value.scrollLeft = startScroll - (e.clientX - startX);
};
const onPointerUp = () => {
  dragging = false;
  paused.value = false;
};

/* Spotlight rotation */
let rotateTimer: ReturnType<typeof setInterval> | null = null;
const startRotation = () => {
  if (rotateTimer || reducedMotion() || spotlights.value.length <= 1) return;
  rotateTimer = setInterval(() => {
    spotlightIndex.value = (spotlightIndex.value + 1) % spotlights.value.length;
  }, SPOTLIGHT_ROTATE_MS);
};

onMounted(async () => {
  try {
    await loadWallets();
    stats.value = await getStatistics(null, 'current_month');
  } catch {
    stats.value = null;
  } finally {
    loading.value = false;
  }
  if (hasData.value) {
    await nextTick();
    measure();
    window.addEventListener('resize', onResize);
    startRotation();
    startAuto();
  }
});

const onResize = () => measure();

onBeforeUnmount(() => {
  if (rotateTimer) clearInterval(rotateTimer);
  if (autoTimer) clearInterval(autoTimer);
  if (scrollRaf) cancelAnimationFrame(scrollRaf);
  window.removeEventListener('resize', onResize);
});
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.landing-insights {
  width: 100%;
  max-width: 680px;
  margin: $spacing-4 auto 0;
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
}

.empty-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-2;
  margin: 0;
  padding: $spacing-3 $spacing-4;
  border-radius: 14px;
  background: $bg-gray;
  color: $text-muted;
  font-size: $font-size-sm;

  svg {
    color: $warning;
  }
}

/* Spotlight: a quiet insight banner, no saturated fill */
.spotlight {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  width: 100%;
  padding: $spacing-2 $spacing-3;
  border: 1px solid $border-light;
  border-radius: 12px;
  background: $bg-light;
  color: $text-primary;
  font-size: $font-size-sm;
  text-align: left;
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    background: $bg-gray;
    border-color: $border-medium;
  }
}

.spotlight-spark {
  display: inline-flex;
  color: $warning;
  flex-shrink: 0;
}

.spotlight-text {
  font-weight: $font-medium;
}

/* Carousel: height is set inline to the active panel and animates between them */
.carousel {
  display: flex;
  align-items: flex-start;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  -ms-overflow-style: none;
  transition: height 0.35s cubic-bezier(0.2, 0.7, 0.2, 1);

  &::-webkit-scrollbar {
    display: none;
  }
}

.panel {
  flex: 0 0 100%;
  scroll-snap-align: start;
  min-width: 0;
  padding: 2px;
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
}

/* One row of cards */
.stat-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-3;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
}

/* Shared warm card, used in both swipes */
.stat {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: $spacing-3 $spacing-4;
  border-radius: 18px;
  border: 1px solid;
  min-width: 0;
  min-height: 132px;
  animation: rise 0.5s cubic-bezier(0.2, 0.7, 0.2, 1) backwards;
  animation-delay: calc(var(--i) * 80ms);

  > *:not(.stat-art) {
    position: relative;
    z-index: 1;
  }

  &.wide {
    min-height: auto;
  }

  &.green {
    background: linear-gradient(
      135deg,
      rgba(var(--color-primary-rgb), 0.13),
      rgba(var(--color-primary-rgb), 0.02)
    );
    border-color: rgba(var(--color-primary-rgb), 0.18);
  }
  &.amber {
    background: linear-gradient(
      135deg,
      rgba(var(--color-warning-rgb), 0.17),
      rgba(var(--color-warning-rgb), 0.03)
    );
    border-color: rgba(var(--color-warning-rgb), 0.22);
  }
  &.blue {
    background: linear-gradient(
      135deg,
      rgba(var(--color-info-rgb), 0.13),
      rgba(var(--color-info-rgb), 0.02)
    );
    border-color: rgba(var(--color-info-rgb), 0.18);
  }
  &.rose {
    background: linear-gradient(
      135deg,
      rgba(var(--color-error-rgb), 0.11),
      rgba(var(--color-error-rgb), 0.02)
    );
    border-color: rgba(var(--color-error-rgb), 0.16);
  }
}

.stat-art {
  position: absolute;
  right: -14px;
  bottom: -16px;
  width: 104px;
  height: 104px;
  z-index: 0;
  opacity: 0.16;
  pointer-events: none;
  transform: rotate(-6deg);

  &--wide {
    width: 120px;
    height: 120px;
  }

  .green & {
    color: $primary;
  }
  .amber & {
    color: $warning;
  }
  .blue & {
    color: $info;
  }
  .rose & {
    color: $error-color;
  }
}

.stat-head {
  display: flex;
  align-items: center;
  gap: 8px;

  &.spread {
    justify-content: space-between;
  }
}

.stat-head-left {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.stat-coin {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 26px;
    height: 26px;
  }

  .green & {
    color: $primary;
  }
  .amber & {
    color: $warning;
  }
  .blue & {
    color: $info;
  }
  .rose & {
    color: $error-color;
  }
}

.stat-label {
  font-size: $font-size-xs;
  font-weight: $font-semibold;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: $text-muted;
}

.stat-value {
  font-size: $font-size-xl;
  font-weight: $font-bold;
  color: $text-primary;
  line-height: 1.1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  i {
    font-style: normal;
    font-size: $font-size-base;
    color: $text-muted;
  }
  &.sm {
    font-size: $font-size-base;
  }
  &.pos {
    color: $primary;
  }
  &.neg {
    color: $error-color;
  }
  &.cat-name {
    text-transform: capitalize;
    font-size: $font-size-lg;
  }
}

.stat-viz {
  margin-top: auto;
  display: flex;
  align-items: flex-end;
  min-height: 34px;

  :deep(.sparkline) {
    width: 100%;
    height: 34px;
  }

  &.bars {
    gap: 5px;
    height: 34px;
  }

  &.wide-viz :deep(.sparkline) {
    height: 58px;
  }
}

.vbar {
  width: 13px;
  height: 100%;
  display: flex;
  align-items: flex-end;
  border-radius: 5px;
  background: rgba(var(--color-info-rgb), 0.14);
  overflow: hidden;
}

.vbar-fill {
  width: 100%;
  background: $info;
  border-radius: 5px;
  transform-origin: bottom;
  animation: growY 0.6s cubic-bezier(0.2, 0.7, 0.2, 1) backwards;
  animation-delay: 0.2s;
}

.ring {
  --p: 0;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: conic-gradient($warning calc(var(--p) * 1%), rgba(var(--color-warning-rgb), 0.18) 0);
}

.ring-hole {
  width: 31px;
  height: 31px;
  border-radius: 50%;
  background: $bg-white;
}

.stat-sub {
  font-size: $font-size-xs;
  color: $text-secondary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Dots */
.dots {
  display: flex;
  justify-content: center;
  gap: 7px;
}

.dot {
  width: 7px;
  height: 7px;
  padding: 0;
  border: none;
  border-radius: 999px;
  background: $border-medium;
  cursor: pointer;
  transition: all 0.25s ease;

  &.active {
    width: 22px;
    background: $primary;
  }
}

/* Skeleton + motion */
.skeleton {
  border-radius: 16px;
  background: linear-gradient(90deg, $bg-gray 25%, $bg-light 50%, $bg-gray 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}

.spotlight-skeleton {
  height: 42px;
}
.panel-skeleton {
  height: 150px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes growY {
  from {
    transform: scaleY(0);
  }
  to {
    transform: scaleY(1);
  }
}

@keyframes shimmer {
  from {
    background-position: 200% 0;
  }
  to {
    background-position: -200% 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton,
  .stat,
  .vbar-fill {
    animation: none;
  }
  .fade-enter-active,
  .fade-leave-active {
    transition: none;
  }
  .carousel {
    scroll-behavior: auto;
    transition: none;
  }
}
</style>
