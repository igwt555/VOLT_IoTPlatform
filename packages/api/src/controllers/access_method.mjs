import { sequelize } from '../db.mjs';
import AccessMethod from '../models/access_method.mjs';
import { generatePincode } from '../utils/common.mjs';

export const findAll = async (req, res) => {
  const accessMethod = await AccessMethod.findAll();
  return res.json({ accessMethod, success: true });
};

export const create = async (req, res) => {
  const data = req.body?.type === 'pin_code' ? await generatePincode() : req.body?.data;
  await AccessMethod.create({
    type: req.body?.type,
    data,
    user_id: req.body?.user_id,
    active_from: req.body?.active_from ? req.body.active_from : new Date(),
    active_until: req.body?.active_until ? req.body.active_until : null,
  });
  const accessMethod = await AccessMethod.findAll();
  if (accessMethod.length) {
    const userAccessMethod = await AccessMethod.findAll({ where: { user_id: req.body?.user_id } });
    return res.json({ userAccessMethod, success: true });
  }
  return res.status(500);
};

export const assignUser = async (req, res) => {
  const { accessMethodId, userId } = req.body;
  const accessMethod = await AccessMethod.update(
    { user_id: userId },
    {
      where: { id: accessMethodId },
      returning: true,
      plain: true,
    },
  );
  return res.json({ accessMethod, success: true });
};

export const findByUserId = async (req, res) => {
  const { userId } = req.params;
  const userAccessMethod = await AccessMethod.findAll({ where: { user_id: userId } });
  return res.json({ userAccessMethod, success: true });
};

export const unassignUser = async (req, res) => {
  const { accessMethodId } = req.body;
  const accessMethod = await AccessMethod.update(
    { active_until: sequelize.fn('NOW') },
    {
      where: { id: accessMethodId },
      returning: true,
      plain: true,
    },
  );
  return res.json({ accessMethod, success: true });
};
export const updateAccessMetholdType = async (req, res) => {
  const { accessMethodId, type } = req.body;
  const accessMethod = await AccessMethod.update(
    { type },
    {
      where: { id: accessMethodId },
      returning: true,
      plain: true,
    },
  );
  return res.json({ accessMethod, success: true });
};
