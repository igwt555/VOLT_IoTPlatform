import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../db.mjs';
import User from './user.mjs';

class AccessMethod extends Model {}
export default AccessMethod;

AccessMethod.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    type: {
      type: DataTypes.ENUM('pin_code', 'rfid_tag'),
    },
    data: {
      type: DataTypes.STRING,
      unique: true,
    },
    user_id: {
      type: DataTypes.UUID,
    },
    active_from: {
      type: DataTypes.DATE,
    },
    active_until: {
      type: DataTypes.DATE,
    },
  },
  { timestamps: true, sequelize, modelName: 'AccessMethod', tableName: 'access_methods', createdAt: 'created_at', updatedAt: 'updated_at' },
);

AccessMethod.belongsTo(User, { foreignKey: 'user_id' });
