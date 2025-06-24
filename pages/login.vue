<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import Logo from '@/components/Logo.vue';

definePageMeta({
  layout: 'auth'
});

const form = ref({
  email: '',
  password: ''
});

const currentSlide = ref(0);

const slides = [
  {
    title: 'Simple',
    text: "Trakli focuses on the basics and gives just what you need to see where your money is coming from or going to."
  },
  {
    title: 'Automated',
    text: "Get your income and expense report completed automatically using your emails and SMS or other custom workflows you setup."
  },
  {
    title: 'Opensource',
    text: "Trakli is open source! You can use all Trakli features at no cost on your self-hosted instance."
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

const handleSubmit = () => {
  // Add your login logic here
};

// Add ref for password visibility
const showPassword = ref(false);

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};
</script>

<template>
  <div class="page-wrapper">
    <div class="floating-docs-pattern"></div>
    
    <div class="login-container">
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

      <div class="login-form-container">
        <div class="form-card">
          <div class="logo-wrapper">
            <Logo size="medium" />
          </div>
          <h1>Welcome Back</h1>
          
          <form @submit.prevent="handleSubmit" class="login-form">
            <div class="form-group">
              <label>Email</label>
              <input
                type="email"
                v-model="form.email"
                placeholder="Enter your email"
                required
              />
            </div>
            <div class="form-group">
              <label>Password</label>
              <div class="password-input">
                <input
                  :type="showPassword ? 'text' : 'password'"
                  v-model="form.password"
                  placeholder="Enter your password"
                  required
                />
                <button 
                  type="button"
                  class="password-toggle"
                  @click="togglePassword"
                >
                  <svg 
                    v-if="!showPassword"
                    xmlns="http://www.w3.org/2000/svg" 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    stroke-width="2" 
                    stroke-linecap="round" 
                    stroke-linejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  <svg
                    v-else 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    stroke-width="2" 
                    stroke-linecap="round" 
                    stroke-linejoin="round"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </button>
              </div>
            </div>

            <div class="form-actions">
              <label class="remember-me">
                <input type="checkbox"> Remember me
              </label>
              <a href="#" class="forgot-password">Forgot Password?</a>
            </div>

            <button type="submit" class="submit-button">Login</button>
            <div class="divider">
              <span class="line"></span>
            </div>
          </form>

          <p class="signup-link">
            Don't have an account? <nuxt-link to="/register">Sign Up</nuxt-link>
          </p>
        </div>
      </div>
    </div>
    <div class="global-copyright">
      © {{ new Date().getFullYear() }} Trakli. All Right Reserved
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page-wrapper {
  min-height: 100vh;
  position: relative;
  background: #006B3F;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.floating-docs-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('/SidebarImage.svg') no-repeat center;
  background-size: cover;
  opacity: 0.1;
}

.login-container {
  flex: 1;
  position: relative;
  display: flex;
  max-width: 1440px;
  margin: 0 auto;
  padding: 2rem;
}

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
      text-align: center;
      color: #FF9F43;
    }

    p {
      font-size: 1.25rem;
      line-height: 1.6;
      opacity: 0.9;
      max-width: 480px;
      text-align: left;
      color: white;
    }
  }

  .carousel-dots {
    display: flex;
    gap: 1rem;
    justify-content: center;
    width: 100%;
    margin-top: 2rem;

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.3);
      cursor: pointer;
      transition: all 0.3s ease;

      &.active {
        width: 24px;
        height: 6px;
        border-radius: 3px;
        background-color: #FF9F43;
      }
    }
  }
}

.login-form-container {
  flex: 1.2;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.form-card {
  background: white;
  border-radius: 16px;
  padding: 4rem;
  width: 100%;
  max-width: 620px; // Updated to match register form width
  min-height: 65vh;
  margin-top: 2rem;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;

  .logo-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 2rem;
  }

  h1 {
    font-size: 2rem;
    color: #1A1A1A;
    font-weight: 600;
    margin: 1.5rem 0;
    text-align: center;
  }
}

h1 {
  font-size: 2rem;
  color: #1A1A1A;
  font-weight: 600;
  margin: 2rem 0 3rem;
  text-align: center;
}

.login-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 2rem 0;

  .form-group {
    margin-bottom: 1.5rem;

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #374151;
      font-size: 0.875rem;
      font-weight: 500;
    }

    input {
      width: 100%;
      padding: 1rem 1.25rem;
      border: 1px solid #E5E7EB;
      border-radius: 8px;
      font-size: 1rem;
      background: #F9FAFB;

      &::placeholder {
        color: #6B7280;
      }

      &:focus {
        border-color: #006B3F;
        outline: none;
        box-shadow: 0 0 0 3px rgba(0, 107, 63, 0.1);
      }
    }

    .password-input {
      position: relative;

      input {
        padding-right: 2.5rem !important;
      }

      .password-toggle {
        position: absolute;
        right: 1rem;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: #6B7280;
        cursor: pointer;
        padding: 0.25rem;
        display: flex;
        align-items: center;
        justify-content: center;
        
        &:hover {
          color: #374151;
        }

        svg {
          display: block;
        }
      }
    }
  }

  .form-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;

    .remember-me {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #4B5563;
      font-size: 0.875rem;
    }

    .forgot-password {
      color: #006B3F;
      font-size: 0.875rem;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .divider {
    padding: 2rem 0 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;

    .line {
      height: 1px;
      width: 100%;
      background-color: #006B3F;
      opacity: 0.2;
    }
  }
}

.submit-button {
  width: 100%;
  padding: 0.875rem;
  background-color: #006B3F;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  margin-top: 1.5rem;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: darken(#006B3F, 5%);
  }
}

.global-copyright {
  position: absolute;
  bottom: 2rem;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 0.875rem;
  color: white;
  opacity: 0.7;
  z-index: 10;
}

.signup-link {
  margin-top: 0.75rem;
  text-align: center;
  font-size: 0.9375rem;
  color: #4B5563;

  a {
    color: #006B3F;
    font-weight: 500;
    text-decoration: none;
    margin-left: 0.25rem;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
