<template>
  <div class="grid">
    <div class="col-12">
      <div class="card text-center text-xl font-semibold">
        Worker Performance Report
      </div>
      <div class="flex card">
        <div
          v-if="employee"
          class="col-6"
        >
          <div class="flex">
            <p class="font-bold col-6">
              Employee:
            </p>
            <p class="col-6">
              {{ employee?.full_name }}
            </p>
          </div>
          <div class="flex justify-content-between">
            <p class="font-bold col-6">
              Company identifier:
            </p>
            <p class="col-6">
              347985
            </p>
          </div>
          <div class="flex justify-content-between">
            <p class="font-bold col-6">
              Otto identifier:
            </p>
            <p class="col-6">
              {{ employee?.ottoId }}
            </p>
          </div>
          <div class="flex justify-content-between">
            <p class="font-bold col-6">
              Trade:
            </p>
            <p class="col-6">
              Construction
            </p>
          </div>
        </div>
        <div
          v-if="employee"
          class="col-6"
        >
          <div>
            <div class="font-bold col-6">
              Certifications:
            </div>
            <ul class="pl-3 pt-0 m-0">
              <li class="p-1 ml-5 sm:ml-3 ">
                OSHA
              </li>
              <li class="p-1 ml-5 sm:ml-3 ">
                NCEES
              </li>
              <li class="p-1 ml-5 sm:ml-3 ">
                ACI
              </li>
              <li class="p-1 ml-5 sm:ml-3 ">
                LEED
              </li>
              <li class="p-1 ml-5 sm:ml-3 ">
                Aerial Lift Training
              </li>
              <li class="p-1 ml-5 sm:ml-3 ">
                Crane Operation Certification
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="flex">
        <div class="col-6 pl-0">
          <div class="card text-center text-2xl font-semibold">
            Key Trends
          </div>
          <div class="card">
            <div class="flex justify-content-between">
              <div>
                <span class="block text-500 font-medium pt-2">Share of hours worked safely</span>
              </div>
              <div
                class="flex align-items-center justify-content-center bg-gray-200"
                style="width: 2.5rem; height: 2.5rem"
              >
                <i class="pi pi-chart-line text-blue-500 text-xl" />
              </div>
            </div>
            <div class="text-900 font-medium text-xl mt-3">
              <Line
                :chart-options="hoursOfWorked.chartOptions"
                :chart-data="hoursOfWorked.chartData"
                :chart-id="hoursOfWorked.props.chartId"
                :plugins="hoursOfWorked.props.plugins"
                :css-classes="hoursOfWorked.props.cssClasses"
                :styles="hoursOfWorked.props.styles"
                :width="hoursOfWorked.props.width"
                :height="hoursOfWorked.props.height"
              />
            </div>
          </div>
          <div class="card">
            <div class="flex justify-content-between">
              <div>
                <span class="block text-500 font-medium pt-2">Current Shift Performance</span>
              </div>
              <div
                class="flex align-items-center justify-content-center bg-gray-200"
                style="width: 2.5rem; height: 2.5rem"
              >
                <i class="pi pi-chart-bar text-blue-500 text-xl" />
              </div>
            </div>
            <div class="text-900 font-medium text-xl mt-3">
              <Bar
                :chart-options="currentShift.chartOptions"
                :chart-data="currentShift.chartData"
                :chart-id="currentShift.props.chartId"
                :plugins="currentShift.props.plugins"
                :css-classes="currentShift.props.cssClasses"
                :styles="currentShift.props.styles"
                :width="currentShift.props.width"
                :height="currentShift.props.height"
              />
            </div>
          </div>
        </div>

        <div class="col-6 pr-0">
          <div class="card text-center text-2xl font-semibold">
            Key Problem Areas
          </div>
          <div class="card">
            <div class="flex justify-content-between">
              <div>
                <span class="block text-500 font-medium pt-2">Warnings</span>
              </div>
              <div
                class="flex align-items-center justify-content-center bg-gray-200"
                style="width: 2.5rem; height: 2.5rem"
              >
                <i class="pi pi-chart-pie text-blue-500 text-xl" />
              </div>
            </div>
            <div class="text-900 font-medium text-xl mt-3">
              <Pie
                :chart-options="areasWarnings.chartOptions"
                :chart-data="areasWarnings.chartData"
                :chart-id="common.props.chartIdPie"
                :plugins="common.props.pluginsPie"
                :css-classes="common.props.cssClasses"
                :styles="common.props.styles"
                :width="common.props.width"
                :height="common.props.height"
              />
            </div>
          </div>
          <div class="card">
            <div class="flex justify-content-between">
              <div>
                <span class="block text-500 font-medium pt-2">Alarms</span>
              </div>
              <div
                class="flex align-items-center justify-content-center bg-gray-200"
                style="width: 2.5rem; height: 2.5rem"
              >
                <i class="pi pi-chart-pie text-blue-500 text-xl" />
              </div>
            </div>
            <div class="text-900 font-medium text-xl mt-3">
              <Pie
                :chart-options="areasAlarms.chartOptions"
                :chart-data="areasAlarms.chartData"
                :chart-id="common.props.chartIdPie"
                :plugins="common.props.pluginsPie"
                :css-classes="common.props.cssClasses"
                :styles="common.props.styles"
                :width="common.props.width"
                :height="common.props.height"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import annotationPlugin from 'chartjs-plugin-annotation';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Filler } from 'chart.js';
