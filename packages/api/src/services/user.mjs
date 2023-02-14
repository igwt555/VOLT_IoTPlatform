/* eslint-disable camelcase */
/* eslint-disable max-len */
import User from '../models/user.mjs';
import KbDevice from '../models/kb_device.mjs';
import Role from '../models/role.mjs';
import Location from '../models/location.mjs';
import EmailNotification from '../models/email_notification.mjs';
import { userEmail } from '../helpers/email.mjs';
import KbChamberReservation from '../models/kb_chamber_reservation.mjs';
import KbDeviceEvent from '../models/kb_device_event.mjs';
import Device from '../models/device.mjs';
import Alerts from '../models/alerts.mjs';
import KbDevicesUsers from '../models/KbDeviceUsers.mjs';
import RolePermission from '../models/role_permission.mjs';
import Permission from '../models/permission.mjs';
import AccessMethod from '../models/access_method.mjs';

export const create = async data => User.create(data);

export const getUserById = async id => {
  const user = await User.findOne({
    where: { id },
    include: [{ model: Role, include: [{ model: RolePermission }] }],
    plain: true,
  });
  if (!user) {
    return null;
  }
  let permissions = [];
  if (user.Role.id === Role.genralRoles.superAdmin.id) {
    permissions = Object.values(Permission.generalPermissions).map(p => p.id);
  } else if (user.Role.id === Role.genralRoles.admin.id) {
    permissions = Object.values(Permission.generalPermissions)
      .filter(p => p.id !== '99d4cff9-a2d7-4654-a7eb-e39554ef49cc')
      .map(p => p.id);
  } else if (user.Role.id === Role.genralRoles.basicAccess.id) {
    permissions = [
      Permission.generalPermissions.loginAccess,
      Permission.generalPermissions.viewLocations,
      Permission.generalPermissions.createLocations,
    ].map(p => p.id);
  } else {
    // custom role => look up perms from db
    permissions = user.Role.RolePermissions.map(ele => ele.id);
  }

  return { ...user.dataValues, permissions };
};

export const report = async userId => {
  const reportData = await KbDeviceEvent.findAll({
    where: {
      user_id: userId,
    },
    include: [{ model: Device }, { model: KbDevice }],
    order: [['created_at', 'DESC']],
  }).then(async data => {
    const modifiedReportData = await Promise.all(
      data.map(async element => {
        if (element.Device) {
          const location = await Location.findOne({
            where: { device_id: element.Device.id },
          });
          // eslint-disable-next-line no-param-reassign
          element.dataValues.location = location;
        }
        return element;
      }),
    );
    return modifiedReportData;
  });
  return reportData;
};

// find user with location and other attributes
// findOneWithLocation = (condition) => {
//   return await User.findOne({
//     where: condition,
//     attributes: ['bayId'],
//     include: [{ model: Unit, attributes: ['un'] }],
//   });
// };

export const assignUser = async data => {
  const {
    deviceId,
    selectedUserId,
    invitedUserId,
    kbDeviceId,
    createdById,
    reservedUntil,
    alertOnExpire,
  } = data;
  const kbDeviceData = await KbDevice.findOne({ where: { id: kbDeviceId } });
  const user = await User.findByPk(selectedUserId, { plain: true });
  const kbUserAssign = await KbDevicesUsers.create({
    kb_device_id: kbDeviceId,
    user_id: selectedUserId,
    reserved_until: reservedUntil,
    alert_on_expire: alertOnExpire,
    created_by: createdById,
  });
  let locationStr = '';
  if (deviceId) {
    const locationData = await Location.findOne({
      where: { device_id: deviceId },
    });
    const locationName = locationData?.name;
    if (locationName) {
      locationStr = `from Location: <b>${locationName}</b> `;
    }
  }
  let emailRes = null;

  const pinCode = Math.floor(1000 + Math.random() * 9000);
  const subject = 'KwikIQ - Device Assigned to you';
  let html = `<div>
    <h1>Device Assignment Notification</h1>
    <div>You have been assigned a device for pickup. You can retrieve it from location <b>${locationStr}</b> using pin code <b>${pinCode}</b></div>`;
  if (kbDeviceData) {
    html += `
      <div>Device Make: <b>${kbDeviceData?.make}</b></div>
      <div>Device Model: <b>${kbDeviceData?.model}</b></div>`;
  }
  if (kbDeviceData?.serial_number) {
    html += `<div>Device Serial Number: <b>${kbDeviceData?.serial_number}</b></div>`;
  }
  html += '</div>';
  emailRes = await userEmail(user, subject, html);
  const emailData = {
    recipient: emailRes?.envelope?.to[0],
    sender_email: emailRes.envelope.from,
    email_body: html,
    message_id: emailRes.messageId,
    subject,
    user_id: invitedUserId,
    sent: emailRes.accepted.length ? 1 : 0,
    undelivered: emailRes.rejected.length ? 1 : 0,
  };
  await EmailNotification.create(emailData);
  return { emailRes, kbUserAssign };
};

