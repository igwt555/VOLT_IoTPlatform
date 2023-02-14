import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../db.mjs';

class Location extends Model {}
export default Location;

Location.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    organization_id: {
      type: DataTypes.UUID,
    },
    device_id: {
      type: DataTypes.UUID,
    },
  },
  {
    sequelize,
    timestamps: true,
    modelName: 'Location',
    tableName: 'locations',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
);
