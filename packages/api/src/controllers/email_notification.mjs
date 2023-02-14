import EmailNotification from '../models/email_notification.mjs';

export const getEmailNotification = async (req, res) => {
  const notification = await EmailNotification.findAll();
  return res.json({ notification, status: true });
};

export const create = async (req, res) => {
  const newNotification = await EmailNotification.create({ ...req.body });
  return res.json({ newNotification, status: true });
};

export const getEmailByUserId = async (req, res) => {
  const { userId } = req.params;
  const userNotification = await EmailNotification.findAll({ where: { user_id: userId }, order: [['created_at', 'DESC']] });
  return res.json({ userNotification, status: true });
};
