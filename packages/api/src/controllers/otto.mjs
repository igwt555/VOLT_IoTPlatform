import { v4 as uuidv4, parse as uuidParse } from 'uuid';
// import Sequelize, { Op, QueryTypes } from 'sequelize';
import { QueryTypes } from 'sequelize';
import { sequelize } from '../db.mjs';
import Twilio from '../utils/twilio.mjs';
import User from '../models/user.mjs';
import Role from '../models/role.mjs';
import Device from '../models/device.mjs';
import OttoInspectionReport from '../models/otto_inspection_reports.mjs';
import DeviceEvent from '../models/device_event.mjs';

const alarmsChartLables = ['Too High', 'Leaning', 'Back Climb', 'Other'];
const alarmsChartColours = ['#4472c4', '#fec001', '#1236EC', '#E7F02E ', '#44c4be', '#d19a41', '#628723', '#cf3a04', '#db1f1f', '#d95f9e'];
const warningChartDataLabels = ['Too High', 'Leaning', 'Other'];
const warningChartColours = ['#EC1236', '#12EC9A', '#127CEC '];

const pGetSites = () => [{
  name: 'Safety and Health Conference', ladderCount: 2,
},
{
  name: 'Storage', ladderCount: 0,
},
{
  name: 'Site 3', ladderCount: 0,
}];

export const getDash1Data = async (req, res) => {
  const pLastIncident = sequelize.query(`
  SELECT now()::date - MAX(occured_at)::date AS days FROM device_events de WHERE de.data->>'data' != '0';
`, { replacements: { orgId: req?.user?.organization_id }, type: QueryTypes.SELECT, plain: true });
  const [lastIncident] = await Promise.all([pLastIncident]);
  const totaldevices = await Device.count({ where: { organization_id: req.user.organization_id } });
  const badgedInUsers = await sequelize.query(
    `
  SELECT details->>'badgedInTime' AS badgedtime FROM users WHERE (details->>'isActive')::boolean = true and organization_id = :orgId;`,
    { replacements: { orgId: req?.user?.organization_id }, type: QueryTypes.SELECT },
  );
  let activedata = 0;
  for (let i = 0; i < badgedInUsers.length; i += 1) {
    const badgedTimeStamp = new Date(parseInt(badgedInUsers[i].badgedtime, 10));
    // eslint-disable-next-line no-await-in-loop
    const activeDevices = await DeviceEvent.findOne({ where: {
      type: 'otto_ladder_event',
      occured_at: {
        $gt: badgedTimeStamp,
      },
    },
    });
    if (activeDevices) {
      activedata += 1;
    }
  }
  return res.json({
    /* compat */
    ottoLaddersChartData: {
      labels: ['Users'],
      datasets: [
        {
          label: 'Inactive',
          backgroundColor: '#19b0f0',

          data: (badgedInUsers.length - activedata),
        },
        {
          label: 'Active',
          backgroundColor: '#fefe03',
          data: activedata,
        },
        {
          label: 'Not signed in',
          backgroundColor: '#fd0807',
          data: (totaldevices - badgedInUsers.length),
        },
      ],
    },
    safety: {
      ladder_falls: lastIncident.days,
      unauthorized_use: 0,
      safe_ladder_hours: [
        { timeRange: 'Today', hoursPercentage: '65%' },
        { timeRange: 'This week', hoursPercentage: '76%' },
        { timeRange: 'This month', hoursPercentage: '73%' },
        { timeRange: 'Last Quarter', hoursPercentage: '65%' },
        { timeRange: 'Last 12 months', hoursPercentage: '65%' },
        { timeRange: 'Year-to-Date', hoursPercentage: '34%' },
        { timeRange: 'Total to date', hoursPercentage: '72%' },
        { timeRange: 'Market average', hoursPercentage: '79%' },
      ],
      safety_ranking: [
        { market: 'By trade', value: '4 out of 15' },
        { market: 'Overall', value: '7 out of 85' },
      ],
    },
    /* END legacy data set */
    lastIncident: lastIncident.days,
    unauthorizedUseWeek: 0, // any events for which we don't have a badge in within 1 hour of use
    safeHoursWeek: 0,
    safeHoursMonth: 0,
    safeHoursToDate: 0,
    safeHoursMarket: 0,
    safetyRankingByTrade: [4, 15],
    safetyRankingOverall: [7, 85],
    laddersInactive: badgedInUsers.length - activedata,
    laddersActive: activedata,
    laddersNotSignedIn: totaldevices - badgedInUsers.length,
    sites: pGetSites(),
    workers: [
      { id: 1, name: 'Giuntini, Ellen', active: false },
      { id: 2, name: 'Curington, Donnie', active: false },
      { id: 3, name: 'Payne, Kenneth', active: false },
    ],
  });
};

