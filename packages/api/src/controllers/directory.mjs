import httpErrors from 'http-errors';
import Directory from '../models/directory.mjs';
import Domain from '../models/domain.mjs';
import Provider from '../models/provider.mjs';

export const create = async (req, res) => {
  const data = req.body;
  const orgId = req?.user?.organization_id;
  const dirFound = await Directory.findOne({ where: { name: data.name } });
  if (dirFound) { throw new httpErrors.BadRequest('Directory name already exists'); }
  const directory = await Directory.create({
    name: data.name,
    type: data.type,
    provider_id: data.providerId,
    organization_id: orgId,
  });
  return res.json({ directory, success: true });
};

export const findAll = async (req, res) => {
  const orgId = req?.user?.organization_id;
  const directorys = await Directory.findAll({
    where: {
      organization_id: orgId,
    },
    include: [{ model: Provider }, { model: Domain }],
  });
  return res.json({ directorys, success: true });
};

export const findByDirectoryId = async (req, res) => {
  const { directoryId } = req.params;
  const directory = await Directory.findOne({
    where: {
      id: directoryId,
    },
    include: [{ model: Provider }, { model: Domain }],
  });
  return res.json({ directory, success: true });
};

export const updateDirectory = async (req, res) => {
  const orgId = req?.user?.organization_id;
  await Directory.update(req.body, {
    where: req.params,
    plain: true,
  });
  const directorys = await Directory.findAll({
    where: {
      organization_id: orgId,
    },
    include: [{ model: Provider }, { model: Domain }],
  });
  return res.json({ directorys, success: true });
};

export const deleteDirectory = async (req, res) => {
  const { dirId } = req.query;
  const deleteRes = await Directory.destroy({
    where: { id: dirId },
    returning: true,
    plain: true,
  });
  if (deleteRes === 1) {
    res.json({ message: 'Directory deleted successfully!', success: true });
  } else {
    throw new httpErrors.BadRequest('Something went wrong!!');
  }
};
