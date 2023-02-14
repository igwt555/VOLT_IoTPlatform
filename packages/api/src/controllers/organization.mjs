import * as fs from 'fs';
import path from 'path';
import AWS from 'aws-sdk';
import jwt from 'jsonwebtoken';
import os from 'os';
import Organization from '../models/organization.mjs';
import constants from '../constant.mjs';
import { wsUnitNamespace } from '../wss.mjs';
import Device from '../models/device.mjs';

const { JWT_SECRET_KEY } = process.env;

const tmpfsPath = os.tmpdir();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export const create = async (req, res) => {
  if (!req?.body?.name) {
    return res.status(400).json({ success: false, message: 'Organization name is required' });
  }
  if (req.file) {
    const filePath = path.join(tmpfsPath, req.file.filename);
    const blob = fs.readFileSync(filePath);
    const params = {
      Key: req.file.filename,
      Body: blob,
      Bucket: process.env.AWS_S3_BUCKET_ORGANIZATION_LOGO,
    };
    const response = await s3.upload(params).promise().catch(err => { throw err; });
    if (response.Location) {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath, error => {
          console.error('err -->>', error);
        });
      }
      const orgCreated = await Organization.create({
        name: req.body?.name,
        logo_filename: req.body?.logo_filename,
        parent_org_id: req.body?.parent_org_id || constants.DEFAULT_PARENT_ORG_ID,
      });
      return res.json({ org: orgCreated, success: true, message: 'Account successfully added' });
    }
    return res.status(500).json({ success: false, message: 'An error occured while fulfilling this request' });
  }
  const orgCreated = await Organization.create({
    name: req.body?.name,
    logo_filename: req.body?.logo_filename,
    parent_org_id: req.body?.parent_org_id || constants.DEFAULT_PARENT_ORG_ID,
  });
  return res.json({ org: orgCreated, success: true, message: 'Account successfully added' });
};

export const update = async (req, res) => {
  const { id } = req.body;
  if (req.file) {
    const filePath = path.join(tmpfsPath, req.file.filename);
    const blob = fs.readFileSync(filePath);
    const params = {
      Key: req.file.filename,
      Body: blob,
      Bucket: process.env.AWS_S3_BUCKET_ORGANIZATION_LOGO,
    };
    const response = await s3.upload(params).promise().catch(err => { throw err; });
    if (response.Location) {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath, error => {
          console.error('err -->>', error);
        });
      }

      let updatedOrganization;
      if (req.body.type !== undefined) {
        if (req.body.type === 'Website Icon') {
          updatedOrganization = await Organization.update(
            { favicon_filename: response.Location },
            { where: { id: req.user?.organization_id }, returning: true, plain: true },
          );
        } else {
          updatedOrganization = await Organization.update(
            { logo_filename: response.Location },
            { where: { id: req.user?.organization_id }, returning: true, plain: true },
          );
        }
      } else {
        updatedOrganization = await Organization.update(
          { logo_filename: response.Location },
          { where: { id: req.user?.organization_id }, returning: true, plain: true },
        );
      }

      return res.json({ organization: updatedOrganization[1], success: true });
    }
    return res.status(500).json({
      success: false,
      message: 'An error occured while fulfilling this request',
    });
  }

  const updatedOrganization = await await Organization.update(
    { ...req.body },
    { where: { id }, returning: true, plain: true },
  );
  return res.json({ organization: updatedOrganization[1], success: true, message: 'Account updated successfully.' });
};
export const getChildOrgs = async (req, res) => {
  // TODO: update to look up child org OF ONLY CURRENTLY LOGGED IN USER
  let orgData = await Organization.findAll();
  orgData = orgData.map(org => ({
    key: org.dataValues.id,
    label: org.dataValues.name,
    parentId: org.dataValues.parent_org_id,
    manual: org.dataValues.manual,
  }));

  // find current org
  const orgTree = orgData.filter(org => org.key === req.user?.organization_id);
  // set lookup children of orgs and kick off next iteration of finding descendant orgs
  const linkChildOrgs = orgList => {
    orgList.forEach(orgChild => {
      // eslint-disable-next-line no-param-reassign
      orgChild.children = orgData.filter(org => org.parentId === orgChild.key);
      linkChildOrgs(orgChild.children);
    });
  };

  // kick off children lookup
  linkChildOrgs(orgTree);
  return res.json({ organizations: orgTree, success: true });
};

