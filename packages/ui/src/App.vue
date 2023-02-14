<template>
  <div>
    <Loading :active="isLoading" :can-cancel="false" :is-full-page="true" />
    <router-view />
    <Toast />
    <ConfirmDialog />
  </div>
</template>

<script setup>
import { useStore } from 'vuex';
import { computed } from 'vue';
import { HttpService } from './service/base.mjs';
import 'vue3-loading-overlay/dist/vue3-loading-overlay.css';

const { getters } = useStore();

const token = computed(() => getters.token);
const isLoading = computed(() => getters.globalLoadingStatus);
HttpService.setToken(token.value);

// onMounted(() => {
//   dispatch('startSocketConnection');
// });

// onBeforeUnmount(() => {
//   dispatch('disconnectSocketConnection');
// });
</script>

<style lang='scss'>
</style>
