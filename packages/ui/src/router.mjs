import { createRouter, createWebHistory } from 'vue-router';
import { computed } from 'vue';
import store from './store/index.mjs';

import { HttpService } from './service/base.mjs';

const subdomain = window.location.host.split('.')[0];
const isOtto = subdomain?.includes('otto');

const RedirectSSO = async () => {
  if (sessionStorage.getItem('token') != null) {
    const token = decodeURIComponent(sessionStorage.getItem('token')).replaceAll('$', '.');
    sessionStorage.removeItem('token');
    store.dispatch('showFullPageLoader', true);
    await store.dispatch('samlAuth', { token });

    HttpService.setToken(token);
    store.dispatch('showFullPageLoader', false);
    window.location.href = '/';
  } else {
    // return user to login page
    window.location.href = '/';
  }
};

const routes = [
  {
    path: '',
    component: () => import('./layout/default-layout.vue'),
    redirect: '/dashboard',
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: '/dashboard',
        name: 'dashboard',
        component: () => (isOtto ? import('./pages/dashboards/dashboard1.vue') : import('./components/Dashboard.vue')),
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: '/dashboard/smart-energy',
        name: 'smartEnergy',
        component: () => import('./components/DashboardSmartEnergy.vue'),
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: '/users/:id/profile/',
        name: 'otto-user-profile',
        component: () => import('./pages/users/otto-user-profile.vue'),
        meta: {
          requiresAuth: true,
          checkSubDomain: true,
        },
      },
      {
        path: '/dashboard/dashboard6',
        name: 'dashboard6',
        component: () => import('./pages/dashboards/dashboard6.vue'),
        meta: {
          requiresAuth: true,
          checkSubDomain: true,
        },
      },
      {
        path: '/locations',
        name: 'locations',
        component: () => import('./pages/locations/index.vue'),
        meta: {
          requiresAuth: true,
          // AllPermission: 'View Locations'
        },
      },
      {
        path: '/locations/:id',
        name: 'locationdetails',
        component: () => import('./pages/LocationDetails.vue'),
        meta: {
          requiresAuth: true,
          // AllPermission: 'View Locations'
        },
      },
      {
        path: '/configuration',
        name: 'configuration',
        component: () => import('./pages/configuration.vue'),
      },
      {
        path: '/accountSetting',
        name: 'AccountSetting',
        component: () => import('./pages/accountSetting.vue'),
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: '/create-directory',
        name: 'createdirectory',
        component: () => import('./pages/createDirectory.vue'),
      },
      {
        path: '/create-directory/:id',
        name: 'createdomain',
        component: () => import('./pages/createDomain.vue'),
      },
      {
        path: '/units',
        name: 'units',
        component: () => import('./pages/units/index.vue'),
        meta: {
          requiresAuth: true,
          // AllPermission: 'View Units',
        },
      },
      {
        path: '/organizations',
        name: 'organizations',
        component: () => import('./components/Organizations.vue'),
        meta: {
          requiresAuth: true,
          // AllPermission: "View Organizations/Accounts"
        },
      },
      {
        path: '/roles',
        name: 'roles',
        component: () => import('./pages/Roles.vue'),
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: '/get-otto-device-reports',
        name: 'inspectionreports',
        component: () => import('./pages/inspectionReports/index.vue'),
      },
      {
        path: '/get-report/:id',
        name: 'inspectionreportsDetails',
        component: () => import('./pages/inspectionReports/inspectionReport.vue'),
      },
      {
        path: '/unit/:id',
        name: 'unit',
        component: () => import('./pages/units/unit/index.vue'),
        meta: {
          requiresAuth: true,
          AllPermission: 'View Units',
        },
      },
      {
        path: '/users',
        name: 'users',
        component: () => import('./pages/users/index.vue'),
        meta: {
          // AllPermission: "View Users"
        },
      },
      {
        path: '/users/:id',
        name: 'userDetail',
        component: () => import('./pages/userDetail.vue'),
        meta: {
          AllPermission: 'User Management',
        },
      },
      {
        path: '/alerts',
        name: 'alerts',
        component: () => import('./pages/alerts/index.vue'),
      },
      {
        path: '/reports',
        name: 'reports',
        component: () => import('./pages/reports.vue'),
      },
      {
        path: '/kbdevice/:id',
        name: 'kbDeviceDetail',
        component: () => import('./pages/kbDeviceDetail.vue'),
      },
      {
        path: '/devices',
        name: 'devices',
        component: () => import('./pages/devices/index.vue'),
      },
    ],
  },
  // ================================= auth layout=========================
  {
    path: '',
    component: () => import('./layout/auth-layout.vue'),
    meta: {
      requiresAuth: false,
    },
    children: [
      {
        path: '/login',
        name: 'login',
        component: () => import('./pages/auth/Login.vue'),
        meta: {
          requiresAuth: false,
        },
      },
      {
        path: '/login/:message',
        name: 'loginError',
        component: () => import('./pages/auth/Login.vue'),
        beforeEnter: to => {
          sessionStorage.setItem('message', atob(to.params.message));
          window.location.href = '/';
        },
        meta: {
          requiresAuth: false,
        },
      },
      {
        path: '/register',
        name: 'register',
        component: () => import('./pages/auth/Register.vue'),
        meta: {
          requiresAuth: false,
        },
      },
      {
        path: '/forget-password',
        name: 'forgetPassword',
        component: () => import('./pages/auth/forgetPass.vue'),
        meta: {
          requiresAuth: false,
        },
      },
      {
        path: '/redirect-sso/:token',
        name: 'redirect-sso-token',
        beforeEnter: to => {
          sessionStorage.setItem('token', to.params.token);
          window.location.href = '/redirect-sso';
        },
        meta: {
          requiresAuth: false,
        },
      },
      {
        path: '/redirect-sso',
        name: 'redirect-sso',
        component: RedirectSSO,
        meta: {
          requiresAuth: false,
        },
      },
      {
        path: '/changePass/:id/:token',
        name: 'changePassword',
        component: () => import('./pages/auth/changePass.vue'),
        meta: {
          requiresAuth: false,
        },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// router guards
router.beforeEach(async (to, from, next) => {
  window.scrollTo(0, 0);
  const roleId = computed(() => store.getters.roleId);
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const token = computed(() => store.getters.token);
  if (roleId.value) {
    await store.dispatch('getPermissionById', { roleId: roleId.value });
    await store.dispatch('getPermissionByRoleId', { roleId: roleId.value });
  }
  // const checkSubDomain = to.matched.some((record) => record.meta.checkSubDomain);
  // const subdomain = window.location.host.split('.')[0];
  // if(requiresAuth && token.value && checkSubDomain && subdomain?.includes('otto')) {
  //   next();
  // } else if (checkSubDomain && !subdomain?.includes('otto')) {
  //   next('/dashboard');
  // }
  if (requiresAuth && token.value) {
    next();
  } else if (requiresAuth && !token.value) {
    next('/login');
  } else if (!requiresAuth && token.value) {
    next('/');
  } else {
    next();
  }
});

export default router;
