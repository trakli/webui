<template>
  <Transition name="story-root">
    <div v-if="open" ref="rootRef" class="story-root" role="dialog" aria-modal="true" tabindex="-1">
      <div class="story-frame" :class="`tone--${currentSlide?.tone || 'opening'}`">
        <div v-if="slides.length" class="bars">
          <span
            v-for="(_, i) in slides"
            :key="i"
            class="bar"
            :class="{
              'bar--filled': i < currentIndex,
              'bar--active': i === currentIndex
            }"
          >
            <span
              v-if="i === currentIndex"
              class="bar-fill"
              :class="{ 'bar-fill--paused': paused }"
              :style="{ animationDuration: `${SLIDE_MS}ms` }"
              @animationend="next"
            />
          </span>
        </div>

        <header class="story-head">
          <div class="story-id">
            <Calendar :size="14" class="story-dot-icon" />
            <span class="story-month">{{ data?.monthLabel || t('Month in review') }}</span>
          </div>
          <button class="story-close" :aria-label="t('Close')" @click="$emit('close')">
            <X :size="20" />
          </button>
        </header>

        <button class="tap-zone tap-zone--prev" :aria-label="t('Previous')" @click="prev">
          <span class="tap-hint tap-hint--left">
            <ChevronLeft :size="20" />
            <span class="tap-hint-label">{{ t('Prev') }}</span>
          </span>
        </button>
        <button class="tap-zone tap-zone--next" :aria-label="t('Next')" @click="next">
          <span class="tap-hint tap-hint--right">
            <span class="tap-hint-label">{{ t('Next') }}</span>
            <ChevronRight :size="20" />
          </span>
        </button>
        <button
          class="tap-zone tap-zone--pause"
          :aria-label="paused ? t('Resume') : t('Pause')"
          @click="togglePause"
        />

        <Transition name="slide-swap" mode="out-in">
          <div v-if="!data" :key="'empty'" class="slide slide--empty">
            <CalendarOff :size="48" />
            <p class="slide-msg">{{ t('No data for the latest month yet.') }}</p>
          </div>
          <div
            v-else
            :key="currentIndex"
            class="slide"
            :class="{ 'slide--flip': currentIndex % 2 === 1 }"
          >
            <div class="illustration-panel">
              <svg
                class="illustration"
                viewBox="0 0 600 600"
                preserveAspectRatio="xMidYMid slice"
                aria-hidden="true"
              >
                <defs>
                  <radialGradient :id="`grad-${currentSlide?.kind}`" cx="50%" cy="50%" r="60%">
                    <stop offset="0%" stop-color="var(--slide-accent)" stop-opacity="0.7" />
                    <stop offset="100%" stop-color="var(--slide-accent)" stop-opacity="0.05" />
                  </radialGradient>
                  <pattern
                    :id="`dots-${currentSlide?.kind}`"
                    width="24"
                    height="24"
                    patternUnits="userSpaceOnUse"
                  >
                    <circle cx="2" cy="2" r="1.4" fill="var(--slide-deep)" opacity="0.18" />
                  </pattern>
                </defs>

                <g v-if="currentSlide?.kind === 'opening'">
                  <rect
                    x="0"
                    y="0"
                    width="600"
                    height="600"
                    :fill="`url(#dots-${currentSlide?.kind})`"
                  />
                  <circle cx="300" cy="620" r="320" :fill="`url(#grad-${currentSlide?.kind})`" />
                  <g
                    transform="translate(300 620)"
                    stroke="var(--slide-deep)"
                    stroke-width="6"
                    stroke-linecap="round"
                    opacity="0.55"
                  >
                    <line
                      v-for="i in 12"
                      :key="i"
                      :x1="0"
                      :y1="-330"
                      :x2="0"
                      :y2="-380"
                      :transform="`rotate(${(i - 6) * 15})`"
                    />
                  </g>
                  <circle cx="300" cy="620" r="180" fill="var(--slide-accent)" opacity="0.5" />
                  <circle cx="300" cy="620" r="110" fill="var(--slide-deep)" opacity="0.85" />
                  <circle cx="120" cy="120" r="10" fill="var(--slide-deep)" opacity="0.6" />
                  <circle cx="500" cy="80" r="14" fill="var(--slide-accent)" opacity="0.85" />
                  <circle cx="540" cy="220" r="6" fill="var(--slide-deep)" opacity="0.7" />
                  <circle cx="80" cy="280" r="8" fill="var(--slide-accent)" opacity="0.7" />
                </g>

                <g v-else-if="currentSlide?.kind === 'income'">
                  <rect
                    x="0"
                    y="0"
                    width="600"
                    height="600"
                    :fill="`url(#dots-${currentSlide?.kind})`"
                  />
                  <path
                    d="M 0 600 L 0 510 L 80 470 L 160 410 L 240 340 L 320 260 L 400 200 L 480 130 L 560 70 L 600 50 L 600 600 Z"
                    :fill="`url(#grad-${currentSlide?.kind})`"
                  />
                  <path
                    d="M 0 510 L 80 470 L 160 410 L 240 340 L 320 260 L 400 200 L 480 130 L 560 70 L 600 50"
                    fill="none"
                    stroke="var(--slide-deep)"
                    stroke-width="5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <g
                    v-for="(p, i) in [
                      [80, 470],
                      [160, 410],
                      [240, 340],
                      [320, 260],
                      [400, 200],
                      [480, 130],
                      [560, 70]
                    ]"
                    :key="i"
                  >
                    <circle
                      :cx="p[0]"
                      :cy="p[1]"
                      r="10"
                      fill="var(--slide-bg)"
                      stroke="var(--slide-deep)"
                      stroke-width="4"
                    />
                  </g>
                  <g v-for="(b, i) in [70, 140, 210, 280, 350, 420, 490]" :key="`b-${i}`">
                    <rect
                      :x="b"
                      y="540"
                      width="40"
                      :height="40 + i * 14"
                      rx="6"
                      fill="var(--slide-deep)"
                      opacity="0.16"
                    />
                  </g>
                </g>

                <g v-else-if="currentSlide?.kind === 'spending'">
                  <rect
                    x="0"
                    y="0"
                    width="600"
                    height="600"
                    :fill="`url(#dots-${currentSlide?.kind})`"
                  />
                  <circle cx="300" cy="300" r="260" fill="var(--slide-accent)" opacity="0.14" />
                  <circle
                    cx="300"
                    cy="300"
                    r="210"
                    fill="none"
                    stroke="var(--slide-deep)"
                    stroke-width="30"
                    stroke-dasharray="380 1320"
                    stroke-linecap="round"
                    opacity="0.85"
                    transform="rotate(-90 300 300)"
                  />
                  <circle
                    cx="300"
                    cy="300"
                    r="210"
                    fill="none"
                    stroke="var(--slide-accent)"
                    stroke-width="30"
                    stroke-dasharray="260 1320"
                    stroke-linecap="round"
                    opacity="0.95"
                    transform="rotate(38 300 300)"
                  />
                  <circle
                    cx="300"
                    cy="300"
                    r="210"
                    fill="none"
                    stroke="var(--slide-deep)"
                    stroke-width="30"
                    stroke-dasharray="180 1320"
                    stroke-linecap="round"
                    opacity="0.6"
                    transform="rotate(96 300 300)"
                  />
                  <circle
                    cx="300"
                    cy="300"
                    r="210"
                    fill="none"
                    stroke="var(--slide-accent)"
                    stroke-width="30"
                    stroke-dasharray="120 1320"
                    stroke-linecap="round"
                    opacity="0.45"
                    transform="rotate(146 300 300)"
                  />
                  <circle cx="300" cy="300" r="150" fill="var(--slide-bg)" />
                  <circle cx="300" cy="300" r="120" fill="var(--slide-accent)" opacity="0.25" />
                </g>

                <g v-else-if="currentSlide?.kind === 'topCategory'">
                  <rect
                    x="0"
                    y="0"
                    width="600"
                    height="600"
                    :fill="`url(#dots-${currentSlide?.kind})`"
                  />
                  <g
                    transform="translate(300 300)"
                    stroke="var(--slide-deep)"
                    stroke-width="5"
                    stroke-linecap="round"
                    opacity="0.55"
                  >
                    <line
                      v-for="i in 18"
                      :key="i"
                      x1="0"
                      y1="-240"
                      x2="0"
                      y2="-280"
                      :transform="`rotate(${i * 20})`"
                    />
                  </g>
                  <circle cx="300" cy="300" r="220" fill="var(--slide-accent)" opacity="0.18" />
                  <circle cx="300" cy="300" r="170" fill="var(--slide-accent)" opacity="0.32" />
                  <circle cx="300" cy="300" r="120" fill="var(--slide-deep)" opacity="0.9" />
                  <g transform="translate(300 300)" fill="var(--slide-bg)">
                    <polygon
                      points="0,-58 17,-18 60,-18 25,8 40,52 0,26 -40,52 -25,8 -60,-18 -17,-18"
                    />
                  </g>
                </g>

                <g v-else-if="currentSlide?.kind === 'topPayee'">
                  <rect
                    x="0"
                    y="0"
                    width="600"
                    height="600"
                    :fill="`url(#dots-${currentSlide?.kind})`"
                  />
                  <path
                    d="M 300 200 C 240 130 100 130 100 270 C 100 380 220 460 300 510 C 380 460 500 380 500 270 C 500 130 360 130 300 200 Z"
                    :fill="`url(#grad-${currentSlide?.kind})`"
                  />
                  <path
                    d="M 300 240 C 260 190 170 190 170 280 C 170 350 240 410 300 440 C 360 410 430 350 430 280 C 430 190 340 190 300 240 Z"
                    fill="var(--slide-deep)"
                    opacity="0.85"
                  />
                  <g fill="var(--slide-accent)">
                    <path
                      d="M 90 110 C 78 100 56 100 56 122 C 56 138 74 152 90 162 C 106 152 124 138 124 122 C 124 100 102 100 90 110 Z"
                      opacity="0.8"
                    />
                    <path
                      d="M 510 110 C 498 100 476 100 476 122 C 476 138 494 152 510 162 C 526 152 544 138 544 122 C 544 100 522 100 510 110 Z"
                      opacity="0.7"
                    />
                    <path
                      d="M 60 470 C 52 463 38 463 38 477 C 38 487 50 496 60 503 C 70 496 82 487 82 477 C 82 463 68 463 60 470 Z"
                      opacity="0.6"
                    />
                    <path
                      d="M 540 480 C 530 471 510 471 510 491 C 510 505 526 517 540 526 C 554 517 570 505 570 491 C 570 471 550 471 540 480 Z"
                      opacity="0.55"
                    />
                  </g>
                </g>

                <g v-else-if="currentSlide?.kind === 'biggest'">
                  <rect
                    x="0"
                    y="0"
                    width="600"
                    height="600"
                    :fill="`url(#dots-${currentSlide?.kind})`"
                  />
                  <circle cx="300" cy="300" r="280" :fill="`url(#grad-${currentSlide?.kind})`" />
                  <g
                    transform="translate(300 300)"
                    stroke="var(--slide-deep)"
                    stroke-width="6"
                    stroke-linecap="round"
                    opacity="0.7"
                  >
                    <line
                      v-for="i in 16"
                      :key="i"
                      x1="0"
                      y1="-160"
                      x2="0"
                      y2="-230"
                      :transform="`rotate(${i * 22.5})`"
                    />
                  </g>
                  <circle cx="300" cy="300" r="140" fill="var(--slide-accent)" opacity="0.5" />
                  <circle cx="300" cy="300" r="100" fill="var(--slide-deep)" opacity="0.95" />
                  <g transform="translate(300 300)" fill="var(--slide-bg)">
                    <path
                      d="M 0 -54 C 25 -30 35 -10 30 14 C 40 6 50 -4 54 -16 C 68 -2 72 22 60 42 C 48 60 24 70 0 70 C -24 70 -48 60 -60 42 C -72 22 -68 -2 -54 -16 C -50 -4 -40 6 -30 14 C -35 -10 -25 -30 0 -54 Z"
                    />
                  </g>
                </g>

                <g v-else-if="currentSlide?.kind === 'closing'">
                  <rect
                    x="0"
                    y="0"
                    width="600"
                    height="600"
                    :fill="`url(#dots-${currentSlide?.kind})`"
                  />
                  <circle cx="300" cy="300" r="260" :fill="`url(#grad-${currentSlide?.kind})`" />
                  <circle cx="300" cy="300" r="170" fill="var(--slide-accent)" opacity="0.4" />
                  <circle cx="300" cy="300" r="110" fill="var(--slide-deep)" opacity="0.9" />
                  <g
                    transform="translate(300 300)"
                    stroke="var(--slide-bg)"
                    stroke-width="6"
                    stroke-linecap="round"
                  >
                    <polyline points="-32,4 -10,28 36,-26" fill="none" />
                  </g>
                  <g>
                    <rect
                      v-for="(p, i) in confettiDots"
                      :key="i"
                      :x="p.x - p.r"
                      :y="p.y - p.r"
                      :width="p.r * 2"
                      :height="p.r * 2"
                      :fill="p.fill"
                      :opacity="p.o"
                      :transform="`rotate(${(i * 37) % 360} ${p.x} ${p.y})`"
                      rx="2"
                    />
                  </g>
                </g>
              </svg>
            </div>

            <div class="slide-body" :class="`align--${currentSlide?.align || 'center'}`">
              <span class="slide-eyebrow">{{ currentSlide?.eyebrow }}</span>
              <component
                :is="currentSlide.icon"
                v-if="currentSlide?.icon"
                :size="28"
                class="slide-icon"
              />
              <h2 class="slide-headline">
                <template v-if="currentSlide?.value != null">
                  {{ formatter(animatedValue, currency) }}
                </template>
                <template v-else>
                  {{ currentSlide?.headline }}
                </template>
              </h2>
              <p v-if="currentSlide?.detail" class="slide-detail">{{ currentSlide.detail }}</p>
              <p v-if="currentSlide?.footnote" class="slide-footnote">
                {{ currentSlide.footnote }}
              </p>
            </div>
          </div>
        </Transition>

        <footer v-if="data" class="story-foot">
          <button
            class="foot-btn foot-btn--text"
            :class="{ 'foot-btn--disabled': currentIndex === 0 }"
            :aria-label="t('Previous slide')"
            @click="prev"
          >
            <ChevronLeft :size="18" />
            <span>{{ t('Prev') }}</span>
          </button>
          <span class="counter">{{ currentIndex + 1 }} / {{ slides.length }}</span>
          <button
            class="foot-btn"
            :aria-label="paused ? t('Resume') : t('Pause')"
            @click="togglePause"
          >
            <Pause v-if="!paused" :size="14" />
            <Play v-else :size="14" />
          </button>
          <button
            class="foot-btn foot-btn--text foot-btn--cta"
            :aria-label="t('Next slide')"
            @click="next"
          >
            <span>{{ t('Next') }}</span>
            <ChevronRight :size="18" />
          </button>
        </footer>

        <Transition name="hint-fade">
          <div v-if="data && showFirstHint" class="first-hint">
            <Keyboard :size="14" />
            <span>{{ t('Click sides, use arrow keys, or use the controls below.') }}</span>
          </div>
        </Transition>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import {
  X,
  Calendar,
  CalendarOff,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ShoppingBag,
  Award,
  Heart,
  Flame,
  PartyPopper,
  Keyboard,
  Pause,
  Play
} from 'lucide-vue-next';

