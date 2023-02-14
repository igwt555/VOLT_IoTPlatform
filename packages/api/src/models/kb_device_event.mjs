import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../db.mjs';
import Device from './device.mjs';
import User from './user.mjs';
import KbDevice from './kb_device.mjs';
import AccessMethod from './access_method.mjs';

class KbDeviceEvent extends Model {}
export default KbDeviceEvent;

KbDeviceEvent.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    event: {
      type: DataTypes.ENUM('deposit', 'retrieval', 'access_rejected', 'alert_door_left_open'),
    },
    device_id: {
      type: DataTypes.UUID,
    },
    user_id: {
      type: DataTypes.UUID,
    },
    kb_device_id: {
      type: DataTypes.UUID,
    },
    chamber_id: {
      type: DataTypes.INTEGER,
    },
    access_method_id: {
      type: DataTypes.UUID,
    },
    details: {
      type: DataTypes.JSONB,
      defaultValue: null,
    },
  },
  { timestamps: true, sequelize, modelName: 'Kb_Device_Event', tableName: 'kb_device_events', createdAt: 'created_at', updatedAt: 'updated_at' },
);

KbDeviceEvent.belongsTo(Device, { foreignKey: 'device_id' });
KbDeviceEvent.belongsTo(User, { foreignKey: 'user_id' });
KbDeviceEvent.belongsTo(KbDevice, { foreignKey: 'kb_device_id' });
KbDevice.hasMany(KbDeviceEvent, { foreignKey: 'kb_device_id', as: 'events' });
KbDeviceEvent.belongsTo(AccessMethod, { foreignKey: 'access_method_id' });
