<template>
  <div class="grid">
    <div class="col-12 xl:col-6 chamber-history-table">
      <div class="card">
        <div class="grid">
          <div class="col-6">
            <span v-if="deviceLocation?.name">
              <h4>
                Unit {{ deviceById?.serial_num }} at {{ deviceLocation.name }}
              </h4>
              <p class="flex align-center">
                <Button
                  label="Remove From Location"
                  class="p-button-secondary p-button-sm mr-2"
                  icon="bi bi-file-earmark-x"
                  @click="removeLocation(deviceLocation)"
                />
                <ChangeLocationDialog label="Change Location" />
              </p>
            </span>
            <span v-else>
              <h4>Unit {{ deviceById?.serial_num }}</h4>
              <ChangeLocationDialog label="Assign Location" />
            </span>
          </div>
          <div class="col-6 flex justify-end">
            <TransferOwnershipDialog
              class="ml-auto my-auto"
              :device-id="params.id"
              @success="router.push({ name: 'units' })"
            />
          </div>
        </div>
        <div class="cards-info">
          <div class="grid">
            <div class="col-12 md:col-6">
              <div class="grey-card h-full">
                <h5>MAC Address</h5>
                <div class="grey-card-footer">
                  <p>{{ deviceById?.mac_addr_eth }}</p>
                </div>
              </div>
            </div>
            <div class="col-12 md:col-6">
              <div class="grey-card h-full">
                <!-- <h5>Last Checkin</h5>
                <div class="grey-card-footer">
                  <p>3 minutes ago (connected)</p>
                </div> -->
              </div>
            </div>
          </div>
        </div>

        <h5>Chamber Status Summary</h5>
        <DataTable
          class="chamber-history"
          responsive-layout="scroll"
          :value="kbDeviceEvent"
          :row-hover="true"
          :removable-sort="true"
          :loading="loadingRecentActivity"
        >
          <template #empty> Chamber status summary found. </template>
          <template #loading> Loading chamber status summary. Please wait. </template>
          <Column class="p-0" style="height: inherit; width: 20px;">
            <template #body="{data}">
              <div class="flex w-full h-full">
                <Tag
                  class="w-full chamber-tag"
                  :class="data.status === 'occupied' ? 'chamber-charging' : 'chamber-normal'">
                  {{ data.chamber_id + 1 }}
                </Tag>
              </div>
            </template>
          </Column>
          <Column field="created_at" sortable header="Last Accessed">
            <template #body="{data}">
              {{ formatDate(data.created_at, 'en-US', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric'
              }) || 'N/A' }}
            </template>
          </Column>
          <Column field="status" sortable header="Status">
            <template #body="{data}">
              <div class="chamber-history-tbody">
                <Badge
                  :class="data.status === 'occupied' ? 'p-badge-success' :
                    data.status === 'unoccupied' ? 'p-badge-grey' :
                    data.status === 'damaged' ? 'p-badge-warning' :
                    data.status === 'hold' ? 'p-badge-danger' :
                    data.status === 'charging' ? 'p-badge-warning' : ''"
                >
                  <select
                    v-model="data.status"
                    class="drop"
                    @change="(payload.chamberId=data.chamber_id,payload.status=data.status)">
                    <option value="occupied">Occupied</option>
                    <option value="unoccupied">Unoccupied</option>
                    <option value="damaged">Damaged</option>
                    <option value="hold">Hold For IT Review</option>
                  </select>
                </Badge>
              </div>
            </template>
          </Column>
          <Column field="kb_device_make" header="Make/Device" sortable>
            <template #body="{data}">
              {{ data.kb_device_make }}  {{ data.kb_devicemodel }}
            </template>
          </Column>
          <Column header="Actions">
            <template #body="{data}">
              <div class="flex no-wrap gap-1 justify-content-end">
                <!-- <UserAssignmentDialog
                  v-if="data.status === 'occupied' && !data.KbDeviceUser" :kb-device-id="data.kb_device_id" />
                <Button
                  v-if="data.status === 'occupied' && data?.KbDeviceUser"
                  v-tooltip.bottom="`Unassign Device from ${data?.KbDeviceUser?.full_name}`"
                  class="p-button-danger cursor-pointer btn mr-1"
                  @click.stop="unAssignUser(data, 'device')"
                >
                  <i class="bi bi-person-x" />
                </Button> -->

                <DeviceAssignmentDialog v-if="!data?.chamberUser" :event="data" />
                <Button
                  v-if="data?.chamberUser"
                  v-tooltip.bottom="`Unassign chamber from ${data?.chamberUser?.full_name}`"
                  icon="bi bi-node-minus"
                  class="p-button-danger cursor-pointer btn mr-1"
                  @click.stop="unAssignUser(data, 'chamber')"
                />

                <Button
                  v-if="0"
                  v-tooltip.bottom="'Take Offline'"
                  icon="pi pi-folder-open"
                  class="cursor-pointer btn mr-1 p-button-warning"
                  @click.stop="takeOffline(data)" />

                <Button
                  v-tooltip.bottom="'Open Door'"
                  icon="bi bi-door-open"
                  class="cursor-pointer btn mr-1 p-button-warning"
                  @click.stop="openDoor(data)" />
              </div>
            </template>
          </Column>
        </DataTable>
        <h5>Notes:</h5>
        <Textarea
          v-model="note"
          placeholder="Installation Notes"
          :auto-resize="true"
          rows="6"
          class="w-100"
          @blur="saveNote"
        />
      </div>
    </div>
    <div class="col-12 lg:col-6">
      <div
        class="card"
        style="height: 98%"
      >
        <h5>Recent Activity</h5>
        <DataTable
          ref="tableRef"
          v-model:filters="filters"
          class="p-datatable-gridlines"
          data-key="id"
          responsive-layout="scroll"
          filter-display="menu"
          :filters="filters"
          :value="recentActivity"
          :row-hover="true"
          :rows="10"
          :rows-per-page-options="[10, 25, 50]"
          :paginator="recentActivity ? (recentActivity.length <= 10 ? false : true) : false"
          :loading="loadingRecentActivity"
          :global-filter-fields="['id', 'date']"
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
                  class="p-button-outlined"
                  @click="clearFilter()" />
              </div>
              <h5 class="m-0" style="line-height: 34px">Recent Activity</h5>
            </div>
          </template>
          <template #empty> No recent activity found. </template>
          <template #loading> Loading recent activity data. Please wait. </template>
          <Column
            field="date"
            sortable header="Date/Time" style="min-width: 10rem" data-type="date" filter-field="date">
            <template #body="{ data }">
              {{ formatTime(data.date) }}
            </template>
            <template #filter="{ filterModel }">
              <Calendar
                v-model="filterModel.value"
                date-format="mm/dd/yy"
                placeholder="Search by date"
                :show-time="true"
                hour-format="12" />
            </template>
          </Column>
          <Column field="chamber_id" sortable header="Chamber" style="min-width: 10rem">
            <template #body="{ data }">
              {{ data.chamber_id + 1 }}
            </template>
            <template #filter="{ filterModel }">
              <InputText
                v-model="filterModel.value"
                type="text"
                class="p-column-filter"
                placeholder="Search by chamber id" />
            </template>
          </Column>
          <Column field="User.full_name" sortable header="User" style="min-width: 10rem">
            <template #body="{ data }">
              {{ data.User && data.User.full_name }}
            </template>
            <template #filter="{ filterModel }">
              <InputText
                v-model="filterModel.value"
                type="text"
                class="p-column-filter"
                placeholder="Search by user name" />
            </template>
          </Column>
          <Column field="description" sortable header="Description" style="min-width: 10rem">
            <template #body="{ data }">
              <span v-text="eventToDesc(data)" />
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script setup>
import { FilterMatchMode, FilterOperator } from 'primevue/api';
import { computed, onMounted, watch, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import useDateFormatter from '../../../composables/useDateFormatter.js';
import { useToastService } from '../../../composables/useToast.mjs';
import ChangeLocationDialog from './ChangeLocationDialog.vue';
import DeviceAssignmentDialog from './DeviceAssignmentDialog.vue';
import TransferOwnershipDialog from './TransferOwnershipDialog.vue';
// import ChamberAssignmentDialog from './ChamberAssignmentDialog.vue';

const { dispatch, getters } = useStore();
const { params } = useRoute();
const router = useRouter();
const loadingRecentActivity = ref(true);
const deviceById = computed(() => getters.deviceById(params.id));
const deviceLocation = computed(() => getters.deviceLocationByDeviceId(params.id));
const userId = computed(() => getters.UserID);
const note = ref(null);
const kbDeviceEvent = computed(() => getters.kbDeviceEvent);

const initFilter = () => ({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  id: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  },
  date: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
  },
  chamber_id: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
  },
  'User.full_name': {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  },
});

