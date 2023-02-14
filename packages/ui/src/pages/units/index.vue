<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <h5>{{ isOtto ? 'Ladders' : 'Units' }}</h5>
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
                  @click="clearFilter"
                />
              </div>
            </div>
          </template>
          <template #empty>
            {{ isOtto ? 'No ladders found.' : 'No units found.' }}
          </template>
          <template #loading>
            {{
              isOtto
                ? 'Loading ladder data. Please wait.'
                : 'Loading units data. Please wait.'
            }}
          </template>
          <Column
            sortable
            field="serial_num"
            header="Device ID"
            style="min-width: 12rem"
            class="e2e-col-serialnum"
          >
            <template #body="{ data }">
              {{ data.serial_num }}
            </template>
            <template #filter="{ filterModel }">
              <InputText
                v-model="filterModel.value"
                type="text"
                class="p-column-filter"
                placeholder="Search by Id"
              />
            </template>
          </Column>
          <Column
            sortable
            field="date"
            header="Initialized"
            filter-field="date"
            data-type="date"
            style="min-width: 10rem"
            class="e2e-col-initialized"
          >
            <template #body="{ data }">
              {{ formatDate(data.date) }}
            </template>
            <template #filter="{ filterModel }">
              <Calendar
                v-model="filterModel.value"
                date-format="mm/dd/yy"
                placeholder="mm/dd/yyyy"
              />
            </template>
          </Column>
          <Column
            sortable
            field="unit_status"
            header="Status"
            :filter-menu-style="{ width: '14rem' }"
            style="min-width: 12rem"
            class="e2e-col-status"
          >
            <template #body="{ data }">
              <span :class="'customer-badge status-' + data.unit_status">{{
                data.unit_status && data.unit_status.replace('-', ' ')
              }}</span>
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
                    :class="'customer-badge status-' + slotProps.value"
                  >{{ slotProps.value }}</span>
                  <span v-else>{{ slotProps.placeholder }}</span>
                </template>
                <template #option="slotProps">
                  <span :class="'customer-badge status-' + slotProps.option">{{
                    slotProps.option.replace('-', ' ')
                  }}</span>
                </template>
              </Dropdown>
            </template>
          </Column>
          <Column
            sortable
            field="progress"
            header="Occupancy"
            :show-filter-match-modes="false"
            style="min-width: 12rem"
            class="e2e-col-activity"
          >
            <template #body="{ data }">
              <ProgressBar
                :value="data.progress"
                :show-value="false"
                style="height: 0.5rem"
              />
            </template>
            <template #filter="{ filterModel }">
              <Slider v-model="filterModel.value" range class="m-3" />
              <div class="flex align-items-center justify-content-between px-2">
                <span>{{ filterModel.value ? filterModel.value[0] : 0 }}</span>
                <span>{{
                  filterModel.value ? filterModel.value[1] : 100
                }}</span>
              </div>
            </template>
          </Column>
          <Column
            sortable
            field="connection"
            header="Connection"
            data-type="boolean"
            style="min-width: 8rem"
            class="e2e-col-connection"
          >
            <template #body="{ data }">
              <Badge v-if="data.is_active" severity="success" value="Connected" />
              <Badge v-else severity="warning" value="Disconnected" />
            </template>
            <template #filter="{ filterModel }">
              <Dropdown
                v-model="filterModel.value"
                :options="connections"
                placeholder="Select Connection"
                class="p-column-filter"
                :show-clear="true"
              >
                <template #value="slotProps">
                  <span v-if="slotProps.value">{{ slotProps.value }}</span>
                  <span v-else>{{ slotProps.placeholder }}</span>
                </template>
              </Dropdown>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script setup>
import { FilterMatchMode, FilterOperator } from 'primevue/api';
import { computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

const { dispatch, getters } = useStore();
const router = useRouter();
const loading = ref(true);
onMounted(async () => {
  await dispatch('getAllDevices');
  loading.value = false;
});
const devices = computed(() => getters.devices?.map(el => ({
  ...el,
  date: new Date(el.created_at),
  connection: (el.is_active ? 'Connected' : 'Disconnected') })));
const isOtto = computed(() => window?.location?.host?.split('.')?.[0] === 'otto');

const initFilter = () => ({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  id: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  },
  serial_num: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  },
  // 'initialized': {operator: FilterOperator.AND, constraints: [{value: null, matchMode: FilterMatchMode.STARTS_WITH}]},
  unit_status: {
    operator: FilterOperator.OR,
    constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
  },
  progress: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.BETWEEN }],
  },
  connection: { value: null, matchMode: FilterMatchMode.EQUALS },
  date: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
  },
});
const statuses = ['ready', 'full', 'needs-attention'];
const connections = ['Connected', 'Disconnected'];

const filters = ref(initFilter());

const clearFilter = () => {
  filters.value = initFilter();
};

const formatDate = value => {
  const timeStamp = new Date(value).getTime();
  let toDate = new Date(timeStamp).getDate();
  let toMonth = new Date(timeStamp).getMonth() + 1;
  const toYear = new Date(timeStamp).getFullYear();
  if (toMonth < 10) toMonth = `0${toMonth}`;
  if (toDate < 10) toDate = `0${toDate}`;
  const originalDate = `${toMonth}/${toDate}/${toYear}`;
  return originalDate;
};

const goToDetailPage = ({ data }) => router.push({ name: 'unit', params: { id: data.id } });
</script>

<style scoped lang="scss">
.customer-badge {
  border-radius: 2px;
  padding: 0.25em 0.5rem;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.3px;
  &.status-ready {
    background: #c8e6c9;
    color: #256029;
  }
  &.status-unqualified {
    background: #ffcdd2;
    color: #c63737;
  }
  &.status-negotiation {
    background: #feedaf;
    color: #8a5340;
  }
  &.status-needs-attention {
    background: #b3e5fc;
    color: #23547b;
  }
  &.status-renewal {
    background: #eccfff;
    color: #694382;
  }
  &.status-full {
    background: #ffd8b2;
    color: #805b36;
  }
}
</style>
