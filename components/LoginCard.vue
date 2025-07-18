<script setup>
import { ref } from 'vue';
import TButton from './TButton.vue';
import AuthFooterLink from './AuthFooterLink.vue';
import Logo from './Logo.vue';
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline';

const showPassword = ref(false);
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-content">
        <div class="login-header">
          <Logo size="medium" />
          <h1 class="title">Login</h1>
        </div>

        <div class="login-form-container">
          <form class="login-form">
            <!-- Username field -->
            <div class="form-group">
              <label for="username" class="form-label">Username</label>
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                class="form-input"
                required
              />
            </div>

            <!-- Password field with toggle visibility -->
            <div class="form-group">
              <label for="password" class="form-label">Password</label>
              <div class="password-container">
                <input
                  id="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Enter your password"
                  class="form-input"
                  required
                />
                <button type="button" class="password-toggle" @click="showPassword = !showPassword">
                  <EyeSlashIcon v-if="!showPassword" class="icon" />
                  <EyeIcon v-else class="icon" />
                </button>
              </div>
            </div>

            <!-- Login button -->
            <div class="button-container">
              <TButton text="Login" width="100%" :height="53" />
            </div>

            <!-- Sign up link -->
            <AuthFooterLink text="Don't have an account?" link-text="Sign up" to="/register" />
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: $spacing-6 0;

  .login-card {
    background-color: $bg-white;
    width: 100%;
    max-width: 480px;
    border-radius: $radius-xl;
    border: 1px solid $border-medium;
    margin: $spacing-10 $spacing-4;
    box-shadow: $shadow-sm;

    .login-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      padding: $spacing-12 $spacing-10;

      @media (max-width: $breakpoint-sm) {
        padding: $spacing-8 $spacing-4;
      }

      .login-header {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: $spacing-8;

        .logo {
          width: 195px;
          height: auto;
          margin-bottom: $spacing-8;
        }

        .title {
          color: $text-primary;
          font-size: $font-size-2xl;
          font-weight: $font-bold;
          margin: 0;
        }
      }

      .login-form-container {
        width: 100%;
        max-width: 400px;

        .login-form {
          display: flex;
          flex-direction: column;
          gap: $spacing-6;
          width: 100%;

          .form-group {
            width: 100%;
            margin-bottom: $spacing-1;

            .form-label {
              display: block;
              font-size: $font-size-sm;
              font-weight: $font-bold;
              color: $text-secondary;
              margin-bottom: $spacing-2;
            }

            .form-input {
              width: 100%;
              padding: $spacing-3 $spacing-4;
              border: 1px solid $border-light;
              background-color: $input-bg;
              border-radius: $radius-md;
              font-size: $font-size-base;
              transition: $transition-base;

              &:focus {
                outline: none;
                border-color: $primary;
                box-shadow: 0 0 0 2px $input-focus;
              }

              &::placeholder {
                color: $text-muted;
                opacity: 1;
              }
            }

            .password-container {
              position: relative;
              width: 100%;

              .password-toggle {
                position: absolute;
                top: 50%;
                right: $spacing-3;
                transform: translateY(-50%);
                background: transparent;
                border: none;
                cursor: pointer;
                padding: $spacing-1;
                border-radius: $radius-sm;
                color: $text-muted;
                transition: $transition-base;

                &:hover {
                  background-color: rgba($primary, 0.1);
                  color: $primary;
                }

                &:focus {
                  outline: none;
                  box-shadow: 0 0 0 2px $input-focus;
                }

                .icon {
                  width: $spacing-5;
                  height: $spacing-5;
                }
              }

              .form-input {
                padding-right: $spacing-10;
              }
            }
          }

          .button-container {
            margin-top: $spacing-6;
            width: 100%;
          }
        }
      }
    }
  }
}
</style>