export const deleteOrg = async (req, res) => {
  const { id } = req.query;
  const org = await Organization.findAll({ where: { id } });
  const filename = org[0]?.dataValues?.logo_filename;
  const manualName = org[0]?.dataValues?.manual;
  // TODO: we should get just the child orgs and not filter afterwards
  const childOrgs = await Organization.findAll();
  const orgList = childOrgs.map(item => ({
    id: item.dataValues.id,
    name: item.dataValues.name,
    filename: item.dataValues.logo_filename,
    parent_id: item.dataValues.parent_org_id,
    manual: item.dataValues.manual,
  }));

  function findAllChild(oId, arr) {
    orgList
      .filter(child => child.parent_id === oId)
      .forEach(item => {
        arr.push(item);
        findAllChild(item.id, arr);
      });
    return arr;
  }

  const childArray = await findAllChild(id, []);
  childArray.forEach(async item => {
    fs.unlinkSync(
      path.join(__dirname, `../../static/${item.filename}`),
      err => {
        console.log('err -->>', err);
      },
    );
    if (item.manual) {
      fs.unlinkSync(
        path.join(__dirname, `../../static/${item.manual}`),
        err => {
          console.log('err -->>', err);
        },
      );
    }
    await Organization.destroy({ where: { id: item.id }, returning: true, plain: true });
  });
  if (filename) {
    fs.unlinkSync(
      path.join(__dirname, `../../static/${filename}`),
      err => {
        console.log('err -->>', err);
      },
    );
  }
  if (manualName) {
    fs.unlinkSync(
      path.join(__dirname, `../../static/${manualName}`),
      err => {
        console.log('err -->>', err);
      },
    );
  }
  const result = await Organization.destroy({ where: { id }, returning: true, plain: true });
  if (result === 1) {
    res
      .status(200)
      .json({ message: 'Organization deleted successfully!', success: true });
  } else {
    res
      .status(400)
      .json({ message: 'An error occured while deleting this organization', success: false });
  }
};

export const createFavicon = async (req, res) => {
  const { id } = req.body;
  if (!req.file) return res.status(400).json({ success: false, message: 'There was an issue locating your favicon upload' });

  const filePath = path.join(tmpfsPath, req.file.filename);
  const blob = fs.readFileSync(filePath);
  const params = {
    Key: req.file.filename,
    Body: blob,
    Bucket: process.env.AWS_S3_BUCKET_ORGANIZATION_FAVICON,
  };
  const response = await s3.upload(params)
    .promise()
    .catch(err => { throw err; });
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath, error => {
      console.error('err -->>', error);
    });
  }
  const updatedOrganization = await Organization.update(
    { favicon_filename: response?.Location },
    { where: { id }, returning: true, plain: true },
  );
  return res.json({ organization: updatedOrganization[1], success: true });
};

export const updateAlertPhoneNumbers = async (req, res) => {
  const { id, phoneNumbers } = req.body;
  if (!phoneNumbers) return res.json({ message: 'Please enter a valid phone number', success: false });
  const updatedOrganizationNumber = await Organization.update({
    settings: { alertPhoneNumbers: phoneNumbers },
  }, { where: { id }, returning: true, plain: true });
  return res.json({ organization: updatedOrganizationNumber[1], success: true });
};

export const getOrganizationData = async (req, res) => {
  const { id } = req.params;
  const orgData = await Organization.findAll({ where: { id } });
  return res.json({ organization: orgData[0], success: true });
};

