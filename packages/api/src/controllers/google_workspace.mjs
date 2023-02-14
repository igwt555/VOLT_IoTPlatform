import process from 'process';
import googlePkg from 'googleapis';
// eslint-disable-next-line import/no-extraneous-dependencies
import pkg from 'google-auth-library';
import { v4 as uuidv4 } from 'uuid';
import * as UserService from '../services/user.mjs';
import Organization from '../models/organization.mjs';
import Role from '../models/role.mjs';
import User from '../models/user.mjs';

const { OAuth2Client } = pkg;
const { google } = googlePkg;

const getGoogleWorkspaceToken = async organizationId => {
  try {
    const organization = await Organization.findOne({
      where: {
        id: organizationId,
      },
    });

    const res = organization.google_workspace_token;
    return res;
  } catch (err) {
    console.log(err);
    return null;
  }
};

const getGoogleUsers = async (client, organizationId, req) => {
  const service = google.admin({ version: 'directory_v1', auth: client });
  const workspaceToken = await getGoogleWorkspaceToken(organizationId);
  if (workspaceToken != null) {
    const { token } = workspaceToken;

    // update token in db
    if (req.body.Domain !== token.domain) {
      token.domain = req.body.Domain;
      const obj = {};
      obj.token = token;
      await Organization.update(
        { google_workspace_token: obj },
        { where: { id: organizationId } },
      );
    }

    const resp = await service.users.list({
      domain: token.domain,
    });
    if (resp != null) {
      resp.data.users.forEach(async item => {
        const user = await User.findOne({
          where: { email: item.primaryEmail },
          plain: true,
        });
        if (user == null) {
          const data = {
            is_active: true,
            password: '',
            full_name: item.name.fullName || null,
            email: item.primaryEmail,
            organization_id: organizationId,
            role_id: Role.genralRoles.basicAccess.id,
          };
          await UserService.create(data);
        }
      });
      if (workspaceToken.WebhookDetail === undefined || Object.keys(workspaceToken.WebhookDetail).length === 0) {
        const address = (`https://${req.host}/api/google/webhookListener`);
        // const ttl = 3600; // Or any other TTL that you can think of
        const WebhookDetail = {};
        let result = await service.users.watch(
          { domain: token.domain, auth: client, event: 'UPDATE' },
          {
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: uuidv4(), type: 'web_hook', address, token: `${organizationId}` }),
          },
        );
        if (result != null) {
          WebhookDetail.update = { channelId: result.data.id, resourceId: result.data.resourceId };
        }

        result = await service.users.watch(
          { domain: token.domain, auth: client, event: 'ADD' },
          {
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: uuidv4(), type: 'web_hook', address, token: `${organizationId}` }),
          },
        );
        if (result != null) {
          WebhookDetail.add = { channelId: result.data.id, resourceId: result.data.resourceId };
        }

        result = await service.users.watch(
          { domain: token.domain, auth: client, event: 'DELETE' },
          {
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: uuidv4(), type: 'web_hook', address, token: `${organizationId}` }),
          },
        );
        if (result != null) {
          WebhookDetail.delete = { channelId: result.data.id, resourceId: result.data.resourceId };
        }

        result = await service.users.watch(
          { domain: token.domain, auth: client, event: 'UNDELETE' },
          {
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: uuidv4(), type: 'web_hook', address, token: `${organizationId}` }),
          },
        );
        if (result != null) {
          WebhookDetail.undelete = { channelId: result.data.id, resourceId: result.data.resourceId };
        }

        workspaceToken.WebhookDetail = WebhookDetail;
        await Organization.update(
          { google_workspace_token: workspaceToken },
          { where: { id: organizationId } },
        );
      }
      return resp.data.users;
    }
  }
  return null;
};

const saveCredentials = async (client, state) => {
  const parsedRes = JSON.parse(state);
  const payload = {
    type: 'authorized_user',
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    refresh_token: client.credentials.refresh_token,
    email: parsedRes.email,
    domain: parsedRes.domain,
  };

  const obj = {};
  obj.token = payload;

  const res = await Organization.update(
    { google_workspace_token: obj },
    { where: { id: parsedRes.organization_id } },
  );
  return res;
};

const loadSavedCredentialsIfExist = async organizationId => {
  try {
    const credentials = await getGoogleWorkspaceToken(organizationId);
    if (credentials != null) {
      const { token } = credentials;
      return google.auth.fromJSON(token);
    }
    return null;
  } catch (err) {
    return null;
  }
};

const getAuthenticatedClient = async (email, stateString, req) => {
  const oAuth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `https://${req.host}/api/google/oauthCallback`,
  );

  const authorizeUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: process.env.GOOGLE_SCOPE,
    login_hint: email,
    prompt: 'consent',
    state: stateString,
  });
  return { isAuthorized: false, authorizeUrl };
};

