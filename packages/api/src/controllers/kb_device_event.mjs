/* eslint-disable no-param-reassign */
import Sequelize, { Op } from 'sequelize';
import { sequelize } from '../db.mjs';
import KbDeviceEvent from '../models/kb_device_event.mjs';
import User from '../models/user.mjs';
import Device from '../models/device.mjs';
import KbDevice from '../models/kb_device.mjs';
import Location from '../models/location.mjs';
import KbDevicesUsers from '../models/KbDeviceUsers.mjs';
import KbChamberReservation from '../models/kb_chamber_reservation.mjs';
import { ccs } from '../wss.mjs';

export const findLocation = async data => {
  const locationData = await Location.findOne({ where: { device_id: data } });
  return locationData;
};
const round5 = x => Math.ceil(x / 5) * 5 || 0;
export const getAllDeviceEvent = async (req, res) => {
  const sortField = req.body.sortField === null ? 'created_at' : `"${req.body.sortField}"`;
  const sortOrder = req.body.sortOrder == null ? 'DESC' : (req.body.sortOrder === 1 ? 'ASC' : 'DESC');
  const { filters } = req.body;

  const deviceModel = filters['Device.serial_num'].value ? { model: Device,
    where: {
      serial_num: {
        [Op.eq]: filters['Device.serial_num'].value,
      },
    },
  } : { model: Device };

  const userModel = filters['User.full_name'].value ? { model: User,
    attributes: ['id', 'full_name'],
    where:
    {
      [Op.and]: [
        {
          organization_id: req?.user?.organization_id,
        },
        {
          full_name: {
            [Op.iLike]: `%${filters['User.full_name'].value}%`, // filters['User.full_name'].value,
          },
        },
      ],
    },
  } : { model: User, attributes: ['id', 'full_name'], where: { organization_id: req?.user?.organization_id } };

  let whereCondition;
  const query = {
    include: [
      deviceModel,
      userModel,
      { model: KbDevice },
    ],
    order: sequelize.literal(`${sortField} ${sortOrder}`),
    limit: req.body.rows,
    offset: req.body.first,
  };

  if (filters.event.value) {
    whereCondition = { ...whereCondition, event: filters.event.value };
  }

  if (filters.chamber_id.value) {
    let chamberId = parseInt(filters.chamber_id.value, 10);

    whereCondition = { ...whereCondition, chamber_id: chamberId -= 1 };
  }

  if (filters.date.value) {
    const d = new Date(filters.date.value.replace('.000Z', ''));
    const formatedDate = `${d.getFullYear()}-${(`0${d.getMonth() + 1}`).slice(-2)}-${(`0${d.getDate()}`).slice(-2)}T${(`0${d.getHours()}`).slice(-2)}:${(`0${d.getMinutes()}`).slice(-2)}`;
    whereCondition = {
      ...whereCondition,
      created_at: { [Op.between]: [`${formatedDate}:00.000Z`, `${formatedDate}:59.000Z`] } };
  }

  if (whereCondition != null) {
    query.where = {
      [Op.and]: [whereCondition],
    };
  }

  try {
    const deviceEvents = await KbDeviceEvent.findAndCountAll(query).then(async data => {
      const modifiedData = await Promise.all(
        data.rows.map(async element => {
          if (element.Device) {
            let location;
            if (filters['location.name'].value) {
              location = await Location.findOne({
                where:
              {
                [Op.and]: [
                  {
                    device_id: element.Device.id,
                  },
                  {
                    name: {
                      [Op.iLike]: `%${filters['location.name'].value}%`, // filters['User.full_name'].value,
                    },
                  },
                ],
              },
              });
            } else {
              location = await Location.findOne({ where: { device_id: element.Device.id } });
            }
            // TODO: fix this N+1
            // eslint-disable-next-line no-param-reassign
            element.dataValues.location = location;
            element.dataValues.totalRecords = data.count;
          }
          return element;
        }),
      );
      return modifiedData;
    });
    // TODO: translate chamber ids in front end
    // eslint-disable-next-line no-return-assign
    deviceEvents.map(de => de.dataValues.chamber_id += 1);
    return res.json({ deviceEvents, success: true });
  } catch (ex) {
    console.log(ex);
    return res.json({ deviceEvents: null, success: false });
  }
};

const occupancyOverrides = ['hold', 'occupied', 'damaged'];
export const getDeviceProgress = async deviceId => {
  const latestChamberEvents = await sequelize.query(`
      SELECT *
      FROM   (SELECT id, created_at, "event", chamber_id, details, RANK() OVER (PARTITION BY chamber_id ORDER BY created_at DESC) AS rk
      FROM   kb_device_events kde WHERE device_id = :deviceId) acs
      WHERE  rk = 1`, {
    model: KbDeviceEvent,
    mapToModel: true,
    replacements: { deviceId },
    raw: true,
  });

  const occupiedChamberCount = latestChamberEvents.filter(kbde => (kbde.details?.status !== 'unoccupied' && kbde.event === 'deposit') || occupancyOverrides.includes(kbde.details?.status)).length;
  const highestSeenChamberNum = Math.max(...latestChamberEvents.map(item => item.chamber_id)) + 1; // +1 since chambers are 0 indexed
  const totalChambers = round5(highestSeenChamberNum);

  return (occupiedChamberCount * 100) / totalChambers;
};