export const getDash2Data = async (req, res) => {
  //   const pSafeHours = sequelize.query(`
  //   SELECT now()::date - MAX(occured_at)::date FROM device_events de WHERE de.data->>'data' != '0';
  // `, { replacements: { orgId: req?.user?.organization_id }, type: QueryTypes.SELECT, raw: true });

  // const pActiveLadderHours = sequelize.query(`
  //   SELECT now()::date - MAX(occured_at)::date FROM device_events de WHERE de.data->>'data' != '0';
  // `, { replacements: { orgId: req?.user?.organization_id }, type: QueryTypes.SELECT, raw: true });

  const warnAlert = await sequelize.query(`
    SELECT de.data->>'data' AS value, count(1)::int AS count
    FROM device_events de
    GROUP BY de.data->>'data';
    `, { replacements: { orgId: req?.user?.organization_id }, type: QueryTypes.SELECT, raw: true });

  const wAM = warnAlert.reduce((acc, wa) => { acc[wa.value] = wa.count; return acc; }, {});

  const safeHours = [
    { day: '2022-04-22', safeHours: 79 },
    { day: '2022-04-23', safeHours: 80 },
    { day: '2022-04-24', safeHours: 84 },
    { day: '2022-04-25', safeHours: 80 },
    { day: '2022-04-26', safeHours: 70 },
    { day: '2022-04-27', safeHours: 60 },
    { day: '2022-04-28', safeHours: 70 },
    { day: '2022-04-29', safeHours: 75 },
    { day: '2022-04-30', safeHours: 78 },
    { day: '2022-05-01', safeHours: 80 },
    { day: '2022-05-02', safeHours: 82 },
    { day: '2022-05-03', safeHours: 85 },
    { day: '2022-05-04', safeHours: 90 },
  ];
  const activeLadderHours = [
    { day: '2022-04-22', active: 30, inactive: 44 },
    { day: '2022-04-23', active: 30, inactive: 44 },
    { day: '2022-04-24', active: 30, inactive: 44 },
    { day: '2022-04-25', active: 29, inactive: 43 },
    { day: '2022-04-26', active: 28, inactive: 42 },
    { day: '2022-04-27', active: 27, inactive: 41 },
    { day: '2022-04-28', active: 26, inactive: 39 },
    { day: '2022-04-29', active: 23, inactive: 37 },
    { day: '2022-04-30', active: 19, inactive: 35 },
    { day: '2022-05-01', active: 16, inactive: 34 },
    { day: '2022-05-02', active: 17, inactive: 37 },
    { day: '2022-05-03', active: 18, inactive: 40 },
    { day: '2022-05-04', active: 19, inactive: 43 },
  ];

  return res.json({
    /* compat */
    hoursOfWorkedChartData: {
      labels: safeHours.map(s => s.day),
      datasets: [
        {
          label: 'Hours Worked',
          backgroundColor: '#596ec1',
          data: safeHours.map(s => s.safeHours),
          borderColor: '#596ec1',
        },
      ],
    },
    hoursOfLaddersChartData: {
      labels: activeLadderHours.map(alh => alh.day),
      datasets: [
        {
          label: 'Active',
          backgroundColor: 'rgba(68, 115, 197, 1)',
          data: activeLadderHours.map(alh => alh.active),
          borderColor: '#4caf50',
        },
        {
          label: 'Inactive',
          backgroundColor: 'rgba(237, 125, 49, 1)',
          data: activeLadderHours.map(alh => alh.inactive),
          borderColor: '#f44336',
        },
      ],
    },
    alertsChartData: {
      labels: warningChartDataLabels,
      datasets: [
        {
          backgroundColor: warningChartColours,
          data: [wAM['8'], wAM['4'] ?? 0 + wAM['6'] ?? 0, wAM['2'] ?? 0 + wAM['3'] ?? 0],
        },
      ],
    },
    alarmsChartData: {
      labels: alarmsChartLables,
      datasets: [
        {
          backgroundColor: alarmsChartColours,
          data: [wAM['9'], wAM['5'] ?? 0 + wAM['7'] ?? 0, wAM['10'], wAM['11'] ?? 0],
        },
      ],
    },
    /* END legacy data set */
    safeHours: [
      { day: '2022-04-22', safeHours: 80 },
      { day: '2022-04-23', safeHours: 84 },
      { day: '2022-04-24', safeHours: 80 },
      { day: '2022-04-25', safeHours: 70 },
      { day: '2022-04-26', safeHours: 60 },
      { day: '2022-04-27', safeHours: 70 },
      { day: '2022-04-28', safeHours: 75 },
      { day: '2022-04-29', safeHours: 78 },
      { day: '2022-04-30', safeHours: 80 },
      { day: '2022-05-01', safeHours: 82 },
      { day: '2022-05-02', safeHours: 85 },
      { day: '2022-05-03', safeHours: 90 },
      { day: '2022-05-04', safeHours: 95 },
    ],
    activeLadderHours: [
      { day: '2022-04-22', active: 30, inactive: 44 },
      { day: '2022-04-23', active: 30, inactive: 44 },
      { day: '2022-04-24', active: 30, inactive: 44 },
      { day: '2022-04-25', active: 29, inactive: 43 },
      { day: '2022-04-26', active: 28, inactive: 42 },
      { day: '2022-04-27', active: 27, inactive: 41 },
      { day: '2022-04-28', active: 26, inactive: 39 },
      { day: '2022-04-29', active: 23, inactive: 37 },
      { day: '2022-04-30', active: 19, inactive: 35 },
      { day: '2022-05-01', active: 16, inactive: 34 },
      { day: '2022-05-02', active: 17, inactive: 37 },
      { day: '2022-05-03', active: 18, inactive: 40 },
      { day: '2022-05-04', active: 19, inactive: 43 },
    ],
    warnAlert,
  });
};

