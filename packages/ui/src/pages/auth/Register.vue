<template>
  <div class="loginContainer">
    <div class="surface-card p-4 shadow-2 border-round w-full lg:w-6">
      <div class="text-center mb-5">
        <div class="text-900 text-3xl font-medium mb-3">Create An Account</div>
        <span class="text-600 font-medium line-height-3">Already have an account?</span>&nbsp;
        <router-link to="/login">Go To Login</router-link>
        <h6 v-if="err !== ''" class="p-error">{{ err }}</h6>
      </div>
      <form enctype="multipart/form-data" @submit.prevent="signup">
        <div>
          <label for="full_name" class="block text-900 font-medium mb-2">Full Name</label>
          <InputText
            id="full_name"
            v-model="full_name"
            type="text"
            class="w-full"
            :class="v$.full_name.$error ? 'p-invalid': ''"
          />
          <small v-if="v$.full_name.$error" class="p-error">{{ v$.full_name.$errors[0].$message }}</small>

          <label for="email1" class="block text-900 font-medium my-2">Email</label>
          <InputText
            id="email1"
            v-model="email"
            type="email"
            class="w-full"
            :class="v$.email.$error ? 'p-invalid': ''"
          />
          <small v-if="v$.email.$error" class="p-error">{{ v$.email.$errors[0].$message }}</small>

          <label for="password1" class="block text-900 font-medium my-2">Password</label>
          <Password
            v-model="password"
            toggle-mask
            class="password-input w-full"
            :class="v$.password.$error ? 'p-invalid': ''"
          >
            <template #header><h6>Pick a password</h6></template>
            <template #footer="sp">
              {{ sp.level }}
              <Divider />
              <p class="mt-2">Suggestions</p>
              <ul class="pl-2 ml-2 mt-0" style="line-height: 1.5">
                <li>At least one lowercase</li>
                <li>At least one uppercase</li>
                <li>At least one numeric</li>
                <li>Minimum 8 characters</li>
              </ul>
            </template>
          </Password>
          <div v-if="v$.password.$error">
            <small v-for="(error, index) in v$.password.$errors" :key="index" class="p-error">
              <p class="p-0 m-0">{{ error.$message }}</p>
            </small>
          </div>

          <label for="password2" class="block text-900 font-medium my-2">Confirm Password</label>
          <Password
            v-model="password2"
            toggle-mask
            placeholder="Confirm Password"
            class="password-input w-full"
            :class="v$.password2.$error ? 'p-invalid': ''"
            input-class="w-full"
            :feedback="false"
          />
          <small v-if="v$.password2.$error" class="p-error">{{ v$.password2.$errors[0].$message }}</small>

          <Button
            label="Sign Up"
            icon="pi pi-user"
            class="w-full mt-2 e2e-register"
            type="submit"
          />
        </div>
      </form>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-unused-vars */
import { defineComponent, ref, computed, reactive, toRefs } from 'vue';
import { useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import { useStore } from 'vuex';
import { required, helpers, email, minLength, sameAs } from '@vuelidate/validators';
import { HttpService } from '../../service/base.mjs';

export default defineComponent({
  name: 'Register',
  props: {},
  setup() {
    const loading = ref(false);
    const { dispatch, getters } = useStore();

    const state = reactive({
      full_name: '',
      email: '',
      password: '',
      password2: '',
    });

    const clearForm = () => {
      state.full_name = '';
      state.email = '';
      state.password = '';
      state.password2 = '';
    };

    // validation rules
    const rules = computed(() => ({
      full_name: {
        required: helpers.withMessage('Full Name is required', required),
        minLength: helpers.withMessage('Full Name must be at least 3 characters', minLength(3)),
      },
      email: {
        required: helpers.withMessage('Email is required', required),
        email: helpers.withMessage('Invalid email', email),
      },
      password: {
        required: helpers.withMessage('Password is required', required),
        minLength: helpers.withMessage('Password must be at least 8 characters', minLength(8)),
        containsUppercase: helpers.withMessage(
          () => 'Password must be at least one uppercase',
          value => /[A-Z]/.test(value),
        ),
        containsLowercase: helpers.withMessage(
          () => 'Password must be at least one lowercase',
          value => /[a-z]/.test(value),
        ),
        containsNumber: helpers.withMessage(
          () => 'Password must be at least one numeric',
          value => /[0-9]/.test(value),
        ),
      },
      password2: {
        required: helpers.withMessage('Password confirmation is required', required),
        sameAs: helpers.withMessage('The confirmation password must be same as password', sameAs(state.password)),
      },
    }));
    const router = useRouter();
    const v$ = useVuelidate(rules, state);
    const token = computed(() => getters.token);
    const err = computed(() => getters.error);

    const signup = async () => {
      try {
        v$.value.$validate();
        if (!v$.value.$error) {
          const formData = new FormData();
          formData.append('email', state.email);
          formData.append('full_name', state.full_name);
          formData.append('password', state.password);
          await dispatch('registerUser', formData);
          clearForm();
          v$.value.$reset();
          await HttpService.setToken(token.value);
          router.push({ name: 'users' });
        }
      } catch (error) {
        console.log(error);
      }
    };

    return {
      loading,
      signup,
      v$,
      err,
      ...toRefs(state),
    };
  },
});
</script>

<style lang="scss">
.password-input {
  input {
    width: 100% !important;
  }
}
.loginContainer {
  width: 100%;
  display: flex;
  justify-content:center;
}
p {
  margin: revert;
}

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
