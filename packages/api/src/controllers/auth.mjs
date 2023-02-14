import httpErrors from 'http-errors';
import bcrypt from 'bcrypt';
import 'dotenv/config';
import jwt from 'jsonwebtoken';
import * as UserService from '../services/user.mjs';
import { sendForgetPassEmail, changePasswordEmail } from '../helpers/email.mjs';
import EmailNotification from '../models/email_notification.mjs';
import RolePermission from '../models/role_permission.mjs';
import Permission from '../models/permission.mjs';
import User from '../models/user.mjs';
import Organization from '../models/organization.mjs';
import Role from '../models/role.mjs';

const { JWT_SECRET_KEY } = process.env;
const INVALID_CREDS = 'Invalid Email or Password';

export const login = async (req, res) => {
  const { email, password } = req.body;
  // need the password to be returned here
  const user = await User.findOne({
    attributes: ['id', 'full_name', 'email', 'is_active', 'organization_id', 'role_id', 'password'],
    where: { email },
    include: [{ model: Organization }, { model: Role }],
    raw: true,
  });

  if (!user || !user?.password) throw new httpErrors.BadRequest(INVALID_CREDS);
  const isValidPw = await bcrypt.compare(password, user.password);
  if (!isValidPw) throw new httpErrors.BadRequest(INVALID_CREDS);

  if (user.is_active === false) {
    throw new httpErrors.BadRequest('This account is currently suspended. Please contact your administrator if you require assistance.');
  }

  const permissions = await RolePermission.findAll({ attributes: ['permission_id'], where: { role_id: user.role_id, organization_id: user.organization_id }, raw: true });
  // TODO: cleanup: we may get back an array of Permissions (check x.id) or RolePermissions (check x.permission_id)
  const hasLoginPerm = permissions.some(x => [x.id, x.permission_id].includes(
    Permission.generalPermissions.loginAccess.id,
  ));
  if (!hasLoginPerm) throw new httpErrors.BadRequest('Access Denied');

  const token = jwt.sign({
    sub: user.id,
    userName: user.full_name,
  }, JWT_SECRET_KEY);

  return res.json({
    success: true,
    token,
    // TODO: find out if the front-end is depending on this, and eliminate the depedency
    // user details should not be getting retrieved via /login
    user: { ...user, password: undefined },
  });
};

export const loginWithToken = async (req, res) => {
  const { token } = req.body;

  let isValidToken = false;
  let email;
  try {
    email = jwt.verify(token, JWT_SECRET_KEY).email;
    isValidToken = true;
  } catch (e) {
    isValidToken = false;
  }

  if (isValidToken) {
    const user = await User.findOne({
      where: { email },
      include: [{ model: Organization }, { model: Role }],
      plain: true,
    });
    if (!user) throw new httpErrors.BadRequest('Email does not exists');

    if (user.is_active === false) {
      throw new httpErrors.BadRequest('This account is currently suspended. Please contact your administrator if you require assistance.');
    }

    const permissions = await RolePermission.findAll({ attributes: ['permission_id'], where: { role_id: user.role_id, organization_id: user.organization_id }, raw: true });
    // TODO: cleanup: we may get back an array of Permissions (check x.id) or RolePermissions (check x.permission_id)
    const hasLoginPerm = permissions.some(x => [x.id, x.permission_id].includes(
      Permission.generalPermissions.loginAccess.id,
    ));
    if (!hasLoginPerm) throw new httpErrors.BadRequest('Access Denied');

    const loginToken = jwt.sign({
      sub: user.id,
      userName: user.full_name,
    }, JWT_SECRET_KEY);

    return res.json({
      success: true,
      token: loginToken,
      user,
    });
  }
  throw new httpErrors.BadRequest('Token does not exists');
};