const { t } = useI18n();

const props = defineProps({
  open: { type: Boolean, default: false },
  data: { type: Object, default: null },
  currency: { type: String, default: 'USD' },
  formatter: { type: Function, default: (n) => `${Math.round(n)}` }
});

const emit = defineEmits(['close']);

const SLIDE_MS = 5200;

const currentIndex = ref(0);
const paused = ref(false);
const rootRef = ref(null);
const animatedValue = ref(0);
const showFirstHint = ref(false);
let hintTimer = null;

const monthDescriptor = (rate) => {
  if (rate >= 0.3) return t('A stellar month.');
  if (rate >= 0.2) return t('A healthy month.');
  if (rate >= 0.1) return t('A steady month.');
  if (rate >= 0) return t('You broke even.');
  return t('A heavy month.');
};

const closingHeadline = (rate) => {
  if (rate >= 0.2)
    return t('You kept {n} of every $100 earned.', { n: `$${Math.round(rate * 100)}` });
  if (rate >= 0.1)
    return t('You set aside about 1 in {n} dollars.', { n: Math.round(1 / Math.max(rate, 0.01)) });
  if (rate >= 0) return t('Income and spending nearly cancelled out.');
  return t('You spent more than you earned this month.');
};

const slides = computed(() => {
  const d = props.data;
  if (!d) return [];
  const out = [];
  const cadence =
    d.transactionCount > 0 ? Math.max(1, Math.round(d.daysInMonth / d.transactionCount)) : 0;

  out.push({
    kind: 'opening',
    tone: 'opening',
    align: 'center',
    eyebrow: d.monthLabel,
    headline: monthDescriptor(d.savingsRate),
    detail: t('Here is your recap.')
  });

  out.push({
    kind: 'income',
    tone: 'income',
    align: 'left',
    eyebrow: t('Cash in'),
    icon: TrendingUp,
    value: d.income,
    detail: d.income > 0 ? t('Money you brought home this month.') : t('No income recorded.')
  });

  if (d.expense > 0) {
    out.push({
      kind: 'spending',
      tone: 'spending',
      align: 'left',
      eyebrow: t('Cash out'),
      icon: ShoppingBag,
      value: d.expense,
      detail: t('Where your spending went.'),
      footnote: d.topCategory ? t('{name} led the way.', { name: d.topCategory.name }) : ''
    });
  }

  if (d.topCategory) {
    out.push({
      kind: 'topCategory',
      tone: 'topCategory',
      align: 'center',
      eyebrow: t('Top category'),
      icon: Award,
      headline: d.topCategory.name,
      detail: props.formatter(d.topCategory.amount, props.currency),
      footnote:
        d.expense > 0
          ? t('{n}% of your spending.', {
              n: Math.round((d.topCategory.amount / d.expense) * 100)
            })
          : ''
    });
  }

  if (d.topPayee) {
    out.push({
      kind: 'topPayee',
      tone: 'topPayee',
      align: 'center',
      eyebrow: t('Your favourite'),
      icon: Heart,
      headline: d.topPayee.name,
      detail: props.formatter(d.topPayee.amount, props.currency),
      footnote: t('Total spent with this party.')
    });
  }

  if (d.biggestExpense) {
    out.push({
      kind: 'biggest',
      tone: 'biggest',
      align: 'center',
      eyebrow: t('Biggest single expense'),
      icon: Flame,
      value: d.biggestExpense.amount,
      detail: d.biggestExpense.party,
      footnote: d.biggestExpense.category ? t('in {name}', { name: d.biggestExpense.category }) : ''
    });
  }

  out.push({
    kind: 'closing',
    tone: 'closing',
    align: 'center',
    eyebrow: t('The recap'),
    icon: PartyPopper,
    headline: closingHeadline(d.savingsRate),
    detail: cadence
      ? t('{count} transactions logged. Roughly one every {days} days.', {
          count: d.transactionCount,
          days: cadence
        })
      : t('{count} transactions logged.', { count: d.transactionCount })
  });

  return out;
});

