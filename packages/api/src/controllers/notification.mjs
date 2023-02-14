import Notification from '../models/notification.mjs';

// eslint-disable-next-line import/prefer-default-export
export const findAll = async (_req, res) => {
  const notifications = await Notification.findAll();
  return res.json({
    success: true,
    notifications,
  });
};
