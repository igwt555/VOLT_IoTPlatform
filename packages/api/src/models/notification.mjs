import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../db.mjs';

class Notification extends Model {}
export default Notification;

Notification.init(
  {
    description: {
      type: DataTypes.STRING,
    },
  },
  { timestamps: true, sequelize, modelName: 'Notification', tableName: 'notifications', createdAt: 'created_at', updatedAt: 'updated_at' },
);
