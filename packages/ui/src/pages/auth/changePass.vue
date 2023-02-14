<template>
  <div class="login-page">
    <form @submit.prevent="changePassword">
      <h1 class="text-white">KwikIQ</h1>
      <h5 class="text-white">Reset Your Password</h5>
      <h6 v-if="err !== ''" class="p-error">{{ err?.message }}</h6>
      <div>
        <span class="p-input-icon-left">
          <i class="pi pi-lock" style="z-index: 9;" />
          <Password
            v-model="password"
            toggle-mask
            placeholder="New Password"
            class="password-input w-full"
            :class="v$.password.$error ? 'p-invalid': ''"
            input-class="w-full"
            input-style="padding-left: 33px;"
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
        </span>
        <div v-if="v$.password.$error">
          <small v-for="(error, index) in v$.password.$errors" :key="index" class="p-error">
            <p class="p-0 m-0">{{ error.$message }}</p>
          </small>
        </div>
      </div>

      <div>
        <span class="p-input-icon-left">
          <i class="pi pi-lock" style="z-index: 9;" />
          <Password
            v-model="cpassword"
            toggle-mask
            placeholder="Confirm Password"
            class="password-input w-full"
            :class="v$.cpassword.$error ? 'p-invalid': ''"
            input-class="w-full"
            input-style="padding-left: 33px;"
            :feedback="false"
          />
        </span>
        <small v-if="v$.cpassword.$error" class="p-error">{{ v$.cpassword.$errors[0].$message }}</small>
      </div>

      <Button
        label="Reset Password"
        class="mr-2 mb-2 mt-2 w-100"
        type="submit"
      />
    </form>
  </div>
</template>

<script>
import { defineComponent, ref, computed, reactive, toRefs, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import { useStore } from 'vuex';
import { required, helpers, minLength, sameAs } from '@vuelidate/validators';
import googleLogo from '../../assets/images/googleLogo.png';

export default defineComponent({
  name: 'ChangePass',
  props: {},
  setup() {
    const loading = ref(false);
    const { dispatch, getters } = useStore();

    const state = reactive({
      password: '',
      cpassword: '',
    });

    // validation rules
    const rules = computed(() => ({
      password: {
        required: helpers.withMessage('New password is required', required),
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
      cpassword: {
        required: helpers.withMessage('Password confirmation is required', required),
        sameAs: helpers.withMessage('Confirm password must be same as password', sameAs(state.password)),
      },
    }));
    // const router = useRouter();
    const { params } = useRoute();
    const v$ = useVuelidate(rules, state);
    const err = computed(() => getters.error);

    onMounted(() => dispatch('clearError'));

    const changePassword = async () => {
      try {
        v$.value.$validate();
        if (!v$.value.$error) {
          const res = await dispatch('forgetPassword', { ...state, ...params });
          v$.value.$reset();
          if (res) {
            state.password = '';
            state.cpassword = '';

            window.location.href = '/';
          } else if (err.value.resendEmail) {
            await dispatch('sendForgetPasswordEmail', { id: params.id });
          }
          // router.push({ name: 'login' });
        }
      } catch (error) {
        const exception = error?.response;
        if (exception?.status === 400) err.value = exception?.data?.error?.message;
      }
    };

    return {
      loading,
      changePassword,
      v$,
      googleLogo,
      err,
      ...toRefs(state),
    };
  },
});
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
