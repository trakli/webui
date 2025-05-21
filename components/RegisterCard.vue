<script setup>
import TButton from '@/components/TButton.vue';

const requiredFields = ['firstName', 'email', 'username', 'password'];
</script>

<template>
  <div class="register-card">
    <h1 class="title">Create an Account</h1>

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
        <TButton text="Register" :width="604" :height="53" />
      </div>

      <div class="login-link">Already have an account? <a href="/login">Login</a></div>
    </form>
  </div>
</template>

<style lang="scss" scoped>
.register-card {
  width: 100%;
  max-width: 600px;
  padding: 30px;
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #b0b8b4; /* Added border to match LoginCard */
  box-shadow: none; /* Removed shadow */
}

.title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin-bottom: 24px;
  text-align: center;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: flex;
  gap: 15px;

  @media (max-width: 600px) {
    flex-direction: column;
  }
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-size: 14px;
    font-weight: 600;
    color: #333;
  }

  input {
    height: 40px;
    padding: 0 12px;
    border: 1px solid #b0b8b4;
    border-radius: 4px;
    font-size: 14px;

    &:focus {
      outline: none;
      border-color: #047844;
    }
  }
}

.required {
  color: red;
}

.button-container {
  margin-top: 10px;
}

.login-link {
  text-align: center;
  font-size: 14px;
  margin-top: 15px;

  a {
    color: #047844;
    text-decoration: none;
    font-weight: 600;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
