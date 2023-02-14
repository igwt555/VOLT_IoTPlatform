import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../db.mjs';
import Domain from './domain.mjs';
import Organization from './organization.mjs';
import Provider from './provider.mjs';

class Directory extends Model {}
export default Directory;

Directory.init(
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
    provider_id: {
      type: DataTypes.UUID,
    },
    domain_id: {
      type: DataTypes.UUID,
    },
    organization_id: {
      type: DataTypes.UUID,
    },
  },
  {
    sequelize,
    timestamps: true,
    modelName: 'Directory',
    tableName: 'directory',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
);

Directory.belongsTo(Organization, { foreignKey: 'organization_id' });
Directory.belongsTo(Provider, { foreignKey: 'provider_id' });
Directory.belongsTo(Domain, { foreignKey: 'domain_id' });
