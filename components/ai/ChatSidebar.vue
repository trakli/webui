<template>
  <aside class="sessions-pane">
    <button class="new-chat-btn" @click="$emit('new-chat')">
      <Plus :size="16" />
      <span>{{ t('New chat') }}</span>
    </button>

    <div v-if="groupedSessions.length" class="sessions-list">
      <div v-for="group in groupedSessions" :key="group.label" class="session-group">
        <div class="group-label">{{ t(group.label) }}</div>
        <ul>
          <li
            v-for="session in group.sessions"
            :key="session.id"
            class="session-item"
            :class="{ active: currentSessionId === session.id }"
            :title="session.title || t('New chat')"
            @click="$emit('open-session', session.id)"
          >
            <MessageSquare :size="14" class="session-icon" />
            <span class="session-title">{{ session.title || t('New chat') }}</span>
            <button
              class="remove-btn"
              :title="t('Delete chat')"
              @click.stop="$emit('delete-session', session.id)"
            >
              <Trash2 :size="14" />
            </button>
          </li>
        </ul>
      </div>
    </div>

    <div v-else-if="!isLoading" class="empty-sessions">
      <MessageSquare :size="28" />
      <p>{{ t('No conversations yet') }}</p>
      <span>{{ t('Your chats will appear here') }}</span>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Plus, Trash2, MessageSquare } from 'lucide-vue-next';
import type { ChatSession } from '@/services/api/aiApi';

const { t } = useI18n();

const props = defineProps<{
  sessions: ChatSession[];
  currentSessionId: number | null;
  isLoading: boolean;
}>();

defineEmits<{
  (e: 'new-chat'): void;
  (e: 'open-session' | 'delete-session', id: number): void;
}>();

const groupedSessions = computed(() => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 86400000;
  const weekAgo = today - 7 * 86400000;

  const buckets: Record<string, ChatSession[]> = {
    Today: [],
    Yesterday: [],
    'This week': [],
    Older: []
  };

  for (const session of props.sessions) {
    const ts = new Date(session.updated_at || session.created_at).getTime();
    if (ts >= today) buckets.Today.push(session);
    else if (ts >= yesterday) buckets.Yesterday.push(session);
    else if (ts >= weekAgo) buckets['This week'].push(session);
    else buckets.Older.push(session);
  }

  return Object.entries(buckets)
    .filter(([, list]) => list.length > 0)
    .map(([label, list]) => ({ label, sessions: list }));
});
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.sessions-pane {
  border-right: 1px solid $border-light;
  display: flex;
  flex-direction: column;
  padding: $spacing-3;
  gap: $spacing-3;
  min-height: 0;
  overflow: hidden;

  @media (max-width: $breakpoint-md) {
    display: none;
  }
}

.new-chat-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-2;
  padding: $spacing-2 $spacing-3;
  background: $primary;
  color: $bg-white;
  border: none;
  border-radius: $radius-lg;
  font-weight: $font-semibold;
  font-size: $font-size-sm;
  cursor: pointer;
  transition: $transition-base;

  &:hover {
    background: $primary-hover;
  }
}

.sessions-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
  margin: 0 (-$spacing-2);
  padding: 0 $spacing-2;
}

.session-group {
  display: flex;
  flex-direction: column;
  gap: $spacing-1;

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
}

.group-label {
  font-size: 0.7rem;
  font-weight: $font-semibold;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: $text-muted;
  padding: 0 $spacing-2;
  margin-bottom: $spacing-1;
}

.session-item {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-2;
  border-radius: $radius-md;
  cursor: pointer;
  transition: $transition-base;
  color: $text-secondary;
  position: relative;

  &:hover {
    background: $bg-gray;
    color: $text-primary;

    .remove-btn {
      opacity: 1;
    }
  }

  &.active {
    background: $primary-light;
    color: $primary;
    font-weight: $font-semibold;

    .session-icon {
      color: $primary;
    }
  }
}

.session-icon {
  flex-shrink: 0;
  color: $text-muted;
}

.session-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: $font-size-sm;
}

.remove-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: $text-muted;
  padding: 2px;
  border-radius: $radius-sm;
  opacity: 0;
  transition: $transition-base;

  &:hover {
    color: $error-color;
    background: $bg-white;
  }
}

.empty-sessions {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: $spacing-1;
  color: $text-muted;
  text-align: center;
  padding: $spacing-4 $spacing-2;

  p {
    margin: 0;
    font-weight: $font-semibold;
    font-size: $font-size-sm;
    color: $text-secondary;
  }

  span {
    font-size: 0.75rem;
  }
}
</style>
