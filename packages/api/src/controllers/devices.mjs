import Sequelize from 'sequelize';

import KbDeviceEvent from '../models/kb_device_event.mjs';
import AccessMethod from '../models/access_method.mjs';
import KbChamberReservation from '../models/kb_chamber_reservation.mjs';
import Device from '../models/device.mjs';
import User from '../models/user.mjs';
import { ccs } from '../wss.mjs';

export const getRfidTags = async (req, res) => {
  const rfidAccessMethods = await AccessMethod.findAll({
    where: { type: 'rfid_tag' },
    attributes: ['data'],
  });

  res.json({ success: true, rfidTags: rfidAccessMethods.map(am => am.data) });
};

export const getPinCodes = async (req, res) => {
  const pinCodeMethods = await AccessMethod.findAll({
    where: { type: 'pin_code' },
    attributes: ['data'],
  });

  res.json({ success: true, pinCodes: pinCodeMethods.map(am => am.data) });
};

// eslint-disable-next-line consistent-return
export const openDoor = async (req, res) => {
  const { deviceId, chamber_id: chamberId } = req.body;

  const device = await Device.findOne({ where: { id: deviceId, organization_id: req?.user?.organization_id } });
  const deviceMAC = device.mac_addr_eth?.replaceAll(':', '');
  const deviceWs = ccs[deviceMAC];
  if (!deviceWs) {
    return res.status(422).json({ success: false, message: 'This door could not be opened. There may be a connection issue.' });
  }
  deviceWs.emit('open_door', chamberId, resp => res.json({ success: true, message: resp }));
  // todo: we should set a timeout on the emit, and instead return a failure message if the emit wasn't ACKed
};

export const saveDeviceNote = async (req, res) => {
  const { id, note } = req.body;
  const kwikiqinote = { notes: note };
  await Device.update({ device_data: JSON.stringify(kwikiqinote) }, { where: { id }, returning: true, plain: true });

  return res.json({ status: true });
};

export const getDeviceNote = async (req, res) => {
  const { deviceId } = req.params;
  const device = await Device.findOne({
    where: { id: deviceId },
    raw: true,
  });

  if (device.device_data) {
    return res.json({ note: device.device_data?.notes });
  }
  return res.json({ note: '' });
};

export const getConfiguration = async (req, res) => {
  const { deviceId } = req.params;
  const [device] = await Device.findOrCreate({
    where: { id: deviceId },
    defaults: { organization_id: 'b1132090-ad75-4f19-b449-3595ae1620c2' },
    raw: true,
  });

  return res.json({
    serialNum: device.serial_num,
  });
};

export const getConfigurationByMac = async (req, res) => {
  const { deviceMac } = req.params;
  const device = await Device.findOne({
    where: { mac_addr_eth: deviceMac },
    raw: true,
  });

  if (!device) return res.status(404).json({ ok: false, message: 'This device was not found' });

  return res.json({
    serialNum: device.serial_num,
  });
};

const findOrCreateDeviceById = async macAddrEth => {
  const [device] = await Device.findOrCreate({
    where: { mac_addr_eth: macAddrEth },
    defaults: { organization_id: 'b1132090-ad75-4f19-b449-3595ae1620c2' },
    raw: true,
  });

  if (!device.serial_num) {
    try {
      const [{ maxSerialNum }] = await Device.findAll({
        attributes: [[Sequelize.fn('max', Sequelize.col('serial_num')), 'maxSerialNum']],
        where: { organization_id: 'b1132090-ad75-4f19-b449-3595ae1620c2' },
        raw: true,
      });
      device.serial_num = parseInt(maxSerialNum, 10) + 1;
      device.update({ serial_num: device.serial_num });
    } catch (err) {
      console.error('failed to set serial_num on new device', err);
    }
  }
  return device;
};

export const recordEvent = async (req, res) => {
  // eslint-disable-next-line no-unused-vars
  const { event, chamberId, accessData, macAddr, uId } = req.body;
  // const { deviceId } = req.params;

  const device = await findOrCreateDeviceById(macAddr);

  if (event === 'updateDeviceToDamaged') {
    await KbDeviceEvent.update({
      where: {
        device_id: device.id,
        chamber_id: chamberId,
      },
      limit: 1,
      order: { created_at: 'DESC' },
    }, { details: { status: 'damaged' } });
    return;
  }
  // TODO: figure out why eslint is not picking up underscore ignore pattern from root eslint rule config
  // eslint-disable-next-line no-unused-vars
  const [accessMethod, _created] = await AccessMethod.findOrCreate({
    where: { data: accessData },
    defaults: { data: accessData },
  });

  await KbDeviceEvent.create({ event,
    device_id: device.id,
    user_id: accessMethod.user_id,
    chamber_id: chamberId,
    access_method_id: accessMethod.id });

  return res.json({ success: true });
};

export const assignToUser = async (req, res) => {
  const { userId, kbDeviceId, reservationType, createdBy } = req.body;
  const newData = await KbChamberReservation.create({
    user_id: userId,
    kb_device_id: kbDeviceId,
    reservation_type: reservationType,
    created_by: createdBy,
  });
  return res.json({ newData, success: true });
};

export const transferOwnership = async (req, res) => {
  const { email } = req.body;
  const { deviceId } = req.params;

  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res.status(400).json({
      success: false,
      toast: {
        severity: 'error',
        summary: 'Error',
        detail: 'User does not exist',
      },
    });
  }

  await Device.update({ organization_id: user.organization_id }, { where: { id: deviceId } });

  return res.status(200).json({
    success: true,
    toast: {
      detail: 'Device ownership updated!',
    },
  });
};
