import { Model, DataTypes } from 'sequelize';
import { onDbReady, sequelize } from '../db.mjs';
import Organization from './organization.mjs';
import RolePermission from './role_permission.mjs';

class Role extends Model {}
export default Role;

Role.init(
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
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    organization_id: {
      type: DataTypes.UUID,
    },
  },
  {
    sequelize,
    timestamps: true,
    modelName: 'Role',
    tableName: 'roles',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
);

// relations here
Role.hasMany(RolePermission, { foreignKey: 'role_id' });
Role.belongsTo(Organization, {
  foreignKey: 'organization_id',
});

// eslint-disable-next-line no-return-await
export const superAdminRole = onDbReady.then(async () => {
  await Role.findOrCreate({
    where: {
      id: '00000000-0000-0000-0000-000000000000',
    },
    defaults: {
      name: 'Super Admin',
      description: 'Users with the ability to add/remove other admins & superadmins',
    },
  });
});

// eslint-disable-next-line no-return-await
export const adminRole = onDbReady.then(async () => {
  await Role.findOrCreate({
    where: {
      id: '7f57a8fb-6af8-4cb9-b72c-205f583d5a79',
    },
    defaults: {
      name: 'Admin',
      description: 'Users with the ability to add/remove other admins',
    },
  });
});

// eslint-disable-next-line no-return-await
export const basicAccessRole = onDbReady.then(async () => {
  await Role.findOrCreate({
    where: {
      id: '12ebf608-1986-4927-96fa-fc0d9007e708',
    },
    defaults: {
      name: 'Standard Access',
      description: 'Users with the basic access on the platform',
    },
  });
});

const roles = {
  superAdmin: new Role({
    id: '00000000-0000-0000-0000-000000000000',
    name: 'Super Admin',
  }),
  admin: new Role({
    id: '7f57a8fb-6af8-4cb9-b72c-205f583d5a79',
    name: 'Admin',
  }),
  basicAccess: new Role({
    id: '12ebf608-1986-4927-96fa-fc0d9007e708',
    name: 'Standard Access',
  }),
};
Role.genralRoles = roles;
