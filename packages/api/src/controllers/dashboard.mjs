import Sequelize, { Op, QueryTypes } from 'sequelize';

import { sequelize } from '../db.mjs';
import Location from '../models/location.mjs';
import User from '../models/user.mjs';
import Device from '../models/device.mjs';
import KbDeviceEvent from '../models/kb_device_event.mjs';
import { ccs } from '../wss.mjs';

export const getDeviceChargingStats = async (req, res) => {
  // get All charging devices
  /*
    SELECT MAX(created_at), chamber_id, device_id
    FROM kb_device_events kde
    INNER JOIN devices d ON d.id = kde.device_id
    WHERE d.organization_id = ${current_user().org_id}
    GROUP BY device_id, chamber_id
    HAVING kde.event = 'deposit'
  */
  const chargingDevices = await sequelize.query(`
  SELECT count(1) FROM (
    SELECT MAX(kde.created_at) AS created_at, device_id, chamber_id
    FROM kb_device_events kde
    INNER JOIN devices d ON d.id = kde.device_id
    WHERE d.organization_id = :orgId AND kde.event IN ('deposit')
    GROUP BY device_id, chamber_id
  ) lce
  INNER JOIN kb_device_events kde ON kde.device_id = lce.device_id AND kde.chamber_id = lce.chamber_id AND kde.created_at = lce.created_at
  WHERE kde.event = 'deposit'
`, { replacements: { orgId: req?.user?.organization_id }, type: QueryTypes.SELECT, plain: true });

  // recently deposited devices (less than 1 hour ago)
  /*
    SELECT count(1) FROM ABOVE_QUERY WHERE created_at > now() - INTERVAL '1 hour';
  */
  const depositedDevices = await sequelize.query(`
  SELECT count(1) FROM (
    SELECT MAX(kde.created_at) AS created_at, device_id, chamber_id
    FROM kb_device_events kde
    INNER JOIN devices d ON d.id = kde.device_id
    WHERE d.organization_id = :orgId AND kde.event IN ('deposit')
    GROUP BY device_id, chamber_id
  ) lce
  INNER JOIN kb_device_events kde ON kde.device_id = lce.device_id AND kde.chamber_id = lce.chamber_id AND kde.created_at = lce.created_at
  WHERE kde.event = 'deposit' AND kde.created_at > NOW() - INTERVAL '1 hour';
`, { replacements: { orgId: req?.user?.organization_id }, type: QueryTypes.SELECT, plain: true });

  return res.json({
    deviceCharging: {
      charging: chargingDevices.count,
      deposited: depositedDevices.count,
    },
    success: true });
};

export const getAverageChargingTimeStats = async (req, res) => {
  const { avgStoreTime } = await sequelize.query(`
  WITH session_lengths(r_created_at, d_creatd_at, session_length) AS (
    SELECT MAX(kdeRetreve.created_at), MAX(kdeDeposit.created_at), kdeRetreve.created_at - kdeDeposit.created_at AS session_length
    FROM kb_device_events kdeRetreve
    INNER JOIN kb_device_events kdeDeposit ON kdeRetreve.id != kdeDeposit.id
    INNER JOIN users u ON u.id = kdeRetreve.user_id
    WHERE kdeRetreve."event" = 'retrieval'
      AND u.organization_id = :orgId
      AND kdeRetreve.chamber_id = kdeDeposit.chamber_id
      AND kdeRetreve.device_id = kdeDeposit.device_id
      AND kdeRetreve.created_at > kdeDeposit.created_at
    GROUP BY kdeRetreve.created_at, kdeDeposit.created_at
  )
  SELECT AVG(session_lengths.session_length) AS "avgStoreTime" FROM session_lengths;
`, { replacements: { orgId: req?.user?.organization_id }, type: QueryTypes.SELECT, plain: true });

  const { lastWeekStoreTime } = await sequelize.query(`
  WITH session_lengths(r_created_at, d_creatd_at, session_length) AS (
    SELECT MAX(kdeRetreve.created_at), MAX(kdeDeposit.created_at), kdeRetreve.created_at - kdeDeposit.created_at AS session_length
    FROM kb_device_events kdeRetreve
    INNER JOIN kb_device_events kdeDeposit ON kdeRetreve.id != kdeDeposit.id
    INNER JOIN users u ON u.id = kdeRetreve.user_id
    WHERE kdeRetreve."event" = 'retrieval'
      AND u.organization_id = :orgId
      AND kdeRetreve.created_at > NOW() - INTERVAL '1 week'
      AND kdeRetreve.chamber_id = kdeDeposit.chamber_id
      AND kdeRetreve.device_id = kdeDeposit.device_id
      AND kdeRetreve.created_at > kdeDeposit.created_at
    GROUP BY kdeRetreve.created_at, kdeDeposit.created_at
  )
  SELECT AVG(session_lengths.session_length) AS "lastWeekStoreTime" FROM session_lengths;
`, { replacements: { orgId: req?.user?.organization_id }, type: QueryTypes.SELECT, plain: true });

  return res.json({ avgChargeTime: { time: avgStoreTime?.minutes || '-', percentage: lastWeekStoreTime?.minutes || '-' }, success: true });
};

