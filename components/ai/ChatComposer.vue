<template>
  <div class="composer-shell">
    <div v-if="files.length" class="attachments">
      <span v-for="(file, i) in files" :key="i" class="attachment-chip">
        <component :is="activeType?.icon || Paperclip" :size="12" />
        <span class="chip-name">{{ file.name }}</span>
        <span v-if="activeType" class="chip-type">{{ t(activeType.label) }}</span>
        <button type="button" class="chip-remove" :title="t('Remove')" @click="removeFile(i)">
          <X :size="12" />
        </button>
      </span>
    </div>

    <form class="composer" @submit.prevent="handleSubmit">
      <button
        ref="attachBtnRef"
        type="button"
        class="attach-btn"
        :class="{ 'attach-btn--active': sheetOpen }"
        :title="t('Attach a file')"
        :disabled="disabled"
        @click="toggleSheet"
      >
        <Plus :size="18" />
      </button>
      <input
        ref="fileInput"
        type="file"
        class="file-input"
        multiple
        :accept="acceptFilter"
        @change="onFilesPicked"
      />
      <textarea
        ref="textareaEl"
        :value="modelValue"
        rows="1"
        class="chat-input"
        :placeholder="t('Ask me anything about your finances...')"
        :disabled="disabled"
        @input="handleInput"
        @keydown="handleKeydown"
      />
      <button
        type="submit"
        class="send-btn"
        :title="t('Send')"
        :disabled="disabled || (!modelValue.trim() && files.length === 0)"
      >
        <Send :size="16" />
      </button>
    </form>

    <!-- Popover anchored to the + button (teleported so it isn't clipped by the
         composer's rounded overflow). A transparent backdrop catches outside clicks. -->
    <Teleport to="body">
      <div v-if="sheetOpen" class="attach-backdrop" @click="closeSheet" />
      <Transition name="attach-pop">
        <div v-if="sheetOpen" class="attach-pop" :style="popoverStyle">
          <button
            v-for="type in fileTypes"
            :key="type.key"
            type="button"
            class="pop-option"
            @click="chooseType(type)"
          >
            <span class="option-icon"><component :is="type.icon" :size="18" /></span>
            <span class="option-text">
              <span class="option-label">{{ t(type.label) }}</span>
              <span class="option-hint">{{ t(type.hint) }}</span>
            </span>
          </button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue';
import {
  Send,
  Plus,
  Paperclip,
  X,
  Landmark,
  Receipt,
  FileText,
  Image as ImageIcon
} from 'lucide-vue-next';

interface FileTypeOption {
  key: string;
  label: string;
  hint: string;
  accept: string;
  documentType?: string;
  icon: unknown;
}

const fileTypes: FileTypeOption[] = [
  {
    key: 'bank_statement',
    label: 'Bank statement',
    hint: 'Import transactions from a CSV or PDF',
    accept: '.csv,.pdf',
    documentType: 'bank_statement',
    icon: Landmark
  },
  {
    key: 'receipt',
    label: 'Receipt',
    hint: 'A photo or scan of a receipt',
    accept: 'image/*,.pdf',
    documentType: 'receipt',
    icon: Receipt
  },
  {
    key: 'invoice',
    label: 'Invoice',
    hint: 'A bill or invoice document',
    accept: '.pdf,image/*',
    documentType: 'invoice',
    icon: FileText
  },
  {
    key: 'photo',
    label: 'Photo',
    hint: 'Any image from your device',
    accept: 'image/*',
    icon: ImageIcon
  },
  {
    key: 'document',
    label: 'Document',
    hint: 'CSV, PDF, spreadsheet or text file',
    accept: '.csv,.pdf,.txt,.xls,.xlsx,.doc,.docx',
    icon: Paperclip
  }
];

const { t } = useI18n();

const props = defineProps<{
  modelValue: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'submit'): void;
  (e: 'attach', files: File[]): void;
}>();

const textareaEl = ref<HTMLTextAreaElement | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const attachBtnRef = ref<HTMLButtonElement | null>(null);
const files = ref<File[]>([]);

const sheetOpen = ref(false);
const popoverStyle = ref<Record<string, string>>({});

const activeType = ref<FileTypeOption | null>(null);
const acceptFilter = computed(
  () =>
    activeType.value?.accept || '.csv,.pdf,.png,.jpg,.jpeg,.webp,.gif,.txt,.xls,.xlsx,.doc,.docx'
);

// Anchor the popover just above the + button (fixed-positioned so the composer's
// rounded overflow can't clip it).
const openSheet = () => {
  const r = attachBtnRef.value?.getBoundingClientRect();
  if (r && typeof window !== 'undefined') {
    const width = 300;
    const left = Math.max(8, Math.min(r.left, window.innerWidth - width - 8));
    popoverStyle.value = {
      position: 'fixed',
      left: `${left}px`,
      bottom: `${window.innerHeight - r.top + 8}px`,
      width: `${width}px`
    };
  }
  sheetOpen.value = true;
};
const closeSheet = () => {
  sheetOpen.value = false;
};
const toggleSheet = () => {
  if (sheetOpen.value) closeSheet();
  else openSheet();
};

