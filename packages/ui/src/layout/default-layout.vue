<template>
  <div :class="containerClass" @click="onWrapperClick">
    <AppTopBar @menu-toggle="onMenuToggle" />
    <div class="layout-sidebar" @click="onSidebarClick">
      <AppMenu
        v-if="isNavLoaded"
        :model="menu"
        :model2="bottomMenu"
        @menuitem-click="onMenuItemClick"
      />

      <div v-else class="custom-skeleton p-4">
        <div class="flex mb-3 mt-3">
          <div class="p-skeleton p-component mb-2" style="width:15rem;height: 1.5rem;" />
        </div>
        <div class="flex mb-3 mt-3">
          <div class="p-skeleton p-component mb-2" style="width:15rem;height: 1.5rem;" />
        </div>
        <div class="flex mb-3 mt-3">
          <div class="p-skeleton p-component mb-2" style="width:15rem;height: 1.5rem;" />
        </div>
      </div>
    </div>
    <div class="layout-main-container">
      <div class="layout-main">
        <router-view />
      </div>
      <AppFooter />
    </div>
    <transition name="layout-mask">
      <div v-if="mobileMenuActive" class="layout-mask p-component-overlay" />
    </transition>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import AppTopBar from './component/AppTopbar.vue';
import AppMenu from './component/AppMenu.vue';
import AppFooter from './component/AppFooter.vue';
import {
  SUPER_ADMIN_ROLE_ID,
} from '../utils/constants.mjs';

const subdomain = window.location.host.split('.')[0];
const isKwikIQ = subdomain?.includes('kwikiq');
const isOtto = subdomain?.includes('otto');

