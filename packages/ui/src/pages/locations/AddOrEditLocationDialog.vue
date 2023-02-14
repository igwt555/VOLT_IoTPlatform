<template>
  <VoltDialog
    activatorText="Add Location"
    :header="isOtto ? `${isEditMode ? 'Edit' : 'Add'} Site` : `${isEditMode ? 'Edit' : 'Add'} Location`"
    class="p-button mb-2 mr-3"
    :style="{ width: '50vw' }"
    @opened="resetLocation"
  >
    <template #activator="{ openDialog }">
      <Button v-if="!isEditMode" label="Add Location" class="my-2" @click="openDialog" />
      <Button
        v-else
        v-tooltip.top="{ value: 'Edit' }"
        type="button"
        icon="pi pi-fw pi-pencil"
        class="p-button mr-3 my-1"
        @click="openDialog"
      />
    </template>
    <InputText
      v-model="name"
      placeholder="Location Name"
      style="width: 100%"
      class="my-2"
    />
    <p class="mb-2">
      <small v-if="v$.name.$error" class="p-error">{{
        v$.name.$errors[0].$message
      }}</small>
    </p>
    <Dropdown
      v-if="!isEditMode"
      id="dropdown"
      v-model="organization"
      :options="orgs"
      option-label="name"
      class="my-2 e2e-Org"
      option-value="value"
      style="width: 100%"
      placeholder="Select Account"
    />
    <p class="mb-2">
      <small v-if="v$.organization.$error" class="p-error">{{
        v$.organization.$errors[0].$message
      }}</small>
    </p>
    <Dropdown
      v-if="!isEditMode"
      id="dropdown"
      v-model="device"
      :options="devices"
      option-label="name"
      class="my-2 e2e-device"
      style="width: 100%"
      placeholder="Assign Locker (optional)"
      :show-clear="true"
    >
      <template #value="slotProps">
        <div
          v-if="slotProps.value?.name"
          class="country-item country-item-value"
        >
          <div>{{ slotProps.value.serial_num }}-{{ slotProps.value.name }}</div>
        </div>
        <div
          v-else-if="slotProps.value"
          class="country-item country-item-value"
        >
          <div>{{ slotProps.value.serial_num }}</div>
        </div>
        <span v-else>
          {{ slotProps.placeholder }}
        </span>
      </template>
      <template #option="slotProps">
        <div class="country-item">
          <div v-if="slotProps.option.name">
            {{ slotProps.option.serial_num }} - {{ slotProps.option.name }}
          </div>
          <div v-else>
            {{ slotProps.option.serial_num }}
          </div>
        </div>
      </template>
    </Dropdown>

    <template #footer="{ closeDialog }">
      <Button label="Close" class="p-button-outlined" @click="closeDialog" />
      <Button
        :label="isEditMode ? 'Update Location' : 'Add Location'"
        class="e2e-add-location"
        @click="save(closeDialog)" />
    </template>
  </VoltDialog>
</template>

<script setup>
import { computed, defineEmits, defineProps, reactive, toRefs } from 'vue';
import { useStore } from 'vuex';
import { useVuelidate } from '@vuelidate/core';
import VoltDialog from '../../components/VoltDialog.vue';
import { locationRules } from '../../validation/location.mjs';

const { getters, dispatch } = useStore();

const props = defineProps({
  location: {
    type: Object,
    default: () => ({}),
  },
});

const mutableLocation = reactive({
  organization: '',
  name: '',
  device: '',
  id: '',
});

const isEditMode = computed(() => !!Object.keys(props?.location).length);

const isOtto = computed(() => window.location.host.split('.')[0]?.includes('otto'));
const v$ = useVuelidate(locationRules, mutableLocation);
const emit = defineEmits(['save', 'locations']);

const devices = computed(() => getters.devices);
// eslint-disable-next-line no-unused-vars
const childOrgs = computed(() => getters.childOrgs);
const orgs = computed(() => getters.flatOrgs);

const { organization, name, device } = toRefs(mutableLocation);

// eslint-disable-next-line consistent-return

const save = async cb => {
  v$.value.$validate();
  if (!v$.value.$error) {
    try {
      if (!isEditMode.value) {
        const data = {
          data: {
            name: mutableLocation.name,
            org_id: mutableLocation.organization,
            device: mutableLocation.device.id,
          },
          isOtto: isOtto.value,
        };
        await dispatch('createLocation', data);
        emit('locations');
      } else {
        await dispatch('updatelocation', {
          name: mutableLocation.name,
          id: mutableLocation.id,
        });
      }
      emit('save', {});
    } catch (e) {
      return 0;
    } finally {
      cb();
    }
  }
};

const resetLocation = () => {
  if (!isEditMode.value) {
    mutableLocation.name = '';
    mutableLocation.organization = '';
    mutableLocation.device = '';
  } else {
    mutableLocation.id = props.location.id;
    mutableLocation.name = props.location.name;
    mutableLocation.organization = props.location.organization_id;
  }
};
</script>