const currentSlide = computed(() => slides.value[currentIndex.value]);

const confettiDots = computed(() => {
  const rng = (seed) => {
    let s = seed;
    return () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  };
  const r = rng(11);
  const palette = ['var(--slide-accent)', 'var(--slide-deep)'];
  return Array.from({ length: 28 }, (_, i) => ({
    x: 30 + r() * 540,
    y: 30 + r() * 540,
    r: 5 + r() * 9,
    fill: palette[i % 2],
    o: 0.45 + r() * 0.45
  }));
});

let raf = null;
const animateValue = (target) => {
  cancelAnimationFrame(raf);
  if (target == null) {
    animatedValue.value = 0;
    return;
  }
  if (paused.value) {
    animatedValue.value = target;
    return;
  }
  const start = performance.now();
  const duration = 900;
  const ease = (x) => 1 - Math.pow(1 - x, 3);
  const tick = (now) => {
    const t2 = Math.min(1, (now - start) / duration);
    animatedValue.value = target * ease(t2);
    if (t2 < 1) raf = requestAnimationFrame(tick);
    else animatedValue.value = target;
  };
  raf = requestAnimationFrame(tick);
};

watch(currentSlide, (s) => {
  animateValue(s?.value ?? null);
});

watch(
  () => props.open,
  async (o) => {
    if (o) {
      currentIndex.value = 0;
      paused.value = false;
      showFirstHint.value = true;
      clearTimeout(hintTimer);
      hintTimer = setTimeout(() => {
        showFirstHint.value = false;
      }, 4200);
      await nextTick();
      rootRef.value?.focus?.();
      animateValue(currentSlide.value?.value ?? null);
    } else {
      cancelAnimationFrame(raf);
      clearTimeout(hintTimer);
      showFirstHint.value = false;
    }
  }
);

