<script setup>
import TButton from '@/components/TButton.vue';

const requiredFields = ['firstName', 'email', 'username', 'password'];
</script>

<template>
  <div class="register-card">
    <div class="register-header">
      <img src="/Logo.svg" alt="Logo Image" class="logo" />
      <h1 class="title">Create an account</h1>
    </div>

    <form class="form">
      <!-- Name row -->
      <div class="form-row">
        <div class="form-group">
          <label
            >First Name
            <span v-if="requiredFields.includes('firstName')" class="required">*</span></label
          >
          <input type="text" placeholder="Enter first name" />
        </div>
        <div class="form-group">
          <label
            >Last Name<span v-if="requiredFields.includes('firstName')" class="required"
              >*</span
            ></label
          >
          <input type="text" placeholder="Enter last name" />
        </div>
      </div>

      <!-- Email and Phone row -->
      <div class="form-row">
        <div class="form-group">
          <label
            >Email <span v-if="requiredFields.includes('email')" class="required">*</span></label
          >
          <input type="email" placeholder="Enter email" />
        </div>
        <div class="form-group">
          <label>Phone Number</label>
          <input type="tel" placeholder="Enter phone number" />
        </div>
      </div>

      <!-- Username and Password row -->
      <div class="form-row">
        <div class="form-group">
          <label>Username </label>
          <input type="text" placeholder="Choose username" />
        </div>
        <div class="form-group">
          <label
            >Password
            <span v-if="requiredFields.includes('password')" class="required">*</span></label
          >
          <input type="password" placeholder="Create password" />
        </div>
      </div>

      <div class="button-container">
        <TButton size="large" class="register-button">Register</TButton>
      </div>

      <div class="login-link">Already have an account? <a href="/login">Login</a></div>
    </form>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/_variables' as *;

.register-card {
  background-color: $bg-white;
  border-radius: $radius-xl;
  border: 1px solid $border-medium;
  box-shadow: $shadow-sm;
  padding: $spacing-8;
  width: 100%;
  max-width: 100%;
  margin: 0;
  box-sizing: border-box;

  .register-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: $spacing-6;

    .logo {
      width: 120px;
      height: auto;
      margin-bottom: $spacing-4;
    }

    .title {
      font-size: $font-size-2xl;
      font-weight: $font-bold;
      color: $text-primary;
      margin: 0 0 $spacing-6 0;
      text-align: center;
    }
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: $spacing-5;
  }

  .form-row {
    display: flex;
    gap: $spacing-6;
    width: 100%;

    @media (max-width: $breakpoint-md) {
      flex-direction: column;
      gap: $spacing-4;
    }

    .form-group {
      flex: 1;
      min-width: 0; /* Prevents flex items from overflowing */
    }
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: $spacing-2;
    width: 100%;
    min-width: 0;

    label {
      font-size: $font-size-sm;
      font-weight: $font-semibold;
      color: $text-secondary;
      display: flex;
      align-items: center;
      gap: $spacing-1;
    }

    input {
      height: 44px;
      padding: 0 $spacing-4;
      border: 1px solid $border-light;
      border-radius: $radius-md;
      font-size: $font-size-base;
      background-color: $bg-white;
      transition: $transition-base;
      color: $text-secondary;

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

    a {
      color: $primary;
      font-weight: $font-semibold;
      text-decoration: none;
      margin-left: $spacing-1;
      transition: $transition-base;

      &:hover {
        text-decoration: underline;
        color: $primary-hover;
      }
    }
  }

  .button-container {
    margin-top: $spacing-6;
    width: 100%;

    .register-button {
      width: 100%;
    }
  }

  .login-link {
    text-align: center;
    font-size: $font-size-sm;
    margin-top: $spacing-5;
    color: $text-secondary;
  }

  @media (max-width: $breakpoint-sm) {
    padding: $spacing-6 $spacing-4;
    border-radius: 0;
    border-left: none;
    border-right: none;
  }

  .title {
    font-size: $font-size-xl;
    margin-bottom: $spacing-5;
  }
}
</style>
