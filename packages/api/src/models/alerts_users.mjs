/* eslint-disable camelcase */
import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../db.mjs';
import Alerts from './alerts.mjs';
import User from './user.mjs';

class AlertsUsers extends Model { }
export default AlertsUsers;
AlertsUsers.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  alert_id: {
    type: DataTypes.UUID,
  },
  user_id: {
    type: DataTypes.UUID,
  },
}, { timestamps: true, sequelize, modelName: 'AlertsUsers', tableName: 'alerts_users', createdAt: 'created_at', updatedAt: 'updated_at' });
// reationships=>here
User.belongsToMany(Alerts, { through: AlertsUsers, foreignKey: 'user_id' });
Alerts.belongsToMany(User, { through: AlertsUsers, foreignKey: 'alert_id' });