watch(currentIndex, () => {
  if (showFirstHint.value) {
    showFirstHint.value = false;
    clearTimeout(hintTimer);
  }
});

const next = () => {
  if (currentIndex.value < slides.value.length - 1) {
    currentIndex.value += 1;
  } else {
    emit('close');
  }
};
const prev = () => {
  if (currentIndex.value > 0) currentIndex.value -= 1;
};
const togglePause = () => {
  paused.value = !paused.value;
};

const onKey = (e) => {
  if (!props.open) return;
  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    prev();
  } else if (e.key === 'ArrowRight' || e.key === ' ') {
    e.preventDefault();
    next();
  } else if (e.key === 'Escape') {
    e.preventDefault();
    emit('close');
  } else if (e.key === 'p' || e.key === 'P') {
    togglePause();
  }
};

onMounted(() => window.addEventListener('keydown', onKey));
onUnmounted(() => {
  window.removeEventListener('keydown', onKey);
  cancelAnimationFrame(raf);
  clearTimeout(hintTimer);
});
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.story-root {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.78);
  backdrop-filter: blur(10px);
  display: grid;
  place-items: center;
  z-index: $z-index-modal;
  outline: none;

  @media (min-width: $breakpoint-md) {
    padding: $spacing-4;
  }
}

.story-frame {
  position: relative;
  background: var(--slide-bg, #fef9f4);
  overflow: hidden;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: $elevation-5;
  color: var(--slide-ink, #1b1f2c);
  transition:
    background $duration-slow $easing-emphasized,
    color $duration-slow $easing-emphasized;

  @media (min-width: $breakpoint-md) {
    width: 100%;
    max-width: 1080px;
    aspect-ratio: 16 / 10;
    height: auto;
    max-height: 88vh;
    border-radius: 28px;
  }

  &.tone--opening {
    --slide-bg: #fdf6ec;
    --slide-ink: #2d1c08;
    --slide-accent: #f59e0b;
    --slide-deep: #b45309;
  }
  &.tone--income {
    --slide-bg: #ecfdf5;
    --slide-ink: #052e1c;
    --slide-accent: #34d399;
    --slide-deep: #047857;
  }
  &.tone--spending {
    --slide-bg: #fff7ed;
    --slide-ink: #2c1503;
    --slide-accent: #fb923c;
    --slide-deep: #c2410c;
  }
  &.tone--topCategory {
    --slide-bg: #f5f3ff;
    --slide-ink: #1e1146;
    --slide-accent: #a78bfa;
    --slide-deep: #6d28d9;
  }
  &.tone--topPayee {
    --slide-bg: #ecfeff;
    --slide-ink: #0c2e34;
    --slide-accent: #22d3ee;
    --slide-deep: #0e7490;
  }
  &.tone--biggest {
    --slide-bg: #fff1f2;
    --slide-ink: #2d0a13;
    --slide-accent: #fb7185;
    --slide-deep: #be123c;
  }
  &.tone--closing {
    --slide-bg: #eef2ff;
    --slide-ink: #161a45;
    --slide-accent: #818cf8;
    --slide-deep: #3730a3;
  }
}

.bars {
  position: absolute;
  top: 14px;
  left: 14px;
  right: 14px;
  display: flex;
  gap: 4px;
  z-index: 6;
}

.bar {
  flex: 1;
  height: 3px;
  background: rgba(0, 0, 0, 0.12);
  border-radius: 999px;
  overflow: hidden;
  position: relative;

  &--filled {
    background: var(--slide-deep);
    opacity: 0.85;
  }
}

.bar-fill {
  display: block;
  height: 100%;
  background: var(--slide-deep);
  border-radius: 999px;
  animation: barFill linear forwards;

  &--paused {
    animation-play-state: paused;
  }
}

@keyframes barFill {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}

.story-head {
  position: absolute;
  top: 30px;
  left: 18px;
  right: 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 6;
}

.story-id {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--slide-deep);
}

.story-dot-icon {
  opacity: 0.9;
}

.story-month {
  font-size: $font-size-sm;
  font-weight: $font-semibold;
  letter-spacing: -0.005em;
}

.story-close {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.06);
  color: var(--slide-ink);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  backdrop-filter: blur(6px);
  transition: $transition-fast;

  &:hover {
    background: white;
    transform: scale(1.04);
  }
}

