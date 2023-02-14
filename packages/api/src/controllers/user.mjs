import httpErrors from 'http-errors';
import bcrypt from 'bcrypt';
import Sequelize, { Op } from 'sequelize';
import jwt from 'jsonwebtoken';
import * as UserService from '../services/user.mjs';
import Timezone from '../models/timezone.mjs';
import Organization from '../models/organization.mjs';
import constants from '../constant.mjs';
import KbDevicesUsers from '../models/KbDeviceUsers.mjs';
import KbChamberReservation from '../models/kb_chamber_reservation.mjs';
import Device from '../models/device.mjs';
import User from '../models/user.mjs';
import KbDevice from '../models/kb_device.mjs';
import Alerts from '../models/alerts.mjs';
import KbDeviceEvent from '../models/kb_device_event.mjs';
import Role from '../models/role.mjs';
import AlertsUsers from '../models/alerts_users.mjs';
import Location from '../models/location.mjs';

import { sendPinCode, sendPinCodeEmail } from '../helpers/email.mjs';
import AccessMethod from '../models/access_method.mjs';
import { generatePincode } from '../utils/common.mjs';

const { JWT_SECRET_KEY } = process.env;

export const createUsers = async (req, res) => {
  const { users } = req.body;
  await User.bulkCreate(users);
  const usersCreated = await User.findAll();
  return res.json({ users: usersCreated, success: true });
};

export const getUsers = async (req, res) => {
  const users = await User.findAll({
    where: { organization_id: req?.user?.organization_id },
    include: [{ model: Role }],
  });
  return res.json({ users, success: true });
};

export const create = async (req, res) => {
  const { email } = req.body;
  const orgId = req.body.organization_id;
  const userFound = await User.findOne({
    where: { email },
    plain: true,
  });
  if (userFound) throw new httpErrors.BadRequest('Email address already exists');

  const response = await UserService.create({
    email: req.body?.email,
    full_name: req.body?.full_name,
    password: await bcrypt.hash(req.body?.password ?? '', 10),
    role_id: req.body?.role_id ? req.body?.role_id : req.body?.role.value,
    organization_id: req.body?.organization_id,
  });
  if (!response) {
    throw new httpErrors.BadRequest('User not created');
  } else {
    const org = await Organization.findOne({ where: { id: orgId } });

    if (org?.settings?.kwikiqSupportAutoIssuePinCode) {
      const pinCode = await generatePincode();
      await AccessMethod.create({
        type: 'pin_code',
        data: pinCode,
        user_id: response.id,
        active_from: new Date(),
        active_until: null,
      });
      await sendPinCode(email, orgId, pinCode);
    }

    const users = await User.findAll({
      where: { organization_id: req?.user?.organization_id },
      include: [{ model: Role }],
    });

    return res.json({ users, success: true, toast: { detail: 'User Created Successfully' } });
  }
};

export const updateUser = async (req, res) => {
  if (req?.body?.phoneNo) {
    const phoneNo = req?.body?.phoneNo;
    const checkPhoneNO =
      /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/.test(phoneNo);

    if (checkPhoneNO) {
      return res.json({ status: 'invalid phone no', success: true });
    }
  }
  // eslint-disable-next-line no-unused-vars
  const [record, updatedUser] = await User.update(req.body, {
    where: req.params,
    include: [{ model: Role }],
    returning: true,
    plain: true,
  });
  const user = await User.findOne({
    where: { id: updatedUser.id, organization_id: req?.user?.organization_id },
    include: [{ model: Role }, { model: Timezone }],
    plain: true,
  });
  return res.json({ user, success: true });
};

export const getUser = async (req, res) => {
  const { id } = req.params;
  const userFound = await User.findOne({
    where: { id, organization_id: req?.user?.organization_id },
    include: [{ model: Role }, { model: Timezone }],
    plain: true,
  });
  return res.json({ user: userFound, success: true });
};

