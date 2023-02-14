import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../db.mjs';
import Device from './device.mjs';
import Location from './location.mjs';

class DevicesLocations extends Model {}
export default DevicesLocations;

DevicesLocations.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    location_id: {
      type: DataTypes.UUID,
    },
    device_id: {
      type: DataTypes.UUID,
    },
  },
  {
    sequelize,
    timestamps: true,
    modelName: 'DevicesLocations',
    tableName: 'device_locations',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
);

DevicesLocations.belongsTo(Location, { foreignKey: 'location_id' });
DevicesLocations.belongsTo(Device, { foreignKey: 'device_id' });
