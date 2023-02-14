import got from 'got';
import bodyParser from 'body-parser';
import EmailNotification from '../models/email_notification.mjs';

export const customParser = bodyParser.json({
  type(req) {
    if (req.headers['content-type'] === '') {
      req.headers['content-type'] = 'application/json';
    } else if (typeof req.headers['content-type'] === 'undefined') {
      req.headers['content-type'] = 'application/json';
    } else {
      req.headers['content-type'] = 'application/json';
    }
    return req.headers['content-type'];
  },
});

export const processAwsSnsEvent = async (req, res) => {
  if (req.body.SubscribeURL) {
    await got(req.body.SubscribeURL);
    return res.end();
  }

  const body = JSON.parse(req.body.Message);
  if (!body.eventType) {
    return res.end();
  }

  const event = body.eventType.toLowerCase();
  const { messageId } = body.mail;

  if (event === 'send') {
    await EmailNotification.update({ sent: 1 }, {
      where: { message_id: messageId },
      returning: true,
      plain: true,
    });
  } else if (event === 'delivery') {
    await EmailNotification.update({ received: 1 }, {
      where: { message_id: messageId },
      returning: true,
      plain: true,
    });
  } else if (event === 'reject') {
    await EmailNotification.update({ undelivered: 1 }, {
      where: { message_id: messageId },
      returning: true,
      plain: true,
    });
  } else if (event === 'open') {
    await EmailNotification.update({ opened: 1 }, {
      where: { message_id: messageId },
      returning: true,
      plain: true,
    });
  }
  return res.end();
};
