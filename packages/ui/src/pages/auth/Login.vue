<template>
  <div class="loginContainer">
    <div v-if="showLoginKwikiq" class="login-page">
      <form @submit.prevent="login">
        <h1 class="text-white">KwikIQ</h1>
        <span v-if="hasProvider" class="text-white">{{ email }}</span>
        <h6 v-if="err !== ''" class="p-error">{{ err }}</h6>
        <div>
          <span v-if="!hasProvider" class="p-input-icon-left">
            <i class="pi pi-user" />
            <InputText v-model="email" type="email" placeholder="Email" />
          </span>
          <!-- <small v-if="hasProvider && v$.email.$error" class="p-error">
            {{ v$.email.$errors[0].$message }}
          </small> -->
          <small v-if="!hasProvider && e$.email.$error" class="p-error">{{ e$.email.$errors[0].$message }}</small> -->
        </div>

        <div v-if="hasProvider">
          <Button
            label="Login with Password"
            icon="pi pi-user"
            class="w-full mt-2" type="button"
            @click="displayPassword" />

          <div class="p-divider p-component p-divider-horizontal p-divider-solid p-divider-center" role="separator">
            <div class="p-divider-content">
              <b>OR</b>
            </div>
          </div>

          <div v-for="(data, index) in provider" :key="index">
            <Button
              :label="`Login with ${data.name}`"
              :icon="data.type == 'saml'? 'pi pi-user' : `pi pi-${data.type}`"
              class="w-full mt-2 p-button-outlined" type="button"
              @click="generalLogin(data.type)" />
          </div>
        </div>

        <div v-if="showPassword">
          <span class="p-input-icon-left">
            <i class="pi pi-lock" />
            <InputText v-model="password" type="password" placeholder="Password" />
          </span>
          <!-- <small v-if="showPassword && v$.password.$error" class="p-error">
            {{ v$.password.$errors[0].$message }}
          </small> -->
        </div>
        <router-link v-if="showPassword" :to="{ name: 'forgetPassword' }" class="sm">
          Forgot Password
        </router-link>
        <Button
          v-if="showPassword" label="Login" class="mr-2 mb-2 mt-4 w-100"
          type="submit" />

        <Button
          v-if="!showPassword && !hasProvider" label="Next" class="mr-2 mb-2  w-100"
          type="button" @click="samlLogin" />

        <p v-if="!hasProvider" class="sm text-white">
          Don't have an account? <router-link to="#">Sign-up here</router-link>
        </p>
      </form>
    </div>

    <div v-else class="surface-card p-4 shadow-2 border-round w-full lg:w-6">
      <div class="text-center mb-5">
        <div class="text-900 text-3xl font-medium mb-3">Welcome Back</div>
        <span v-if="!hasProvider" class="text-600 font-medium line-height-3">Don't have an account?</span>&nbsp;
        <router-link v-if="!hasProvider" to="/register">Create one today!</router-link>
        <span v-if="hasProvider">{{ email }}</span>
        <h6 v-if="err !== ''" class="p-error">{{ err }}</h6>
      </div>
      <form @submit.prevent="login">
        <div>
          <label v-if="!hasProvider" for="email1" class="block text-900 font-medium mb-2">Email</label>
          <InputText v-if="!hasProvider" id="email1" v-model="email" type="email" class="w-full mb-3" />
          <!-- <small v-if="showPassword && v$.email.$error" class="p-error">
            {{ v$.email.$errors[0].$message }}
          </small> -->
          <small v-if="!hasProvider && e$.email.$error" class="p-error">{{ e$.email.$errors[0].$message }}</small>

          <div v-if="hasProvider">
            <Button
              label="Login with Password"
              icon="pi pi-user"
              class="w-full mt-2" type="button"
              @click="displayPassword" />

            <div class="p-divider p-component p-divider-horizontal p-divider-solid p-divider-center" role="separator">
              <div class="p-divider-content">
                <b>OR</b>
              </div>
            </div>

            <div v-for="(data, index) in provider" :key="index">
              <Button
                :label="`Login with ${data.name}`"
                :icon="data.type == 'saml'? 'pi pi-user' : `pi pi-${data.type}`"
                class="w-full mt-2 p-button-outlined" type="button"
                @click="generalLogin(data.type)" />
            </div>
          </div>

          <label v-if="showPassword" for="password1" class="block text-900 font-medium mb-2">Password</label>
          <Password
            v-if="showPassword"
            v-model="password"
            toggle-mask
            placeholder="Password"
            class="password-input w-full mb-3"
            input-class="w-full"
            :feedback="false"
          />

          <div v-if="showPassword" class="flex align-items-center justify-content-between mb-6">
            <div class="flex align-items-center" />
            <router-link
              :to="{ name: 'forgetPassword' }"
              class="font-medium no-underline ml-2 text-blue-500 text-right">
              Forgot Password
            </router-link>
          </div>

          <Button
            v-if="showPassword" label="Sign In" icon="pi pi-user"
            class="w-full e2e-signin" type="submit" />
        </div>
      </form>
      <Button
        v-if="!showPassword && !hasProvider" label="Next"
        class="w-full mt-2 e2e-next" type="button"
        @click="samlLogin" />
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted, computed, reactive, toRefs } from 'vue';
import { useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import { useStore } from 'vuex';
import { loginSchema, loginEmailSchema } from '../../validation/login.mjs';
import { installGoogleAuth } from '../../helper/googleAuth.mjs';
import googleLogo from '../../assets/images/googleLogo.png';
import { HttpService } from '../../service/base.mjs';
import { useToastService } from '../../composables/useToast.mjs';

export default defineComponent({
  name: 'Login',
  props: {},
  setup() {
    const loading = ref(false);
    const showLoginKwikiq = ref(false);
    const { dispatch, getters } = useStore();
    const { showToast } = useToastService();

    const state = reactive({
      email: '',
      password: '',
    });

    // validation rules
    const rules = computed(() => loginSchema);
    const emailRule = computed(() => loginEmailSchema);
    const router = useRouter();
    const v$ = useVuelidate(rules, state);
    const e$ = useVuelidate(emailRule, state);
    const token = computed(() => getters.token);
    const err = computed(() => getters.error);
    const showPassword = ref(false);
    const hasProvider = ref(false);
    const provider = ref([]);

    let gAuth;
    const options = {
      clientId: import.meta.env.VITE_APP_AUTH_CLIENT_ID,
      scope: 'profile email',
      prompt: 'select_account',
    };

    onMounted(async () => {
      const subdomain = window.location.host.split('.')[0];
      if (subdomain?.includes('kwikiq')) {
        showLoginKwikiq.value = true;
      }
      gAuth = await installGoogleAuth(options);

      if (sessionStorage.getItem('message') != null) {
        showPassword.value = true;
        showToast({
          severity: 'error',
          summary: 'Error',
          detail: decodeURIComponent(sessionStorage.getItem('message')),
        });
        sessionStorage.removeItem('message');
      } else {
        // return user to login page
        // window.location.href = '/';
      }
    });

    const loginWithGoogle = async () => {
      try {
        if (!gAuth) return;
        await gAuth.signIn();
      } catch (error) {
        console.log(error);
      }
    };

    const login = async () => {
      try {
        v$.value.$validate();
        if (!v$.value.$error) {
          dispatch('showFullPageLoader', true);
          await dispatch('login', state);
          v$.value.$reset();
          HttpService.setToken(token.value);
          dispatch('showFullPageLoader', false);
          router.push({ name: 'dashboard' });
        }
      } catch (error) {
        dispatch('showFullPageLoader', false);
        console.log(error);
      }
    };

    const generalLogin = async _provider => {
      dispatch('showFullPageLoader', true);
      const UR = await dispatch('samlLogin', { email: state.email, provider: _provider });
      dispatch('showFullPageLoader', false);
      window.location = UR.data.SAMLURL;
    };

    const samlLogin = async () => {
      try {
        e$.value.$validate();
        if (!e$.value.$error) {
          dispatch('showFullPageLoader', true);
          const res = await dispatch('samlLogin', { email: state.email, provider: 'none' });
          dispatch('showFullPageLoader', false);
          if (res.data.redirect) {
            window.location = res.data.SAMLURL;
          } else if (res.data.providers.length !== 0) {
            hasProvider.value = true;
            provider.value = res.data.providers;
            showPassword.value = false;
          } else {
            if (res.data.message !== '' && res.data.message !== 'Email does not exists') {
              showToast({
                severity: 'error',
                summary: 'Error',
                detail: res.data.message,
              });
            }
            hasProvider.value = false;
            provider.value = [];
            showPassword.value = true;
          }
          e$.value.$reset();
        }
      } catch (error) {
        dispatch('showFullPageLoader', false);
      }
    };

    const displayPassword = async () => {
      hasProvider.value = false;
      provider.value = [];
      showPassword.value = true;
    };

    return {
      loading,
      loginWithGoogle,
      login,
      e$,
      googleLogo,
      err,
      generalLogin,
      samlLogin,
      displayPassword,
      showPassword,
      hasProvider,
      provider,
      ...toRefs(state),
    };
  },
});
</script>

<style lang="scss" scoped>
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