export const authenticateUser = async (req, res) => {
  const stateString = JSON.stringify({
    email: req.body.Email,
    domain: req.body.Domain,
    organization_id: req?.user?.organization_id });
  const response = await getAuthenticatedClient(req.body.Email, stateString, req);
  return res.json(response);
};

export const oauthCallback = async (req, res) => {
  const oAuth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `https://${req.host}/api/google/oauthCallback`,
  );
  let msg = '';
  // Now that we have the code, use that to acquire tokens.
  const r = await oAuth2Client.getToken(req.query.code);
  // Make sure to set the credentials on the OAuth2 client.
  oAuth2Client.setCredentials(r.tokens);
  if (oAuth2Client.credentials) {
    const result = await saveCredentials(oAuth2Client, req.query.state);
    if (result != null) {
      msg = 'success'; // 'Authentication successful. Please close this window';
    }
  } else {
    msg = 'fail'; // 'Authentication unsuccessful';
  }
  if (msg === 'success') {
    const appURL = process.env.NODE_ENV === 'production' ? `https://${req.host}/configuration?config=true` : `${process.env.VITE_FRONTEND_URL}/configuration?config=true`;
    res.redirect(appURL);
  } else {
    res.send('Authentication unsuccessful');
  }
};

export const syncUser = async (req, res) => {
  try {
    const client = await loadSavedCredentialsIfExist(req?.user?.organization_id);
    if (client) {
      await getGoogleUsers(client, req?.user?.organization_id, req);
    }
    return res.send({ message: '', success: true });
  } catch (err) {
    return res.send({ message: err.message, success: false });
  }
};

const getGoogleUserByEmailId = async (emailId, organizationId) => {
  const client = await loadSavedCredentialsIfExist(organizationId);
  if (client) {
    const service = google.admin({ version: 'directory_v1', auth: client });

    const workspaceToken = await getGoogleWorkspaceToken(organizationId);
    if (workspaceToken != null) {
      const { token } = workspaceToken;
      const response = await service.users.list({
        domain: token.domain,
        query: `email='${emailId}'`,
      });
      return response.data.users;
    }
  } else {
    return null;
  }
  return null;
};

// eslint-disable-next-line no-unused-vars
export const webhookListener = async (req, res) => {
  const userEmail = req?.body?.primaryEmail;
  if (userEmail != null) {
    if (req.headers['x-goog-resource-state'] === 'delete') {
      const user = await User.findOne({
        where: { email: userEmail },
        plain: true,
      });
      const { id } = user;
      const body = {};
      body.is_active = false;

      await User.update(body, {
        where: { id },
        include: [{ model: Role }],
        returning: true,
        plain: true,
      });
    } else if (req.headers['x-goog-resource-state'] === 'undelete') {
      const user = await User.findOne({
        where: { email: userEmail },
        plain: true,
      });
      const { id } = user;
      const body = {};
      body.is_active = true;

      await User.update(body, {
        where: { id },
        include: [{ model: Role }],
        returning: true,
        plain: true,
      });
    } else if (req.headers['x-goog-resource-state'] === 'add' || req.headers['x-goog-resource-state'] === 'update') {
      const googleUser = await getGoogleUserByEmailId(userEmail, req.headers['x-goog-channel-token']);
      if (googleUser != null) {
        const user = await User.findOne({
          where: { email: userEmail },
          plain: true,
        });
        if (user === null) {
          const data = {
            is_active: true,
            password: '',
            full_name: googleUser[0].name.fullName || null,
            email: googleUser[0].primaryEmail,
            organization_id: req.headers['x-goog-channel-token'],
            role_id: Role.genralRoles.basicAccess.id,
          };
          await UserService.create(data);
        } else {
          const { id } = user;
          const body = {};
          body.is_active = true;
          body.full_name = googleUser[0].name.fullName;

          await User.update(body, {
            where: { id },
            include: [{ model: Role }],
            returning: true,
            plain: true,
          });
        }
      }
    }
  }
};

export const stopWebhook = async (req, res) => {
  try {
    const client = await loadSavedCredentialsIfExist(req?.user?.organization_id);
    if (client) {
      const service = google.admin({ version: 'directory_v1', auth: client });
      const organization = await Organization.findOne({
        where: {
          id: req?.user?.organization_id,
        },
      });

      const result = organization.google_workspace_token;
      if (result != null) {
        const { WebhookDetail } = result;
        if (WebhookDetail) {
          // eslint-disable-next-line no-restricted-syntax
          for (const key of Object.keys(WebhookDetail)) {
            // eslint-disable-next-line no-await-in-loop
            const response = await service.channels.stop({
              requestBody: {
                id: WebhookDetail[key].channelId,
                resourceId: WebhookDetail[key].resourceId,
              },
            });
            if (response != null) {
              delete WebhookDetail[key];
            }
          }
        }

        await Organization.update(
          { google_workspace_token: null },
          { where: { id: req?.user?.organization_id } },
        );
      }
    }
    return res.json({ message: '', success: true });
  } catch (err) {
    return res.json({ message: err.message, success: false });
  }
};