const { formatDate } = useDateFormatter();
const formatTime = value => new Date(value).toLocaleString('en-US');
const { showToast } = useToastService();

const filters = ref(initFilter());
const clearFilter = () => {
  filters.value = initFilter();
};
const payload = reactive({
  deviceId: params.id,
  status: null,
  chamberId: null,
});
watch(payload, (newValue, _oldValue) => {
  if (newValue.status) {
    dispatch('updateChamberStatus', payload);
    payload.deviceId = params.id;
    payload.status = null;
    payload.chamberId = null;
  }
});

onMounted(async () => {
  await dispatch('getAllLocations');
  await dispatch('findLocationByDeviceId', params.id);
  await dispatch('getEventByDeviceId', params.id);
  await dispatch('findUnassignedLocations', params.id);
  await dispatch('findByDeviceId', params.id);
  await dispatch('getRecentEventByDeviceId', params.id);

  const resNote = await dispatch('getDeviceNote', params.id);
  note.value = resNote;
  loadingRecentActivity.value = false;
});

const openDoor = async data => {
  await dispatch('openDoor', { ...data, chamber_id: data.chamber_id, deviceId: deviceById.value.id });
};

const removeLocation = async data => {
  await dispatch('removeAssignLocation', { locationId: data.id });
  await dispatch('findLocationByDeviceId', params.id);
  await dispatch('findUnassignedLocations', params.id);
  await dispatch('getAllLocations');
};