.tap-zone {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 35%;
  border: none;
  background: transparent;
  cursor: pointer;
  z-index: 3;
  -webkit-tap-highlight-color: transparent;
  display: flex;
  align-items: center;

  &--prev {
    left: 0;
    justify-content: flex-start;
  }
  &--next {
    right: 0;
    justify-content: flex-end;
  }
  &--pause {
    left: 35%;
    width: 30%;
  }

  &:focus {
    outline: none;
  }

  &:hover .tap-hint,
  &:focus-visible .tap-hint {
    opacity: 1;
    transform: translateX(0);
  }
}

.tap-hint {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin: 0 18px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.85);
  color: var(--slide-deep);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 999px;
  font-size: 12px;
  font-weight: $font-bold;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  backdrop-filter: blur(6px);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.12);
  opacity: 0;
  pointer-events: none;
  transition:
    opacity $duration-fast $easing-standard,
    transform $duration-fast $easing-emphasized;

  &--left {
    transform: translateX(-8px);
  }
  &--right {
    transform: translateX(8px);
  }
}

.tap-hint-label {
  @media (max-width: $breakpoint-sm) {
    display: none;
  }
}

.slide {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 0;
  color: var(--slide-ink);
  overflow: hidden;

  @media (min-width: $breakpoint-md) {
    display: grid;
    grid-template-columns: 5fr 6fr;
    align-items: stretch;
  }

  &--flip {
    @media (min-width: $breakpoint-md) {
      grid-template-columns: 6fr 5fr;

      .illustration-panel {
        order: 2;
      }
      .slide-body {
        order: 1;
      }
    }
  }

  &--empty {
    color: $text-muted;
    background: $bg-white;
    align-items: center;
    justify-content: center;
    gap: $spacing-3;
    padding: $spacing-8;
    display: flex;
  }

  .slide-msg {
    font-size: $font-size-sm;
    margin: 0;
  }
}

