<template>
  <div class="grid">
    <div class="col-12">
      <div class="card text-center text-3xl font-semibold">
        Subcontractor Dashboard
      </div>
      <div style="height: 100vh; overflow: auto;">
        <div class="flex flex-row flex-wrap" style="column-gap: 10px;">
          <div
            v-if="safetyColData" class="card sm:col-4 md:col-5 lg-col-4 xl:col-3 flex-grow-1 flex flex-column"
            style="row-gap: 10px;"
          >
            <h5 class="mb-0">Safety Stats</h5>
            <div class="flex justify-content-between align-items-center">
              <span class="font-bold">Days without Ladder Incident:</span>
              <span class="font-bold">{{ safetyColData.ladder_falls }}</span>
            </div>
            <div class="flex justify-content-between align-items-center">
              <span class="font-bold">Unauthorized use this week:</span>
              <span class="font-bold">{{ safetyColData.unauthorized_use }}</span>
            </div>
          </div>
          <div
            v-if="safetyColData"
            class="card sm:col-5 md:col-5 lg-col-4 xl:col-3 flex flex-column flex-grow-1" style="row-gap: 10px;">
            <h5 class="mb-0">
              Safety ranking in market
            </h5>
            <ul class="m-0 px-0 flex flex-column" style="row-gap: 10px;">
              <li
                v-for="(item, index) in safetyColData.safety_ranking"
                :key="index"
                class="flex justify-content-between"
              >
                <span class="font-bold">{{ item.market }}:</span>
                <span class="font-bold">{{ item.value }}</span>
              </li>
            </ul>
          </div>
          <div v-if="safetyColData" class="card sm:col-4 md:col-5 lg-col-4 xl:col-3 flex-grow-1">
            <h5>
              Safe ladder operating hours
            </h5>
            <Dropdown
              v-model="selectedSafeLadderOpRange"
              :options="safetyColData.safe_ladder_hours"
              option-label="timeRange"
              option-value="timeRange"
              :placeholder="selectedSafeLadderOpRange? selectedSafeLadderOpRange: 'Today'"
              class="w-100 mb-2"
              placehol
            />
            <span class="font-bold">Market Average: {{ timeSlotValue }}</span>
          </div>
          <div class="card sm:col-5 md:col-5 lg-col-4 xl:col-3 flex flex-grow-1 flex-column" style="row-gap: 10px">
            <h5>
              Ladders by site
            </h5>
            <div class="flex justify-content-between">
              <span class="font-bold">Total</span>
              <a class="font-bold cursor-pointer" @click="scrollToElement('globalPerf')">
                {{ siteDataCalculated }}
              </a>
            </div>
            <div
              v-for="(data, index) in siteData"
              :key="index"
              class="justify-content-between flex"
            >
              <span>{{ data.name }}</span>
              <a class="font-bold cursor-pointer" @click="scrollToElement('sitePerf')">
                {{ data.ladders }}
              </a>
            </div>
          </div>

          <div class="card flex flex-column sm:col-4 md:col-5 lg-col-4 xl:col-3 flex-grow-1">
            <h5>
              Otto Ladder Status
            </h5>
            <div class="flex">
              <span class="font-bold">Ladders Registered:</span>
              <p
                style="margin-left: 10px;
                text-align: center;
                min-height: 15px;
                width: 25px;
                border-radius: 50%;
                background-color: greenyellow;
                color: white;"
              >
                {{ finalStates }}
              </p>
            </div>
            <div class="mt-3">
              <Bar
                :chart-options="ottoLaddersChart.chartOptions"
                :chart-data="ottoLaddersChart.chartData"
                :chart-id="commonChart.props.chartIdBar"
                :plugins="commonChart.props.pluginsBar"
                :css-classes="commonChart.props.cssClasses"
                :styles="commonChart.props.styles"
                :width="commonChart.props.width"
                :height="commonChart.props.height"
              />
            </div>
          </div>
          <div class="card sm:col-4 md:col-5 lg-col-4 xl:col-3 flex-grow-1">
            <router-link :to="'/users'">
              <div class="flex justify-content-between mb-3">
                <div>
                  <span class="block text-500 font-medium mb-3">Workers</span>
                  <div class="text-900 font-medium text-xl">
                    {{ badgedInCount }} badged in
                  </div>
                </div>
                <div
                  class="flex align-items-center justify-content-center bg-purple-100 border-round"
                  style="width: 2.5rem; height: 2.5rem"
                >
                  <i class="pi pi-users text-purple-500 text-xl" />
                </div>
              </div>
              <span v-if="workersData?.length" class="text-500">of {{ workersData?.length }} total workers</span>
            </router-link>
          </div>
        </div>
      </div>
      <div ref="globalPerf" class="card text-center text-3xl font-semibold mt-4">
        All Sites
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
                :chart-id="commonChart.props.chartIdLine"
                :plugins="commonChart.props.pluginsLine"
                :css-classes="commonChart.props.cssClasses"
                :styles="commonChart.props.styles"
                :width="commonChart.props.width"
                :height="commonChart.props.height"
              />
            </div>
          </div>
          <div class="card">
            <div class="flex justify-content-between">
              <div>
                <span class="block text-500 font-medium pt-2">Hours of ladders in active use</span>
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
                :chart-options="hoursOfLadders.chartOptions"
                :chart-data="hoursOfLadders.chartData"
                :chart-id="commonChart.props.chartIdPlanet"
                :plugins="commonChart.props.pluginsLine"
                :css-classes="commonChart.props.cssClasses"
                :styles="commonChart.props.styles"
                :width="commonChart.props.width"
                :height="commonChart.props.height"
              />
            </div>
          </div>
          <div class="card">
            <div class="flex justify-content-between">
              <div>
                <span class="block text-500 font-medium pt-2">Share of Ladders Signed In</span>
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
                :chart-options="shareOfLadders.chartOptions"
                :chart-data="shareOfLadders.chartData"
                :chart-id="commonChart.props.chartIdPlanet"
                :plugins="commonChart.props.pluginsPie"
                :css-classes="commonChart.props.cssClasses"
                :styles="commonChart.props.styles"
                :width="commonChart.props.width"
                :height="commonChart.props.height"
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
                :chart-options="alerts.chartOptions"
                :chart-data="alerts.chartData"
                :chart-id="commonChart.props.chartIdPie"
                :plugins="commonChart.props.pluginsPie"
                :css-classes="commonChart.props.cssClasses"
                :styles="commonChart.props.styles"
                :width="commonChart.props.width"
                :height="commonChart.props.height"
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
                :chart-options="alarms.chartOptions"
                :chart-data="alarms.chartData"
                :chart-id="commonChart.props.chartIdPie"
                :plugins="commonChart.props.pluginsPie"
                :css-classes="commonChart.props.cssClasses"
                :styles="commonChart.props.styles"
                :width="commonChart.props.width"
                :height="commonChart.props.height"
              />
            </div>
          </div>
        </div>
      </div>
      <div ref="sitePerf" class="card text-center text-xl font-semibold mt-4">
        Work Shift Trends
      </div>
      <div
        class="flex"
        style="margin-bottom: 50rem;"
      >
        <div class="col-6 pl-0">
          <div class="card">
            <div class="flex justify-content-between">
              <div>
                <span class="block text-500 font-medium pt-2">Warnings</span>
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
                :chart-options="alertsBar.chartOptions"
                :chart-data="alertsBar.chartData"
                :chart-id="commonChart.props.chartIdBar"
                :plugins="commonChart.props.pluginsBar"
                :css-classes="commonChart.props.cssClasses"
                :styles="commonChart.props.styles"
                :width="commonChart.props.width"
                :height="commonChart.props.height"
              />
            </div>
          </div>
        </div>
        <div class="col-6 pr-0">
          <div class="card">
            <div class="flex justify-content-between">
              <div>
                <span class="block text-500 font-medium pt-2">Alarms</span>
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
                :chart-options="alarmsBar.chartOptions"
                :chart-data="alarmsBar.chartData"
                :chart-id="commonChart.props.chartIdBar"
                :plugins="commonChart.props.pluginsBar"
                :css-classes="commonChart.props.cssClasses"
                :styles="commonChart.props.styles"
                :width="commonChart.props.width"
                :height="commonChart.props.height"
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
import 'chart.piecelabel.js';

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

