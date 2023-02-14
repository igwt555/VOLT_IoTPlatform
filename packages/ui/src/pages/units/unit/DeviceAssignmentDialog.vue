<template>
  <VoltDialog
    header="Assign this chamber to:"
    :breakpoints="{ '960px': '75vw' }"
    :style="{ width: '50vw' }"
    @opened="handleModalOpen"
  >
    <template #activator="{ openDialog }">
      <Button
        v-tooltip.bottom="'Assign chamber to user'"
        icon="bi bi-node-plus"
        class="btn p-button-primary mr-1"
        aria-label="Bookmark"
        @click.stop="openDialog"
      />
    </template>
    <div class="p-fluid">
      <Dropdown
        v-model="selectedUser"
        option-value="id"
        option-label="full_name"
        :options="users"
        placeholder="Select a User"
        class="w-100"
      />
      <p class="mb-2">
        <small v-if="v$.selectedUser.$error" class="p-error">
          {{ v$.selectedUser.$errors[0].$message }}
        </small>
      </p>
      <Dropdown
        v-model="selectedReservation"
        :options="reservationType"
        option-label="name"
        option-value="value"
        placeholder="Select Reservation Type"
        class="w-100 mt-4"
      />
      <p class="mb-2">
        <small v-if="v$.selectedReservation.$error" class="p-error">
          {{ v$.selectedReservation.$errors[0].$message }}
        </small>
      </p>
    </div>
    <template #footer="{closeDialog}">
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
        :loading="assignChamberLoading"
        @click="assignChamber(closeDialog)"
      />
    </template>
  </VoltDialog>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits, reactive, toRefs } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import VoltDialog from '../../../components/VoltDialog.vue';
import { useToastService } from '../../../composables/useToast.mjs';
import assignChamberRules from '../../../validation/assignChamber.mjs';

const { params } = useRoute();
const { showToast } = useToastService();

const props = defineProps({
  event: {
    type: Object,
    default: () => ({}),
  },
  type: {
    type: String,
    default: 'chamber',
  },
});

const emit = defineEmits(['saved']);

const { dispatch, getters } = useStore();

const users = computed(() => getters.users);
const userId = computed(() => getters.UserID);
const reservationType = ref([{ name: 'One Off', value: 'one-off' }, { name: 'Persistent', value: 'persistent' }]);
const assignChamberLoading = ref(false);
const values = reactive({
  selectedUser: '',
  selectedReservation: '',
});
const { selectedUser, selectedReservation } = toRefs(values);
const v$ = useVuelidate(assignChamberRules, values);

const assignChamber = async cb => {
  v$.value.$validate();
  if (!v$.value.$error) {
    try {
      assignChamberLoading.value = true;
      await dispatch('assignChamberToUser', {
        deviceId: params.id,
        selectedUserId: selectedUser.value,
        chamberId: props.event.chamber_id,
        kbDeviceId: props.event.kb_device_id,
        reservationType: selectedReservation.value,
        createdById: userId.value,
      });
      assignChamberLoading.value = false;
      showToast({ detail: 'Chamber assignment completed successfully' });
      emit('saved');
      cb();
      // window.location.reload(); // TODO: above code is not reloading the chamber data
    } catch (e) {
      console.log(e);
    }
  }
  await dispatch('getEventByDeviceId', params.id);
};

const handleModalOpen = async () => {
  selectedUser.value = null;
  selectedReservation.value = null;
  await dispatch('getUsers');
};
</script>
