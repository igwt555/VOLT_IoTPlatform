<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <h5>Inspection Reports</h5>
        <DataTable
          ref="tableRef"
          v-model:filters="filters"
          class="p-datatable-gridlines"
          data-key="id"
          responsive-layout="scroll"
          filter-display="menu"
          :filters="filters"
          :value="inspectionReports"
          :row-hover="true"
          :rows="10"
          :rows-per-page-options="[10, 25, 50]"
          :paginator="inspectionReports ? (inspectionReports.length <= 10 ? false : true) : false"
          :loading="loading"
          :global-filter-fields="['id', 'date', 'status']"
          :removable-sort="true"
          paginator-template="CurrentPageReport
          FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          current-page-report-template="Showing {first} to {last} of {totalRecords}"
          @row-click="goToUserDetailPage"
        >
          <template #empty>
            No inspection reports found
          </template>
          <template #loading>
            Loading user data. Please wait.
          </template>
          <Column
            sortable
            field="date_time"
            header="Date/Time"
            style="min-width: 10rem"
            class="e2e-col-user"
          >
            <template #body="{ data }">
              {{ formatDate(data.created_at) }}
            </template>
          </Column>
          <Column
            sortable
            field="user"
            header="User"
            class="e2e-col-email"
            style="min-width: 12rem"
          >
            <template #body="{ data }">
              {{ data.User?.full_name }}
            </template>
          </Column>
          <Column
            sortable
            field="status"
            header="Status"
            class="e2e-col-email"
            style="min-width: 12rem"
          >
            <template #body="{ data }">
              {{ data?.report?.ladderIsOk === true ? 'Ladder OK' :
                data?.report?.ladderIsOk === false ? 'Ladder Decommissioned' :
                'Unknown' }}
            </template>
          </Column>
          <Column
            sortable
            field="ladder"
            header="Ladder"
            class="e2e-col-email"
            style="min-width: 12rem"
          >
            <template #body="{ data }">
              {{ data?.Device?.serial_num }}
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script setup>

import axios from 'axios';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const inspectionReports = ref([]);
const { push } = useRouter();

const goToUserDetailPage = ({ data }) => {
  push(`/get-report/${data?.id}`);
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

onMounted(async () => {
  const result = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/api/otto/inspection-reports`);
  inspectionReports.value = result?.data?.reports;
});

</script>

<style scope>
table td {
  cursor: pointer;
}

</style>
