import KbDevice from '../models/kb_device.mjs';
import Device from '../models/device.mjs';
import KbDeviceEvent from '../models/kb_device_event.mjs';
import Location from '../models/location.mjs';
import KbDevicesUsers from '../models/KbDeviceUsers.mjs';
import User from '../models/user.mjs';

export const findById = async (req, res) => {
  const { id } = req.params;
  const kbDevice = await KbDevice.findOne({ where: { id } });
  return res.json({ kbDevice, success: true });
};

export const updateDevice = async (req, res) => {
  const { locationId } = req.body;
  const { deviceId } = req.params;
  const location = await Location.update({ device_id: deviceId }, {
    where: { id: locationId }, returning: true,
  });
  return res.json({ location, success: true });
};

export const getAllKbDevices = async (req, res) => {
  const allKbDevice = await KbDevice.findAll({
    attributes: ['id', 'make', 'model', 'serial_number'],
    include: [
      {
        model: KbDeviceEvent,
        required: false,
        limit: 1,
        order: [['created_at', 'DESC']],
        as: 'events',
        attributes: [
          'id',
          'event',
          'device_id',
          'chamber_id',
          'created_at',
        ],
        include: [
          {
            model: Device,
            required: false,
            as: 'Device',
            attributes: ['serial_num'],
          },
        ],
      },
      {
        model: KbDevicesUsers,
        required: false,
        include: [{
          model: User,
          required: false,
          as: 'User',
          attributes: ['id', 'full_name'],
        }],
      },
    ],
  });

  return res.json({ allKbDevice, success: true });
};