export const getDash3Data = async (req, res) => {
  //   const pSafeHours = sequelize.query(`
  //   SELECT now()::date - MAX(occured_at)::date FROM device_events de WHERE de.data->>'data' != '0';
  // `, { replacements: { orgId: req?.user?.organization_id }, type: QueryTypes.SELECT, raw: true });

  // const pActiveLadderHours = sequelize.query(`
  //   SELECT now()::date - MAX(occured_at)::date FROM device_events de WHERE de.data->>'data' != '0';
  // `, { replacements: { orgId: req?.user?.organization_id }, type: QueryTypes.SELECT, raw: true });

  const warnHours = await sequelize.query(`
  SELECT date_part('hour', de.occured_at at time zone 'america/new_york')::int AS hour, count(1)::int AS count
  FROM device_events de
  WHERE de.data->>'data' IN ('2', '4', '6', '7', '8')
  GROUP BY date_part('hour', de.occured_at at time zone 'america/new_york')::int
  `, { replacements: { orgId: req?.user?.organization_id }, type: QueryTypes.SELECT, raw: true });

  const wH = warnHours.reduce((acc, wh) => { acc[wh.hour] = wh.count; return acc; }, {});

  const alertHours = await sequelize.query(`
  SELECT date_part('hour', de.occured_at at time zone 'america/new_york')::int AS hour, count(1)::int AS count
  FROM device_events de
  WHERE de.data->>'data' IN ('3', '5', '9', '10', '11')
  GROUP BY date_part('hour', de.occured_at at time zone 'america/new_york')::int
  `, { replacements: { orgId: req?.user?.organization_id }, type: QueryTypes.SELECT, raw: true });

  const aH = alertHours.reduce((acc, ah) => { acc[ah.hour] = ah.count; return acc; }, {});

  const laddersSignedIn = [
    { day: '2022-04-22', signedIn: 30, notSignedIn: 44 },
    { day: '2022-04-23', signedIn: 30, notSignedIn: 44 },
    { day: '2022-04-24', signedIn: 30, notSignedIn: 44 },
    { day: '2022-04-25', signedIn: 29, notSignedIn: 43 },
    { day: '2022-04-26', signedIn: 28, notSignedIn: 42 },
    { day: '2022-04-27', signedIn: 27, notSignedIn: 41 },
    { day: '2022-04-28', signedIn: 26, notSignedIn: 39 },
    { day: '2022-04-29', signedIn: 23, notSignedIn: 37 },
    { day: '2022-04-30', signedIn: 19, notSignedIn: 35 },
    { day: '2022-05-01', signedIn: 16, notSignedIn: 34 },
    { day: '2022-05-02', signedIn: 17, notSignedIn: 37 },
    { day: '2022-05-03', signedIn: 18, notSignedIn: 40 },
    { day: '2022-05-04', signedIn: 19, notSignedIn: 43 },
  ];

  return res.json({
    /* compat */
    shareOfLaddersChartData: {
      labels: laddersSignedIn.map(las => las.day),
      datasets: [
        {
          label: 'Otto registered ladders, signed in',
          backgroundColor: 'rgba(68, 115, 197, 1)',
          data: laddersSignedIn.map(las => las.signedIn),
          borderColor: '#4caf50',
        },
        {
          label: 'Otto registered ladders, not signed in',
          backgroundColor: 'rgba(237, 125, 49, 1)',
          data: laddersSignedIn.map(las => las.notSignedIn),
          borderColor: '#f44336',
        },
      ],
    },
    alertChartData: {
      labels: ['6AM', '7AM', '8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM'],
      datasets: [
        {
          label: 'Warnings',
          backgroundColor: '#4473c5',
          data: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map(h => wH[h.toString()] ?? 0),
        },
      ],
    },
    alarmsChartData: {
      labels: ['6AM', '7AM', '8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM'],
      datasets: [
        {
          label: 'Alarms',
          backgroundColor: '#ed7d31',
          data: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map(h => aH[h.toString()] ?? 0),
        },
      ],
    },
    /* END legacy data set */
    laddersSignedIn,
    warnHours,
  });
};

