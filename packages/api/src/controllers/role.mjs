import httpErrors from 'http-errors';
import Permissions from '../models/permission.mjs';
import Role from '../models/role.mjs';

export const create = async (req, res) => {
  if (!req.user.permissions.includes(Permissions.generalPermissions.createUpdateDeleteRoles.id)) {
    return res.status(403).json({ message: 'Access denied', success: false });
  }
  const orgId = req?.user?.organization_id;

  if (!orgId) {
    throw new httpErrors.BadRequest("Organization doesn't exists.");
  }

  const roleCreated = await Role.create({
    name: req.body.name,
    description: req.body.description,
    organization_id: orgId,
  });
  return res.json({ org: roleCreated, success: true });
};

export const getAllRoles = async (req, res) => {
  if (!req.user.permissions.includes(Permissions.generalPermissions.createUpdateDeleteRoles.id)) {
    return res.status(403).json({ message: 'Access denied', success: false });
  }
  const organizationId = req?.user?.organization_id;
  const currentUserRoleId = req?.user?.role_id;
  const customRoles = await Role.findAll({
    where: { organization_id: organizationId },
    order: [['created_at', 'ASC']],
    raw: true,
  });
  let fullRoleList = [];
  if (currentUserRoleId === Role.genralRoles.superAdmin.id) { // superadmin
    fullRoleList = [Role.genralRoles.superAdmin, Role.genralRoles.admin, Role.genralRoles.basicAccess, ...customRoles];
  } else if (currentUserRoleId === Role.genralRoles.admin.id) {
    fullRoleList = [Role.genralRoles.admin, Role.genralRoles.basicAccess, ...customRoles];
  } else {
    fullRoleList = customRoles;
  }
  return res.json({ roles: fullRoleList, success: true });
};

export const getRoleById = async (req, res) => {
  if (!req.user.permissions.includes(Permissions.generalPermissions.createUpdateDeleteRoles.id)) {
    return res.status(403).json({ message: 'Access denied', success: false });
  }
  const { id } = req.query;
  const role = await Role.findAll({ where: { id, organization_id: req?.user?.organization_id } });
  return res.json({ role, success: true });
};

export const update = async (req, res) => {
  if (!req.user.permissions.includes(Permissions.generalPermissions.createUpdateDeleteRoles.id)) {
    return res.status(403).json({ message: 'Access denied', success: false });
  }
  const { name, id } = req.body;
  const updatedRole = await Role.update({ name }, {
    where: { id, organization_id: req?.user?.organization_id }, returning: true, plain: true });
  return res.json({ role: updatedRole[1], success: true });
};

export const deleteRole = async (req, res) => {
  if (!req.user.permissions.includes(Permissions.generalPermissions.createUpdateDeleteRoles.id)) {
    return res.status(403).json({ message: 'Access denied', success: false });
  }
  const { id } = req.params;
  const result = await Role.destroy({
    where: { id, organization_id: req?.user?.organization_id }, returning: true, plain: true });
  if (result === 1) {
    return res.status(200)
      .json({ message: 'Role deleted successfully!', success: true });
  }
  return res.status(400)
    .json({ message: 'An issue occured while deleting this role', success: false });
};
