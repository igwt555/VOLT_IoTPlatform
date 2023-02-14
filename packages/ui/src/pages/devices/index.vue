<!-- eslint-disable max-len -->
<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <h5>Devices</h5>
        <DataTable
          ref="tableRef"
          v-model:filters="filters"
          class="p-datatable-gridlines"
          data-key="id"
          responsive-layout="scroll"
          filter-display="menu"
          :filters="filters"
          :value="devices"
          :row-hover="true"
          :rows="10"
          :rows-per-page-options="[10, 25, 50]"
          :paginator="devices ? (devices.length <= 10 ? false : true) : false"
          :loading="loading"
          :global-filter-fields="['id', 'date', 'status']"
          :removable-sort="true"
          paginator-template="CurrentPageReport
          FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          current-page-report-template="Showing {first} to {last} of {totalRecords}"
        >
          <template #header>
            <div class="flex justify-content-between flex-column sm:flex-row">
              <div>
                <Button
                  type="button"
                  icon="pi pi-filter-slash"
                  label="Clear"
                  class="p-button-outlined mb-2 mr-3"
                  @click="clearFilter()"
                />
              </div>
            </div>
          </template>
          <template #empty>
            No devices found.
          </template>
          <template #loading>
            Loading devices data. Please wait.
          </template>
          <Column
            sortable
            field="make"
            header="Make"
            style="min-width: 12rem"
          >
            <template #body="{ data }">
              {{ data.make }}
            </template>
            <template #filter="{ filterModel }">
              <InputText
                v-model="filterModel.value"
                type="text"
                class="p-column-filter"
                placeholder="Search by Make"
              />
            </template>
          </Column>
          <Column
            sortable
            field="model"
            header="Model"
            style="min-width: 8rem"
          >
            <template #body="{ data }">
              {{ data.model }}
            </template>
            <template #filter="{ filterModel }">
              <InputText
                v-model="filterModel.value"
                type="text"
                class="p-column-filter"
                placeholder="Search by Model"
              />
            </template>
          </Column>
          <Column
            sortable
            field="serial_number"
            header="Serial Number"
            style="min-width: 10rem"
          >
            <template #body="{ data }">
              {{ data.serial_number }}
            </template>
            <template #filter="{ filterModel }">
              <InputText
                v-model="filterModel.value"
                type="text"
                class="p-column-filter"
                placeholder="Search by Serial Number"
              />
            </template>
          </Column>
          <Column
            sortable
            field="last_location"
            header="Last Location"
            style="min-width: 10rem"
          >
            <template #body="{ data }">
              <div v-if="data?.events?.[0]" class="flex flex-column">
                <span :class="`reports-badge mx-auto status-${data?.events?.[0]?.event}`" class="mr-1">
                  {{ data?.events?.[0]?.event }}
                </span>
                <span class="reports-badge mx-auto">
                  Chamber: {{ data?.events?.[0]?.chamber_id }}
                </span>
                <span class="reports-badge mx-auto">Unit: {{ data?.events?.[0]?.Device?.serial_num }}</span>
                <span class="reports-badge mx-auto">ON: {{ new Date(data?.events?.[0]?.created_at).toLocaleDateString('en-US', {day: '2-digit',month: '2-digit',year: 'numeric'}) }}</span>
              </div>
            </template>
            <template #filter="{ filterModel }">
              <InputText
                v-model="filterModel.value"
                type="text"
                class="p-column-filter"
                placeholder="Search by Last Location"
              />
            </template>
          </Column>
          <Column style="max-width: 8rem">
            <template #body="{ data }">
              <div v-if="data?.kb_devices_user" class="flex flex-column">
                <span class="mb-2 mx-auto">
                  {{
                    `Assigned to ${data?.kb_devices_user?.User?.full_name}
                  until ${new Date(data?.kb_devices_user?.reserved_until).toLocaleDateString('en-US', {day: '2-digit',month: '2-digit',year: 'numeric'})}`
                  }}
                </span>
                <Button label="Unassign" @click="openUnAssignModal(data)" />
              </div>
              <DeviceAssignmentDialog v-else :device="data" />
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <input
      ref="csv"
      type="file"
      accept=".csv"
      class="d-none"
      @change="getFileHandler"
    >
    <input
      ref="button"
      type="text"
      class="d-none"
      @change="getFileHandler"
    >
  </div>
  <Dialog
    v-model:visible="unAssignUserModal"
    :header="`Unassign this device from ${currenlyAssignedUser}`"
    :breakpoints="{ '960px': '75vw' }"
    :style="{ width: '50vw' }"
  >
    <div class="p-fluid">
      Are you sure you want to unassign ?
    </div>
    <template #footer>
      <Button
        label="Cancel"
        icon="pi pi-times"
        class="p-button-text"
        @click="unAssignUserModal = false"
      />
      <Button
        label="Proceed"
        icon="pi pi-check"
        autofocus
        type="submit"
        @click="unAssignUser()"
      />
    </template>
  </Dialog>
