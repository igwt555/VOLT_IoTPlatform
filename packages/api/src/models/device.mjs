import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../db.mjs';
import Organization from './organization.mjs';

class Device extends Model {}
export default Device;

Device.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    serial_num: {
      type: DataTypes.INTEGER,
    },
    mac_addr_eth: {
      type: DataTypes.STRING,
    },
    mac_addr_wifi: {
      type: DataTypes.STRING,
    },
    device_data: {
      type: DataTypes.STRING,
    },
    app_id: {
      type: DataTypes.STRING,
    },
    current_release_id: {
      type: DataTypes.STRING,
    },
    target_release_id: {
      type: DataTypes.STRING,
    },
    name: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.STRING,
    },
    is_online: {
      type: DataTypes.STRING,
    },
    last_connectivity_event: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    is_connected_to_vpn: {
      type: DataTypes.STRING,
    },
    last_vpn_event: {
      type: DataTypes.STRING,
    },
    ip_address: {
      type: DataTypes.STRING,
    },
    vpn_address: {
      type: DataTypes.STRING,
    },
    public_address: {
      type: DataTypes.STRING,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
    },
    organization_id: {
      type: DataTypes.UUID,
    },
  },
  { timestamps: true, sequelize, modelName: 'Device', tableName: 'devices', createdAt: 'created_at', updatedAt: 'updated_at' },
);

// relations here
Device.belongsTo(Organization, {
  foreignKey: 'organization_id',
});