export const getUserByEmailId = async (req, res) => {
  const { email } = req.params;
  const userFound = await User.findOne({
    where: { email },
    plain: true,
  });
  return res.json({ user: userFound, success: true });
};

export const assignBay = async (req, res) => {
  const data = req.body;
  const { userId, deviceId } = data;
  const user = await User.findOne({
    where: { id: userId },
    plain: true,
  });
  const locationData = await Location.findOne({
    where: { device_id: deviceId },
  });
  if (locationData) {
    await sendPinCodeEmail(user, locationData.name);
    const kbChamberReservation = {
      user_id: data.userId,
      device_id: data.deviceId,
      chamber_id: data.chamberId,
      reservation_type: data.reservationType,
      created_by: data.createdBy,
    };
    await KbChamberReservation.create(kbChamberReservation);
  }
  return res.json({
    success: true,
    message: 'Bay assigned successfully',
  });
};

export const report = async (req, res) => {
  const { id } = req.params;
  const userReport = await UserService.report(id);
  return res.json({ report: userReport });
};

export const assignUser = async (req, res) => {
  const emailData = await UserService.assignUser(req.body);
  return res.json({ success: true, emailData });
};
export const unassignUser = async (req, res) => {
  const emailData = await UserService.unassignUser(req.body);
  return res.json({ success: true, emailData });
};

export const getUsersByOrgId = async (req, res) => {
  const orgId = req?.user?.organization_id;
  let userFound = await User.findAll({
    where: { organization_id: orgId },
  });
  const childs = await Organization.findAll({
    where: { parent_org_id: orgId },
  });
  let childsOfOrg = [];
  // TODO: get full org lineage, then get all users in orgList
  // eslint-disable-next-line no-restricted-syntax
  for await (const item of childs) {
    const users = await User.findAll({
      where: { organization_id: item.dataValues.id },
    });
    childsOfOrg = [...childsOfOrg, ...users];
  }
  userFound = userFound.concat(childsOfOrg);
  return res.json({ users: userFound, success: true });
};

export const setalerts = async (req, res) => {
  const subbed = await AlertsUsers.findOne({ where: { alert_id: req?.body?.alert_id } });
  const alertfound = await User.findAll({
    include: Alerts,
    where: { id: req?.body?.user_id, organization_id: req?.user?.organization_id },
  });
  if (subbed) {
    await AlertsUsers.destroy({ where: { alert_id: req?.body?.alert_id } });

    const totalAlerts = await Alerts.findAll({
      where: { organization_id: req?.user?.organization_id },
    });

    return res.json({ alerts: alertfound, totalAlerts });
  }

  await AlertsUsers.create({
    alert_id: req.body.alert_id,
    user_id: req.body.user_id,
  });
  User.findAll({
    include: Alerts,
    where: { id: req.body.user_id },
  });
  const totalAlerts = await Alerts.findAll({
    where: { organization_id: req?.user?.organization_id },
  });
  return res.json({ alerts: alertfound, totalAlerts });
};

