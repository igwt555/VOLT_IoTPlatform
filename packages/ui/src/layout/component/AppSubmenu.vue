<template>
  <div>
    <ul
      v-if="items"
      class="main-root"
    >
      <template v-for="(item, i) of items">
        <li
          v-if="visible(item) && !item.separator && !item.hidden"
          :key="item.label || i"
          :class="[{ 'layout-menuitem-category': root, 'active-menuitem': activeIndex === i && !item.to && !item.disabled }]"
          role="none"
        >
          <template v-if="root">
            <div class="layout-menuitem-root-text">
              {{ item.label }}
            </div>
            <appsubmenu
              :items="visible(item) && item.items"
              @menuitem-click="$emit('menuitem-click', $event)"
            />
          </template>
          <template v-else>
            <router-link
              v-if="item.to"
              v-ripple
              :to="item.to"
              :class="[item.class, 'p-ripple', { 'p-disabled': item.disabled }]"
              :style="item.style"
              :target="item.target"
              exact
              role="menuitem"
              @click="onMenuItemClick($event, item, i, item.props)"
            >
              <i :class="item.icon" />
              <span>{{ item.label }}</span>
              <i
                v-if="item.items"
                class="pi pi-fw pi-angle-down menuitem-toggle-icon"
              />
              <span
                v-if="item.badge"
                class="menuitem-badge"
              >{{ item.badge }}</span>
            </router-link>
            <a
              v-if="!item.to"
              v-ripple
              :href="item.url || '#'"
              :style="item.style"
              :class="[item.class, 'p-ripple', { 'p-disabled': item.disabled }]"
              :target="item.target"
              role="menuitem"
              @click="onMenuItemClick($event, item, i)"
            >
              <i :class="item.icon" />
              <span>{{ item.label }}</span>
              <i
                v-if="item.items"
                class="pi pi-fw pi-angle-down menuitem-toggle-icon"
              />
              <span
                v-if="item.badge"
                class="menuitem-badge"
              >{{ item.badge }}</span>
            </a>
            <transition name="layout-submenu-wrapper">
              <appsubmenu
                v-show="activeIndex === i"
                :items="visible(item) && item.items"
                @menuitem-click="$emit('menuitem-click', $event)"
              />
            </transition>
          </template>
        </li>
        <li
          v-if="visible(item) && item.separator"
          :key="'separator' + i"
          class="p-menu-separator"
          :style="item.style"
          role="separator"
        />
      </template>
    </ul>
    <ul
      v-if="bottomMenu"
      class="main-root root-bottom"
    >
      <template
        v-for="(item, i) of bottomMenu"
        :key="i"
      >
        <li
          v-if="visible(item) && !item.separator && !item.hidden"
          :key="item.label || i"
          :class="[{ 'layout-menuitem-category': root, 'active-menuitem': activeIndex === i && !item.to && !item.disabled }]"
          role="none"
        >
          <template v-if="root">
            <div class="layout-menuitem-root-text">
              {{ item.label }}
            </div>
            <appsubmenu
              :bottom-menu="visible(item) && item.items"
              @menuitem-click="$emit('menuitem-click', $event)"
            />
          </template>
          <template v-else>
            <router-link
              v-ripple
              :to="item.to"
              :class="[item.class, 'p-ripple', { 'p-disabled': item.disabled }]"
              :style="item.style"
              :target="item.target"
              exact
              role="menuitem"
              @click="onMenuItemClick($event, item, i, item.props)"
            >
              <i :class="item.icon" />
              <span>{{ item.label }}</span>
              <i
                v-if="item.items"
                class="pi pi-fw pi-angle-down menuitem-toggle-icon"
              />
              <span
                v-if="item.badge"
                class="menuitem-badge"
              >{{ item.badge }}</span>
            </router-link>
            <transition name="layout-submenu-wrapper">
              <appsubmenu
                v-show="activeIndex === i"
                :items="visible(item) && item.items"
                @menuitem-click="$emit('menuitem-click', $event)"
              />
            </transition>
          </template>
        </li>
        <li
          v-if="visible(item) && item.separator"
          :key="'separator' + i"
          class="p-menu-separator"
          :style="item.style"
          role="separator"
        />
      </template>
    </ul>
  </div>
</template>
<script>
export default {
  name: 'Appsubmenu',
  props: {
    items: Array,
    bottomMenu: Array,
    root: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      activeIndex: null,
    };
  },
  methods: {
    onMenuItemClick(event, item, index, props = '') {
      if (props) {
        this.$store.state.user.openModel = true;
      }
      if (item.disabled) {
        event.preventDefault();
        return;
      }

      if (!item.to && !item.url) {
        event.preventDefault();
      }

      // execute command
      if (item.command) {
        item.command({ originalEvent: event, item });
      }

      this.activeIndex = index === this.activeIndex ? null : index;

      this.$emit('menuitem-click', {
        originalEvent: event,
        item,
      });
    },
    visible(item) {
      return typeof item?.visible === 'function' ? item.visible() : item?.visible !== false;
    },
  },
};
</script>

<style scoped>
.main-root {
  list-style: none;
  padding-left: 0;
}
.root-bottom {
  margin-bottom: 0;
  margin-top: auto;
  display: none;
}
</style>