.illustration-panel {
  position: relative;
  width: 100%;
  min-height: 50%;
  z-index: 0;

  @media (min-width: $breakpoint-md) {
    min-height: 100%;
  }
}

.illustration {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  animation: illEnter $duration-deliberate $easing-emphasized both;
}

@keyframes illEnter {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.slide-body {
  position: relative;
  z-index: 2;
  padding: $spacing-6 $spacing-6 80px;
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
  justify-content: flex-end;

  @media (min-width: $breakpoint-md) {
    padding: $spacing-8 $spacing-6 80px;
    justify-content: center;
    gap: $spacing-3;
  }

  &.align--center {
    text-align: center;
    align-items: center;

    @media (min-width: $breakpoint-md) {
      text-align: left;
      align-items: flex-start;
    }
  }
  &.align--left {
    text-align: left;
    align-items: flex-start;
  }
}

.slide-eyebrow {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-weight: $font-bold;
  color: var(--slide-deep);
}

.slide-icon {
  color: var(--slide-deep);
  margin-bottom: $spacing-1;
}

.slide-headline {
  font-size: 2.4rem;
  font-weight: $font-bold;
  margin: 0;
  letter-spacing: -0.025em;
  line-height: 1.05;
  font-variant-numeric: tabular-nums;
  word-break: break-word;
  color: var(--slide-ink);

  @media (max-width: $breakpoint-sm) {
    font-size: 2rem;
  }
  @media (min-width: $breakpoint-md) {
    font-size: 3.4rem;
    line-height: 1;
  }
  @media (min-width: $breakpoint-lg) {
    font-size: 4rem;
  }
}

.slide-detail {
  font-size: $font-size-base;
  color: var(--slide-ink);
  opacity: 0.78;
  margin: 0;
  max-width: 30ch;
  line-height: 1.4;

  @media (min-width: $breakpoint-md) {
    font-size: 1.05rem;
    max-width: 36ch;
  }
}

.slide-detail:has(+ .slide-footnote) {
  margin-bottom: $spacing-1;
}

.slide-footnote {
  font-size: $font-size-sm;
  color: var(--slide-deep);
  font-weight: $font-semibold;
  margin: 0;
  letter-spacing: -0.005em;
}

.story-foot {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  gap: $spacing-2;
  z-index: 7;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 999px;
  backdrop-filter: blur(10px);
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.12);
}

