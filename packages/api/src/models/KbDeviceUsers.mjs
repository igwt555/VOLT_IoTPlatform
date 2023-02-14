import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../db.mjs';
import User from './user.mjs';

class KbDevicesUsers extends Model {}
export default KbDevicesUsers;
KbDevicesUsers.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  kb_device_id: DataTypes.UUID,
  user_id: DataTypes.UUID,
  reserved_until: DataTypes.DATE,
  alert_on_expire: DataTypes.BOOLEAN,
  created_by: DataTypes.UUID,
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE,
}, {
  timestamps: true,
  sequelize,
  tableName: 'kb_devices_users',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  modelName: 'kb_devices_users',
});
KbDevicesUsers.belongsTo(User, {
  foreignKey: 'user_id',
});
