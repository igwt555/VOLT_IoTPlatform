<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <h5>Reports</h5>
        <DataTable
          ref="dt"
          v-model:filters="filters"
          class="p-datatable-gridlines"
          data-key="id"
          show-gridlines
          responsive-layout="scroll"
          filter-display="menu"
          :filters="filters"
          :value="reportData"
          :row-hover="true"
          :rows="10"
          :rows-per-page-options="[10, 25, 50]"
          :paginator="true"
          :loading="loading"
          :global-filter-fields="['id', 'date', 'event']"
          :removable-sort="true"
          :lazy="true"
          :total-records="totalRecords"
          paginator-template="CurrentPageReport
          FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          current-page-report-template="Showing {first} to {last} of {totalRecords}"
          @page="onPage($event)"
          @sort="onSort($event)"
          @filter="onFilter($event)"
          @row-click="goToDetailPage"
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
            No reports found.
          </template>
          <template #loading>
            Loading reporting data. Please wait.
          </template>
          <Column
            sortable
            field="event"
            header="Event"
            data-type="boolean"
            style="min-width: 11rem"
            :filter-match-mode-options="matchModeEq"
          >
            <template #body="{ data }">
              <Badge v-if="data.event == 'retrieval'" class="p-badge-success">RETRIEVAL</Badge>
              <Badge v-else-if="data.event =='deposit'" class="p-badge-warning">DEPOSIT</Badge>
              <Badge v-else-if="data.event =='access_rejected'" class="p-badge-danger">ACCESS REJECTED</Badge>
              <span v-else-if="data.event =='alert_door_left_open'" class="p-badge-dot">ALERT DOOR LEFT OPEN</span>
            </template>
            <template #filter="{ filterModel }">
              <Dropdown
                v-model="filterModel.value"
                :options="statuses"
                placeholder="Select Status"
                class="p-column-filter"
                :show-clear="true"
              >
                <template #value="slotProps">
                  <span
                    v-if="slotProps.value"
                    :class="'reports-badge status-' + slotProps.value"
                  >
                    {{ slotProps.value.replace("_", ' ') }}
                  </span>
                  <span v-else>{{ slotProps.placeholder.replace("_", ' ') }}</span>
                </template>
                <template #option="slotProps">
                  <span :class="'reports-badge status-' + slotProps.option">
                    {{ slotProps.option.replace("_", ' ') }}
                  </span>
                </template>
              </Dropdown>
            </template>
          </Column>
          <Column
            data-type="boolean"
            :sortable="false"
            field="statusColTemplate"
            header="Status"
            style="min-width: 11rem"
          >
            <template #body="{ data }">
              <Badge v-if="data.event == 'retrieval'" class="p-badge-success">{{ data.statusColTemplate }}</Badge>
              <Badge v-else-if="data.event =='deposit'" class="p-badge-warning">{{ data.statusColTemplate }}</Badge>
              <span v-else>{{ data.statusColTemplate }}</span>
            </template>
          </Column>
          <Column
            data-type="boolean"
            sortable
            field="Device.serial_num"
            :filter-match-mode-options="matchModeEq"
            header="Unit Id"
            style="min-width: 8rem"
          >
            <template #body="{ data }">
              {{ data.Device && data.Device.serial_num }}
            </template>

            <template #filter="{ filterModel }">
              <InputText
                v-model="filterModel.value"
                type="text"
                class="p-column-filter"
                placeholder="Search by Unit Id"
              />
            </template>
          </Column>
          <Column
            data-type="boolean"
            sortable
            field="User.full_name"
            header="Users"
            style="min-width: 12rem"
            :filter-match-mode-options="matchModeContains"
          >
            <template #body="{ data }">
              <span v-if="data.event !== 'access_rejected'">{{ data.User && data.User.full_name }}</span>
            </template>
            <template #filter="{ filterModel }">
              <InputText
                v-model="filterModel.value"
                type="text"
                class="p-column-filter"
                placeholder="Search by Users"
              />
            </template>
          </Column>
          <!-- <Column field="Kb_Device.make" header="Device" style="min-width: 12rem">
            <template #body="{ data }">
              <span v-if="data.event !== 'access_rejected' && data?.Kb_Device">
                <span>{{ data?.Kb_Device.make }} {{ data?.Kb_Device.model }}</span>
                <Button type="button"
                icon="pi pi-external-link"
                class="p-button-outlined mb-2 mr-3"
                @click="showDevice(data)" />
              </span>
            </template>
            <template #filter="{ filterModel }">
              <InputText type="text"
              v-model="filterModel.value"
              class="p-column-filter" placeholder="Search by device" />
            </template>
          </Column> -->
          <Column
            :sortable="false"
            field="location.name"
            header="Location"
            style="min-width: 12rem"
            :filter-match-mode-options="matchModeContains"
          >
            <template #body="{ data }">
              {{ data.location && data.location.name }}
            </template>
            <template #filter="{ filterModel }">
              <InputText
                v-model="filterModel.value"
                type="text"
                class="p-column-filter"
                placeholder="Search by Location"
              />
            </template>
          </Column>
          <Column
            data-type="boolean"
            sortable
            field="chamber_id"
            header="Chamber"
            style="min-width: 12rem"
            :filter-match-mode-options="matchModeEq"
          >
            <template #body="{ data }">
              <span v-if="data.event !== 'access_rejected'">{{ data.chamber_id + 1 }}</span>
            </template>
            <template #filter="{ filterModel }">
              <InputText
                v-model="filterModel.value"
                type="text"
                class="p-column-filter"
                placeholder="Search by Chamber Id"
              />
            </template>
          </Column>
          <Column
            sortable
            filter-field="date"
            header="Date & Time"
            style="min-width: 12rem"
            field="created_at"
            data-type="boolean"
            :filter-match-mode-options="matchModeEq"
          >
            <template #body="{ data }">
              {{ formatDateTime(data.date) }}
            </template>
            <template #filter="{ filterModel }">
              <Calendar
                v-model="filterModel.value"
                date-format="mm/dd/yy"
                placeholder="Search by date"
                :show-time="true"
                hour-format="12"
              />
            </template>
          </Column>
          <Column
            :sortable="false"
            field="reportColTemplate"
            header="Report"
            style="min-width: 15rem"
          >
            <template #body="{ data }">
              <!-- {{ data.report }} -->
              <span v-if="data.reportColTemplate === 'An unrecognized RFID tag was presented'">
                <div>An unrecognized RFID tag was presented</div>
                <!-- <button class="btn">Assign to user?</button> -->
                <Button
                  label="Assign to user?"
                  class="p-button-sm mt-1"
                  @click.stop="openAssignUserModel(data)"
                />
              </span>
              <span v-else>
                {{ data.reportColTemplate }}
              </span>
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
    <Dialog
      v-model:visible="assignUserModel"
      header="Assign to:"
      :breakpoints="{ '960px': '75vw' }"
      :style="{ width: '50vw' }"
    >
      <div class="p-fluid">
        <Dropdown
          v-model="selectedUser"
          :options="orgUsers"
          option-label="full_name"
          option-value="id"
          placeholder="Select a User"
          class="w-100"
        />
      </div>
      <template #footer>
        <Button
          label="Cancel"
          icon="pi pi-times"
          class="p-button-text"
          @click="closeAssignUserModal"
        />
        <Button
          label="Proceed"
          icon="pi pi-check"
          autofocus
          type="submit"
          @click="assignUser()"
        />
      </template>
    </Dialog>
  </div>
