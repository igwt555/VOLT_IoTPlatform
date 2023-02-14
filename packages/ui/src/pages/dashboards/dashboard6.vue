<template>
  <div class="grid">
    <div class="col-12 ">
      <div class="flex card card_wrap">
        <div class="col-12 lg:col-6 xl:col-6 padding_x">
          <h5 class="font-bold text-center">
            My Subcontractors
          </h5>
          <div>
            <DataTable
              v-model:filters="filters"
              class="p-datatable-gridlines"
              data-key="id"
              responsive-layout="scroll"
              filter-display="menu"
              :filters="filters"
              :value="subcontractorsData"
              :row-hover="true"
              :rows="10"
              :rows-per-page-options="[10, 25, 50]"
              :paginator="subcontractorsData ? (subcontractorsData.length <= 10 ? false : true) : false"
              :loading="loading"
              :global-filter-fields="['id', 'date', 'status']"
              :removable-sort="true"
              paginator-template="CurrentPageReport
              FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
              current-page-report-template="Showing {first} to {last} of {totalRecords}"
              @row-click="goToDashboard8"
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
                No subcontractors found.
              </template>
              <template #loading>
                Loading subcontractors data. Please wait.
              </template>
              <Column
                sortable
                field="name"
                header="Name"
              >
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
                sortable
                field="ladders"
                header="# of Ladders"
              >
                <template #body="{ data }">
                  {{ data.ladders }}
                </template>
                <template #filter="{ filterModel }">
                  <InputText
                    v-model="filterModel.value"
                    type="text"
                    class="p-column-filter"
                    placeholder="Search by ladders"
                  />
                </template>
              </Column>
              <Column
                sortable
                field="safe_hours"
                header="% Safe Hours"
              >
                <template #body="{ data }">
                  {{ data.safe_hours }}
                </template>
                <template #filter="{ filterModel }">
                  <InputText
                    v-model="filterModel.value"
                    type="text"
                    class="p-column-filter"
                    placeholder="Search by safe hours"
                  />
                </template>
              </Column>
              <Column
                sortable
                field="safety_ranking"
                header="Safety Ranking"
              >
                <template #body="{ data }">
                  {{ data.safety_ranking }}
                </template>
                <template #filter="{ filterModel }">
                  <InputText
                    v-model="filterModel.value"
                    type="text"
                    class="p-column-filter"
                    placeholder="Search by safety ranking"
                  />
                </template>
              </Column>
            </DataTable>
          </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-6 padding_x">
          <h5 class="font-bold text-center">
            My Sites
          </h5>
          <div>
            <DataTable
              v-model:filters="filters2"
              class="p-datatable-gridlines"
              data-key="id"
              responsive-layout="scroll"
              filter-display="menu"
              :filters="filters"
              :value="sitesData"
              :row-hover="true"
              :rows="10"
              :rows-per-page-options="[10, 25, 50]"
              :paginator="sitesData ? (sitesData.length <= 10 ? false : true) : false"
              :loading="loading"
              :global-filter-fields="['id', 'date', 'status']"
              :removable-sort="true"
              paginator-template="CurrentPageReport
              FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
              current-page-report-template="Showing {first} to {last} of {totalRecords}"
              @row-click="goToDashboard9"
            >
              <template #header>
                <div class="flex justify-content-between flex-column sm:flex-row">
                  <div>
                    <Button
                      type="button"
                      icon="pi pi-filter-slash"
                      label="Clear"
                      class="p-button-outlined mb-2 mr-3"
                      @click="clearFilter2()"
                    />
                  </div>
                </div>
              </template>
              <template #empty>
                No sites found.
              </template>
              <template #loading>
                Loading sites data. Please wait.
              </template>
              <Column
                sortable
                field="name"
                header="Name"
              >
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
                sortable
                field="ladders"
                header="# of Ladders"
              >
                <template #body="{ data }">
                  {{ data.ladders }}
                </template>
                <template #filter="{ filterModel }">
                  <InputText
                    v-model="filterModel.value"
                    type="text"
                    class="p-column-filter"
                    placeholder="Search by ladders"
                  />
                </template>
              </Column>
              <Column
                sortable
                field="safe_hours"
                header="% Safe Hours"
              >
                <template #body="{ data }">
                  {{ data.safe_hours }}
                </template>
                <template #filter="{ filterModel }">
                  <InputText
                    v-model="filterModel.value"
                    type="text"
                    class="p-column-filter"
                    placeholder="Search by safe hours"
                  />
                </template>
              </Column>
              <Column
                sortable
                field="efficiency"
                header="Efficiency"
              >
                <template #body="{ data }">
                  {{ data.efficiency }}
                </template>
                <template #filter="{ filterModel }">
                  <InputText
                    v-model="filterModel.value"
                    type="text"
                    class="p-column-filter"
                    placeholder="Search by efficiency"
                  />
                </template>
              </Column>
            </DataTable>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { FilterMatchMode, FilterOperator } from 'primevue/api';

export default {
  data() {
    return {
      subcontractorsData: null,
      sitesData: null,
      filters: null,
      filters2: null,
      loading: true,
    };
  },
  async mounted() {
    await this.$store.dispatch('getDashboard6Data');
    await this.$store.dispatch('getSiteData');
    const { dashboard6Data } = this.$store.getters;
    this.subcontractorsData = dashboard6Data.subcontractors;
    this.sitesData = this.$store.getters.siteData;
    this.initFilters();
    this.initFilters2();
    this.loading = false;
  },
  methods: {
    initFilters() {
      this.filters = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        name: {
          operator: FilterOperator.AND,
          constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
        },
        ladders: {
          operator: FilterOperator.AND,
          constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
        },
        safe_hours: {
          operator: FilterOperator.AND,
          constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
        },
        safety_ranking: {
          operator: FilterOperator.OR,
          constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
        },
      };
    },
    clearFilter() {
      this.initFilters();
    },
    initFilters2() {
      this.filters2 = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        name: {
          operator: FilterOperator.AND,
          constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
        },
        ladders: {
          operator: FilterOperator.AND,
          constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
        },
        safe_hours: {
          operator: FilterOperator.AND,
          constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
        },
        efficiency: {
          operator: FilterOperator.OR,
          constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
        },
      };
    },
    clearFilter2() {
      this.initFilters2();
    },
    goToDashboard8() {
      this.$router.push('/dashboard/dashboard8');
    },
    goToDashboard9() {
      this.$router.push('/dashboard/dashboard9');
    },
  },
};
</script>

<style scoped>
.card_wrap{
  flex-wrap: wrap;
}
.chart_border{
  border: 1px solid #4473c5;
  padding: 28px;
  margin-bottom: 18px;
}
</style>
