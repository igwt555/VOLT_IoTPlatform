/* eslint-disable indent */
import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../db.mjs';
import Organization from './organization.mjs';
import Permission from './permission.mjs';

class RolePermission extends Model {
  // findAll(opts) {
  //   console.log({ opts });
  //   return this.Model.DAO.prototype.save.apply(this, arguments);
  // }
}
export default RolePermission;

RolePermission.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    // foreign key->roles.id,
    role_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    // foreign key->permission.id,
    permission_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    // foreign key->organization.id,
    organization_id: {
      type: DataTypes.UUID,
      // allowNull: false,
    },
  },
  {
    sequelize,
    timestamps: true,
    modelName: 'RolePermission',
    tableName: 'role_permissions',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
);

const superAdminPermissions = Object.values(Permission.generalPermissions);

const adminPermissions = [
  Permission.generalPermissions.loginAccess,
  Permission.generalPermissions.createLocations,
  Permission.generalPermissions.viewLocations,
  Permission.generalPermissions.deleteLocations,
  Permission.generalPermissions.viewReports,
];

const standardUserPermissions = [
  Permission.generalPermissions.loginAccess,
  Permission.generalPermissions.viewLocations,
];

RolePermission.findAllOrig = RolePermission.findAll;
// eslint-disable-next-line arrow-body-style
RolePermission.findAll = async opts => {
  const permissions = opts?.where?.role_id === '00000000-0000-0000-0000-000000000000' ? superAdminPermissions :
                      opts?.where?.role_id === '7f57a8fb-6af8-4cb9-b72c-205f583d5a79' ? adminPermissions :
                      opts?.where?.role_id === '12ebf608-1986-4927-96fa-fc0d9007e708' ? standardUserPermissions :
                      await RolePermission.findAllOrig({ ...opts, attributes: ['permission_id'] });
  // we may get back an array of new/unpersisted sqlize object that are fine to use as is
  // or we may need to pluck the data value from .dataValues, if we're getting a non-raw response
  return permissions.map(p => p.dataValues || p);
};

RolePermission.belongsTo(Organization, { foreignKey: 'organization_id' });
RolePermission.belongsTo(Permission, { foreignKey: 'permission_id' });
