<template>
  <div class="layout-topbar topbar">
    <button
      class="p-link layout-menu-button layout-topbar-button"
      @click="onMenuToggle"
    >
      <i class="pi pi-bars" />
    </button>
    <router-link
      to="/"
      class="layout-topbar-logo"
    >
      <img
        v-if="isOtto"
        alt="Otto Logo"
        :src="ottoLogo"
        class="mt-1"
      >
      <img
        v-else
        alt="Your logo here"
        :src="logoFilename"
      >
    </router-link>

    <button
      v-styleclass="{
        selector: &quot;@next&quot;,
        enterClass: &quot;hidden&quot;,
        enterActiveClass: &quot;scalein&quot;,
        leaveToClass: &quot;hidden&quot;,
        leaveActiveClass: &quot;fadeout&quot;,
        hideOnOutsideClick: true,
      }"
      class="p-link layout-topbar-menu-button layout-topbar-button"
    >
      <i class="pi pi-ellipsis-v" />
    </button>
    <ul class="layout-topbar-menu hidden lg:flex origin-top">
      <li
        v-if="showLogoKwikiq"
        style="display: flex; align-items: center"
      >
        <img
          alt="KwikIQ Logo"
          :src="kwikIQLogo"
          style="width: 200px; max-height: 27px"
        >
      </li>
      <li>
        <Menu
          ref="menu"
          :model="menuItems"
          :popup="true"
          class="menuItemClass"
        />
        <Avatar
          v-if="userAvatarName"
          v-tooltip.bottom="{ value: userEmailAddress, class: 'nav-avatar tooltipClass' }"
          :label="userAvatarName"
          class="p-link e2e-profile"
          shape="circle"
          size="large"
          style="background-color:#2196F3; color: #ffffff"
          @click="toggleMenu"
        />
        <Avatar
          v-else
          v-tooltip.bottom="{ value: userEmailAddress, class: 'nav-avatar' }"
          icon="pi pi-user"
          class="p-link"
          size="large"
          style="background-color:#2196F3; color: #ffffff"
          shape="circle"
          @click="toggleMenu"
        />
      </li>
    </ul>
  </div>
</template>

<script setup>
/* eslint-disable import/no-unresolved */
import { ref, computed, onMounted, defineEmits, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import placeholderFavicon from '@/assets/images/favicon.svg';
import placeholderLogo from '@/assets/images/default_company_logo.png';
import kwikIQLogo from '@/assets/images/kwikboost_logo.svg';
import ottoLogo from '@/assets/images/otto_logo.svg';

const store = useStore();
const router = useRouter();
const menu = ref(null);
const showLogoKwikiq = computed(() => window.location.host.split('.')[0]?.includes('kwikiq'));
const isOtto = computed(() => window.location.host.split('.')[0]?.includes('otto'));
const logoFilename = computed(() => {
  if (store?.getters?.organization?.logo_filename) {
    return store?.getters?.organization?.logo_filename;
  }
  if (store?.getters?.logo_filename) {
    return store?.getters?.logo_filename;
  }

  return placeholderLogo;
});
const faviconFilename = computed(() => {
  if (store?.getters?.organization?.favicon_filename) {
    return store?.getters?.organization?.favicon_filename;
  }
  if (store?.getters?.favicon_filename) {
    return store?.getters?.favicon_filename;
  }

  return placeholderFavicon;
});

const emit = defineEmits(['menu-toggle', 'topbar-menu-toggle']);

onMounted(() => {
  store.dispatch('findAllNotifications');
  const favicon = document.getElementById('favicon');
  favicon.href = faviconFilename.value;
});

watchEffect(() => {
  const favicon = document.getElementById('favicon');
  favicon.href = faviconFilename.value;
});

// const goToAccountSetting = () => { router.push('/accountSetting'); };

const userAvatarName = computed(() => store?.getters?.user?.full_name?.slice(0, 1).toUpperCase());

const userEmailAddress = computed(() => store?.getters?.user?.email);

const logout = () => {
  store.commit('logout');
  router.replace('/login');
};

const menuItems = computed(() => [
  {
    label: 'Logout',
    icon: 'pi pi-sign-out',
    command: logout,
    class: 'e2e-logout',
  },
]);

const onMenuToggle = event => emit('menu-toggle', event);

const toggleMenu = event => {
  menu.value.toggle(event);
};

</script>

<style>
.nav-avatar.p-tooltip {
  /* position: absolute !important; */
  right: 30px !important;
  max-width: 100% !important;
  left: auto !important;
}
.nav-avatar.p-tooltip-text {
  white-space: nowrap !important;
}
.nav-avatar.p-tooltip-bottom .p-tooltip-arrow {
  left: auto !important;
  right: 20px !important;
}

.topbar {
  z-index: 999;
}

.menuItemClass {
  position: fixed !important;
  top: 69px !important;
  display: block !important;
  z-index: 9999;
}

.tooltipClass {
  position: fixed !important;
  top:65px !important;
  z-index: 9999;
}

</style>
