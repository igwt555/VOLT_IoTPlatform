import Domain from '../models/domain.mjs';

export const create = async (req, res) => {
  const domain = await Domain.create(req.body);
  return res.json({ domain, success: true });
};

export const findAll = async (req, res) => {
  const domains = await Domain.findAll();
  return res.json({ domains, success: true });
};

export const findByDomainId = async (req, res) => {
  const { domainId } = req.params;
  const domain = await Domain.findOne({ where: { id: domainId } });
  return res.json({ domain, success: true });
};
