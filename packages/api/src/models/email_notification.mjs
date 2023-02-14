import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../db.mjs';
import User from './user.mjs';

class EmailNotification extends Model {}
export default EmailNotification;

EmailNotification.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    recipient: {
      type: DataTypes.STRING,
    },
    sender_email: {
      type: DataTypes.STRING,
    },
    email_body: {
      type: DataTypes.TEXT,
    },
    message_id: {
      type: DataTypes.STRING,
    },
    sent: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    received: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    undelivered: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    opened: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    subject: {
      type: DataTypes.STRING,
    },
    user_id: {
      type: DataTypes.UUID,
    },
  },
  { timestamps: true, sequelize, modelName: 'EmailNotification', tableName: 'email_notifications', createdAt: 'created_at', updatedAt: 'updated_at' },
);

EmailNotification.belongsTo(User, { foreignKey: 'user_id' });
