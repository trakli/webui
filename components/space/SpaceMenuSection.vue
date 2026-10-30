<template>
  <div class="space-menu" role="group" :aria-label="t('Your spaces')">
    <p class="heading">{{ t('Your spaces') }}</p>
    <button
      v-for="option in options"
      :key="option.slug"
      type="button"
      role="menuitemradio"
      class="option"
      :aria-checked="option.slug === activeSlug"
      @click="choose(option.slug)"
    >
      <span class="badge" :class="`surface surface--${option.tone}`">
        <component :is="option.icon" />
      </span>
      <span class="copy">
        <span class="name">{{ option.name }}</span>
        <span class="kind">{{ option.kind }}</span>
      </span>
      <Check v-if="option.slug === activeSlug" class="check" />
    </button>
    <button type="button" class="option option--link" @click="manage">
      <Plus class="plus" />
      <span>{{ workspaces.length ? t('Manage shared spaces') : t('Create a shared space') }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { Check, Plus, User, Users } from 'lucide-vue-next';
import { PERSONAL_SPACE, spaceTone } from '~/utils/activeSpace';

const emit = defineEmits<{ done: [] }>();
const { t } = useI18n();
const { workspaces, load } = useWorkspaces();
const { space, switchTo } = useActiveSpace();
const activeSlug = computed(() => space.value?.slug ?? PERSONAL_SPACE);

const options = computed(() => [
  { slug: PERSONAL_SPACE, name: t('Personal'), kind: t('Just you'), icon: User, tone: 'neutral' },
  ...workspaces.value.map((workspace) => ({
    slug: workspace.slug,
    name: workspace.name,
    kind: t('Group'),
    icon: Users,
    tone: spaceTone(workspace.id)
  }))
]);

async function choose(slug: string) {
  emit('done');
  if (slug !== activeSlug.value) await switchTo(slug);
}

async function manage() {
  emit('done');
  await navigateTo('/workspaces');
}

onMounted(() => load().catch(() => {}));
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.space-menu {
  padding: 0.25rem 0;
  border-bottom: 1px solid $border-color;
}

.heading {
  margin: 0.5rem 1rem 0.25rem;
  font-size: $font-size-xs;
  font-weight: $font-semibold;
  color: $text-muted;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.option {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: $font-size-sm;
  color: $text-primary;
  text-align: left;
  transition: background-color 0.2s;

  &:hover {
    background: $bg-gray;
  }

  &[aria-checked='true'] {
    background: $primary-light;
  }

  &--link {
    padding: 0.75rem 1rem;
    color: $primary;
    font-weight: $font-medium;
  }
}

.badge {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: $radius-lg;
  background: var(--surface-accent);
  color: var(--surface-ink);

  svg {
    width: 16px;
    height: 16px;
  }
}

.copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
  line-height: 1.25;
}

.name {
  overflow: hidden;
  font-weight: $font-medium;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.kind {
  font-size: $font-size-xs;
  color: $text-muted;
}

.check {
  width: 18px;
  height: 18px;
  margin-left: auto;
  flex-shrink: 0;
  color: $primary;
}

.plus {
  width: 18px;
  height: 18px;
  margin-left: 5px;
}
</style>