const chooseType = (type: FileTypeOption) => {
  activeType.value = type;
  closeSheet();
  // Wait for the dynamic accept to bind before opening the picker.
  nextTick(() => fileInput.value?.click());
};

const documentType = computed(() => activeType.value?.documentType ?? null);

const onFilesPicked = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const picked = Array.from(target.files ?? []);
  if (picked.length) {
    files.value = [...files.value, ...picked];
    emit('attach', files.value);
  }
  target.value = '';
};

const removeFile = (index: number) => {
  files.value.splice(index, 1);
  if (files.value.length === 0) activeType.value = null;
  emit('attach', files.value);
};

const clearFiles = () => {
  files.value = [];
  activeType.value = null;
};

const autoResize = () => {
  const el = textareaEl.value;
  if (!el) return;
  el.style.height = 'auto';
  const maxHeight = parseInt(getComputedStyle(el).maxHeight, 10) || Infinity;
  el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
};

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  emit('update:modelValue', target.value);
  autoResize();
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    handleSubmit();
  }
};

const handleSubmit = () => {
  if (props.disabled) return;
  if (!props.modelValue.trim() && files.value.length === 0) return;
  emit('submit');
};

watch(
  () => props.modelValue,
  async (value) => {
    if (value === '') {
      await nextTick();
      autoResize();
    }
  }
);

defineExpose({
  focus: () => textareaEl.value?.focus(),
  clearFiles,
  files,
  documentType
});
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.composer-shell {
  position: relative;
  flex-shrink: 0;
  border-top: 1px solid $border-light;
  background: $bg-white;
}

.composer {
  display: flex;
  align-items: flex-end;
  gap: $spacing-2;
  padding: $spacing-3 $spacing-4;
}

.attachments {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-2;
  padding: $spacing-2 $spacing-4 0;
}

.attachment-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px 2px 8px;
  background: $primary-light;
  color: $primary;
  border-radius: 9999px;
  font-size: $font-size-xs;

  .chip-remove {
    display: inline-flex;
    border: none;
    background: none;
    color: inherit;
    cursor: pointer;
    padding: 0;
  }
}

.file-input {
  display: none;
}

.attach-btn {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 50%;
  background: $bg-gray;
  color: $text-secondary;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: $transition-base;

  &:hover:not(:disabled),
  &--active {
    background: $primary-light;
    color: $primary;
  }

  &--active {
    transform: rotate(45deg);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.chip-name {
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chip-type {
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-size: 0.6rem;
  font-weight: $font-semibold;
  background: $primary;
  color: $text-inverse;
  border-radius: 9999px;
  padding: 1px 6px;
}

.attach-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1049;
  background: transparent;
}

.attach-pop {
  /* position/left/bottom/width set inline (anchored to the button) */
  z-index: 1050;
  background: $bg-white;
  border: 1px solid $border-light;
  border-radius: $radius-lg;
  box-shadow: $elevation-3;
  padding: $spacing-1;
  transform-origin: bottom left;
}

.pop-option {
  width: 100%;
  display: flex;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-2;
  border: none;
  background: none;
  border-radius: $radius-md;
  cursor: pointer;
  text-align: left;
  transition: $transition-base;

  &:hover {
    background: $primary-light;
  }

  .option-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border-radius: $radius-md;
    background: $bg-gray;
    color: $primary;
    flex-shrink: 0;
  }

  .option-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .option-label {
    font-weight: $font-semibold;
    color: $text-primary;
    font-size: $font-size-sm;
  }

  .option-hint {
    font-size: $font-size-xs;
    color: $text-muted;
  }
}

.attach-pop-enter-active,
.attach-pop-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.attach-pop-enter-from,
.attach-pop-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(6px);
}

.chat-input {
  flex: 1;
  resize: none;
  padding: $spacing-3 $spacing-3;
  min-height: 52px;
  border: 1px solid $border-light;
  border-radius: $radius-lg;
  outline: none;
  font-size: $font-size-base;
  font-family: inherit;
  background: $bg-gray;
  color: $text-primary;
  line-height: 1.5;
  max-height: 200px;
  overflow-y: auto;
  transition: $transition-base;

  &::placeholder {
    color: $text-muted;
  }

  &:focus {
    background: $bg-white;
    border-color: $primary;
    box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
  }
}

.send-btn {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 50%;
  background: $primary;
  color: $bg-white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: $transition-base;

  &:hover:not(:disabled) {
    background: $primary-hover;
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}
</style>