// eslint-disable-next-line arrow-body-style
export const getUserProfile = async (req, res) => {
  const { userId } = req.params;
  // eslint-disable-next-line max-len
  if (req.user.id !== userId && req.user.role_id !== Role.genralRoles.superAdmin.id && req.user.role_id !== Role.genralRoles.admin.id) {
    return res.status(403).json('Unauthorized');
  }
  const user = await User.findByPk(userId, { raw: true });
  const userOttoId = Buffer.from(uuidParse(user.id)).readUInt32BE(0);
  user.ottoId = userOttoId;
  const safeHours = [
    { day: '2022-04-22', safeHours: 80 },
    { day: '2022-04-23', safeHours: 84 },
    { day: '2022-04-24', safeHours: 80 },
    { day: '2022-04-25', safeHours: 70 },
    { day: '2022-04-26', safeHours: 60 },
    { day: '2022-04-27', safeHours: 70 },
    { day: '2022-04-28', safeHours: 75 },
    { day: '2022-04-29', safeHours: 78 },
    { day: '2022-04-30', safeHours: 80 },
    { day: '2022-05-01', safeHours: 82 },
    { day: '2022-05-02', safeHours: 85 },
    { day: '2022-05-03', safeHours: 90 },
    { day: '2022-05-04', safeHours: 95 },
  ];
  return res.json({
    user,
    currentShiftChartData: {
      labels: ['6AM', '7AM', '8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM'],
      datasets: [
        {
          label: 'Warning',
          backgroundColor: '#4473C5',
          data: [0, 0, 0, 0, 2, 1, 3, 0, 2, 1, 0, 0, 0],
        },
        {
          label: 'Alarm',
          backgroundColor: '#ED7D31',
          data: [0, 0, 0, 0, 0, 0, 1, 0, 2, 0, 0, 0, 0],
        },
      ],
    },
    hoursOfWorkedChartData: {
      labels: safeHours.map(s => s.day),
      datasets: [
        {
          label: 'worked hours',
          backgroundColor: '#596EC1',
          data: safeHours.map(s => s.safeHours),
          borderColor: '#596EC1',
        },
      ],
    },
    areasAlertsChartData: {
      labels: warningChartDataLabels,
      datasets: [
        {
          backgroundColor: warningChartColours,
          data: [70, 30, 30],
        },
      ],
    },
    areasAlarmsChartData: {
      labels: alarmsChartLables,
      datasets: [
        {
          backgroundColor: alarmsChartColours,
          data: [20, 5, 5, 10, 10, 20, 2, 8, 12, 8],
        },
      ],
    },
  });
};

