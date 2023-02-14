<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <h5>Users</h5>
        <DataTable
          ref="tableRef"
          v-model:filters="filters"
          class="p-datatable-gridlines"
          data-key="id"
          responsive-layout="scroll"
          filter-display="menu"
          :filters="filters"
          :value="users"
          :row-hover="true"
          :rows="10"
          :rows-per-page-options="[10, 25, 50]"
          :paginator="users ? (users.length <= 10 ? false : true) : false"
          :loading="loading"
          :global-filter-fields="['id', 'date', 'status']"
          :removable-sort="true"
          paginator-template="CurrentPageReport
          FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          current-page-report-template="Showing {first} to {last} of {totalRecords}"
          @row-click="goToUserDetailPage"
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
                <Button
                  type="button"
                  label="Import/Export"
                  class="p-button mb-2"
                  @click="showPopUp($event)"
                />
                <AddUserDialog />
              </div>
            </div>
          </template>
          <template #empty> No users found. </template>
          <template #loading> Loading user data. Please wait. </template>
          <Column v-if="isOtto" class="p-0" style="height: inherit; width: 20px;">
            <template #body="{data}">
              <div class="flex justify-content-center w-full h-full extra-class">
                <Badge
                  v-if="data?.details?.isActive" value="Badged In" severity="success"
                  class="white-space-nowrap mx-2" />
                <Badge v-else value="Badged Out" severity="danger" class="white-space-nowrap mx-2" />
              </div>
            </template>
          </Column>
          <Column
            sortable
            field="full_name"
            header="User"
            style="min-width: 10rem"
            class="e2e-col-user"
          >
            <template #body="{ data }">
              {{ data.full_name }}
              <Badge v-if="data.is_active" value="Active" severity="success" />
              <Badge v-else value="Suspended" severity="warning" />
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
            field="email"
            header="Email"
            class="e2e-col-email"
            style="min-width: 12rem"
          >
            <template #body="{ data }">
              {{ data.email }}
            </template>
            <template #filter="{ filterModel }">
              <InputText
                v-model="filterModel.value"
                type="text"
                class="p-column-filter"
                placeholder="Search by Email"
              />
            </template>
          </Column>
          <Column
            sortable
            field="Role.name"
            header="Role"
            class="e2e-col-role"
            style="min-width: 8rem"
            :show-filter-match-modes="false"
            :filter-match-mode-options="roleMatchModes"
          >
            <template #body="{ data }">
              <span :class="`user-badge`">{{
                data.Role && data.Role.name.replaceAll('-', ' ')
              }}</span>
            </template>
            <template #filter="{ filterModel }">
              <Dropdown
                v-model="filterModel.value"
                :options="userRole"
                placeholder="Select Role"
                class="p-column-filter"
                :show-clear="true"
              >
                <template #value="slotProps">
                  <span v-if="slotProps.value" class="user-badge">{{
                    slotProps.value
                  }}</span>
                  <span v-else>{{ slotProps.placeholder }}</span>
                </template>
                <template #option="slotProps">
                  <span class="user-badge">{{ slotProps.option }}</span>
                </template>
              </Dropdown>
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
    <input ref="button" type="text" class="d-none" @change="getFileHandler">
  </div>

  <ConfirmPopup group="demo">
    <template #message="slotProps">
      <div class="p-d-flex p-p-4">
        <i :class="slotProps.message.icon" style="font-size: 1.5rem" />
        <p ref="div" class="p-pl-2">
          {{ slotProps.message.message }}
        </p>
      </div>
    </template>
  </ConfirmPopup>
</template>

<script setup>
import { FilterMatchMode, FilterOperator } from 'primevue/api';
import {
  computed,
  onMounted,
  ref,
  watch,
} from 'vue';
import { useConfirm } from 'primevue/useconfirm';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import AddUserDialog from './AddUserDialog.vue';

const isOtto = computed(() => window.location.host.split('.')[0]?.includes('otto'));

const confirm = useConfirm();
const initFilter = () => ({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  id: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  },
  full_name: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  },
  email: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  },
  'Role.name': {
    operator: FilterOperator.OR,
    constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
  },
});
const roleMatchModes = [{ label: 'Equals', value: FilterMatchMode.EQUALS }];
const filters = ref(initFilter());
const { getters, dispatch } = useStore();
const loading = ref(true);
const userRole = ref(null);
const users = computed(() => getters.users);
watch(users, () => {
  const arr = [];
  if (users.value) {
    users.value.forEach(element => {
      if (element?.Role?.name) {
        arr.push(element?.Role?.name);
      }
    });
    userRole.value = [...new Set(arr)];
  }
});
const tableRef = ref(null);
const { push } = useRouter();
const csv = ref(null);
const roleId = computed(() => getters.roleId);
const organizationId = computed(() => getters.organizationId);

onMounted(async () => {
  await dispatch('getUsers');
  await dispatch('getChildOrgs', { id: organizationId.value });
  await dispatch('getRoles');
  if (roleId.value) {
    await dispatch('getPermissionByRoleId', { roleId: roleId.value });
  }
  loading.value = false;
});

const clearFilter = () => {
  filters.value = initFilter();
};

const exportCSV = () => {
  tableRef.value.exportCSV();
};

const getFileHandler = async e => {
  try {
    if (e.target.files.length) {
      loading.value = true;
      const file = e?.target?.files[0];
      if (file.type !== 'text/csv') {
        // eslint-disable-next-line no-alert
        alert('Invalid file type');
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

const goToUserDetailPage = ({ data }) => {
  push(`/users/${data.id}`);
};

const showPopUp = event => {
  confirm.require({
    target: event.currentTarget,
    message: 'Do you want to upload or download users?',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Upload',
    rejectLabel: 'Download',
    accept: () => csv.value.click(),
    reject: () => exportCSV(),
  });
};
</script>

<style scoped lang="scss">
.user-badge {
  border-radius: 2px;
  padding: 0.25em 0.5rem;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.3px;

  &.status-admin {
    background: #c8e6c9;
    color: #256029;
  }

  &.status-device-retrieval-only {
    background: #ffcdd2;
    color: #c63737;
  }

  &.status-reporting-only {
    background: #eccfff;
    color: #694382;
  }

  &.status-standard-access {
    background: #b3e5fc;
    color: #23547b;
  }

  &.status-basic-access {
    background: #ffd8b2;
    color: #805b36;
  }
}
.customer-badge {
  border-radius: 2px;
  padding: 0.25em 0.5rem;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.3px;
}

.product-badge {
  border-radius: 2px;
  padding: 0.25em 0.5rem;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.3px;

  &.status-instock {
    background: #c8e6c9;
    color: #256029;
  }

  &.status-outofstock {
    background: #ffcdd2;
    color: #c63737;
  }

  &.status-lowstock {
    background: #feedaf;
    color: #8a5340;
  }
}

.order-badge {
  border-radius: 2px;
  padding: 0.25em 0.5rem;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.3px;

  &.order-delivered {
    background: #c8e6c9;
    color: #256029;
  }

  &.order-cancelled {
    background: #ffcdd2;
    color: #c63737;
  }

  &.order-pending {
    background: #feedaf;
    color: #8a5340;
  }

  &.order-returned {
    background: #eccfff;
    color: #694382;
  }
}

.badged-in-out{
  width: 100%;
  min-width: 100px;
  text-align: center;
  margin: 0px 4px;
  padding: 4px 0px;
  border-radius: 6px;
}
</style>
