import Device from '../models/device.mjs';
import { ccs } from '../wss.mjs';
import { getDeviceProgress } from './kb_device_event.mjs';

export const getDevice = async (req, res) => {
  const allDevices = await Device.findAll({
    where: { organization_id: req?.user?.organization_id },
    order: [['created_at', 'asc']],
    raw: true,
  });
  const devices = await Promise.all(
    allDevices.map(async d => {
      // eslint-disable-next-line no-param-reassign
      d.unit_status = 'ready';
      // eslint-disable-next-line no-param-reassign
      d.is_active = !!ccs[d.mac_addr_eth?.replace(/:/g, '')];
      // eslint-disable-next-line no-param-reassign
      d.progress = await getDeviceProgress(d.id);
      return d;
    }),
  );

  return res.json({ devices, success: true });
};

export const findByDeviceId = async (req, res) => {
  const { deviceId } = req.params;
  const device = await Device.findByPk(deviceId, { where: { organization_id: req?.user?.organization_id } });

  return res.json({ device, success: true });
};