// eslint-disable-next-line arrow-body-style
export const getDash5Data = async (req, res) => {
  return res.json({
    safety: {
      ladder_falls: 285,
      safe_ladder_hours: [
        { data: 'My ladders', hours_percentage: '76%' },
        { data: 'Average for subcontractors', hours_percentage: '73%' },
        { data: 'Average for all', hours_percentage: '72%' },
      ],
    },
    progressTargetChartData: {
      labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 8, 19, 20, 21],
      datasets: [
        {
          label: 'worked hours',
          backgroundColor: '#596ec1',
          data: [80, 75, 70, 78, 68, 69, 78, 74, 72, 68, 70, 73, 71, 68, 67, 70, 72, 73, 60, 50, 40],
          borderColor: '#596ec1',
        },
      ],
    },
    ottoLaddersChartData: {
      labels: ['Users'],
      datasets: [
        {
          label: 'Inactive',
          backgroundColor: '#19b0f0',
          data: [450],
        },
        {
          label: 'Active',
          backgroundColor: '#fefe03',
          data: [900],
        },
        {
          label: 'Not signed in',
          backgroundColor: '#fd0807',
          data: [450],
        },
      ],
    },
    laddersBySite: [
      { name: 'Total', value: 180 },
      { name: 'Site 1', value: 46 },
      { name: 'Site 2', value: 28 },
      { name: 'Site 3', value: 25 },
    ],
    success: true,
  });
};

export const getSiteData = async (req, res) => {
  const sites = [
    {
      id: 1,
      name: 'Safety and Health Conference',
      ladders: 2,
      safe_hours: '76%',
      efficiency: '67%',
      value: 46,
    },
    {
      id: 2,
      name: 'Storage',
      ladders: 0,
      safe_hours: '76%',
      efficiency: '67%',
      value: 28,
    },
    {
      id: 3,
      name: 'Site 3',
      ladders: 0,
      safe_hours: '76%',
      efficiency: '67%',
      value: 25,
    },
  ];
  return res.json({
    sites,
    success: true,
  });
};

export const getDash6Data = async (req, res) => {
  const subcontractors = [
    {
      id: 1,
      name: 'Subcontractor 1',
      ladders: 100,
      safe_hours: '95.8%',
      safety_ranking: 1,
    },
    {
      id: 2,
      name: 'Subcontractor 2',
      ladders: 100,
      safe_hours: '95.8%',
      safety_ranking: 2,
    },
    {
      id: 3,
      name: 'Subcontractor 3',
      ladders: 100,
      safe_hours: '95.8%',
      safety_ranking: 3,
    },
    {
      id: 4,
      name: 'Subcontractor 4',
      ladders: 100,
      safe_hours: '95.8%',
      safety_ranking: 4,
    },
    {
      id: 5,
      name: 'Subcontractor 5',
      ladders: 100,
      safe_hours: '95.8%',
      safety_ranking: 5,
    },
    {
      id: 6,
      name: 'Subcontractor 6',
      ladders: 100,
      safe_hours: '95.8%',
      safety_ranking: 6,
    },
    {
      id: 7,
      name: 'Subcontractor 7',
      ladders: 100,
      safe_hours: '95.8%',
      safety_ranking: 7,
    },
    {
      id: 8,
      name: 'Subcontractor 8',
      ladders: 100,
      safe_hours: '95.8%',
      safety_ranking: 8,
    },
    {
      id: 9,
      name: 'Subcontractor 9',
      ladders: 100,
      safe_hours: '95.8%',
      safety_ranking: 9,
    },
    {
      id: 10,
      name: 'Subcontractor 10',
      ladders: 100,
      safe_hours: '95.8%',
      safety_ranking: 10,
    },
  ];
  return res.json({
    subcontractors,
    success: true,
  });
};