const recentActivity = computed(() => {
  const activities = getters.recentActivity?.map(a => ({
    ...a, date: new Date(a.created_at), chamber_id: a.chamber_id }));
  return activities;
});

const unAssignUser = async (event, type) => {
  if (type === 'chamber') {
    try {
      await dispatch('unassignChamberToUser', {
        deviceId: params.id,
        selectedUserId: event.chamberUser?.id,
        kbDeviceId: event.kb_device_id,
        chamberId: event.chamber_id,
      });
      showToast({ detail: 'Chamber unassignment completed successfully' });
    } catch (error) {
      console.log(error);
    }
  } else {
    try {
      await dispatch('unassignDeviceToUser', {
        deviceId: params.id,
        selectedUserId: event.KbDeviceUser?.id,
        invitedUserId: userId?.value,
        kbDeviceId: event.kb_device_id,
      });
      showToast({ detail: 'Device unassignment completed successfully' });
    } catch (error) {
      console.log(error);
    }
  }
  dispatch('getEventByDeviceId', params.id);
};

const takeOffline = async data => {
  await dispatch('takeOffline', data);
};

const eventToDesc = data => {
  if (data.event === 'access_rejected') return 'An unrecognized RFID tag was presented';
  const eventVerb = data.event === 'deposit' ? 'deposited' : data.event === 'retrieval' ? 'retrieved' : null;
  if (!eventVerb) return 'N/A';
  const chamberNum = parseInt(data.chamber_id, 10) + 1;
  const chamberText = Number.isFinite(chamberNum) && data.event === 'retrieval' ? ` from chamber ${chamberNum}` :
    Number.isFinite(chamberNum) && data.event === 'deposit' ? ` in chamber ${chamberNum}` :
      '';
  const userName = data.User?.full_name ?? 'A user';
  const deviceName = data.KbDevice?.name ?? 'device';
  return `${userName} ${eventVerb} a ${deviceName}${chamberText}`;
};

const saveNote = async () => {
  await dispatch('saveDeviceNote', {
    id: params.id,
    note: note.value,
  });
};
</script>

<style lang="scss">
.chamber-normal {
  background-color: #b6b3b3;
}
.chamber-charging {
  background-color: #69eb22 !important;
}
.chamber-tag {
  border-radius: 0;
}
.chamber-history .p-datatable-table .p-datatable-tbody tr {
  height:1px;
}
.drop {
  // display: inline-block;
  background-color: transparent;
  border: none;
}
.p-badge > select {
  font-weight: 700;
  color: white;
  font-size: 0.75rem;
}
.p-badge > select > option {
  color: initial;
}
.p-badge-grey {
  background-color: #b6b3b3;
}
.drop:focus-visible, .drop:focus {
  border: none;
  outline: none !important;
}
.chamber-history-tbody{
  display: flex;
}
.chamber-history-tbody .p-badge {
  display: flex;
  align-items: center;
  width: max-content !important;
}

</style>
