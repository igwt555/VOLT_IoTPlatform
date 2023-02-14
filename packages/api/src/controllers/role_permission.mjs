import RolePermission from '../models/role_permission.mjs';

export const create = async (req, res) => {
  const rolePermissionCreated = await RolePermission.create({
    role_id: req.body.role_id,
    permission_id: req.body.permission_id,
    organization_id: req?.user?.organization_id,
  });
  return res.json({ rolePermission: rolePermissionCreated, success: true });
};

export const getAllPermissions = async (req, res) => {
  const allPermissions = await RolePermission.findAll({ where: { organization_id: req?.user?.organization_id } });
  return res.json({ permissions: allPermissions, success: true });
};

export const getPermissionById = async (req, res) => {
  const { roleId } = req.query;
  const permission = await RolePermission.findAll({
    where: { role_id: roleId, organization_id: req?.user?.organization_id } });
  return res.json({ permission, success: true });
};

export const getAllPermissionByRoleId = async (req, res) => {
  const { roleId } = req.query;
  if (!roleId) return res.json({ permission: [], success: true });
  const permissionIds = await RolePermission.findAll({
    where: { role_id: roleId, organization_id: req?.user?.organization_id },
  });

  return res.json({ permission: permissionIds, success: true });
};

export const deletePermission = async (req, res) => {
  const { roleId, permissionId } = req.query;
  const result = await RolePermission.destroy({
    where: {
      role_id: roleId, permission_id: permissionId, organization_id: req?.user?.organization_id,
    },
    returning: true,
    plain: true,
  });

  if (result === 1) {
    return res.status(200).json({ message: 'Permission unassigned', success: true });
  }
  return res.status(400)
    .json({ message: 'An error occured while unuassigning this permission', success: false });
};
