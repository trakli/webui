<script setup>
import { ref } from 'vue';
import TButton from './TButton.vue';
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline';

const showPassword = ref(false);
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-content">
        <div class="login-header">
          <img src="/Logo.svg" alt="Logo Image" class="logo" />
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
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;

  .login-card {
    background-color: #ffffff;
    width: 627px;
    height: 618px;
    border-radius: 1rem;
    border: 1px solid #b0b8b4;
    margin-top: 2.5rem;

    .login-content {
      display: flex;
      flex-direction: column;
      justify-content: center;
      width: 100%;

      .login-header {
        padding: 60px 63px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        text-align: center;

        .logo {
          width: 195px;
          height: 80px;
          margin: 0 auto;
        }

        .title {
          margin-top: 2rem;
          font-weight: 700;
          font-size: 1.5rem;
        }
      }

      .login-form-container {
        padding: 0 63px 60px;

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          max-width: 100%;

          .form-group {
            width: 100%;

            .form-label {
              display: block;
              font-size: 1rem;
              font-weight: 700;
              color: #374151;
              margin-bottom: 0.25rem;
            }

            .form-input {
              width: 100%;
              padding: 0.75rem 1rem;
              border: 1px solid #d1d5db;
              background-color: #f5f6f7;
              border-radius: 0.375rem;
              box-sizing: border-box;

              &:focus {
                outline: none;
                box-shadow: 0 0 0 2px rgba(4, 120, 68, 0.5);
                border-color: #047844;
              }
            }

            .password-container {
              position: relative;
              width: 100%;

              .password-toggle {
                position: absolute;
                top: 50%;
                right: 12px;
                transform: translateY(-50%);
                background: transparent;
                border: none;
                cursor: pointer;
                padding: 0;
                display: flex;
                align-items: center;
                justify-content: center;

                &:hover,
                &:focus {
                  outline: none;
                  background: transparent;
                }

                .icon {
                  height: 1.25rem;
                  width: 1.25rem;
                  color: #6b7280;
                }
              }

              /* Adjust padding on password input to make room for the icon */
              .form-input {
                padding-right: 2.5rem;
              }
            }
          }

          .button-container {
            padding-top: 0.5rem;
            width: 100%;
          }
        }
      }
    }
  }
}
</style>
