import { Model, DataTypes } from 'sequelize';
import Role from './role.mjs';
import { sequelize } from '../db.mjs';
import Organization from './organization.mjs';
import Timezone from './timezone.mjs';

class User extends Model {}
export default User;

User.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    full_name: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
    },
    // foreign key->roles.id,
    role_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    organization_id: {
      type: DataTypes.UUID,
    },
    details: {
      type: DataTypes.JSONB,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
    },
    phoneNo: {
      type: DataTypes.STRING,
    },
    // foreign key->roles.id,
    timezoneid: {
      type: DataTypes.UUID,
    },
  },
  {
    timestamps: true,
    sequelize,
    modelName: 'User',
    tableName: 'users',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    defaultScope: {
      attributes: { exclude: ['password'] },
    },
  },
);

// relations here
User.belongsTo(Organization, {
  foreignKey: 'organization_id',
});

// relation between user and bay
User.belongsTo(Role, { foreignKey: 'role_id' });
User.belongsTo(Timezone, { foreignKey: 'timezoneid' });