export const getDash8Data = async (req, res) => {
  const warnAlert = await sequelize.query(`
  SELECT de.data->>'data' AS value, count(1)::int AS count
  FROM device_events de
  GROUP BY de.data->>'data';
  `, { replacements: { orgId: req?.user?.organization_id }, type: QueryTypes.SELECT, raw: true });

  const wAM = warnAlert.reduce((acc, wa) => { acc[wa.value] = wa.count; return acc; }, {});

  const safeHours = [
    { day: '2022-04-22', safeHours: 80 },
    { day: '2022-04-23', safeHours: 84 },
    { day: '2022-04-24', safeHours: 80 },
    { day: '2022-04-25', safeHours: 70 },
    { day: '2022-04-26', safeHours: 60 },
    { day: '2022-04-27', safeHours: 70 },
    { day: '2022-04-28', safeHours: 75 },
    { day: '2022-04-29', safeHours: 78 },
    { day: '2022-04-30', safeHours: 80 },
    { day: '2022-05-01', safeHours: 82 },
    { day: '2022-05-02', safeHours: 85 },
    { day: '2022-05-03', safeHours: 90 },
    { day: '2022-05-04', safeHours: 95 },
  ];
  const activeLadderHours = [
    { day: '2022-04-22', active: 30, inactive: 44 },
    { day: '2022-04-23', active: 30, inactive: 44 },
    { day: '2022-04-24', active: 30, inactive: 44 },
    { day: '2022-04-25', active: 29, inactive: 43 },
    { day: '2022-04-26', active: 28, inactive: 42 },
    { day: '2022-04-27', active: 27, inactive: 41 },
    { day: '2022-04-28', active: 26, inactive: 39 },
    { day: '2022-04-29', active: 23, inactive: 37 },
    { day: '2022-04-30', active: 19, inactive: 35 },
    { day: '2022-05-01', active: 16, inactive: 34 },
    { day: '2022-05-02', active: 17, inactive: 37 },
    { day: '2022-05-03', active: 18, inactive: 40 },
    { day: '2022-05-04', active: 19, inactive: 43 },
  ];

  return res.json({
    hoursOfWorkedChartData: {
      labels: safeHours.map(s => s.day),
      datasets: [
        {
          label: 'Hours Worked',
          backgroundColor: '#596ec1',
          data: safeHours.map(s => s.safeHours),
          borderColor: '#596ec1',
        },
      ],
    },
    hoursOfLaddersChartData: {
      labels: activeLadderHours.map(alh => alh.day),
      datasets: [
        {
          label: 'Active',
          backgroundColor: 'rgba(68, 115, 197, 1)',
          data: activeLadderHours.map(alh => alh.active),
          borderColor: '#4caf50',
        },
        {
          label: 'Inactive',
          backgroundColor: 'rgba(237, 125, 49, 1)',
          data: activeLadderHours.map(alh => alh.inactive),
          borderColor: '#f44336',
        },
      ],
    },
    alertsChartData: {
      labels: warningChartDataLabels,
      datasets: [
        {
          backgroundColor: warningChartColours,
          data: [wAM['6'], wAM['8'], wAM['9']],
        },
      ],
    },
    alarmsChartData: {
      labels: alarmsChartLables,
      datasets: [
        {
          backgroundColor: alarmsChartColours,
          data: [wAM['4'], wAM['2'], wAM['7'], wAM['5'], wAM['3'], wAM['10'], wAM['11'], wAM['12'], wAM['13'], wAM['14']],
        },
      ],
    },
    safeHours: [
      { day: '2022-04-22', safeHours: 80 },
      { day: '2022-04-23', safeHours: 84 },
      { day: '2022-04-24', safeHours: 80 },
      { day: '2022-04-25', safeHours: 70 },
      { day: '2022-04-26', safeHours: 60 },
      { day: '2022-04-27', safeHours: 70 },
      { day: '2022-04-28', safeHours: 75 },
      { day: '2022-04-29', safeHours: 78 },
      { day: '2022-04-30', safeHours: 80 },
      { day: '2022-05-01', safeHours: 82 },
      { day: '2022-05-02', safeHours: 85 },
      { day: '2022-05-03', safeHours: 90 },
      { day: '2022-05-04', safeHours: 95 },
    ],
    activeLadderHours: [
      { day: '2022-04-22', active: 30, inactive: 44 },
      { day: '2022-04-23', active: 30, inactive: 44 },
      { day: '2022-04-24', active: 30, inactive: 44 },
      { day: '2022-04-25', active: 29, inactive: 43 },
      { day: '2022-04-26', active: 28, inactive: 42 },
      { day: '2022-04-27', active: 27, inactive: 41 },
      { day: '2022-04-28', active: 26, inactive: 39 },
      { day: '2022-04-29', active: 23, inactive: 37 },
      { day: '2022-04-30', active: 19, inactive: 35 },
      { day: '2022-05-01', active: 16, inactive: 34 },
      { day: '2022-05-02', active: 17, inactive: 37 },
      { day: '2022-05-03', active: 18, inactive: 40 },
      { day: '2022-05-04', active: 19, inactive: 43 },
    ],
    warnAlert,
  });
};

