/* eslint-disable no-param-reassign */
/* eslint-disable no-shadow */
/* eslint-disable consistent-return */
/* eslint-disable import/prefer-default-export */
import http from '../../plugins/axios.mjs';

const config = process.env.NODE_ENV === 'production' ? `${window.location.origin}/api/` : `${import.meta.env.VITE_APP_BASE_URL}/api/`;
// eslint-disable-next-line import/prefer-default-export
export const auth = {
  state: {
    user: null,
    success: false,
    loading: false,
    error: '',
    token: '',
  },
  getters: {
    token: state => state.token,
    organizations: state => state.user.Organizations,
    error: state => state.error,
    logo_filename: state => state.user?.Organization?.logo_filename,
    favicon_filename: state => state.user?.Organization?.favicon_filename,
    azure_ad_secret: state => state.user?.Organization?.azure_ad_secret,
    organizationId: state => state.user?.organization_id,
    organizationManual: state => state.user?.Organization?.manual,
    UserID: state => state.user?.id,
    user: state => state.user,
    roleId: state => state.user?.role_id,
    roleName: state => state.user?.Role?.name,
    globalLoadingStatus: state => state.loading,
  },
  mutations: {
    showLoader(state, loadingStatus) {
      state.loading = loadingStatus;
    },

    login: (state, { user, token }) => {
      state.user = user;
      state.organizationId = user.organization_id;
      state.token = token;
      state.success = true;
    },

    logout: state => {
      state.user = null;
      state.token = '';
      state.error = '';
    },

    forgetPassword: () => {},

    updateCompanyData: (state, { organization }) => {
      if (organization) state.user.Organization = organization;
      state.success = true;
    },

    setError: (state, { error }) => {
      state.error = error?.message || 'An unexpected error occured';
    },
    clearError: state => {
      state.error = '';
    },
    setForgetError: (state, { error }) => {
      state.error = error;
    },
  },
  actions: {
    login: async ({ commit }, data) => {
      try {
        const res = await http.post('auth/login', data);
        commit('login', res.data);
        return res;
      } catch (error) {
        // TODO: notify airbrake/sentry
        commit('setError', error.response.data);
        localStorage.clear();
      }
    },
    registerUser: async ({ commit }, data) => {
      try {
        const res = await http.post('user/register', data);
        commit('login', res.data);
        return res;
      } catch (error) {
        commit('setError', error.response.data);
        localStorage.clear();
      }
    },
    // eslint-disable-next-line no-empty-pattern
    sendForgetPasswordEmail: ({}, data) => http.post('auth/send-forgetPassword-email', { ...data, host: window.location.host }),
    forgetPassword: async ({ commit }, data) => {
      try {
        const res = await http.post(`auth/forgetPassword/${data.id}/${data.token}`, { password: data.password });
        commit('updateCompanyData', res.data);
        return res.data;
      } catch (error) {
        commit('setForgetError', error.response.data);
      }
    },
    clearError: async ({ commit }) => {
      commit('clearError');
    },
    // eslint-disable-next-line no-empty-pattern
    changePasswordEmail: async ({}, data) => {
      await http.post('auth/send-changePassword-email', data);
    },
    showFullPageLoader: ({ commit }, data) => {
      commit('showLoader', data);
    },
    samlAuth: async ({ commit }, data) => {
      try {
        const res = await http.post('auth/loginWithToken', data);
        commit('login', res.data);
        return res;
      } catch (error) {
        commit('setError', error.response.data);
        localStorage.clear();
      }
    },
    // eslint-disable-next-line no-empty-pattern
    samlLogin: async ({ }, data) => {
      const res = await http.post('auth/samlLogin', { apiURL: config, appURL: window.location.origin, email: data.email, provider: data.provider });
      return res;
    },
  },
};
