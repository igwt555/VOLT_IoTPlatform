<template>
<VoltDialog
      header="Assign this device to:"
      activator-text="Assign device to a user"
      :breakpoints="{ '960px': '75vw' }"
      :style="{ width: '50vw' }"
      @opened="onModelOpen"
    >

      <div class="p-fluid">
        <Dropdown
          v-model="selectedUser"
          :options="users"
          option-label="full_name"
          option-value="id"
          placeholder="Select a User"
          class="w-100"
        />
        <h6
          v-if="errorMessage !== ''"
          class="p-error text-center"
        >
          {{ errorMessage }}
        </h6>
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
        /> <label>Send me an email alert if device isn't retrived by chosen reservation period</label>
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
          form="assignUser"
          @click.prevent="assignDeviceUser(closeDialog)"
        />
      </template>
  </VoltDialog>
</template>

<script setup>
import { computed, reactive, defineProps, ref } from 'vue'
// import { device } from '@/validation/device.mjs';
import { useStore } from 'vuex';
// import { useVuelidate } from '@vuelidate/core';
import VoltDialog from '@/components/VoltDialog.vue'
import { useToastService } from '@/composables/useToast.mjs';

const { showToast } = useToastService();

const selectedUser = ref(null);
const reservedUntill = ref(null);
const sendUserAlert = ref(false);
const errorMessage = ref('');

// const rules = computed(() => device);
// const v$ = useVuelidate(rules, assignUser);
const { getters, dispatch } = useStore();

const createdById = computed(() => getters.UserID);

const props = defineProps({
  device: {
    type: Object,
    default: ()=>({})
  }
});

const users = computed(() => getters.users)

const assignDeviceUser = async (cb) => {
  if (selectedUser.value) {
        try {
          const selectedUserId = selectedUser.value;
          await dispatch('assignDeviceToUser', {
            deviceId:  props.device.events[0].Device.id,
            selectedUserId,
            reservedUntil: reservedUntill.value,
            alertOnExpire: sendUserAlert.value,
            createdById: createdById.value,
            invitedUserId: createdById.value,
            kbDeviceId: props.device.id,
          });
          const { emailError } = getters;
          if (emailError) {
            showToast({ severity: 'error', summary: 'Error', detail: emailError });
          } else {
            showToast({ detail: 'Device assigned. Email notification sent informing user that device is ready for pickup' });
            clearForm();
            cb();
          }
        } catch (error) {
          console.log(error);
        }
      } else {
        errorMessage.value = 'User field is required, please select one.';
      }
};

const clearForm = () => {
  reservedUntill.value = '';
  selectedUser.value = '';
  sendUserAlert.value = false;
  errorMessage.value = '';
}

const onModelOpen = async () => {
  clearForm();
  await dispatch('getUsers');
}
</script>
