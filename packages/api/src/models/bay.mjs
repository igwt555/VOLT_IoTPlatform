import { Model, DataTypes } from 'sequelize';
import KbDevice from './kb_device.mjs';
import { sequelize } from '../db.mjs';

class Bay extends Model {}
export default Bay;

Bay.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    bayNumber: {
      type: DataTypes.INTEGER,
    },
    checkIn: {
      type: DataTypes.DATE,
    },
    checkOut: {
      type: DataTypes.DATE,
    },
    status: {
      type: DataTypes.STRING,
    },
  },
  { timestamps: true, sequelize, modelName: 'Bay', tableName: 'bays', createdAt: 'created_at', updatedAt: 'updated_at' },
);

Bay.belongsTo(KbDevice, { foreignKey: 'deviceId' });
