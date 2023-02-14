import Sequelize from 'sequelize';

import KbDeviceEvent from '../models/kb_device_event.mjs';

// eslint-disable-next-line import/prefer-default-export
export async function findByUnitId(req, res) {
  const { deviceId } = req.params;
  const [{ max_chamber_id: maxChamberId = 0 }] = await KbDeviceEvent.findAll({
    attributes: [
      [Sequelize.fn('MAX', Sequelize.col('Kb_Device_Event.chamber_id')), 'max_chamber_id'],
    ],
    where: { device_id: deviceId },
    raw: true,
  });

  const bays = [];
  const totalChamberCount = Math.max(5, Math.ceil(maxChamberId / 5) * 5);
  for (let i = 0; i < totalChamberCount; i += 1) {
    bays.push({
      bayNumber: i + 1,
    });
  }

  return res.json({ success: true, bays });
}
