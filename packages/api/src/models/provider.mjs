import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../db.mjs';

class Provider extends Model {}
export default Provider;

Provider.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
    },
    type: {
      type: DataTypes.STRING,
    },
    protocol: {
      type: DataTypes.STRING,
    },
    certificate_type: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.TEXT,
    },
  },
  {
    sequelize,
    timestamps: true,
    modelName: 'Provider',
    tableName: 'providers',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
);
