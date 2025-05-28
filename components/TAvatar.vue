<template>
  <button class="nav-footer-button-avatar" :style="{ width: width, height: height }">
    <img src="~/public/userImage.png" alt="User Image" />
    <div class="footer-user-name">
      <span class="footer-user-text">Nde-Fru Che-boy </span>
      <ChevronDownIcon class="footer-user-icon" />
    </div>
  </button>
</template>

<script setup>
import { ChevronDownIcon } from '@heroicons/vue/24/outline';
// eslint-disable-next-line no-unused-vars
const props = defineProps({
  width: {
    type: String,
    default: '296px'
  },
  height: {
    type: String,
    default: '76px'
  }
});
</script>

<style lang="scss" scoped>
.nav-footer-button-avatar {
  display: flex;
  align-items: center;
  border-radius: 8px;
  padding: 16px;
  gap: 16px;
  background-color: transparent;
  border: none;
  color: #495057;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-left: 10px;
}

.footer-user-name {
  display: flex;
  flex-direction: row;
  gap: 8px;
}

.footer-user-text {
  color: #01190e;
  font-weight: 700;
  font-size: 16px;
}

.footer-user-icon {
  width: 24px;
  height: 24px;
  margin-left: 10px;
}
</style>
