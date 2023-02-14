<template>
  <VoltDialog
    header="Change Location to:"
    :breakpoints="{ '960px': '75vw' }"
    :style="{ width: '50vw' }"
  >
    <template #activator="{ openDialog }">
      <Button
        :label="label"
        class="p-button-secondary p-button-sm"
        icon="bi bi-pin-map"
        @click="openDialog"
      />
    </template>
    <Dropdown
      v-model="selectedLocation"
      :options="isOtto ? changeLocationFrom : unassignedLocations"
      option-label="name"
      option-value="id"
      placeholder="Select a Location"
      class="w-100"
    />
    <h6
      v-if="errorMessage !== ''"
      class="p-error text-center"
    >
      {{ errorMessage }}
    </h6>
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
        @click="changeLocation(closeDialog)"
      />
    </template>
  </VoltDialog>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import VoltDialog from '../../../components/VoltDialog.vue';

const { params } = useRoute();
const { dispatch, getters } = useStore();

const isOtto = computed(() => window.location.host.split('.')[0]?.includes('otto'));
const selectedLocation = ref(null);
const errorMessage = ref('');
const unassignedLocations = computed(() => getters.unassignedLocations);

const deviceLocation = computed(() => getters.deviceLocationByDeviceId(params.id));

const props = defineProps({
  label: {
    type: String,
    default: '',
  },
  locations: {
    type: Array,
    default: () => [],
  },
  devices: {
    type: String,
    default: '',
  },
});

const changeLocationFrom = computed(() => {
  const arr = props.locations.map(el => {
    const obj = {
      name: el.name,
      id: el.id,
    };
    return obj;
  });
  return arr;
});

const changeLocation = async cb => {
  if (selectedLocation.value) {
    try {
      let payload;
      if (isOtto.value) {
        payload = {
          deviceId: props.devices,
          newLocationId: selectedLocation.value,
        };
      } else {
        payload = {
          deviceId: params.id,
          newLocationId: selectedLocation.value,
          oldLocationId: deviceLocation.value && deviceLocation.value.id,
        };
      }
      await dispatch('changeLocation', { data: payload, isOtto: isOtto.value });
      await dispatch('findLocationByDeviceId', params.id);
      await dispatch('findUnassignedLocations', params.id);
      await dispatch('getAllLocations');
      cb();
    } catch {
      errorMessage.value = 'Please try again later.';
    }
  } else {
    errorMessage.value = 'Location is required field, please select one.';
  }
};
</script>
