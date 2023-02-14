import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../db.mjs';

class Organization extends Model {}
export default Organization;

Organization.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
    },
    logo_filename: {
      type: DataTypes.STRING,
    },
    favicon_filename: {
      type: DataTypes.STRING,
    },
    config: {
      type: DataTypes.JSON,
    },
    parent_org_id: {
      type: DataTypes.UUID,
    },
    settings: {
      type: DataTypes.JSONB,
    },
    manual: {
      type: DataTypes.STRING,
    },
    azure_ad_secret: {
      type: DataTypes.STRING(5000),
    },
    google_workspace_token: {
      type: DataTypes.JSON,
    },
  },
  {
    sequelize,
    timestamps: true,
    modelName: 'Organization',
    tableName: 'organizations',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
);
