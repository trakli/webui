<template>
  <div class="sidebar">
    <div class="sidebar-content">
      <div class="carousel-slide">
        <div class="slide-image-wrapper">
          <div class="carousel-image" />
        </div>
        <div class="sidebar-text">
          <transition name="fade" mode="out-in">
            <div :key="currentSlide" class="text-content">
              <h2>{{ slides[currentSlide].title }}</h2>
              <p>{{ slides[currentSlide].text }}</p>
            </div>
          </transition>
        </div>
        <div class="carousel-dots">
          <span
            v-for="(slide, index) in slides"
            :key="index"
            :class="['dot', { active: currentSlide === index }]"
            @click="currentSlide = index"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const currentSlide = ref(0);

const slides = [
  {
    title: 'Simple',
    text: 'Trakli focuses on the basics and gives just what you need to see where your money is coming from or going to.'
  },
  {
    title: 'Automated',
    text: 'Get your income and expense report completed automatically using your emails and SMS or other custom workflows you setup.'
  },
  {
    title: 'Opensource',
    text: 'Trakli is open source! You can use all Trakli features at no cost on your self-hosted instance.'
  }
];

let slideInterval;

const startSlideShow = () => {
  slideInterval = setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % slides.length;
  }, 5000);
};

onMounted(startSlideShow);
onBeforeUnmount(() => clearInterval(slideInterval));
</script>

<style scoped lang="scss">
@use '@/assets/_variables.scss' as *;

.sidebar {
  flex: 1;
  display: flex;
  align-items: center; 
  justify-content: center;
  padding: 2rem 3rem;
  min-width: 480px;
  color: white;
}

.sidebar-content {
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.5rem;
}

.carousel-slide {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.slide-image-wrapper {
  width: 40%;
  max-width: 400px;
  margin: 0 auto;
  aspect-ratio: 16/15;

  .carousel-image {
    width: 100%;
    height: 100%;
    background: url('/SidebarImage.svg') no-repeat center;
    background-size: contain;
    opacity: 0.9;
  }
}

.sidebar-text {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 180px;
  overflow: hidden;
  text-align: center;

  .text-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 80%;

    h2 {
      font-size: 3.5rem;
      font-weight: 700;
      color: $accent-color;
      margin: 0;
    }

    p {
      font-size: 1.125rem;
      line-height: 1.6;
      margin: 0;
    }
  }
}

.carousel-dots {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 10px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: background-color 0.3s;

  &.active {
    background-color: $accent-color;
  }
}

// Fade transition
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

</style>
