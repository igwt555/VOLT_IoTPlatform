import Permission from '../models/permission.mjs';

export const getAllPermissions = async (req, res) => {
  const permissions = await Permission.getAllPermissions();
  return res.json({ permissions, success: true });
};

export const getPermissionById = async (req, res) => {
  const { id } = req.query;
  const permission = Permission.getPermissionById(id);
  return res.json({ permission, success: true });
};
