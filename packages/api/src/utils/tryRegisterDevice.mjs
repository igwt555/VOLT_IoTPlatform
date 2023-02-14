import Sequelize from 'sequelize';
import Device from '../models/device.mjs';

/**
 * Registers a unit (by mac address) if not already registered.
 * @param {string} mac - MAC address of unit without colons
 * @returns {boolean} returns true if device didn't exist and was registered; otherwise false
 */
// eslint-disable-next-line import/prefer-default-export
export const tryRegisterDevice = async mac => {
  const [device] = await Device.findOrCreate({
    where: { mac_addr_eth: mac },
    defaults: { organization_id: 'b1132090-ad75-4f19-b449-3595ae1620c2' },
    raw: true,
  });

  if (device?.serial_num) return device;

  try {
    const { maxSerialNum } = await Device.findOne({
      attributes: [[Sequelize.fn('max', Sequelize.col('serial_num')), 'maxSerialNum']],
      where: { organization_id: 'b1132090-ad75-4f19-b449-3595ae1620c2' },
      raw: true,
      logging: console.log,
    });
    const newUnitSerial = Math.max(1000, parseInt(maxSerialNum, 10) + 1);
    await Device.update({ serial_num: newUnitSerial }, { where: { mac_addr_eth: mac } });
    console.log('registered new unit:', newUnitSerial);
  } catch (err) {
    console.log('failed to set serial_num on new device', err);
  }
  return device;
};
