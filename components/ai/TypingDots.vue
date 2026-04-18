<template>
  <div class="typing-dots" aria-label="AI is thinking">
    <span />
    <span />
    <span />
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.typing-dots {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 0;

  span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: $primary;
    animation: typing-bounce 1.2s infinite ease-in-out both;
    opacity: 0.4;

    &:nth-child(2) {
      animation-delay: 0.15s;
    }

    &:nth-child(3) {
      animation-delay: 0.3s;
    }
  }
}

@keyframes typing-bounce {
  0%,
  80%,
  100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  40% {
    transform: translateY(-4px);
    opacity: 1;
  }
}
</style>
