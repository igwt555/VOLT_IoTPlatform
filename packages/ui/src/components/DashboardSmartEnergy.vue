<template>
  <div class="grid">
    <div class="col-12 lg:col-4 xl:col-4">
      <div class="card card_dashboard">
        <h5 style="color: var(--text-color)">
          Voltage Chart
        </h5>
        <Line
          :chart-options="voltage.chartOptions"
          :chart-data="voltage.chartData"
          :chart-id="voltage.props.chartId"
          :plugins="voltage.props.plugins"
          :css-classes="voltage.props.cssClasses"
          :styles="voltage.props.styles"
          :width="voltage.props.width"
          :height="voltage.props.height"
        />
      </div>
    </div>
    <div class="col-12 lg:col-4 xl:col-4">
      <div class="card card_dashboard">
        <h5 style="color: var(--text-color)">
          Energy Consumption
        </h5>
        <Bar
          :chart-options="energyBarChart.chartOptions"
          :chart-data="energyBarChart.chartData"
          :chart-id="energyBarChart.props.chartId"
          :plugins="energyBarChart.props.plugins"
          :css-classes="energyBarChart.props.cssClasses"
          :styles="energyBarChart.props.styles"
          :width="energyBarChart.props.width"
          :height="energyBarChart.props.height"
        />
      </div>
    </div>
    <div class="col-12 lg:col-4 xl:col-4">
      <div class="card card_dashboard">
        <h5 style="color: var(--text-color)">
          Energy Meters
        </h5>
        <DataTable
          :value="energyMeters.data"
          data-key="id"
          :rows="2"
          :paginator="true"
          responsive-layout="scroll"
        >
          <template #empty>
            No energy meters found.
          </template>
          <template #loading>
            Loading energy meters data. Please wait.
          </template>
          <Column
            sortable
            field="name"
            header="Name"
          />
          <Column
            sortable
            field="label"
            header="Label"
          />
          <Column
            sortable
            field="voltage"
            header="Voltage,V"
          />
          <Column
            sortable
            field="amperage"
            header="Amperage,V"
          />
          <Column
            sortable
            field="power"
            header="Power,W"
          />
        </DataTable>
      </div>
    </div>
    <div class="col-12 lg:col-3 xl:col-3">
      <div class="card card_dashboard doughnut_chart">
        <h5 style="color: var(--text-color)">
          Energy Consumption
        </h5>
        <Doughnut
          :chart-options="energyConsumption.chartOptions"
          :chart-data="energyConsumption.chartData"
          :chart-id="energyConsumption.props.chartId"
          :plugins="energyConsumption.props.plugins"
          :css-classes="energyConsumption.props.cssClasses"
          :styles="energyConsumption.props.styles"
          :width="energyConsumption.props.width"
          :height="energyConsumption.props.height"
        />
      </div>
    </div>
    <div class="col-12 lg:col-5 xl:col-5">
      <div class="card card_dashboard">
        <h5 style="color: var(--text-color)">
          Amperage
        </h5>
        <Line
          :chart-options="amperage.chartOptions"
          :chart-data="amperage.chartData"
          :chart-id="amperage.props.chartId"
          :plugins="amperage.props.plugins"
          :css-classes="amperage.props.cssClasses"
          :styles="amperage.props.styles"
          :width="amperage.props.width"
          :height="amperage.props.height"
        />
      </div>
    </div>
    <div class="col-12 lg:col-4 xl:col-4">
      <div class="card card_dashboard">
        <h5 style="color: var(--text-color)">
          Alarms
        </h5>
        <DataTable
          v-model:selection="selectedAlarms"
          :value="alarms.data"
          data-key="id"
          :rows="2"
          :paginator="true"
          responsive-layout="scroll"
        >
          <template #empty>
            No alarms found.
          </template>
          <template #loading>
            Loading alarms data. Please wait.
          </template>
          <Column
            selection-mode="multiple"
            header-style="width: 3rem"
          />
          <Column
            field="start_time"
            header="Start time"
            :sortable="true"
          >
            <template #body="{ data }">
              {{ formatDateTime(data.start_time) }}
            </template>
          </Column>
          <Column
            field="originator"
            header="Originator"
          />
          <Column
            field="type"
            header="Type"
          />
          <Column
            field="severity"
            header="Severity"
          />
          <Column
            field="status"
            header="Status"
          />
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script>
// import { mapGetters } from 'vuex'
import annotationPlugin from 'chartjs-plugin-annotation';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Filler } from 'chart.js';
import ChartJson from '../../public/data/charts/chart-data.json';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Filler,
  annotationPlugin,
);

export default {
  data() {
    return {
      permissions: false,
      voltage: null,
      energyConsumption: null,
      energyBarChart: null,
      energyMeters: null,
      amperage: null,
      alarms: null,
      selectedAlarms: null,
    };
  },
  async created() {
    this.energyConsumption = ChartJson.energyConsumption;
    this.voltage = ChartJson.voltage;
    this.energyBarChart = ChartJson.energyConsumptionBarChart;
    this.energyMeters = ChartJson.energyMeters;
    this.amperage = ChartJson.amperage;
    this.alarms = ChartJson.alarms;
  },
  methods: {
    formatDateTime(value) {
      return new Date(value).toLocaleString();
    },
  },
};
</script>

<style>
.card_dashboard{
  height: 100%;
}
.card.card_dashboard.doughnut_chart canvas {
  height: 300px !important;
}
</style>