export const getDash9Data = async (req, res) => {
  const warnHours = await sequelize.query(`
  SELECT date_part('hour', de.occured_at at time zone 'america/new_york')::int AS hour, count(1)::int AS count
  FROM device_events de
  WHERE de.data->>'data' IN ('2', '4', '6', '7', '8')
  GROUP BY date_part('hour', de.occured_at at time zone 'america/new_york')::int
  `, { replacements: { orgId: req?.user?.organization_id }, type: QueryTypes.SELECT, raw: true });

  const wH = warnHours.reduce((acc, wh) => { acc[wh.hour] = wh.count; return acc; }, {});

  const alertHours = await sequelize.query(`
  SELECT date_part('hour', de.occured_at at time zone 'america/new_york')::int AS hour, count(1)::int AS count
  FROM device_events de
  WHERE de.data->>'data' IN ('3', '5', '9', '10', '11')
  GROUP BY date_part('hour', de.occured_at at time zone 'america/new_york')::int
  `, { replacements: { orgId: req?.user?.organization_id }, type: QueryTypes.SELECT, raw: true });

  const aH = alertHours.reduce((acc, ah) => { acc[ah.hour] = ah.count; return acc; }, {});

  const laddersSignedIn = [
    { day: '2022-04-22', signedIn: 30, notSignedIn: 44 },
    { day: '2022-04-23', signedIn: 30, notSignedIn: 44 },
    { day: '2022-04-24', signedIn: 30, notSignedIn: 44 },
    { day: '2022-04-25', signedIn: 29, notSignedIn: 43 },
    { day: '2022-04-26', signedIn: 28, notSignedIn: 42 },
    { day: '2022-04-27', signedIn: 27, notSignedIn: 41 },
    { day: '2022-04-28', signedIn: 26, notSignedIn: 39 },
    { day: '2022-04-29', signedIn: 23, notSignedIn: 37 },
    { day: '2022-04-30', signedIn: 19, notSignedIn: 35 },
    { day: '2022-05-01', signedIn: 16, notSignedIn: 34 },
    { day: '2022-05-02', signedIn: 17, notSignedIn: 37 },
    { day: '2022-05-03', signedIn: 18, notSignedIn: 40 },
    { day: '2022-05-04', signedIn: 19, notSignedIn: 43 },
  ];

  return res.json({
    shareOfLaddersChartData: {
      labels: laddersSignedIn.map(las => las.day),
      datasets: [
        {
          label: 'Otto registered ladders, signed in',
          backgroundColor: 'rgba(68, 115, 197, 1)',
          data: laddersSignedIn.map(las => las.signedIn),
          borderColor: '#4caf50',
        },
        {
          label: 'Otto registered ladders, not signed in',
          backgroundColor: 'rgba(237, 125, 49, 1)',
          data: laddersSignedIn.map(las => las.notSignedIn),
          borderColor: '#f44336',
        },
      ],
    },
    alertChartData: {
      labels: ['6AM', '7AM', '8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM'],
      datasets: [
        {
          label: 'Warnings',
          backgroundColor: '#4473c5',
          data: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map(h => wH[h.toString()] ?? 0),
        },
      ],
    },
    alarmsChartData: {
      labels: ['6AM', '7AM', '8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM'],
      datasets: [
        {
          label: 'Alarms',
          backgroundColor: '#ed7d31',
          data: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map(h => aH[h.toString()] ?? 0),
        },
      ],
    },
    laddersSignedIn,
    warnHours,
  });
};

