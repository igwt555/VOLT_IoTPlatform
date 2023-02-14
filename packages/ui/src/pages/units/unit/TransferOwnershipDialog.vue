<template>
  <VoltDialog
    activator-text="Transfer Ownership"
    :style="{ width: '50vw' }"
    icon="bi bi-send"
    header="Transfer Ownership"
    @opened="handleModalOpen"
  >
    <div class="row">
      <div class="col">
        <InputText
          v-model="email"
          placeholder="Enter email of the recipient"
          style="width: 100%"
        />
        <small v-if="validator?.email?.$error" class="p-error">
          {{ validator.email?.$errors[0].$message }}
        </small>
      </div>
    </div>
    <template #footer="{ closeDialog }">
      <Button class="p-button-outlined" @click="closeDialog">Cancel</Button>
      <Button class="p-button" @click="transferOwnership(closeDialog)">Transfer</Button>
    </template>
  </VoltDialog>
</template>

<script setup>
import { reactive, toRefs, defineProps, defineEmits, computed } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import http from '../../../plugins/axios.mjs';
import VoltDialog from '../../../components/VoltDialog.vue';
import { loginEmailSchema } from '../../../validation/login.mjs';

const emit = defineEmits(['success']);
const props = defineProps({
  deviceId: {
    type: String,
    required: true,
  },
});

const state = reactive({
  email: '',
});
const { email } = toRefs(state);

const emailRule = computed(() => loginEmailSchema);

const validator = useVuelidate(emailRule, state);

const transferOwnership = async closeDialog => {
  await validator.value.$validate();
  if (validator.value.$error) return;

  await http.post(`/device/${props.deviceId}/transfer-ownership`, {
    email: email.value,
  });

  emit('success');
  closeDialog();
};

const handleModalOpen = () => {
  email.value = '';
};
</script>