</template>

<script setup>
import { FilterMatchMode, FilterOperator } from 'primevue/api';
import { ref, onMounted, computed } from 'vue';
import { useStore } from 'vuex';
import axios from 'axios';
import { useToastService } from '../../composables/useToast.mjs';
import DeviceAssignmentDialog from './DeviceAssignmentDialog.vue';

const { showToast } = useToastService();
const initFilter = () => ({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  id: {
    operator: FilterOperator.AND,
    constraints: [
      { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    ],
  },
  serial_number: {
    operator: FilterOperator.AND,
    constraints: [
      { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    ],
  },
  make: {
    operator: FilterOperator.AND,
    constraints: [
      { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    ],
  },
  model: {
    operator: FilterOperator.AND,
    constraints: [
      { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    ],
  },
});

const filters = ref(initFilter());
const { dispatch, getters } = useStore();
const loading = ref(true);
const currenlyAssignedUser = ref('');
const unAssignUserModal = ref(false);
const confirmModelData = ref(null);

const userId = computed(() => getters.UserID);

const openUnAssignModal = async data => {
  confirmModelData.value = data;
  currenlyAssignedUser.value = data?.kb_devices_user?.User?.full_name;
  unAssignUserModal.value = true;
};

const closeUnAssignModal = async () => {
  currenlyAssignedUser.value = '';
  unAssignUserModal.value = false;
};

const unAssignUser = async () => {
  console.log(confirmModelData.value);
  try {
    const payload = {
      deviceId: confirmModelData.value?.events?.[0]?.Device.id,
      selectedUserId: confirmModelData.value?.kb_devices_user?.User?.id,
      invitedUserId: userId?.value,
      kbDeviceId: confirmModelData.value.id,
    };
    await axios.post(`${window.location.host}/api/user/unassign-device-user`, payload);
    dispatch('getKbDevices');
    closeUnAssignModal();
  } catch (error) {
    console.log(error);
  }
};

onMounted(async () => {
  await dispatch('getKbDevices');
  loading.value = false;
});

const devices = computed(() => getters.getKbDevice);
const tableRef = ref(null);
const csv = ref(null);

const clearFilter = () => {
  filters.value = initFilter();
};

const getFileHandler = async e => {
  try {
    if (e?.target?.files?.length) {
      loading.value = true;
      const file = e?.target?.files?.[0];
      if (file.type !== 'text/csv') {
        // eslint-disable-next-line no-alert
        showToast({
          severity: 'error',
          summary: 'Error',
          detail: 'Invalid file type',
        });
      } else {
        const newUsers = await dispatch('uploadCSV', file);
        await dispatch('createUsers', { users: newUsers });
        loading.value = false;
      }
    }
    e.target.value = null;
  } catch (error) {
    console.log(error);
  }
};
</script>
