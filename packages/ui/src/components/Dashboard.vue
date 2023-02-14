<template>
  <div class="grid">
    <div class="col-12 lg:col-6 xl:col-3">
      <router-link
        :to="hasAlertPermission ? 'alerts' : 'javascript:void(0)'"
        :style="hasAlertPermission ? '': 'cursor: default;'"
      >
        <div class="card mb-0">
          <div class="flex justify-content-between mb-3">
            <div>
              <span class="block text-500 font-medium mb-3">Alerts</span>
              <div class="text-900 font-medium text-xl">
                {{ alert.issues }} issues
              </div>
            </div>
            <div
              class="flex align-items-center justify-content-center bg-pink-100 border-round"
              style="width: 2.5rem; height: 2.5rem"
            >
              <i class="pi pi-flag text-purple-500 text-xl" />
            </div>
          </div>
          <span class="text-500">in the last 12 hours</span>
        </div>
      </router-link>
    </div>
    <!-- <div class="col-12 lg:col-6 xl:col-3">
      <router-link to="devices">
        <div class="card mb-0">
          <div class="flex justify-content-between mb-3">
            <div>
              <span class="block text-500 font-medium mb-3">
                Devices Charging</span>
              <div class="text-900 font-medium text-xl">
                {{ deviceCharging.charging }}
              </div>
            </div>
            <div
              class="flex align-items-center justify-content-center bg-cyan-100 border-round"
              style="width: 2.5rem; height: 2.5rem"
            >
              <i class="pi pi-inbox text-cyan-500 text-xl" />
            </div>
          </div>
          <span class="text-green-500 font-medium"> {{ deviceCharging.deposited }} </span>
          <span class="text-500"> deposited in the last hour</span>
        </div>
      </router-link>
    </div> -->
    <div class="col-12 lg:col-6 xl:col-3">
      <router-link
        :to="hasReportPermission ? 'reports' : 'javascript:void(0)'"
        :style="hasReportPermission ? '': 'cursor: default;'"
      >
        <div class="card mb-0">
          <div class="flex justify-content-between mb-3">
            <div>
              <span class="block text-500 font-medium mb-3">
                Average Charging Time</span>
              <div class="text-900 font-medium text-xl">
                {{ avgChargeTime.time }} minutes
              </div>
            </div>
            <div
              class="flex align-items-center justify-content-center bg-orange-100 border-round"
              style="width: 2.5rem; height: 2.5rem"
            >
              <i class="pi pi-clock text-orange-500 text-xl" />
            </div>
          </div>
          <span class="text-green-500 font-medium"> {{ avgChargeTime.percentage }} </span>
          <span class="text-500"> since last week</span>
        </div>
      </router-link>
    </div>
    <div class="col-12 lg:col-6 xl:col-3">
      <router-link
        :to="hasUserPermission ? 'users' : 'javascript:void(0)'"
        :style="hasUserPermission ? '': 'cursor: default;'"
      >
        <div class="card mb-0">
          <div class="flex justify-content-between mb-3">
            <div>
              <span class="block text-500 font-medium mb-3">Active Users</span>
              <div class="text-900 font-medium text-xl">
                {{ aciveUsers.activeUsers }}
              </div>
            </div>
            <div
              class="flex align-items-center justify-content-center bg-blue-100 border-round"
              style="width: 2.5rem; height: 2.5rem"
            >
              <i class="pi pi-users text-blue-500 text-xl" />
            </div>
          </div>
          <span class="text-500">of {{ aciveUsers.enrolledUsers }} Enrolled Users</span>
        </div>
      </router-link>
    </div>
    <div class="col-12 lg:col-6 xl:col-3">
      <router-link
        :to="hasUnitPermission ? 'units' : 'javascript:void(0)'"
        :style="hasUnitPermission ? '': 'cursor: default;'"
      >
        <div class="card mb-0">
          <div class="flex justify-content-between mb-3">
            <div>
              <span class="block text-500 font-medium mb-3">Connectivity</span>
              <div class="text-900 font-medium text-xl">
                {{ connectivity.online }} online
              </div>
            </div>
            <div
              class="flex align-items-center justify-content-center bg-purple-100 border-round"
              style="width: 2.5rem; height: 2.5rem"
            >
              <i class="pi pi-wifi text-purple-500 text-xl" />
            </div>
          </div>
          <span class="text-500">of {{ connectivity.total }} total</span>
        </div>
      </router-link>
    </div>
    <!-- <div class="col-12 lg:col-6 xl:col-6">
      <div class="card">
        <router-link to="alerts">
          <div>
            <div class="flex justify-content-between mb-3">
              <div>
                <span class="block text-500 font-medium mb-3">Alerts</span>
                <div class="text-900 font-medium text-xl">
                  {{ alert.issues }} issues
                </div>
              </div>
              <div
                class="flex align-items-center justify-content-center bg-pink-100 border-round"
                style="width: 2.5rem; height: 2.5rem"
              >
                <i class="pi pi-flag text-purple-500 text-xl" />
              </div>
            </div>
            <span class="text-500">in the last 12 hours</span>
          </div>
        </router-link>
      </div>
      <div class="card">
        <router-link to="devices">
          <div>
            <div class="flex justify-content-between mb-3">
              <div>
                <span class="block text-500 font-medium mb-3">
                  Device Activity Today</span>
                <div class="text-900 font-medium text-xl">
                  {{ deviceReturned.returned }} devices checked out
                </div>
              </div>
              <div
                class="flex align-items-center justify-content-center bg-green-100 border-round"
                style="width: 2.5rem; height: 2.5rem"
              >
                <i class="pi pi-info text-yellow-700 text-xl" />
              </div>
            </div>
            <span class="text-blue-500 font-medium"> {{ deviceReturned.unaccounted }} </span>
            <span class="text-500"> devices returned</span>
          </div>
        </router-link>
      </div>
    </div> -->
    <div v-if="hasCanViewLocationsPerm" class="col-12 lg:col-12 xl:col-12">
      <div class="card">
        <h5 style="color: var(--text-color)">
          Device Locations
        </h5>
        <DataTable
          class="p-datatable-gridlines"
          data-key="id"
          responsive-layout="scroll"
          :value="locations"
          :row-hover="true"
          :rows="5"
          :rows-per-page-options="[5,10,20]"
          :paginator="locations ? (locations.length <= 5 ? false : true) : false"
          :loading="loading"
          :removable-sort="true"
          paginator-template="CurrentPageReport
          FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          current-page-report-template="Showing {first} to {last} of {totalRecords}"
        >
          <Column field="name" sortable header="Location" />
          <Column field="created_at" sortable header="Date">
            <template #body="{ data }">
              {{ formatDate(data.created_at) }}
            </template>
          </Column>
          <Column style="width: 5%" header="View">
            <template #body="{data}">
              <Button
                icon="pi pi-search"
                type="button"
                class="p-button-text"
                @click="gotoDeviceLocation(data.device_id)"
              />
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  data() {
    return {
      hasCanViewLocationsPerm: false,
      hasUserPermission: false,
      hasAlertPermission: false,
      hasReportPermission: false,
      hasUnitPermission: false,
    };
  },
  computed: {
    ...mapGetters(['deviceCharging', 'avgChargeTime', 'aciveUsers', 'connectivity', 'alert', 'deviceReturned', 'locationsData', 'locations']),
  },

  async mounted() {
    this.$store.dispatch('getDeviceCharging');
    this.$store.dispatch('getAvgChargeTime');
    this.$store.dispatch('getActiveUsers');
    this.$store.dispatch('getConnectivity');
    this.$store.dispatch('getAlerts');
    this.$store.dispatch('getDevicereturned');
    this.$store.dispatch('getLocations');
    this.$store.dispatch('getAllLocations');
    const { roleId } = this.$store.getters;
    if (roleId === null) {
      this.hasCanViewLocationsPerm = true;
      this.hasUserPermission = true;
      this.hasAlertPermission = true;
      this.hasReportPermission = true;
      this.hasUnitPermission = true;
    } else {
      await this.$store.dispatch('getPermission');
      await this.$store.dispatch('getPermissionByRoleId', { roleId });
      const getPermissionByRoleId = this.$store.getters.RoleByPermission;
      const permissions = this.$store.getters.Permission.map(x => ({ id: x.id, name: x.name }));

      this.hasCanViewLocationsPerm = permissions.some(x => getPermissionByRoleId.some(y => x.id === y.id && x.name.toLowerCase() === 'view location'));
      this.hasUserPermission = permissions.some(x => getPermissionByRoleId.some(y => x.id === y.id && x.name.toLowerCase() === 'view users'));
      this.hasAlertPermission = permissions.some(x => getPermissionByRoleId.some(y => x.id === y.id && x.name.toLowerCase() === 'view alerts'));
      this.hasReportPermission = permissions.some(x => getPermissionByRoleId.some(y => x.id === y.id && x.name.toLowerCase() === 'view reports'));
      this.hasUnitPermission = permissions.some(x => getPermissionByRoleId.some(y => x.id === y.id && x.name.toLowerCase() === 'view units'));
    }
  },
  methods: {
    formatCurrency(value) {
      return value.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      });
    },
    gotoDeviceLocation(deviceId) {
      if (deviceId) {
        this.$router.push(`/units/${deviceId}`);
      } else {
        this.$toast.add({ severity: 'warn', summary: 'Warning', detail: 'No device is assigned to this location', life: 3000 });
      }
    },
    formatDate(value) {
      return new Date(value).toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    },
  },
};
</script>