</template>

<script>
/* eslint-disable no-param-reassign */
import { FilterMatchMode } from 'primevue/api';
import { computed, defineComponent, onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { useToastService } from '../composables/useToast.mjs';

export default defineComponent({
  name: 'Reports',
  setup() {
    const initFilter = () => ({
      'User.full_name': { value: null, matchMode: FilterMatchMode.CONTAINS },
      'Device.serial_num': { value: null, matchMode: FilterMatchMode.EQUALS },
      'location.name': { value: null, matchMode: FilterMatchMode.CONTAINS },
      chamber_id: { value: null, matchMode: FilterMatchMode.EQUALS },
      event: { value: null, matchMode: FilterMatchMode.EQUALS },
      date: { value: null, matchMode: FilterMatchMode.EQUALS },
    });

    const matchModeEq = ref([
      { label: 'EQUALS', value: FilterMatchMode.EQUALS },
    ]);
    const matchModeContains = ref([
      { label: 'CONTAINS', value: FilterMatchMode.CONTAINS },
    ]);
    const router = useRouter();
    const filters = ref(initFilter());
    const { getters, dispatch } = useStore();
    const loading = ref(true);
    const statuses = ['deposit', 'retrieval', 'access_rejected'];
    const organizationId = computed(() => getters.organizationId);
    const orgUsers = computed(() => getters.orgUsers);
    const selectedUser = ref(null);
    const assignUserModel = ref(false);
    const assignAccessMethodId = ref(null);
    const { showToast } = useToastService();
    const totalRecords = ref(0);
    const lazyParams = ref({});
    const reportData = ref();
    const dt = ref();

    const loadLazyData = async () => {
      loading.value = true;
      reportData.value = await dispatch('allDeviceEvent', lazyParams.value);
      reportData.value.forEach(el => {
        el.date = new Date(el.created_at);

        if (el?.details?.status) {
          el.statuColsTemplate = reportData.value?.details?.status;
        } else if (el.event === 'retrieval') {
          el.statusColTemplate = 'Unoccupied';
        } else if (el.event === 'deposit') {
          el.statusColTemplate = 'Occupied';
        } else {
          el.statusColTemplate = '';
        }

        if (el.event !== 'access_rejected') {
          el.reportColTemplate = `Access Granted on chamber ${el.chamber_id} on Locker ${el.Device && el.Device.serial_num}`;
        } else {
          el.reportColTemplate = 'An unrecognized RFID tag was presented';
        }
      });
      totalRecords.value = reportData.value[0]?.totalRecords;
      loading.value = false;
    };

    onMounted(async () => {
      lazyParams.value = {
        first: 0,
        rows: dt.value.rows,
        sortField: 'created_at',
        sortOrder: -1,
        filters: filters.value,
      };
      loadLazyData();
      // await dispatch('reportsKbDevice');

      await dispatch('getUsersByOrgId', { organizationId: organizationId.value });
    });

    const goToDetailPage = ({ data }) => {
      router.push({ name: 'unit', params: { id: data.device_id } });
    };

    const onPage = async event => {
      lazyParams.value = event;
      loadLazyData();
    };

    const onSort = event => {
      lazyParams.value = event;
      loadLazyData();
    };

    const onFilter = event => {
      lazyParams.value = event;
      loadLazyData();
    };

    const openAssignUserModel = data => {
      if (data.access_method_id) {
        assignAccessMethodId.value = data.access_method_id;
        assignUserModel.value = true;
      } else {
        showToast({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Please assign an access method to this device event.',
        });
      }
    };

    const closeAssignUserModal = () => {
      assignUserModel.value = false;
      selectedUser.value = null;
    };

    const assignUser = async () => {
      await dispatch('assignAccessMethod', {
        accessMethodId: assignAccessMethodId.value,
        userId: selectedUser.value,
      });
      showToast({ detail: 'Assign user successfully' });
      closeAssignUserModal();
    };

    const clearFilter = () => {
      filters.value = initFilter();
      lazyParams.value.filters = filters.value;
      loadLazyData();
    };

    const getFileHandler = async e => {
      if (e.target.files.length) {
        loading.value = true;
        const file = e.target.files[0];
        this.users = await this.userService.uploadCSV(file);
        this.loading = false;
      }
      e.target.value = null;
    };

    const formatDate = value => new Date(value).toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const formatDateTime = value => new Date(value).toLocaleString();

    const showDevice = data => {
      router.push(`/kbdevice/${data.kb_device_id}`);
    };

    return {
      filters,
      loading,
      formatDate,
      clearFilter,
      initFilter,
      statuses,
      getFileHandler,
      formatDateTime,
      orgUsers,
      assignUserModel,
      selectedUser,
      openAssignUserModel,
      closeAssignUserModal,
      assignUser,
      showDevice,
      goToDetailPage,
      loadLazyData,
      totalRecords,
      reportData,
      dt,
      lazyParams,
      onPage,
      onSort,
      onFilter,
      matchModeEq,
      matchModeContains,
    };
  },
});
</script>

<style>
.p-datatable-footer {
    background: none !important;
}
</style>