.counter {
  font-size: 11px;
  color: var(--slide-deep);
  opacity: 0.85;
  font-variant-numeric: tabular-nums;
  font-weight: $font-bold;
  letter-spacing: 0.05em;
  padding: 0 $spacing-2;
  min-width: 36px;
  text-align: center;
}

.foot-btn {
  height: 34px;
  min-width: 34px;
  padding: 0;
  border-radius: 999px;
  background: transparent;
  border: none;
  color: var(--slide-deep);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 12px;
  font-weight: $font-bold;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition:
    background $duration-fast $easing-standard,
    transform $duration-fast $easing-standard;

  &--text {
    padding: 0 12px;
  }
  &--cta {
    background: var(--slide-deep);
    color: var(--slide-bg);

    &:hover {
      background: var(--slide-deep);
      filter: brightness(1.1);
    }
  }

  &:hover {
    background: rgba(0, 0, 0, 0.06);
    transform: scale(1.04);
  }
  &:active {
    transform: scale(0.96);
  }
  &--disabled {
    opacity: 0.3;
    pointer-events: none;
  }
}

.first-hint {
  position: absolute;
  bottom: 70px;
  left: 50%;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: rgba(15, 23, 42, 0.85);
  color: white;
  border-radius: 999px;
  font-size: 12px;
  font-weight: $font-medium;
  letter-spacing: -0.005em;
  z-index: 8;
  white-space: nowrap;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.25);
  max-width: calc(100% - $spacing-6);

  @media (max-width: $breakpoint-sm) {
    bottom: 64px;
    font-size: 11px;
    padding: 7px 12px;
    white-space: normal;
    max-width: 88%;
    text-align: center;
  }
}

.hint-fade-enter-active,
.hint-fade-leave-active {
  transition:
    opacity $duration-base $easing-standard,
    transform $duration-base $easing-emphasized;
}
.hint-fade-enter-from,
.hint-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}

.story-root-enter-active,
.story-root-leave-active {
  transition: opacity $duration-base $easing-standard;
}
.story-root-enter-active .story-frame,
.story-root-leave-active .story-frame {
  transition: transform $duration-base $easing-emphasized;
}
.story-root-enter-from {
  opacity: 0;
}
.story-root-leave-to {
  opacity: 0;
}
.story-root-enter-from .story-frame,
.story-root-leave-to .story-frame {
  transform: scale(0.96);
}

.slide-swap-enter-active,
.slide-swap-leave-active {
  transition: opacity $duration-base $easing-standard;
}
.slide-swap-enter-from,
.slide-swap-leave-to {
  opacity: 0;
}
</style>