export default {
  components: {
    AppTopBar,
    AppMenu,
    // AppConfig: AppConfig,
    AppFooter,
  },
  data() {
    return {
      RoleByPermission_data: [],
      subdomain,
      isKwikIQ,
      isOtto,
      layoutMode: 'static',
      layoutColorMode: 'light',
      staticMenuInactive: false,
      overlayMenuActive: false,
      mobileMenuActive: false,
      expandedPermission: new Set(),
      isNavLoaded: false,
      menu: [
        {
          label: '',
          items: [
            {
              label: 'Dashboard',
              icon: 'pi pi-fw pi-home',
              to: '/dashboard',
            },
            {
              label: isOtto ? 'Sites' : 'Locations',
              icon: 'pi pi-fw pi-compass',
              to: '/locations',
              permission: 'View location',
            },
            {
              label: isOtto ? 'Ladders' : 'Units',
              icon: 'pi pi-fw pi-tablet',
              to: '/units',
              permission: 'View Units',
            },
            {
              label: 'Users',
              icon: 'pi pi-fw pi-users',
              to: '/users',
              permission: 'View Users',
            },
            {
              label: 'Configuration',
              permission: 'Create/Update/Delete Configuration',
              icon: 'pi pi-fw pi-cog',
              to: '/configuration',
            },
          ],
          permissions: [],
        },
      ],
      bottomMenu: [
        {
          label: '',
          items: [{
            label: 'Help & Getting Started',
            icon: 'pi pi-fw pi-question-circle',
            to: '/',
            hidden: true,
          },
          {
            label: 'Invite teammates',
            icon: 'pi pi-fw pi-user-plus',
            to: '/users',
            props: true,
            hidden: true,
          }],
          permissions: [],
          hidden: true,
        },
      ],
    };
  },
  computed: {
    ...mapGetters(['RoleByPermission', 'organization', 'getPermissionById']),
    containerClass() {
      return [
        'layout-wrapper',
        {
          'layout-overlay': this.layoutMode === 'overlay',
          'layout-static': this.layoutMode === 'static',
          'layout-static-sidebar-inactive':
            this.staticMenuInactive && this.layoutMode === 'static',
          'layout-overlay-sidebar-active':
            this.overlayMenuActive && this.layoutMode === 'overlay',
          'layout-mobile-sidebar-active': this.mobileMenuActive,
          'p-input-filled': this.$primevue.config.inputStyle === 'filled',
          'p-ripple-disabled': this.$primevue.config.ripple === false,
          'layout-theme-light': this.$appState.theme.startsWith('saga'),
        },
      ];
    },
    logo() {
      return this.layoutColorMode === 'dark'
        ? 'images/logo-white.svg'
        : 'images/logo.svg';
    },
  },
  watch: {
    organization(val) {
      if (val.manual && this.menu[0].items.filter(x => x.label === 'Product Manual').length === 0) {
        this.menu[0].items.push(
          {
            label: 'Product Manual',
            icon: 'pi pi-fw pi-cloud-download',
            command: async () => {
              const res = await this.$store.dispatch('downloadManual');
              this.download_file(res.data.url, this.organization.manual.substring(this.organization.manual.lastIndexOf('/') + 1));
            },
          },
        );
      }
    },
    $route() {
      this.menuActive = false;
      this.$toast.removeAllGroups();
    },
    RoleByPermission() {
      this.menuFilter();
    },
  },
  beforeUpdate() {
    if (this.mobileMenuActive) {
      this.addClass(document.body, 'body-overflow-hidden');
    } else {
      this.removeClass(document.body, 'body-overflow-hidden');
    }
  },
  async mounted() {
    for (let i = 0; i < this.RoleByPermission.length; i += 1) {
      this.RoleByPermission_data.push(this.RoleByPermission[i].name);
    }
    this.more_page();

    const { organizationId } = this.$store.getters;
    const { roleId } = this.$store.getters;
    await this.getPermissions(roleId);
    if (organizationId) {
      await this.$store.dispatch('getOrganization', organizationId);
    }
    this.$store.dispatch('startSocketConnection');
    this.menuFilter();
    this.isNavLoaded = true;
  },
  beforeUnmount() {
    this.$store.dispatch('disconnectSocketConnection');
  },
  methods: {
    more_page() {
      if (isKwikIQ) {
        this.menu[0].items.push(
          {
            label: 'Reporting',
            icon: 'pi pi-fw pi-chart-bar',
            to: '/reports',
            permission: 'View Reports',
          },
          { label: 'Alerts', icon: 'pi pi-fw pi-info-circle', to: '/alerts', permission: 'View Alerts' },
        );
      }

      this.menu[0].items.push(
        {
          label: 'Organizations',
          icon: 'pi pi-fw pi-sitemap',
          to: '/organizations',
          permission: 'View Organizations/Accounts',
        },
        {
          label: 'Roles',
          icon: 'pi pi-fw pi-list',
          to: '/roles',
          permission: 'Create/Update/Delete roles',
        },
      );

      if (isOtto) {
        this.menu[0].items.push({
          label: 'Inspection Reports',
          icon: 'pi pi-pw pi-chart-bar',
          to: '/get-otto-device-reports',
        });
      }
    },
    download_file(fileURL, fileName) {
      const save = document.createElement('a');
      save.href = fileURL;
      save.target = '_blank';
      const filename = fileURL.substring(fileURL.lastIndexOf('/') + 1);
      save.download = fileName || filename;
      if (navigator.userAgent.toLowerCase().match(/(ipad|iphone|safari)/) && navigator.userAgent.search('Chrome') < 0) {
        document.location = save.href;
        // window event not working here
      } else {
        const evt = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: false,
        });
        save.dispatchEvent(evt);
        (window.URL || window.webkitURL).revokeObjectURL(save.href);
      }
    },
    async getPermissions(role) {
      const { roleId } = this.$store.getters;
      await this.$store.dispatch('getPermissionById', {
        roleId: role,
      });
      if (roleId === role) {
        await this.$store.dispatch('getPermissionByRoleId', {
          roleId: role,
        });
      }

      this.expandedPermission = new Set(this.getPermissionById.map(x => x.permission_id || x.id));
    },
    menuFilter() {
      const { roleId } = this.$store.getters;
      // const { roleName } = this.$store.getters;
      this.permissions = this.$store.getters.RoleByPermission;
      const userPermNames = new Set(this.permissions?.map(p => p.name) || []);
      // eslint-disable-next-line array-callback-return
      this.menu.forEach(el => {
        el.items?.filter(menuItem => {
          if (!menuItem) return false;
          // eslint-disable-next-line no-param-reassign
          menuItem.hidden = false;
          if (roleId === SUPER_ADMIN_ROLE_ID) {
            return true;
          }
          if (menuItem.permission) {
            // eslint-disable-next-line no-param-reassign
            menuItem.hidden = !userPermNames.has(menuItem.permission);
            return userPermNames.has(menuItem.permission);
          }
          return menuItem.hidden;
        });
      });
    },
    onWrapperClick() {
      if (!this.menuClick) {
        this.overlayMenuActive = false;
        this.mobileMenuActive = false;
      }

      this.menuClick = false;
    },
    onMenuToggle() {
      this.menuClick = true;

      if (this.isDesktop()) {
        if (this.layoutMode === 'overlay') {
          if (this.mobileMenuActive === true) {
            this.overlayMenuActive = true;
          }

          this.overlayMenuActive = !this.overlayMenuActive;
          this.mobileMenuActive = false;
        } else if (this.layoutMode === 'static') {
          this.staticMenuInactive = !this.staticMenuInactive;
        }
      } else {
        this.mobileMenuActive = !this.mobileMenuActive;
      }
    },
    onSidebarClick() {
      this.menuClick = true;
    },
    onMenuItemClick(event) {
      if (event.item && !event.item.items) {
        this.overlayMenuActive = false;
        this.mobileMenuActive = false;
      }
    },
    onLayoutChange(layoutMode) {
      this.layoutMode = layoutMode;
    },
    onLayoutColorChange(layoutColorMode) {
      this.layoutColorMode = layoutColorMode;
    },
    addClass(element, className) {
      if (element.classList) element.classList.add(className);
      // eslint-disable-next-line no-param-reassign
      else element.className += ` ${className}`;
    },
    removeClass(element, className) {
      if (element.classList) element.classList.remove(className);
      // eslint-disable-next-line no-param-reassign
      else {
      // eslint-disable-next-line no-param-reassign
        element.className = element.className.replace(
          new RegExp(`(^|\\b)${className.split(' ').join('|')}(\\b|$)`, 'gi'),
          ' ',
        );
      }
    },
    isDesktop() {
      return window.innerWidth >= 992;
    },
    isSidebarVisible() {
      if (this.isDesktop()) {
        if (this.layoutMode === 'static') return !this.staticMenuInactive;
        if (this.layoutMode === 'overlay') return this.overlayMenuActive;
      }

      return true;
    },
  },
};
</script>
