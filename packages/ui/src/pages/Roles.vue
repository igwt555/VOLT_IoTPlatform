<!-- eslint-disable vue/v-on-event-hyphenation -->
<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <h5>Roles</h5>
        <DataTable
          ref="tableRef"
          v-model:filters="filters"
          v-model:expandedRows="expandedRows"
          class="p-datatable-gridlines"
          data-key="id"
          responsive-layout="scroll"
          filter-display="menu"
          :filters="filters"
          :value="roles"
          :row-hover="true"
          :rows="10"
          :rows-per-page-options="[10, 25, 50]"
          :paginator="roles ? (roles.length <= 10 ? false : true) : false"
          :loading="loading"
          :global-filter-fields="['name', 'description']"
          :removable-sort="true"
          :expanded-row-groups="1"
          paginator-template="CurrentPageReport
          FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          current-page-report-template="Showing {first} to {last} of {totalRecords}"
          @row-expand="changeparmission($event, $data)"
          @row-collapse="RowCollapse"
        >
          <template #header>
            <div
              class="flex justify-content-between flex-column sm:flex-row"
            >
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
                  icon="pi pi-fw pi-plus"
                  label="Create Role"
                  class="p-button mb-2 mr-3"
                  @click="openAddRole"
                />
              </div>
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
          <template #empty>
            No roles found.
          </template>
          <template #loading>
            Loading roles data. Please wait.
          </template>
          <Column
            :expander="true"
            header-style="width: 3rem"
          />
          <Column
            sortable
            field="name"
            header="Role"
            style="min-width: 10rem"
            class="e2e-role-filter"
          >
            <template #body="{ data }">
              {{ data.name }}
            </template>
            <template #filter="{ filterModel }">
              <InputText
                v-model="filterModel.value"
                type="text"
                class="p-column-filter"
                placeholder="Search by Role"
              />
            </template>
          </Column>
          <Column
            sortable
            field="description"
            header="Description"
            style="min-width: 10rem"
            class="e2e-description-filter"
          >
            <template #body="{ data }">
              {{ data.description }}
            </template>
            <template #filter="{ filterModel }">
              <InputText
                v-model="filterModel.value"
                type="text"
                class="p-column-filter"
                placeholder="Search by Description"
              />
            </template>
          </Column>
          <Column v-if="rolename !== 'user' && roles?.length > 3">
            <template #body="{ data }">
              <SplitButton
                v-if="!isSystemRole(data.id)"
                label="Manage Role"
                :model="roleItems(data)"
                class="p-button-primary"
              />
            </template>
          </Column>
          <template #expansion="{ data }">
            <h5 class="ml-5 pl-4">
              <b>Change Permissions for {{ data.name }}</b>
            </h5>
            <div>
              <p
                v-for="item in permissions"
                :key="item.id"
                class="ml-5 pl-4"
              >
                <Checkbox
                  id="permission"
                  v-model="expandedPermission"
                  :disabled="isSystemRole(data.id)"
                  name="permission"
                  :value="item.id"
                  @click="parmissionAllValue"
                  @change="parmissionValue(item.id, data.id)"
                />
                <label
                  :for="item.id + data.id"
                  class="pl-3"
                >{{
                  item.name
                }}</label>
              </p>
            </div>
            <!-- <div v-else>
                     <p class="ml-5 pl-4">No parmission found</p>
                  </div> -->
          </template>
        </DataTable>
      </div>
    </div>

    <Dialog
      v-model:visible="showAddRole"
      header="Add a new role"
      :breakpoints="{ '960px': '75vw', '640px': '100vw' }"
      :style="{ width: '50vw' }"
    >
      <InputText
        v-model="role"
        type="text"
        class="mb-2 w-100 e2e-rolename"
        placeholder="Role Name"
        @keypress.enter.prevent="AddRole()"
      />
      <small
        v-if="v$.role.$error"
        class="p-error"
      >{{
        v$.role.$errors[0].$message
      }}</small>

      <Textarea
        id="address"
        v-model="description"
        placeholder="Role Description"
        class="w-100 e2e-description"
        rows="4"
      />
      <small
        v-if="v$.description.$error"
        class="p-error"
      >{{
        v$.description.$errors[0].$message
      }}</small>

      <template #footer>
        <Button
          label="Cancel"
          icon="pi pi-times"
          class="p-button-text"
          @click="closeAddRole"
        />
        <Button
          label="Create Role"
          icon="pi pi-check"
          autofocus
          class="e2e-add-role"
          @click="AddRole"
        />
      </template>
    </Dialog>
    <Dialog
      v-model:visible="roleedit"
      header="Edit/Update Role"
      :style="{ width: '50vw' }"
    >
      <InputText
        v-model="roleName"
        style="width: 100%"
        class="my-2"
      />
      <template #footer>
        <Button
          label="Cancel"
          icon="pi pi-times"
          class="p-button-text"
          @click="closemodal"
        />
        <Button
          label="Proceed"
          icon="pi pi-check"
          autofocus
          @click="submitted"
        />
      </template>
    </Dialog>
    <Dialog
      v-model:visible="roleDelete"
      header="Role Delete"
      :breakpoints="{'960px': '75vw', '640px': '90vw'}"
      :style="{width: '20vw'}"
    >
      <p> Are You sure to delete this role?</p>
      <template #footer>
        <Button
          label="cancle"
          icon="pi pi-times"
          class="p-button-text"
          @click="canceldelete"
        />
        <Button
          label="proceed"
          icon="pi pi-check"
          autofocus
          @click="confirmdelete"
        />
      </template>
    </Dialog>
  </div>