export const getalerts = async (req, res) => {
  const { id } = req.params;
  const alertfound = await User.findAll({
    include: Alerts,
    where: { id, organization_id: req?.user?.organization_id },
  });
  const totalAlerts = await Alerts.findAll({
    where: { organization_id: req?.user?.organization_id },
  });

  const mostRecentActivityIds = [
    ...(await KbDeviceEvent.findAll({
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
    })),
  ].map(activity => activity.id);

  let deviceNotReturned = await KbDeviceEvent.findAll({
    where: {
      id: mostRecentActivityIds,
      event: 'retrieval',
      created_at: {
        [Op.gt]: Sequelize.literal("NOW() - INTERVAL '10 HOURS'"),
      },
    },
    include: [{ model: Device }, { model: User }],
  });

  let alertDoorIssues = await KbDeviceEvent.findAll({
    where: {
      id: mostRecentActivityIds,
      event: 'alert_door_left_open',
      created_at: {
        [Op.lte]: Sequelize.literal("NOW() - INTERVAL '10 MINUTE'"),
      },

    },
    include: [{ model: Device }, { model: User }],
  });

  let offlineDevices = await Device.findAll({
    attributes: ['serial_num', 'organization_id', 'last_connectivity_event'],
    where: {
      organization_id: req?.user?.organization_id,
      last_connectivity_event: {
        [Op.lt]: Sequelize.literal("NOW() - INTERVAL '5 HOURS'"),
      },
    },
    raw: true,
  });

  deviceNotReturned = deviceNotReturned.map(ele => {
    const temp = {};
    temp.occured_at = ele.created_at;
    temp.description = `A device that was checked out of Unit ${ele?.Device?.serial_num}, bay ${ele?.chamber_id} by ${ele?.User?.full_name} was not returned in 10 hours`;
    return temp;
  });

  alertDoorIssues = alertDoorIssues.map(ele => {
    const temp = {};
    temp.occured_at = ele.created_at;
    temp.description = `Door X on unit ${ele?.Device?.serial_num} has been left open for over 10 minutes`;
    return temp;
  });

  offlineDevices = offlineDevices.map(ele => {
    const temp = {};
    temp.occured_at = ele.last_connectivity_event;
    temp.description = `Unit ${ele.serial_num} has not been connected for 5 hours`;
    return temp;
  });

  const allIssuesCount = [
    ...deviceNotReturned,
    ...alertDoorIssues,
    ...offlineDevices,
  ];

  return res.json({
    alerts: alertfound,
    totalAlerts,
    alertIssues: allIssuesCount,
  });
};

export const registerUser = async (req, res) => {
  const { email } = req.body;
  const userFind = await User.findOne({
    where: { email },
    plain: true,
  });
  if (userFind) throw new httpErrors.BadRequest('Email address already exists');

  const orgCreated = await Organization.create({
    name: `${req?.body?.full_name}'s Organization`,
    parent_org_id: req.body?.parent_org_id || constants.DEFAULT_PARENT_ORG_ID,
  });
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const user = {
    email: req.body.email,
    full_name: req.body.full_name,
    password: hashedPassword,
    role_id: Role.genralRoles.superAdmin.id,
    organization_id: orgCreated.id,
  };
  const userCreate = await UserService.create(user);
  const userFound = await User.findOne({
    where: { id: userCreate.dataValues.id },
    include: [{ model: Organization }, { model: Role }],
    plain: true,
  });
  jwt.sign(
    {
      sub: userFound.id,
      userName: userFound.full_name,
    },
    JWT_SECRET_KEY,
    (err, token) => {
      if (err) throw new httpErrors.InternalServerError();
      return res.json({
        success: true,
        token,
        user: userFound,
        message: 'User Registerd Sucessfully',
      });
    },
  );
};

export const assignUserChamber = async (req, res) => {
  const emailData = await UserService.assignUserChamber(req.body);
  return res.json({ success: true, emailData });
};
export const unassignUserChamber = async (req, res) => {
  const emailData = await UserService.unassignUserChamber(req.body);
  return res.json({ success: true, emailData });
};
export const getTimeZones = async (req, res) => {
  const timezones = await Timezone.findAll();
  return res.json({ Timezones: timezones, sucess: true });
};

export const getUserReservations = async (req, res) => {
  const userId = req.params.id;
  const kbDevicesUsers = await KbDevicesUsers.findAll({
    where: { user_id: userId },
    include: [
      { model: User, attributes: ['id', 'full_name'] },
      { model: KbDevice },
    ],
  });

  const kbChamberReservations = await KbChamberReservation.findAll({
    where: { user_id: userId },
    include: [
      { model: User, attributes: ['id', 'full_name'] },
      { model: Device },
    ],
  });

  return res.json({
    reservations: [...kbChamberReservations, ...kbDevicesUsers],
    sucess: true,
  });
};