export const uploadManualPdf = async (req, res) => {
  const { id } = req.body;
  if (!req.file) return res.status(400).json({ success: false, message: 'There was an issue locating your product manual upload' });

  const filePath = path.join(tmpfsPath, req.file.filename);
  const blob = fs.readFileSync(filePath);
  const params = {
    Key: `${id}/${req.file.filename}`,
    Body: blob,
    Bucket: process.env.AWS_S3_BUCKET_PRODUCT_MANUAL,
    ContentType: 'application/pdf',
  };
  const response = await s3.upload(params).promise().catch(err => { throw err; });
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath, error => {
      console.error('err -->>', error);
    });
  }
  const updatedOrganization = await Organization.update(
    { manual: response?.Location },
    { where: { id }, returning: true, plain: true },
  );
  return res.json({ organization: updatedOrganization[1], success: true, message: 'Manual Uploaded successfully' });
};

export const downloadManualPdf = async (req, res) => {
  const organization = await Organization.findOne({ where: { id: req.user.organization_id } });
  const fileName = organization.manual.substring(organization.manual.lastIndexOf('/') + 1);
  const params = {
    Key: `${req.user.organization_id}/${decodeURIComponent(fileName)}`,
    Bucket: process.env.AWS_S3_BUCKET_PRODUCT_MANUAL,
    Expires: 2000,
  };
  const url = s3.getSignedUrl('getObject', params);
  return res.json({ url, success: true });
};

export const updatealertPhoneNumbers = async (req, res) => {
  const { id, PhoneNumbers } = req.body;
  if (PhoneNumbers.length < 10) { return res.json({ message: 'Please enter a valid number', success: false }); }
  const updatedOrganizationNumber = await Organization.update({
    settings: { alertPhoneNumbers: PhoneNumbers },
  }, { where: { id }, returning: true, plain: true });
  return res.json({ organization: updatedOrganizationNumber[1], success: true });
};

export const createAzureADSecret = async (req, res) => {
  const { id } = req.body;

  const token = jwt.sign(
    {
      sub: req.user.id,
      userName: req.user.full_name,
      orgid: req.user.organization_id,
    },
    JWT_SECRET_KEY,
  );

  await Organization.update({ azure_ad_secret: token }, { where: { id }, returning: true, plain: true });
  return res.json({ azure_ad_secret: token, success: true });
};

export const updateKwikiqSettings = async (req, res) => {
  const kwikiqMinChargeDurationEnum = ['no_time_check', '1_hour', '2_hour', '3_hour'];

  // TODO: destructure
  if (req.body.kwikiqMinChargeDuration && !kwikiqMinChargeDurationEnum.includes(req.body.kwikiqMinChargeDuration)) {
    return res.status(422).json({ message: `Min charge duration must be one of [${kwikiqMinChargeDurationEnum.join(', ')}]`, success: false });
  }
  const { settings: existingSettings = {} } = await Organization.findByPk(req?.user?.organization_id, { attributes: ['settings'] });
  const settings = { ...existingSettings };

  settings.kwikiqRequireAdminOccupancyReset = req.body.kwikiqRequireAdminOccupancyReset;
  settings.kwikiqSupportSwapDevice = req.body.kwikiqSupportSwapDevice;
  settings.kwikiqSupportDamagedDevice = req.body.kwikiqSupportDamagedDevice;
  settings.kwikiqSupportItHold = req.body.kwikiqSupportItHold;
  settings.kwikiqSupportAutoIssuePinCode = req.body.kwikiqSupportAutoIssuePinCode;
  settings.kwikiqMinChargeDuration = req.body.kwikiqMinChargeDuration;
  settings.kwikiqOneSwap = req.body.kwikiqOneSwap;
  settings.kwikiqAllowReturnWithoutRetrieve = req.body.kwikiqAllowReturnWithoutRetrieve;
  const [orgSettingsWereUpdated] = await Organization.update({ settings }, {
    where: { id: req?.user?.organization_id },
    returning: true,
  });

  if (orgSettingsWereUpdated) {
    const deviceIds = (await Device.findAll({
      attributes: ['mac_addr_eth'],
      where: {
        organization_id: req?.user?.organization_id,
      },
    })).map(ele => ele.mac_addr_eth?.replace(/:/g, ''));
    wsUnitNamespace.in(deviceIds).emit('settingsChange', settings);
    console.log(`[WSS] Broadcasted new settings to ${deviceIds.length} devices`);
  }

  return res.status(200).json({ success: true, message: 'Settings updated successfully' });
};