Tooltip.positioners.custom = function (elements, eventPosition) {
  return eventPosition;
};
export default {
  data() {
    return {
      selectedSafeLadderOpRange: '',
      safetyColData: null,
      workersData: null,
      siteData: null,
      ottoLaddersChart: {
        chartData: {},
        chartOptions: {
          responsive: true,
          plugins: {
            tooltip: {
              position: 'custom',
              // callbacks: {
              //   label(tooltipItem, data) {
              //     const label = `${Math.floor(tooltipItem.yLabel * 100) / 100} ${data.datasets[tooltipItem.datasetIndex].label}`;
              //     return label;
              //   },
              // },
            },
            legend: {
              position: 'right',
            },
            datalabels: {
              display: true,
              align: 'center',
              anchor: 'center',
            },
          },
          barThickness: 60,
          scales: {
            y: {
              stacked: true,
              display: false,
              beginAtZero: true,
            },
            x: {
              ticks: {
                display: false,
              },
              gridLines: {
                display: false,
              },
              stacked: true,
              categoryPercentage: 0.5,
              barPercentage: 1,
            },
          },
        },
      },
      hoursOfWorked: {
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
      hoursOfLadders: {
        chartData: {},
        chartOptions: {
          responsive: true,
          lineTension: 0.1,
          borderWidth: 1,
          elements: {
            point: {
              radius: 0.5,
            },
          },
          plugins: {
            legend: {
              display: false,
            },
          },
          fill: true,
          scales: {
            y: {
              beginAtZero: true,
              suggestedMax: 50,
              ticks: {
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
      alerts: {
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
      alarms: {
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
      shareOfLadders: {
        chartData: {},
        chartOptions: {
          responsive: true,
          lineTension: 0.1,
          borderWidth: 1,
          elements: {
            point: {
              radius: 0.5,
            },
          },
          plugins: {
            legend: {
              display: false,
            },
          },
          fill: true,
          scales: {
            y: {
              beginAtZero: true,
              suggestedMax: 50,
              ticks: {
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
      alertsBar: {
        chartData: {},
        chartOptions: {
          responsive: true,
          barThickness: 30,
          scales: {
            y: {
              title: {
                display: true,
                text: 'Avg. #',
                font: {
                  size: 18,
                  weight: 'bold',
                },
              },
              beginAtZero: true,
              suggestedMax: 7,
              ticks: {
                font: {
                  size: 15,
                },
              },
            },
            x: {
              title: {
                display: true,
                text: 'Hour of shift',
                font: {
                  size: 18,
                  weight: 'bold',
                },
              },
              ticks: {
                font: {
                  size: 15,
                },
              },
            },
          },
        },
      },
      alarmsBar: {
        chartData: {},
        chartOptions: {
          responsive: true,
          barThickness: 30,
          scales: {
            y: {
              title: {
                display: true,
                text: 'Avg. #',
                font: {
                  size: 18,
                  weight: 'bold',
                },
              },
              beginAtZero: true,
              suggestedMax: 7,
              ticks: {
                font: {
                  size: 15,
                },
              },
            },
            x: {
              title: {
                display: true,
                text: 'Hour of shift',
                font: {
                  size: 18,
                  weight: 'bold',
                },
              },
              ticks: {
                font: {
                  size: 15,
                },
              },
            },
          },
        },
      },
      commonChart: {
        props: {
          chartIdLine: {
            type: 'String',
            default: 'line-chart',
          },
          chartIdPlanet: {
            type: 'String',
            default: 'planet-chart',
          },
          chartIdPie: {
            type: 'String',
            default: 'pie',
          },
          chartIdBar: {
            type: 'String',
            default: 'bar-chart',
          },
          width: {
            type: 'Number',
            default: 400,
          },
          height: {
            type: 'Number',
            default: 400,
          },
          cssClasses: {
            default: '',
            type: 'String',
          },
          styles: {
            type: 'Object as PropType<Partial<CSSStyleDeclaration>>',
            default: {},
          },
          pluginsLine: {
            type: "Array as PropType<Plugin<'line'>[]>",
            default: [],
          },
          pluginsPie: {
            type: "Array as PropType<Plugin<'pie'>[]>",
            default: [],
          },
          pluginsBar: {
            type: "Array as PropType<Plugin<'bar'>[]>",
            default: [],
          },
        },
      },
    };
  },
  computed: {
    siteDataCalculated() {
      // eslint-disable-next-line no-param-reassign
      return this.siteData?.reduce((acc, s) => { acc += s.ladders; return acc; }, 0);
    },
    finalStates() {
      const ladderStates = this?.ottoLaddersChart?.chartData?.datasets;
      return ladderStates?.map(s => s.data[0]).reduce((a, b) => a + b) || 0;
    },
    timeSlotValue() {
      if (this.safetyColData && this.safetyColData.safe_ladder_hours && this.selectedSafeLadderOpRange) {
        const selectedOption = this.selectedSafeLadderOpRange;
        let hourPercentage;
        // eslint-disable-next-line default-case
        switch (selectedOption) {
          case 'Today':
            hourPercentage = this.safetyColData.safe_ladder_hours[0].hoursPercentage;
            break;
          case 'This week':
            hourPercentage = this.safetyColData.safe_ladder_hours[1].hoursPercentage;
            break;
          case 'This month':
            hourPercentage = this.safetyColData.safe_ladder_hours[2].hoursPercentage;
            break;
          case 'Last Quarter':
            hourPercentage = this.safetyColData.safe_ladder_hours[3].hoursPercentage;
            break;
          case 'Last 12 months':
            hourPercentage = this.safetyColData.safe_ladder_hours[4].hoursPercentage;
            break;
          case 'Year-to-Date':
            hourPercentage = this.safetyColData.safe_ladder_hours[5].hoursPercentage;
            break;
          case 'Total to date':
            hourPercentage = this.safetyColData.safe_ladder_hours[6].hoursPercentage;
            break;
          case 'Market average':
            hourPercentage = this.safetyColData.safe_ladder_hours[7].hoursPercentage;
            break;
        }
        return hourPercentage;
      }
      return this.safetyColData.safe_ladder_hours[0].hoursPercentage;
    },
    badgedInCount() {
      return this.workersData?.filter(worker => worker.details?.isActive === true)?.length || 0;
    },
  },
  async mounted() {
    await this.$store.dispatch('getDashboard1Data');
    await this.$store.dispatch('getSiteData');
    await this.$store.dispatch('getUsers');
    // get users but exlude demo and app user
    this.workersData = this.$store.getters.users.filter(u => u.id !== 'aaa95351-8181-4abc-a21b-369f1474b545' && u.id !== '3a106511-8938-4c62-ad0f-bb992031fcf5');
    const { dashboard1Data } = this.$store.getters;
    const ottoData = JSON.stringify(dashboard1Data.ottoLaddersChartData);
    this.ottoLaddersChart.chartData = JSON.parse(ottoData);
    this.ottoLaddersChart.chartData.datasets.forEach(chartData => {
      // eslint-disable-next-line no-param-reassign
      chartData.data = [chartData.data];
    });
    this.safetyColData = dashboard1Data.safety;
    this.siteData = this.$store.getters.siteData;

    await this.$store.dispatch('getDashboard2Data');
    const { dashboard2Data } = this.$store.getters;
    this.hoursOfWorked.chartData = dashboard2Data.hoursOfWorkedChartData;
    this.hoursOfLadders.chartData = dashboard2Data.hoursOfLaddersChartData;
    this.alerts.chartData = dashboard2Data.alertsChartData;
    this.alarms.chartData = dashboard2Data.alarmsChartData;

    await this.$store.dispatch('getDashboard3Data');
    const { dashboard3Data } = this.$store.getters;
    this.shareOfLadders.chartData = dashboard3Data.shareOfLaddersChartData;
    this.alertsBar.chartData = dashboard3Data.alertChartData;
    this.alarmsBar.chartData = dashboard3Data.alarmsChartData;
  },
  methods: {
    scrollToElement(refName) {
      const el = this.$refs[refName];
      if (!el) {
        console.log('el was not found by refName', refName);
      } else {
        const headerOffset = 115;
        const elementPosition = el.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    },
  },
};
</script>

<style>
</style>