</template>

<script>
import {
  computed,
  defineComponent,
  onMounted,
  ref,
  reactive,
  toRefs,
} from 'vue';
import { useStore } from 'vuex';
import { useVuelidate } from '@vuelidate/core';
import { FilterMatchMode, FilterOperator } from 'primevue/api';
import { useToastService } from '../composables/useToast.mjs';
import { role } from '../validation/role.mjs';

const systemRoleIds = new Set([
  '00000000-0000-0000-0000-000000000000',
  '7f57a8fb-6af8-4cb9-b72c-205f583d5a79',
  '12ebf608-1986-4927-96fa-fc0d9007e708',
]);

export default defineComponent({
  name: 'Role',
  setup() {
    const initFilter = () => ({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      id: {
        operator: FilterOperator.AND,
        constraints: [
          { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        ],
      },
      name: {
        operator: FilterOperator.AND,
        constraints: [
          { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        ],
      },
      description: {
        operator: FilterOperator.AND,
        constraints: [
          { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        ],
      },
    });

    const { dispatch, getters } = useStore();
    const getRoles = async () => {
      await dispatch('getRoles');
    };

    const expandedPermission = ref('');
    const roleedit = ref(false);
    const roleDelete = ref(false);
    const afterUpdate = ref('');
    const roleName = ref('');
    const expandedRows = ref(null);
    const selectedRoleId = ref(null);
    const loading = ref(false);

    const state = reactive({
      role: '',
      description: '',
    });
    const rules = computed(() => role);
    const v$ = useVuelidate(rules, state);

    const { showToast } = useToastService();
    const showAddRole = ref(false);
    const rolename = computed(() => getters.roleName);
    const organizationId = computed(() => getters.organizationId);
    const roles = computed(() => getters.roles);
    const filters = ref(initFilter());
    const permissions = computed(() => getters.Permission.map(x => ({ id: x.id, name: x.name })));
    const getRoleByPermission = computed(() => getters.getPermissionById);
    const rolebyid = computed(() => getters.rolebyid);
    const roleId = computed(() => getters.roleId);
    onMounted(async () => {
      await dispatch('getPermission');
      getRoles();
    });

    const isSystemRole = rId => systemRoleIds.has(rId);

    const getPermissionById = async paramsRoleId => {
      await dispatch('getPermissionById', {
        roleId: paramsRoleId,
      });
      if (roleId.value === paramsRoleId) {
        await dispatch('getPermissionByRoleId', {
          roleId: paramsRoleId,
        });
      }

      // TODO depending on whether we're getting rolePermissions from db or hardcoded, we get an array of
      // permission objects OR an arrany of rolePermissions. Need to consistently return just permission objs
      expandedPermission.value = getRoleByPermission.value.map(x => x.permission_id || x.id);
    };

    const clearFilter = () => {
      filters.value = initFilter();
    };

    const closeAddRole = () => {
      showAddRole.value = false;
    };

    const openAddRole = () => {
      state.role = '';
      state.description = '';
      v$.value.$reset();
      showAddRole.value = true;
    };
    const rolePermission = ref([]);

    const AddRole = async () => {
      try {
        v$.value.$validate();
        if (!v$.value.$error) {
          await dispatch('addRole', {
            name: state.role,
            description: state.description,
            organization_id: organizationId.value,
          });
          getRoles();
          showToast({ detail: 'Role successfully added' });
          closeAddRole();
        }
      } catch (error) {
        console.log(error);
        closeAddRole();
        showToast({
          severity: 'error',
          summary: 'Error',
          detail: 'An issue occurred when creating role Please try again.',
        });
      }
    };

    const RowCollapse = async () => {
      expandedPermission.value = '';
    };

    const changeparmission = async event => {
      if (event.data.name === 'Account Holder' || event.data.id === '00000000-0000-0000-0000-000000000000') {
        expandedPermission.value = [];
        expandedPermission.value = permissions.value.map(x => x.id);
      } else {
        expandedPermission.value = [];
        getPermissionById(event.data.id);
      }
      const data = [];
      data.push(event.data);
      expandedRows.value = data;
    };

    const parmissionValue = async (parmision, paramsRole) => {
      if (expandedPermission.value.length < afterUpdate.value.length) {
        await dispatch('deletePermission', {
          roleId: paramsRole,
          permissionId: parmision,
        });
        getPermissionById(paramsRole);
      } else if (
        expandedPermission.value.length > afterUpdate.value.length
      ) {
        const permissionnames = permissions.value.filter(x => parmision === x.id);
        if (permissionnames.length > 0) {
          await dispatch('createRolePermission', {
            role_id: paramsRole,
            permission_id: parmision,
            organization_id: organizationId.value,
          });
          getPermissionById(paramsRole);
        }
      }
    };

    const parmissionAllValue = async () => {
      afterUpdate.value = expandedPermission.value;
    };
    const closemodal = () => {
      roleedit.value = false;
    };
    const updateRole = data => {
      roleName.value = data.name;
      selectedRoleId.value = data.id;
      roleedit.value = true;
    };
    const deleteRole = data => {
      selectedRoleId.value = data.id;
      roleDelete.value = true;
    };
    const roleItems = data => {
      const items = [
        {
          label: 'Update',
          icon: 'pi pi-refresh',
          command: () => {
            updateRole(data);
          },
        },
        {
          label: 'Delete',
          icon: 'pi pi-times',
          command: () => {
            deleteRole(data);
          },
        },
      ];
      return items;
    };

    const submitted = async () => {
      await dispatch('updateRoles', {
        id: selectedRoleId.value,
        name: roleName.value,
      });
      const updateError = getters.updateRoleError;
      if (updateError) {
        showToast({ severity: 'error', summary: 'Error', detail: 'something went wrong !!' });
      } else {
        showToast({ detail: 'Role Updated successfully' });
      }
      getRoles();
      roleedit.value = false;
    };
    const canceldelete = () => {
      roleDelete.value = false;
    };
    const confirmdelete = async () => {
      await dispatch('delete_Role', {
        id: selectedRoleId.value,
      });
      const deleteError = getters.deleteRoleError;
      if (deleteError) {
        showToast({ severity: 'error', summary: 'Error', detail: 'something went wrong !!' });
      }
      getRoles();
      roleDelete.value = false;
    };

    return {
      ...toRefs(state),
      loading,
      roles,
      showAddRole,
      closeAddRole,
      openAddRole,
      AddRole,
      clearFilter,
      filters,
      v$,
      permissions,
      rolebyid,
      expandedPermission,
      expandedRows,
      rolePermission,
      getRoleByPermission,
      RowCollapse,
      changeparmission,
      parmissionValue,
      parmissionAllValue,
      roleItems,
      canceldelete,
      submitted,
      confirmdelete,
      closemodal,
      roleedit,
      roleDelete,
      roleName,
      selectedRoleId,
      rolename,
      isSystemRole,
    };
  },
});
</script>