const smsHistory = {};
const THIRTY_MINUTES = 1000 * 60 * 30;
export const saveEvent = async (req, res) => {
  await sequelize.query(`
  INSERT INTO device_events(type, device_id, data, occured_at) VALUES ('otto_ladder_event', :device_id, :data, :occured_at)
  `, { replacements: {
    device_id: req.body.coreid,
    data: JSON.stringify({ ...req.body, public: undefined }),
    occured_at: req.body.published_at,
  },
  type: QueryTypes.INSERT,
  raw: true });

  res.json({
    created_at: new Date().toString(),
    // eslint-disable-next-line no-undef
    id: uuidv4(),
  });

  if (req.body.data === '0' || req.body.data === '1') return;

  // now check if we need to send an SMS based on this alert or warning that just came in
  const pastEvents = await sequelize.query(`
  SELECT occured_at, data->>'data' AS event_id FROM device_events WHERE device_id = :device_id AND data->>'data' NOT IN ('0', '1') AND occured_at > NOW() - INTERVAL '30 minutes' ORDER BY occured_at DESC LIMIT 5`, { logging: console.log,
    replacements: {
      device_id: req.body.coreid,
    },
    type: QueryTypes.SELECT,
    raw: true });

  console.log({ pastEvents });
  if (!pastEvents[4]?.occured_at) return;

  const [{ alert_phone_numbers: alertPhoneNums }] = await sequelize.query(`
    SELECT settings->>'alertPhoneNumbers' AS alert_phone_numbers FROM organizations o WHERE o.id = 'e5559a11-a707-4d61-9689-6935f1f71e7f' LIMIT 1;`, { replacements: {
    device_id: req.body.coreid,
  },
  type: QueryTypes.SELECT,
  raw: true });

  const alertPhoneNumbers = (alertPhoneNums || '+13472395113').split(',').map(p => p.trim());
  const now = new Date();

  for (let i = 0; i < alertPhoneNumbers.length; i += 1) {
    const alertPhoneNumber = alertPhoneNumbers[i];
    const lastSms = smsHistory[alertPhoneNumber] || new Date(null); // last SMS defaults to 1970 if no more recent SMS found
    const mostRecentAlert = new Date(pastEvents[0]?.occured_at);
    const fifthAlertAgo = new Date(pastEvents[4]?.occured_at);
    console.log('Checking', { alertPhoneNumber, lastSms, mostRecentAlert, fifthAlertAgo });
    if (mostRecentAlert - fifthAlertAgo < THIRTY_MINUTES && now - lastSms > THIRTY_MINUTES) {
      console.log('Will send alert SMS to', alertPhoneNumber, { lastSms });
      smsHistory[alertPhoneNumber] = new Date();
      Twilio.messages.create({
        body: 'Otto Alert: Persistent ladder misuse detected. Ladder: 001, Site: Safety Conference, Floor: 1',
        from: '+19896629507',
        to: alertPhoneNumber,
      }).then(message => console.log('SMS sent sID', message.sid));
    }
  }
};

export const deleteAllEvents = async (req, res) => {
  await sequelize.query(`
  DELETE FROM device_events WHERE type = 'otto_ladder_event'`, { type: QueryTypes.DELETE, raw: true });

  return res.json({});
};

export const activateUser = async (req, res) => {
  const userId = '7157fb8a-b906-4e53-9706-9a546deb6011'; // Donnie Curington's user ID
  await User.update({ details: { isActive: true, badgedInTime: Number(new Date()) } }, { where: { id: userId } });
  return res.json({});
};

export const deactivateUser = async (req, res) => {
  const userId = '7157fb8a-b906-4e53-9706-9a546deb6011'; // Donnie Curington's user ID
  await User.update({ details: { isActive: false } }, { where: { id: userId } });
  return res.json({});
};
export const createReport = async (req, res) => {
  const data = req.body;
  data.user_id = data.userId;
  data.device_id = data.deviceId;
  const report = await OttoInspectionReport.create(data);
  return res.json({ report, success: true });
};

export const getOttoReports = async (req, res) => {
  const reports = await OttoInspectionReport.findAll({
    include: [{
      model: Device,
      as: 'Device',
      attributes: ['serial_num'],
    }, {
      model: User,
      as: 'User',
      attributes: ['id', 'full_name'],
    }],
    $sort: { id: 1 },
    logging: console.log,
  });
  return res.json({
    reports,
    success: true,
  });
};

export const getOttoReport = async (req, res) => {
  const { inspectionReportId } = req.params;
  const report = await OttoInspectionReport.findOne(
    {
      where: { id: inspectionReportId },
      include: [{
        model: Device,
        as: 'Device',
        attributes: ['id', 'serial_num'],
      }, {
        model: User,
        as: 'User',
        attributes: ['id', 'full_name'],
      }],
    },
  );
  return res.json({
    report,
    success: true,
  });
};