export const getEventByDeviceId = async (req, res) => {
  const { deviceId } = req.params;
  // const deviceEvent = await KbDeviceEventService.getByDeviceId(deviceId);
  const latestChamberData = await sequelize.query(`
  WITH latest AS (
    SELECT MAX("kbe"."created_at") OVER (PARTITION BY kbe.chamber_id ORDER BY kbe.created_at DESC) AS "created_at", ROW_NUMBER() OVER (PARTITION BY kbe.chamber_id) AS rn, kbe.chamber_id, kbe.*, kbd.make as kb_device_make, kbd.model as kb_devicemodel, kbd.name as kb_devicename, kbd.serial_number as kb_device_serial_number
    FROM "kb_device_events" AS "kbe" LEFT JOIN kb_devices kbd on kbe.kb_device_id = kbd.id
    WHERE "kbe"."device_id" = :deviceId AND kbe.chamber_id IS NOT NULL
    )
  SELECT * FROM latest WHERE rn = 1;`, {
    model: KbDeviceEvent,
    mapToModel: true,
    replacements: { deviceId },
    raw: true,
  });

  const chamberLookup = latestChamberData.reduce((acc, c) => {
    acc.set(c.chamber_id, c);
    return acc;
  }, new Map());

  const allChambers = new Array(Math.max(5, round5(1 + Math.max(...chamberLookup.keys())))).fill({
    created_at: 'N/A',
    deviceId: null,
    id: '0000000-0000-0000-0000-000000000000',
    status: 'unoccupied',
  }).map(async (chamberPlaceholder, i) => {
    // clone the placeholder so we dont mutate it
    const chamber = chamberLookup.get(i) || { ...chamberPlaceholder };
    const kbDevicedata = chamber;
    chamber.chamber_id = chamber.chamber_id || i;
    if (chamber.event === 'deposit' && kbDevicedata?.kb_device_id) {
      const userDeviceAssignment = await KbDevicesUsers.findOne({
        where: { kb_device_id: kbDevicedata?.kb_device_id },
        include: { model: User, attributes: ['id', 'full_name'] },
      });

      if (userDeviceAssignment) {
        const user = userDeviceAssignment.User?.dataValues;
        chamber.KbDeviceUser = user;
      }
    }
    chamber.status = chamber.event === 'deposit' ? 'occupied' : chamber.event === 'retrieval' ? 'unoccupied' : chamber.status;
    const userChamberAssignmemt = await KbChamberReservation.findOne({
      where: { device_id: deviceId, chamber_id: chamber.chamber_id },
      include: { model: User, attributes: ['id', 'full_name'], raw: true } });
    if (userChamberAssignmemt) {
      chamber.chamberUser = userChamberAssignmemt.User;
    }
    chamber.status = chamber?.details?.status || chamber?.status;
    return chamber;
  });
  const deviceEvent = await Promise.all(allChambers);
  return res.json({ deviceEvent, success: true });
};

export const getRecentActivityByDeviceId = async (req, res) => {
  const { deviceId } = req.params;
  const recentActivity = await KbDeviceEvent.findAll({
    where: { device_id: deviceId },
    include: [{ model: Device }, { model: User, attributes: ['id', 'full_name'] }, { model: KbDevice }],
    order: [['created_at', 'DESC']],
  });
  return res.json({ recentActivity, success: true });
};

export const getEventByKbDeviceId = async (req, res) => {
  const { kbDeviceId } = req.params;
  const deviceEvent = await KbDeviceEvent.findAll({
    include: [{ model: Device }, { model: User, attributes: ['id', 'full_name'] }, { model: KbDevice }],
    where: { kb_device_id: kbDeviceId },
    order: [['created_at', 'DESC']],
  });
  return res.json({ deviceEvent, success: true });
};

export const getNotReturnedDevicesEvents = async (req, res) => {
  const deviceEvents = await KbDeviceEvent.findAll({
    where: {
      event: 'retrieval',
      updated_at: {
        [Op.lte]: Sequelize.literal("NOW() - INTERVAL '10 HOURS'"),
      },
    },
    include: [{ model: KbDevice }],
  });
  return res.json({ deviceEvents, success: true });
};

export const updateChamberStatus = async (req, res) => {
  const validStatus = ['occupied', 'unoccupied', 'damaged', 'hold'];
  const { deviceId, status: newStatus, chamberId } = req.body;

  if (!deviceId) {
    return res.status(422).json({ message: 'deviceId is required', success: false });
  }

  if (!validStatus.includes(newStatus)) {
    return res.status(422).json({ message: "Status must be one of ['occupied', 'unoccupied', 'damaged', 'hold']", success: false });
  }

  const mostResetEventForChamber = await KbDeviceEvent.findOne({
    attributes: ['details'],
    where: {
      chamber_id: chamberId,
      device_id: deviceId,
    },
    order: [['created_at', 'DESC']],
  });

  const updatedChamberDetails = { ...mostResetEventForChamber?.details, status: newStatus };
  // eslint-disable-next-line no-unused-vars
  const [_updated, record] = await KbDeviceEvent.update({
    details: updatedChamberDetails,
  }, {
    where: {
      chamber_id: chamberId,
      device_id: deviceId,
    },
    returning: true,
  });

  const device = await Device.findOne({ where: { id: deviceId } });
  const deviceMAC = device.mac_addr_eth?.replaceAll(':', '');
  const deviceWs = ccs[deviceMAC];
  if (!deviceWs) {
    return res.status(422).json({ success: false, message: 'This unit could not be reached. There may be a connection issue.' });
  }

  deviceWs.emit('change_door_status', chamberId, newStatus, resp => res.json({ message: resp, data: record }));
  return null;
};
