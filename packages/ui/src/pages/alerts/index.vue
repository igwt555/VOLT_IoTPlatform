<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <h5>Subscribed Email Alerts</h5>
        <div class="alerts">
          <div v-for="alert in tempAlerts" :key="alert.id" class="alerts--item">
            <div class="field-checkbox mb-0">
              <input
                :id="'alert' + alert.id"
                type="checkbox"
                name="option"
                :checked="alert.value"
                @change="changeHandler(alert.id)"
              >
              <label :for="'alert' + alert.id" class="alertLabel">
                {{ alert.label }}
              </label>
            </div>
          </div>
        </div>
        <h5>Recent Alerts</h5>
        <DataTable
          ref="tableRef"
          v-model:filters="filters"
          class="p-datatable-gridlines"
          data-key="id"
          responsive-layout="scroll"
          filter-display="menu"
          :filters="filters"
          :value="alertIssues"
          :row-hover="true"
          :rows="10"
          :rows-per-page-options="[10, 25, 50]"
          :paginator="alertIssues ? (alertIssues.length <= 10 ? false : true) : false"
          :loading="loading"
          :global-filter-fields="['id', 'occured_at', 'description']"
          :removable-sort="true"
          paginator-template="CurrentPageReport
          FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          current-page-report-template="Showing {first} to {last} of {totalRecords}"
          @row-click="goToDetailPage"
        >
          <template #header>
            <div class="flex justify-content-between flex-column sm:flex-row">
              <Button
                type="button"
                icon="pi pi-filter-slash"
                label="Clear"
                class="p-button-outlined mb-2"
                @click="clearFilter1()"
              />
              <span class="p-input-icon-left mb-2">
                <i class="pi pi-search" />
                <InputText
                  v-model="filters['global'].value"
                  placeholder="Keyword Search"
                  style="width: 100%"
                />
              </span>
            </div>
          </template>
          <template #empty> No recent alerts. </template>
          <template #loading> Loading recent alerts. Please wait. </template>
          <Column
            sortable
            field="occured_at"
            header="Occured At"
            filter-field="date"
            data-type="date"
            style="min-width: 10rem"
            class="e2e-col-occured"
          >
            <template #body="{ data }">
              {{ formatDateTime(data.occured_at) }}
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
            field="description"
            header="Description"
            :show-filter-match-modes="false"
            style="min-width: 12rem"
            class="e2e-col-description"
          >
            <template #body="{ data }">
              {{ data.description }}
            </template>
            <template #filter="{ filterModel }">
              <InputText
                v-model="filterModel.value"
                type="text"
                class="p-column-filter"
                placeholder="Search by description"
              />
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { FilterMatchMode, FilterOperator } from 'primevue/api';
import AlertService from '../../service/AlertService.mjs';

const { dispatch, getters } = useStore();
const router = useRouter();
const alertService = ref(new AlertService());
const alerts = ref([]);
const loading = ref(false);

const UserID = computed(() => getters.UserID);

const tempAlerts = computed({
  get: () => getters.tempAlerts,
  set: val => console.log(val),
});

const notReturnedDevicesGetter = computed(
  () => getters.notReturnedDevicesGetter,
);
const alertIssues = computed(
  () => getters.alertIssues,
);

const fetchAlerts = async () => {
  try {
    loading.value = true;
    alerts.value = await alertService.value.getAlerts();
    alerts.value.forEach(element => {
    // eslint-disable-next-line no-param-reassign
      element.date = new Date(element.created_at);
    });
    loading.value = false;
  } catch (error) {
    loading.value = false;
    console.log(error);
  }
};

const initFilter = () => ({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  description: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  },
  date: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
  },
});
const filters = ref(initFilter());

const clearFilter1 = () => {
  initFilter();
};

const notReturnedDevices = () => {
  alerts.value = [];

  notReturnedDevicesGetter.value?.forEach(ele => {
    const updatedAt = new Date(ele.updated_at);
    const currentDate = new Date();
    const milliseconds = Math.abs(currentDate - updatedAt);
    const hours = milliseconds / 36e5;
    alerts.value.push({
      id: ele.id,
      date: new Date(ele.created_at),
      description: `${
        ele.KbDevice.name
      } has not returned a device checked out ${Math.round(hours)} hours ago`,
      created_at: ele.created_at,
      user_id: ele.user_id,
    });
  });
};

const goToDetailPage = ({ data }) => {
  if (data.unit_id) {
    router.push(`/units/${data.unit_id}`);
  } else if (data.user_id) {
    router.push(`/users/${data.user_id}`);
  }
};

const changeHandler = async id => {
  await dispatch('toggleAlerts', {
    alert_id: id,
    user_id: UserID.value,
  });
  await dispatch('notReturnedKbDevices');
  notReturnedDevices();
};

const formatDateTime = value => new Date(value).toLocaleString();

onMounted(() => {
  // initFilters();
  fetchAlerts();
  dispatch('getUserAlerts', UserID.value);
});
</script>

<style lang="scss" scoped>
.alertLabel {
  text-transform: capitalize;
}
.alerts {
  &--item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    span {
      margin-right: 1rem;
    }
  }
}

input[type='checkbox'] {
  border: 2px solid #ced4da;
  background: #ffffff;
  width: 20px;
  height: 20px;
  color: #495057;
  border-radius: 6px;
  transition: background-color 0.2s, color 0.2s, border-color 0.2s,
    box-shadow 0.2s;
  margin: 0;
}
</style>
