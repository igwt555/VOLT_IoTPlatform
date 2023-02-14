<template>
  <slot name="activator" v-bind="{ openDialog }">
    <Button :label="activatorText" v-bind="$attrs" @click="openDialog" />
  </slot>
  <Dialog v-model:visible="display" :position="position" :header="header" :style="style">
    <template #header>
      <slot name="header" />
    </template>

    <slot />

    <template #footer>
      <slot name="footer" v-bind="{ closeDialog }" />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch } from 'vue';

const display = ref(false);

const emit = defineEmits(['opened']);

// eslint-disable-next-line no-unused-vars
const props = defineProps({
  activatorText: {
    type: String,
    default: 'Click Me',
  },
  position: {
    type: String,
    default: '',
  },
  header: {
    type: String,
    default: '',
  },
  style: {
    type: Object,
    default: () => ({}),
  },
});

watch(
  () => display.value,
  val => {
    if (val) {
      emit('opened');
    }
  },
);

const openDialog = () => {
  display.value = true;
};

const closeDialog = () => {
  display.value = false;
};
</script>

<script>
export default {
  inheritAttrs: false,
};
</script>
