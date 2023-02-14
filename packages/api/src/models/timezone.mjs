import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../db.mjs';

class Timezone extends Model {}
export default Timezone;

Timezone.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    value: {
      type: DataTypes.STRING,
    },
    abbr: {
      type: DataTypes.STRING,
    },
    offset: {
      type: DataTypes.STRING,
    },
    isdst: {
      type: DataTypes.BOOLEAN,
    },
    text: {
      type: DataTypes.STRING,
    },
    utc: {
      type: DataTypes.JSON,
    },
  },
  { timestamps: true, sequelize, modelName: 'Timezone', tableName: 'timezones', createdAt: 'created_at', updatedAt: 'updated_at' },
);
