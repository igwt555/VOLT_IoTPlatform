<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <div class="col-12 lg:col-4">
          <div class="flex justify-content-between">
            <p class="m-0">
              Make: {{ kbDevice?.make }}
            </p>
          </div>
        </div>
        <div class="col-12 lg:col-4">
          <div class="flex justify-content-between">
            <p class="m-0">
              Model: {{ kbDevice?.model }}
            </p>
          </div>
        </div>
        <div class="col-12 lg:col-4 mb-5">
          <div class="flex justify-content-between">
            <p class="m-0">
              Device: {{ kbDevice?.name }}
            </p>
          </div>
        </div>

        <DataTable
          v-model:filters="filters"
          class="p-datatable-gridlines"
          data-key="id"
          responsive-layout="scroll"
          show-gridlines
          filter-display="menu"
          :filters="filters"
          :value="deviceData"
          :row-hover="true"
          :rows="10"
          :rows-per-page-options="[10, 25, 50]"
          :paginator="deviceData ? (deviceData.length <= 10 ? false : true) : false"
          :loading="loading"
          :global-filter-fields="['id', 'date', 'event']"
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
            No device data found.
          </template>
          <template #loading>
            Loading device data. Please wait.
          </template>
          <Column
            sortable
            field="User.full_name"
            header="Users"
            style="min-width: 12rem"
          >
            <template #body="{ data }">
              <span>{{ data.User && data.User.full_name }}</span>
            </template>
            <template #filter="{ filterModel }">
              <InputText
                v-model="filterModel.value"
                type="text"
                class="p-column-filter"
                placeholder="Search by User"
              />
            </template>
          </Column>
          <Column
            sortable
            field="Device.serial_num"
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
            sortable
            field="chamber_id"
            header="Chamber #"
            style="min-width: 12rem"
          >
            <template #body="{ data }">
              <span>{{ data.chamber_id }}</span>
            </template>
            <template #filter="{ filterModel }">
              <InputText
                v-model="filterModel.value"
                type="text"
                class="p-column-filter"
                placeholder="Search by Chamber"
              />
            </template>
          </Column>
          <Column
            sortable
            filter-field="date"
            header="Date & Time"
            style="min-width: 12rem"
            data-type="date"
            field="date"
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
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script>
import { FilterMatchMode, FilterOperator } from 'primevue/api';
import {
  computed,
  defineComponent,
  onMounted,
  ref,
} from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';

export default defineComponent({
  setup() {
    const initFilter = () => ({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      id: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
      'User.full_name': {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
      'Device.serial_num': {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
      chamber_id: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
      date: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
      },
    });
    const filters = ref(initFilter());
    const { dispatch, getters } = useStore();
    const { params } = useRoute();
    const loading = ref(true);
    const kbDevice = computed(() => getters.kbDevice);
    const deviceData = computed(() => {
      const data = getters.eventDataByKbDeviceId;
      if (data) {
        data.forEach(el => {
          // eslint-disable-next-line no-param-reassign
          el.date = new Date(el.created_at);
        });
      }
      return data;
    });

    onMounted(async () => {
      await dispatch('findById', params.id);
      await dispatch('getEventByKbDeviceId', params.id);
      loading.value = false;
    });

    const formatDateTime = value => new Date(value).toLocaleString();

    const clearFilter = () => {
      filters.value = initFilter();
    };

    return {
      kbDevice,
      loading,
      deviceData,
      formatDateTime,
      filters,
      clearFilter,
    };
  },
});
</script>
