<template>
  <VoltDialog
    header="Assign this device to:"
    :breakpoints="{ '960px': '75vw' }"
    :style="{ width: '50vw' }"
    @opened="handleModalOpen"
  >
    <template #activator="{ openDialog }">
      <Button
        v-tooltip.bottom="'Assign device to user'"
        icon="bi bi-person-workspace"
        class="p-button-primary btn mr-1"
        @click="openDialog"
      />
    </template>

    <div class="p-fluid">
      <Dropdown
        v-model="selectedUser"
        :options="users"
        option-label="full_name"
        option-value="id"
        placeholder="Select a User"
        class="w-100"
      />
      <Calendar
        v-model="reservedUntill"
        class="mt-4 mb-4"
        date-format="mm/dd/yy"
        placeholder="Device Reserved Until (optional)"
        :show-icon="true"
        :select-other-months="true"
      />
      <Checkbox
        v-model="sendUserAlert"
        :binary="true"
        :disabled="!reservedUntill"
      />
      <label
        >Send me an email alert if device isn't retrived by chosen reservation
        period</label
      >
    </div>
    <template #footer="{ closeDialog }">
      <Button
        label="Cancel"
        icon="pi pi-times"
        class="p-button-text"
        @click="closeDialog"
      />
      <Button
        label="Proceed"
        icon="pi pi-check"
        autofocus
        type="submit"
        @click="assignUser(closeDialog)"
      />
    </template>
  </VoltDialog>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import VoltDialog from '../../../components/VoltDialog.vue';

const { dispatch, getters } = useStore();
const { params } = useRoute();

const props = defineProps({
  kbDeviceId: {
    type: String,
    default: '',
  },
});

const selectedUser = ref(null);
const reservedUntill = ref(null);
const sendUserAlert = ref(false);
const users = computed(() => getters.users);
const userId = computed(() => getters.UserID);

const emit = defineEmits(['saved']);

const assignUser = async cb => {
  if (selectedUser.value) {
    try {
      await dispatch('assignDeviceToUser', {
        deviceId: params.id,
        selectedUserId: selectedUser.value,
        reservedUntil: reservedUntill.value,
        alertOnExpire: sendUserAlert.value,
        createdById: userId.value,
        invitedUserId: userId.value,
        kbDeviceId: props.kbDeviceId,
      });
      emit('saved');
      cb();
      const { emailError } = getters;
      if (emailError) {
        console.log(emailError);
      } else {
        await dispatch('getEventByDeviceId', params.id);
      }
      // eslint-disable-next-line no-empty
    } catch {}
  }
};

const handleModalOpen = async () => {
  await dispatch('getUsers');
};
</script>
