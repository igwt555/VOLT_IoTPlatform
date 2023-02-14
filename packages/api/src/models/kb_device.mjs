import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../db.mjs';
import KbDevicesUsers from './KbDeviceUsers.mjs';

class KbDevice extends Model {}
export default KbDevice;

KbDevice.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    serial_number: DataTypes.STRING,
    make: DataTypes.STRING,
    model: DataTypes.STRING,
    name: DataTypes.STRING,
  },
  { timestamps: true, sequelize, modelName: 'KbDevice', tableName: 'kb_devices', createdAt: 'created_at', updatedAt: 'updated_at' },
);
KbDevice.hasOne(KbDevicesUsers, {
  foreignKey: 'kb_device_id',
});
KbDevicesUsers.belongsTo(KbDevice, {
  foreignKey: 'kb_device_id',
});
