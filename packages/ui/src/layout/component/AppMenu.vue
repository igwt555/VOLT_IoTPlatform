<template>
  <div class="layout-menu-container">
    <AppSubmenu
      :items="props.model"
      :bottom-menu="props.model2"
      class="layout-menu"
      :root="true"
      @menuitem-click="onMenuItemClick"
    />
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import AppSubmenu from './AppSubmenu.vue';

const props = defineProps({
  model: {
    type: Array,
    default: () => [],
  },
  model2: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['menuitem-click']);

const onMenuItemClick = event => {
  emit('menuitem-click', event);
};
</script>

<style scoped>
.layout-menu-container{
  height: 100%;
}
.layout-menu{
    overflow: auto;
    height: 100%;
    display: flex;
    flex-wrap: wrap;
  }
</style>
