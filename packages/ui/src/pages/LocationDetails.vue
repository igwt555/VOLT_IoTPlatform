<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <div class="transfer">
          <ChangeLocationDialog
            v-if="locationDevices.length"
            :locations="locations" :devices="locationDevices[0]?.device_id" label="Change Location" />
          <Button
            v-if="locationDevices.length"
            label="Remove From Location"
            class="p-button-secondary p-button-sm mr-2"
            icon="bi bi-file-earmark-x"
            @click="removeLocation(locationDevices)"
          />
          <TransferOwnershipDialog
            class="ml-auto my-auto"
            :device-id="params.id"
            @success="router.push({ name: 'units' })"
          />
        </div>
      </div>
      <div>
        <DataTable
          v-model:filters="filters"
          class="p-datatable-gridlines"
          data-key="id"
          responsive-layout="scroll"
          filter-display="menu"
          :filters="filters"
          :value="locationDevices"
          :row-hover="true"
          :rows="10"
          :rows-per-page-options="[10, 25, 50]"
          :paginator="locationDevices ? (locationDevices.length <= 10 ? false : true) : false"
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
            field="serial_num"
            header="Serial Num"
            style="min-width: 12rem"
            class="e2e-col-serialnum"
          >
            <template #body="{ data }">
              {{ data.Device.serial_num }}
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
            header="Initialized"
            filter-field="date"
            data-type="date"
            style="min-width: 10rem"
            class="e2e-col-initialized"
          >
            <!-- <template #body="{ data }">
              {{ formatDate(data.created_at) }}
            </template> -->
            <template #filter="{ filterModel }">
              <Calendar
                v-model="filterModel.value"
                date-format="mm/dd/yy"
                placeholder="mm/dd/yyyy"
              />
            </template>
          </Column>
          <Column
            field="status"
            header="Status"
            :filter-menu-style="{ width: '14rem' }"
            style="min-width: 12rem"
            class="e2e-col-status"
          >
            <template #body="{ data }">
              <span :class="'customer-badge status-' + data.unit_status">{{
                data.Device.status && data.Device.status.replace('-', ' ')
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
            field="activity"
            header="Activity"
            :show-filter-match-modes="false"
            style="min-width: 12rem"
            class="e2e-col-activity"
          >
            <template #body="{ data }">
              <ProgressBar
                :value="
                  ((data.serial_num?.length +
                    data.id.split('').filter((c) => /[a-z]/.test(c)).length) %
                    5) *
                    20
                "
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
            field="is_active"
            header="Connection"
            data-type="boolean"
            body-class="text-center"
            style="min-width: 8rem"
            class="e2e-col-connection"
          >
            <template #body="{ data }">
              <i
                class="pi"
                :class="{
                  'text-green-500 pi-check-circle': data.is_active,
                  'text-pink-500 pi-times-circle': !data.is_active,
                }"
              />
            </template>
            <template #filter="{ filterModel }">
              <Checkbox v-model="filterModel.value" :binary="true" />
              <label>{{
                filterModel.value
                  ? 'Show connected units only'
                  : 'Show disconnected only'
              }}</label>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script setup>

import { computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import TransferOwnershipDialog from './units/unit/TransferOwnershipDialog.vue';
import ChangeLocationDialog from './units/unit/ChangeLocationDialog.vue';

const { dispatch, getters } = useStore();
const { params } = useRoute();
const router = useRouter();
const isOtto = computed(() => window.location.host.split('.')[0]?.includes('otto'));

onMounted(() => {
  dispatch('getAllLocations');
  dispatch('findDeviceByLocation', { isOtto: isOtto.value, locationId: params.id });
  dispatch('findUnassignedLocations', { isOtto: isOtto.value });
});

const locations = computed(() => getters.locations);
const locationDevices = computed(() => getters.locationDevices);

const removeLocation = async ([data]) => {
  await dispatch('removeAssignLocation', { locationId: data.location_id, isOtto: isOtto.value });
  await dispatch('findDeviceByLocation', { isOtto: isOtto.value, locationId: params.id });
  await dispatch('getAllLocations');
  await dispatch('findUnassignedLocations', { isOtto: isOtto.value });
};

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

.transfer{
  display: flex;
  column-gap: 5px;
  margin-bottom: 10px;
}

</style>