export const getActiveUsersStats = async (req, res) => {
  const { activeUserCount } = await sequelize.query(`
  SELECT count(DISTINCT("Kb_Device_Event"."user_id")) AS "activeUserCount"
  FROM "kb_device_events" AS "Kb_Device_Event"
  INNER JOIN "users" AS "User" ON "Kb_Device_Event"."user_id" = "User"."id"
  WHERE "Kb_Device_Event"."created_at" > NOW() - INTERVAL '1 WEEK'
    AND "User"."organization_id" = :orgId;
`, { replacements: { orgId: req?.user?.organization_id }, type: QueryTypes.SELECT, plain: true });

  const countAllUser = await User.count({ where: { organization_id: req?.user?.organization_id } });

  return res.json({ aciveUsers: { activeUsers: activeUserCount, enrolledUsers: countAllUser }, success: true });
};

export const getConnectivityStats = async (req, res) => {
  const allUnitsWithCount = await Device.findAndCountAll({
    attributes: ['mac_addr_eth'],
    where: { organization_id: req?.user?.organization_id },
    raw: true,
  });
  const onlineUnits = allUnitsWithCount.rows.reduce((acc, device) => {
    const count = acc + ccs[device.mac_addr_eth?.replace(/:/g, '')] ? 1 : 0;
    return count;
  }, 0);

  return res.json({ connectivity: { online: onlineUnits, total: allUnitsWithCount.count }, success: true });
};

export const getAlertStats = async (req, res) => {
  /*
    WITH most_recent_activity(created_at, id) AS (
      SELECT MAX(created_at), id FROM kb_device_events
      GROUP BY device_id, chamber_id, id
    )
  */

  const mostRecentActivityIds = [...(await KbDeviceEvent.findAll({
    include: [{
      model: User,
      where: { organization_id: req?.user?.organization_id },
      required: true,
    }],
    attributes: [
      [
        Sequelize.fn('MAX', Sequelize.col('Kb_Device_Event.created_at')),
        'Kb_Device_Event.created_at',
      ],
      'Kb_Device_Event.id',
      'Kb_Device_Event.*',
    ],
    group: ['Kb_Device_Event.device_id', 'Kb_Device_Event.chamber_id', 'Kb_Device_Event.id', 'User.id'],
    raw: true,
  }))].map(activity => activity.id);
  /*
    SELECT COUNT(1) FROM kb_device_events
    WHERE id IN most_recent_activity.id
      AND event = 'deposit'
      AND created_at > now() - INTERVAL '24 hours';
  */

  const issuesCount = await KbDeviceEvent.count({
    where: {
      id: mostRecentActivityIds,
      event: 'retrieval',
      created_at: {
        [Op.gt]: Sequelize.literal("NOW() - INTERVAL '10 HOURS'"),
      },
      // created_at: { [Op.gt]: new Date(new Date() - 24 * 60 * 60 * 1000) },
    },
  });
  /*
    // the above plus:
    SELECT COUNT(1) FROM kb_device_events WHERE event = 'alert_door_left_open';
  */
  const issuesCount1 = await KbDeviceEvent.count({
    where: {
      id: mostRecentActivityIds,
      event: 'alert_door_left_open',
      created_at: {
        [Op.lte]: Sequelize.literal("NOW() - INTERVAL '10 MINUTE'"),
      },
    },
  });
  const notConnectedDeviceCount = await Device.count({
    where: {
      organization_id: req?.user?.organization_id,
      last_connectivity_event: {
        [Op.lt]: Sequelize.literal("NOW() - INTERVAL '5 HOURS'"),
      },
    },
  });

  const allIssuesCount = issuesCount + issuesCount1 + notConnectedDeviceCount;
  return res.json({ alert: { issues: allIssuesCount }, success: true });
};

export const getDeviceReturnedStats = async (req, res) => {
  // TODO: API payload key names (returned/unaccouted) should be agnostic to the data passing through
  const countDevicesCheckedOutToday = await KbDeviceEvent.count({ where: { event: 'retrieval',
    created_at: {
      [Op.gt]: Sequelize.literal("NOW() - INTERVAL '24 HOURS'"),
    } } });

  const countDevicesReturnedToday = await KbDeviceEvent.count({ where: { event: 'deposit',
    created_at: {
      [Op.gt]: Sequelize.literal("NOW() - INTERVAL '24 HOURS'"),
    } } });

  return res.json({
    deviceReturned: {
      returned: countDevicesCheckedOutToday,
      unaccounted: countDevicesReturnedToday,
    },
    success: true,
  });
};

export const getLocations = async (req, res) => {
  const locs = await Location.findAll({
    attributes: ['name', 'created_at'],
    order: [['created_at', 'DESC']],
  });

  const locations = {
    data: locs.map(l => ({
      location: l.dataValues.name,
      date: l.dataValues.created_at?.toLocaleDateString(),
    })),
  };

  return res.json({ locations, success: true });
};
