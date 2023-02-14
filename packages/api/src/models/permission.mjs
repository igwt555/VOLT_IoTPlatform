import {
  Model,
  DataTypes,
} from 'sequelize';
import {
  sequelize,
} from '../db.mjs';
import Organization from './organization.mjs';

export default class Permission extends Model { }

Permission.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // foreign key->organization.id,
  organization_id: {
    type: DataTypes.UUID,
    allowNull: true,
    defaultValue: null,
  },
}, {
  sequelize,
  timestamps: true,
  modelName: 'Permission',
  tableName: 'permissions',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

Permission.belongsTo(Organization, {
  foreignKey: 'organization_id',
});

const permissions = {
  loginAccess: new Permission({
    id: 'b3927687-2fd1-419f-b9ec-97bc76e990b6',
    name: 'Login Access',
  }),
  viewUsers: new Permission({
    id: '3f67341c-6aeb-466b-808b-6bcdd2d4fda6',
    name: 'View Users',
  }),
  createDeleteRenameAccounts: new Permission({
    id: 'fbeb5f50-758f-4b47-8c8e-0c118337f55f',
    name: 'Create/Delete/Rename Accounts',
  }),
  userManagement: new Permission({
    id: '99d4cff9-a2d7-4654-a7eb-e39554ef49cc',
    name: 'User Management',
  }),
  viewOrgAccounts: new Permission({
    id: '82e9e7cd-c787-417a-91c2-cb98da76595b',
    name: 'View Organizations/Accounts',
  }),
  createLocations: new Permission({
    id: '80e9f382-6686-4269-9ea2-f4ad306ca433',
    name: 'Create location',
  }),
  viewLocations: new Permission({
    id: 'dff4aad0-0616-4d97-aae1-45f1d7a465b0',
    name: 'View location',
  }),
  deleteLocations: new Permission({
    id: '4cfe7313-b3f8-4955-8522-85f64806b414',
    name: 'Delete location',
  }),
  updateLocations: new Permission({
    id: '4cfe7313-b3f8-4955-8522-85f64806b415',
    name: 'Update location',
  }),
  createUpdateDeleteRoles: new Permission({
    id: '3311b290-9155-44c0-990e-8aee69f3a479',
    name: 'Create/Update/Delete roles',
  }),
  createUpdateDeleteConfig: new Permission({
    id: '60b76502-8f99-4699-98b8-1ede1f42aba1',
    name: 'Create/Update/Delete Configuration',
  }),
  viewReports: new Permission({
    id: '18f34ac2-698e-11ed-a1eb-0242ac120002',
    name: 'View Reports',
  }),
  viewAlerts: new Permission({
    id: '1fe936b6-698e-11ed-a1eb-0242ac120002',
    name: 'View Alerts',
  }),
  viewUnits: new Permission({
    id: 'b24686e0-6992-11ed-a1eb-0242ac120002',
    name: 'View Units',
  }),
};

Permission.generalPermissions = permissions;

Permission.getAllPermissions = () => Object.values(permissions);

Permission.getPermissionById = id => Object.values(permissions).filter(value => value.id === id);

Permission.getPermissionByNameAndId = (id, name) => Object.values(permissions)
  .filter(value => value.id === id && value.name === name);
