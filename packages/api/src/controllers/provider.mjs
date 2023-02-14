import Provider from '../models/provider.mjs';

export const create = async (req, res) => {
  await Provider.create({
    name: req.body?.name,
    type: req.body?.type,
    protocol: req.body?.protocol,
    certificate_type: req.body?.certificate_type,
    description: req.body?.description,
  });
  const providers = await Provider.findAll();
  return res.json({ providers, success: true });
};

export const findAll = async (req, res) => {
  const providers = await Provider.findAll();
  return res.json({ providers, success: true });
};

export const findByProviderId = async (req, res) => {
  const { providerId } = req.params;
  const provider = await Provider.findOne({ where: { id: providerId } });
  return res.json({ provider, success: true });
};
