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

onMounted(() => {
  startSlideShow();
});

onBeforeUnmount(() => {
  clearInterval(slideInterval);
});
</script>

<template>
  <div class="login-sidebar">
    <div class="sidebar-content">
      <div class="carousel-slide">
        <div class="slide-image-wrapper">
          <div class="carousel-image"></div>
        </div>
        <div class="sidebar-text">
          <h2>{{ slides[currentSlide].title }}</h2>
          <p>{{ slides[currentSlide].text }}</p>
        </div>
        <div class="carousel-dots">
          <span
            v-for="(slide, index) in slides"
            :key="index"
            :class="['dot', { active: currentSlide === index }]"
            @click="currentSlide = index"
          ></span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.login-sidebar {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: white;
  padding: 4rem 6rem 2rem 4rem;

  .sidebar-content {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding-top: 6rem;
  }

  .carousel-slide {
    margin-top: 2rem;
    display: flex;
    flex-direction: column;
    gap: 3rem;
  }

  .slide-image-wrapper {
    width: 90%;
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
    flex-direction: column;
    align-items: center;
    gap: 2rem;

    h2 {
      font-size: 3.5rem;
      font-weight: 700;
      color: $accent-color;
    }

    p {
      font-size: 1.125rem;
      line-height: 1.6;
      text-align: center;
      max-width: 80%;
    }
  }

  .carousel-dots {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 2rem;
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
}
</style>
