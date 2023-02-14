import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../db.mjs';

class DeviceEvent extends Model {}
export default DeviceEvent;

DeviceEvent.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    type: {
      type: DataTypes.STRING,
    },
    device_id: {
      type: DataTypes.STRING,
    },
    data: {
      type: DataTypes.JSON,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('NOW()'),
    },
    occured_at: {
      type: DataTypes.DATE,
    },
  },
  { timestamps: false, sequelize, modelName: 'DeviceEvent', tableName: 'device_events', createdAt: 'created_at' },
);
