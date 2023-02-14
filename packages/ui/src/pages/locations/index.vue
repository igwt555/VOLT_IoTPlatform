<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <h5>{{ isOtto ? 'Sites' : 'Locations' }}</h5>
        <DataTable
          ref="tableRef"
          v-model:filters="filters"
          class="p-datatable-gridlines"
          data-key="id"
          responsive-layout="scroll"
          filter-display="menu"
          :filters="filters"
          :value="locationsData"
          :row-hover="true"
          :rows="10"
          :rows-per-page-options="[10, 25, 50]"
          :paginator="locationsData ? (locationsData.length <= 10 ? false : true) : false"
          :loading="loading"
          :global-filter-fields="['name', 'created_at', 'date']"
          :removable-sort="true"
          paginator-template="CurrentPageReport
          FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          current-page-report-template="Showing {first} to {last} of {totalRecords}"
          @row-click="goToDevicesOnLocation"
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
                <AddOrEditLocationDialog v-if="addPermission" @locations="loadLocations" />
              </div>
            </div>
          </template>
          <template #empty>
            {{ isOtto ? 'No sites found.' : 'No locations found.' }}
          </template>
          <template #loading>
            {{
              isOtto
                ? 'Loading site data. Please wait.'
                : 'Loading location data. Please wait.'
            }}
          </template>
          <Column field="name" class="e2e-col-location" sortable :header="isOtto ? 'Site' : 'Location'">
            <template #body="{ data }">
              {{ data.name }}
            </template>
            <template #filter="{ filterModel }">
              <InputText
                v-model="filterModel.value"
                type="text"
                class="p-column-filter"
                placeholder="Search by name"
              />
            </template>
          </Column>
          <Column
            field="date" header="Date Added" class="e2e-col-date-added" filter-field="date"
            sortable data-type="date">
            <template #body="{ data }">
              {{ formatDate(data.created_at) }}
            </template>
            <template #filter="{ filterModel }">
              <Calendar
                v-model="filterModel.value"
                date-format="mm/dd/yy"
                placeholder="mm/dd/yyyy"
                :select-other-months="true"
                :max-date="maxDate"
                :manual-input="false"
              />
            </template>
          </Column>
          <Column v-if="rolename !== 'user' && (editPermission || deletePermission)" header="Actions">
            <template #body="{ data }">
              <AddOrEditLocationDialog v-if="editPermission" :location="data" />
              <Button
                v-if="deletePermission"
                v-tooltip.top="{ value: 'Delete' }"
                type="button"
                icon="pi pi-fw pi-trash"
                label=""
                class="p-button-danger mr-3 my-1"
                @click="deleteLocation(data)"
              />
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
import { useConfirm } from 'primevue/useconfirm';
import { useToastService } from '../../composables/useToast.mjs';
import AddOrEditLocationDialog from './AddOrEditLocationDialog.vue';

const initFilter = () => ({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  id: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  },
  name: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  },
  date: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
  },
  activity: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.BETWEEN }],
  },
});

const confirm = useConfirm();
const { push } = useRouter();
const { showToast } = useToastService();
const filters = ref(initFilter());
const { getters, dispatch } = useStore();
const loading = ref(true);
const maxDate = new Date();
const addPermission = ref(false);
const editPermission = ref(false);
const deletePermission = ref(false);

const locationsData = computed(() => {
  const data = getters.locations;
  data.forEach(el => {
    // eslint-disable-next-line no-param-reassign
    el.date = new Date(el.created_at);
  });
  return data;
});

const isOtto = computed(() => window.location.host.split('.')[0]?.includes('otto'));

const organizationId = computed(() => getters.organizationId);
const roleId = computed(() => getters.roleId);
const rolename = computed(() => getters.roleName);
const getPermissionByRoleId = computed(() => getters.RoleByPermission);
const permissions = computed(() => getters.Permission.map(x => ({ id: x.id, name: x.name })));

onMounted(async () => {
  await dispatch('getAllLocations');
  await dispatch('getAllDevices');
  await dispatch('getChildOrgs', { id: organizationId.value });

  if (roleId.value !== null) {
    await dispatch('getPermission');
    await dispatch('getPermissionByRoleId', { roleId: roleId.value });
    if (getPermissionByRoleId.value) {
      addPermission.value = permissions.value.some(x => getPermissionByRoleId.value.some(y => x.id === y.id && x.name.toLowerCase() === 'create location'));
      editPermission.value = permissions.value.some(x => getPermissionByRoleId.value.some(y => x.id === y.id && x.name.toLowerCase() === 'update location'));
      deletePermission.value = permissions.value.some(x => getPermissionByRoleId.value.some(y => x.id === y.id && x.name.toLowerCase() === 'delete location'));
    }
  }
  loading.value = false;
});

const loadLocations = async () => {
  await dispatch('getAllLocations');
};

const clearFilter = () => {
  filters.value = initFilter();
};

const formatDate = value => new Date(value).toLocaleDateString('en-US', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const goToDevicesOnLocation = ({ data }) => {
  if (data.device_id) {
    push(`/locations/${data.id}`);
  } else {
    showToast({
      severity: 'warn',
      summary: 'Warning',
      detail: 'No device is assigned to this location',
    });
  }
};

const deleteLocation = location => {
  confirm.require({
    message: 'Are you sure you want to delete this location?',
    header: 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      await dispatch('deleteLocation', { locationId: location.id, isOtto: isOtto.value });
    },
    reject: () => {},
  });
};
</script>