import http from '../../plugins/axios.mjs';

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
      profileUserId: this.$route.params.id,
      ottoDetail: null,
      currentShift: {
        props: {
          chartId: {
            type: 'String',
            default: 'bar-chart',
          },
          cssClasses: {
            default: '',
            type: 'String',
          },
          styles: {
            type: 'Object as PropType<Partial<CSSStyleDeclaration>>',
            default: {},
          },
          plugins: {
            type: "Array as PropType<Plugin<'bar'>[]>",
            default: [],
          },
        },
        chartData: {},
        chartOptions: {
          responsive: true,
          barThickness: 10,
          plugins: {
            legend: {
              position: 'bottom',
            },
          },
          scales: {
            y: {
              title: {
                display: true,
                text: '#',
                font: {
                  size: 18,
                  weight: 'bold',
                },
              },
              beginAtZero: true,
              ticks: {
                stepSize: 0.5,
                font: {
                  size: 15,
                },
              },
              suggestedMax: 4.5,
              stacked: true,
            },
            x: {
              stacked: true,
              categoryPercentage: 0.5,
              barPercentage: 1,
              ticks: {
                font: {
                  size: 15,
                },
              },
            },
          },
        },
      },
      hoursOfWorked: {
        props: {
          chartId: {
            type: 'String',
            default: 'line-chart',
          },
          cssClasses: {
            default: '',
            type: 'String',
          },
          styles: {
            type: 'Object as PropType<Partial<CSSStyleDeclaration>>',
            default: {},
          },
          plugins: {
            type: "Array as PropType<Plugin<'line'>[]>",
            default: [],
          },
        },
        chartData: {},
        chartOptions: {
          responsive: true,
          lineTension: 0.1,
          borderWidth: 2,
          elements: {
            point: {
              radius: 0.5,
            },
          },
          plugins: {
            autocolors: false,
            legend: {
              display: false,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 20,
                font: {
                  size: 15,
                },
              },
            },
            x: {
              ticks: {
                font: {
                  size: 15,
                },
              },
            },
          },
        },
      },
      areasWarnings: {
        chartData: {},
        chartOptions: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom',
            },
          },
        },
      },
      areasAlarms: {
        chartData: {},
        showDatapoints: true,
        chartOptions: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom',
            },
          },
        },
      },
      common: {
        props: {
          chartIdPie: {
            type: 'String',
            default: 'pie',
          },
          width: {
            type: 'Number',
            default: 400,
          },
          height: {
            type: 'Number',
            default: 400,
          },
          styles: {
            type: 'Object as PropType<Partial<CSSStyleDeclaration>>',
            default: {},
          },
          cssClasses: {
            default: '',
            type: 'String',
          },
          pluginsPie: {
            type: "Array as PropType<Plugin<'pie'>[]>",
            default: [],
          },
        },
      },
    };
  },
  async mounted() {
    await this.$store.dispatch('getDashboard2Data');
    const { data: getUserProfileResp } = await http.get(`users/${this.profileUserId}/profile`);
    const { dashboard2Data } = this.$store.getters;

    this.employee = getUserProfileResp.user;
    this.currentShift.chartData = getUserProfileResp.currentShiftChartData;
    this.hoursOfWorked.chartData = getUserProfileResp.hoursOfWorkedChartData;
    this.areasWarnings.chartData = getUserProfileResp.areasAlertsChartData;
    this.areasAlarms.chartData = getUserProfileResp.areasAlarmsChartData;

    // if Donnie, show real data (dashboard 2), otherwise show demo data (dashboard 4)
    if (this.profileUserId === '7157fb8a-b906-4e53-9706-9a546deb6011') {
      this.areasWarnings.chartData = dashboard2Data.alertsChartData;
      this.areasAlarms.chartData = dashboard2Data.alarmsChartData;
    }
  },
  methods: {
  },
};
</script>

<style scoped>
.chart_border{
  border: 1px solid #4473C5;
  padding: 28px;
  margin-bottom: 18px;
}
.pie-chart-main{
  flex-wrap: wrap;
}
.pie-chart-flex > div{
  height: 300px;
}
</style>