export const unassignUser = async data => {
  const { deviceId, selectedUserId, invitedUserId, kbDeviceId } = data;
  const locationData = await Location.findOne({
    where: { device_id: deviceId },
  });
  const kbDeviceData = await KbDevice.findOne({ where: { id: kbDeviceId } });
  const user = await User.findByPk(selectedUserId, { plain: true });
  const kbUserUnassign = await KbDevicesUsers.destroy({
    where: { kb_device_id: kbDeviceId },
  });
  let emailRes = null;
  if (locationData) {
    const locationName = locationData?.name;
    const pinCode = Math.floor(1000 + Math.random() * 9000);
    const subject = 'KwikIQ - Device Unassigned';
    let html = `<div>
      <h1>Device Assignment Notification</h1>
        <div>You have been unassigned from a device. You can drop it at location <b>${locationName}</b> using pin code ${pinCode}</div>`;
    if (kbDeviceData) {
      html += `
        <div>Device Make: <b>${kbDeviceData?.make}</b></div>
        <div>Device Model: <b>${kbDeviceData?.model}</b></div>`;
    }
    if (kbDeviceData?.serial_number) {
      html += `<div>Device Serial Number: <b>${kbDeviceData?.serial_number}</b></div>`;
    }
    html += '</div>';
    emailRes = await userEmail(user, subject, html);
    const emailData = {
      recipient: emailRes?.envelope?.to[0],
      sender_email: emailRes?.envelope?.from,
      email_body: html,
      message_id: emailRes?.messageId,
      subject,
      user_id: invitedUserId,
      sent: emailRes.accepted.length ? 1 : 0,
      undelivered: emailRes.rejected.length ? 1 : 0,
    };
    await EmailNotification.create(emailData);
  }
  return { emailRes, kbUserUnassign };
};

export const getAllAlerts = orgId => Alerts.findAll({ where: { organization_id: orgId } });

export const assignUserChamber = async data => {
  const {
    deviceId,
    chamberId,
    kbDeviceId,
    reservationType,
    selectedUserId,
    createdbyId,
  } = data;
  const locationData = await Location.findOne({
    where: { device_id: deviceId },
  });
  const kbDeviceData = kbDeviceId
    ? await KbDevice.findOne({ where: { id: kbDeviceId } })
    : null;
  const user = await User.findByPk(selectedUserId, { plain: true });
  const KbChamberReserverd = await KbChamberReservation.create({
    kb_device_id: kbDeviceId,
    user_id: selectedUserId,
    chamber_id: chamberId,
    reservation_type: reservationType,
    device_id: deviceId,
    created_by: createdbyId,
  });
  let emailRes = null;
  if (locationData) {
    const locationName = locationData?.name;
    const pinCode = Math.floor(1000 + Math.random() * 9000);
    const subject = 'KwikIQ - Chamber Assigned';
    let html = `<div>
      <h1>Chamber Assignment Notification</h1>`;
    if (reservationType === 'persistent') {
      html += `<div>You have been assigned a chamber for device storage. You can access it at location <b>${locationName}</b> using pin code <b>${pinCode}</b></div>`;
    } else {
      html += `<div>You have been assigned a chamber to pick up a device. You can access it at location <b>${locationName}</b> using pin code <b>${pinCode}</b></div>`;
    }

    if (kbDeviceData) {
      html += `
        <div>Device Make: <b>${kbDeviceData?.make}</b></div>
        <div>Device Model: <b>${kbDeviceData?.model}</b></div>`;
    }
    if (kbDeviceData?.serial_number) {
      html += `<div>Device Serial Number: <b>${kbDeviceData?.serial_number}</b></div>`;
    }
    html += '</div>';

    emailRes = await userEmail(user, subject, html);
    const emailData = {
      recipient: emailRes?.envelope?.to[0],
      sender_email: emailRes?.envelope?.from,
      email_body: html,
      message_id: emailRes?.messageId,
      subject,
      user_id: selectedUserId,
      sent: emailRes?.accepted?.length ? 1 : 0,
      undelivered: emailRes?.rejected?.length ? 1 : 0,
    };
    await EmailNotification.create(emailData);

    await AccessMethod.create({
      type: 'pin_code',
      data: pinCode,
      user_id: user.id,
    });
  }
  return { emailRes, KbChamberReserverd };
};

export const unassignUserChamber = async data => {
  const { deviceId, selectedUserId, chamberId } = data;
  const location = await Location.findOne({
    where: { device_id: deviceId },
  });
  const user = await User.findByPk(selectedUserId, { plain: true });
  const kbUserUnassignChamber = await KbChamberReservation.destroy({
    where: { device_id: deviceId, user_id: user.id, chamber_id: chamberId },
  });
  let emailRes = null;
  if (location) {
    const subject = 'KwikIQ - Chamber Unassigned';
    const html = `<div>
      <div>Your chamber reservation at Location ${location.name} was canceled.</div>
    </div>`;
    emailRes = await userEmail(user, subject, html);
    const emailData = {
      recipient: emailRes?.envelope?.to[0],
      sender_email: emailRes?.envelope?.from,
      email_body: html,
      message_id: emailRes?.messageId,
      subject,
      user_id: selectedUserId,
      sent: emailRes?.accepted?.length ? 1 : 0,
      undelivered: emailRes?.rejected?.length ? 1 : 0,
    };
    await EmailNotification.create(emailData);
  }
  return { emailRes, kbUserUnassignChamber };
};
