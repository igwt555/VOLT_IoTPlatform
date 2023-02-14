<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <div class="surface-section">
          <div class="font-medium text-3xl text-900 mb-3">Inspection Report</div>
          <ul class="list-none p-0 m-0">
            <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
              <div class="text-500 w-6 md:w-2 font-medium">Device ID</div>
              <div class="text-900 w-full md:w-8 md:flex-order-0 flex-order-1">
                {{ singleReport?.Device?.serial_num || singleReport?.Device?.id || 'Unknown' }}
              </div>
            </li>
            <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
              <div class="text-500 w-6 md:w-2 font-medium">Created at</div>
              <div class="text-900 w-full md:w-8 md:flex-order-0 flex-order-1">
                {{ formatDate(singleReport?.created_at) }}
              </div>
            </li>
            <li
              v-for="(value, name, index) in singleReport?.report" :key="index"
              class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
              <div class="text-500 w-6 md:w-2 font-medium">
                {{ name === 'ladderok' ? 'Ladder' : convertToCamelCase(name) }}
              </div>
              <div class="text-900 w-full md:w-8 md:flex-order-0 flex-order-1">
                {{ name === 'ladderok' ? value? 'Ladder Decommissioned' : 'Ladder OK' : value ? 'Damaged' : 'Ok' }}
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>

import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import http from '../../plugins/axios.mjs';

const route = useRoute();
const singleReport = ref(null);

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
  const response = await http.get(`/otto/inspection-report/${route.params.id}`);
  singleReport.value = response?.data?.report;
});

const convertToCamelCase = str => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

</script>
