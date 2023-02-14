<template>
  <div class="login-page">
    <form @submit.prevent="sendForgetPasswordEmail">
      <h1 class="text-white">KwikIQ</h1>
      <h5 class="text-white">Forgot your password?</h5>
      <p class="text-white">Please enter the email you use to sign in.</p>
      <h6 v-if="err !== ''" class="p-error">{{ err }}</h6>
      <div>
        <span class="p-input-icon-left">
          <i class="pi pi-user" />
          <InputText v-model="email" type="email" placeholder="Email" />
        </span>
        <small v-if="v$.email.$error" class="p-error">{{
          v$.email.$errors[0].$message
        }}</small>
      </div>
      <Button
        label="Request Pasword Reset"
        :loading="mailSending"
        class="mr-2 mb-2 mt-2 w-100"
        type="submit"
      />
      <router-link :to="{ name: 'login' }">Back to sign in</router-link>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, reactive, toRefs } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { useStore } from 'vuex';
import { forgetPasswordSchema } from '../../validation/forgetPassword.mjs';
// eslint-disable-next-line import/no-unresolved
import { useToastService } from '@/composables/useToast.mjs';

const { dispatch } = useStore();

const state = reactive({
  email: '',
});

const { email } = toRefs(state);

// validation rules
const rules = computed(() => forgetPasswordSchema);
const v$ = useVuelidate(rules, state);
const err = ref('');
const { showToast } = useToastService();
const mailSending = ref(false);

const sendForgetPasswordEmail = async () => {
  try {
    v$.value.$validate();
    if (!v$.value.$error) {
      mailSending.value = true;
      await dispatch('sendForgetPasswordEmail', state);
      mailSending.value = false;
      showToast({ detail: `Password reset instructions have been sent to ${state.email}` });
      v$.value.$reset();
    }
  } catch (error) {
    mailSending.value = false;
    const exception = error?.response;
    if (exception?.status === 400) err.value = exception?.data?.error?.message;
  }
};
</script>

<style lang="scss" scoped>
.login-page {
  width: 100%;

  form {
    max-width: 350px;

    > div {
      margin-bottom: 1rem;

      span,
      input {
        width: 100%;
      }
    }
  }
}

.loginBtn {
  background: white !important;
  color: #7f7f7f !important;
  padding: 0.5rem 5rem !important;
}

.loginBtn span {
  padding-left: 20px;
}
</style>