export const sendForgetPasswordEmail = async (req, res) => {
  const { id, email, host, sendBy } = req.body;
  let userFound;
  if (id) {
    userFound = await User.findOne({
      where: { id },
      plain: true,
    });
  } else {
    userFound = await User.findOne({
      where: { email },
      plain: true,
    });
  }

  if (!userFound) throw new httpErrors.BadRequest('User not found');

  const token = jwt.sign(
    { sub: userFound.id, userName: userFound.full_name },
    JWT_SECRET_KEY,
    { expiresIn: '15m' },
  );

  const link = `${host}/changePass/${userFound.id}/${encodeURIComponent(token.replaceAll('.', '$'))}`;
  const subject = 'Your password reset link';
  const emailBody = `<div>
      <h1>Reset Your Password</h1>
      <p>Please click the link below to reset your password.</p>
      <p>
        <a href="${link}" style="color:white; background: #266aca; border-color: gray; border-radius: 4px; display: inline-block; padding: 14px 40px; text-decoration: none;">
          Reset your password
        </a>
      </p>
      <p><span style="font-weight: bold">Please note: </span> This link will expire in 15 minutes.</p>
    </div>
    `;
  try {
    const mailRes = await sendForgetPassEmail(userFound.email, subject, emailBody);

    if (mailRes.messageId) {
      const emailData = {
        recipient: mailRes.envelope.to[0],
        sender_email: mailRes.envelope.from,
        email_body: emailBody,
        message_id: mailRes.messageId,
        subject,
        user_id: sendBy ?? id,
        sent: mailRes.accepted.length ? 1 : 0,
        undelivered: mailRes.rejected.length ? 1 : 0,
      };
      await EmailNotification.create(emailData);

      return res.json({
        message: `Instructions for password reset have been sent to: ${userFound.email}`,
        success: true,
      });
    }
  } catch {
    return res.status(400).json({
      error: {
        message: 'An error occured processing your password reset request',
      },
    });
  }
  return res.status(500);
};

// eslint-disable-next-line consistent-return
export const forgetPassword = async (req, res) => {
  const { password } = req.body;
  const { id, token } = req.params;
  const userFound = await UserService.getUserById(id);
  if (!userFound) {
    return res.status(400).json({
      error: {
        message: 'Invalid credentials',
        success: false,
      },
    });
  }
  jwt.verify(decodeURIComponent(token.replaceAll('$', '.')), JWT_SECRET_KEY, async (err, decoded) => {
    if (!decoded) {
      return res.status(400).json({
        error: {
          message: 'Your password reset request has expired. We have sent you a new email confirmation',
          resendEmail: true,
        },
      });
    }
    const hash = await bcrypt.hash(password, 10);
    await User.update({ password: hash }, {
      where: { id },
      include: [{ model: Role }],
      returning: true,
      plain: true,
    });
    return res.json({
      message: 'Password changed successfully!',
      success: true,
    });
  });
};

export const changePassEmail = async (req, res) => {
  const { email } = req.body;
  await changePasswordEmail(email, req.user.organization_id);
  return res.json({
    message: 'password reset mail send successfully',
    success: true,
  });
};

export const changePass = async (req, res) => {
  const { email, password } = req.body;
  const userFound = await User.update({ password }, {
    where: { email },
    include: [{ model: Role }],
    returning: true,
    plain: true,
  });
  return res.json({
    message: 'Password changed successfully!',
    success: true,
    user: userFound[1],
  });
};

export const updatePassword = async (req, res) => {
  if (!req.user) {
    return res.json({ message: 'The user does not exist', success: false });
  }
  const { id } = req.user;
  const user = await User.findOne({ attributes: ['password'], where: { id } });

  const { password, newPassword, passwordConfirmation } = req.body;
  if (newPassword !== passwordConfirmation) {
    return res.json({ message: 'The passwords do not match', success: false });
  }

  const comparison = bcrypt.compareSync(password, user.password);
  if (!comparison) {
    return res.json({ message: 'Invalid current password', success: false });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const userResult = await UserService.update({ id }, { password: hashedPassword });
  if (!userResult) {
    return res.json({ message: 'Something went wrong, please try again', success: false });
  }
  return res.json({
    message: 'Password changed successfully!',
    success: true,
    user: userResult,
  });
};

export const refreshToken = async (req, res) => {
  if (!req.user) {
    return res.status(422).json({ message: 'The user does not exist', success: false });
  }
  const { user } = req;
  const token = jwt.sign({
    sub: user.id,
    userName: user.full_name,
  }, JWT_SECRET_KEY);

  return res.json({
    success: true,
    token,
    user,
  });
};
