import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../db.mjs';
import Organization from './organization.mjs';

class SamlProvider extends Model { }
export default SamlProvider;

SamlProvider.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    organization_id: {
      type: DataTypes.UUID,
    },
    name: {
      type: DataTypes.STRING,
    },
    type: {
      type: DataTypes.STRING,
    },
    logo_filename: {
      type: DataTypes.STRING,
    },
    entry_point: {
      type: DataTypes.STRING,
    },
    cert: {
      type: DataTypes.STRING(5000),
    },
  },
  {
    sequelize,
    timestamps: true,
    modelName: 'SamlProvider',
    tableName: 'saml_provider',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
);

SamlProvider.belongsTo(Organization, {
  foreignKey: 'organization_id',
});
