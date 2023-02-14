/* eslint-disable no-undef */
import express from 'express';
// import { v4 as uuidv4 } from 'uuid';
import bodyParser from 'body-parser';

import { errorHandler } from './helpers/errorHandler.mjs';
import { upload, setCurrentUser } from './middleware.mjs';

import * as AuthController from './controllers/auth.mjs';
import * as OrgController from './controllers/organization.mjs';
import * as RoleController from './controllers/role.mjs';
import * as PermissionController from './controllers/permission.mjs';
import * as RolePermissionController from './controllers/role_permission.mjs';
import * as LocationController from './controllers/location.mjs';
import * as DeviceController from './controllers/device.mjs';
import * as DevicesController from './controllers/devices.mjs';
import * as KbDeviceController from './controllers/kb_device.mjs';
import * as UserController from './controllers/user.mjs';
import * as BayController from './controllers/bay.mjs';
import * as NotificationController from './controllers/notification.mjs';
import * as EmailnotificationController from './controllers/email_notification.mjs';
import * as KbDeviceEventController from './controllers/kb_device_event.mjs';
import * as WebhookController from './controllers/webhook.mjs';
import * as AccessMethodController from './controllers/access_method.mjs';
import * as DashboardController from './controllers/dashboard.mjs';
import * as KbChamberReservationController from './controllers/kb_chamber_reservations.mjs';
import * as ProviderController from './controllers/provider.mjs';
import * as DirectoryController from './controllers/directory.mjs';
import * as DomainController from './controllers/domain.mjs';
import * as AzureAdController from './controllers/azure_ad.mjs';
import * as OttoController from './controllers/otto.mjs';
import * as ScimController from './controllers/scim.mjs';
import * as SamlController from './controllers/saml.mjs';
import * as GoogleController from './controllers/google_workspace.mjs';

const router = express.Router();
export default router;

router.use(setCurrentUser);

router.post('/auth/login', errorHandler(AuthController.login));
router.post('/auth/loginWithToken', errorHandler(AuthController.loginWithToken));
router.post('/auth/samlLogin', errorHandler(SamlController.samlLogin));
router.post('/auth/reset-password', errorHandler(AuthController.resetPassword));
router.post('/auth/send-forgetPassword-email', errorHandler(AuthController.sendForgetPasswordEmail));
router.post('/auth/forgetPassword/:id/:token', errorHandler(AuthController.forgetPassword));
router.post('/auth/changePassword', errorHandler(AuthController.changePass));
router.post('/auth/send-changePassword-email', errorHandler(AuthController.changePassEmail));
router.post('/auth/password/update', errorHandler(AuthController.updatePassword));
router.post('/auth/refresh-token', errorHandler(AuthController.refreshToken));

router.post('/organization/createSubOrg', upload.single('file'), errorHandler(OrgController.create));
router.post('/organization', upload.single('file'), errorHandler(OrgController.update));
router.post('/organization/get-child-orgs', errorHandler(OrgController.getChildOrgs));
router.delete('/organization/delete-org', errorHandler(OrgController.deleteOrg));
router.post('/organization/favicon', upload.single('file'), errorHandler(OrgController.createFavicon));
router.post('/organization/update/alertPhoneNumbers', errorHandler(OrgController.updateAlertPhoneNumbers));
router.get('/organization/:id/', errorHandler(OrgController.getOrganizationData));
router.post('/organization/uploadManual', upload.single('file'), errorHandler(OrgController.uploadManualPdf));
router.post('/organization/downloadManual', errorHandler(OrgController.downloadManualPdf));
router.post('/organization/createAzureADSecret', errorHandler(OrgController.createAzureADSecret));
router.post('/organization/updateKwiqiqSetting', errorHandler(OrgController.updateKwikiqSettings));

router.post('/role/createRole', errorHandler(RoleController.create));
router.get('/role/getRoles', errorHandler(RoleController.getAllRoles));
router.get('/role/getRoleById', errorHandler(RoleController.getRoleById));
router.delete('/role/deleteRole/:id', errorHandler(RoleController.deleteRole));
router.post('/role/updateRole', errorHandler(RoleController.update));

router.get('/permission/getPermissions', errorHandler(PermissionController.getAllPermissions)); //
router.get('/permission/getPermissionById', errorHandler(PermissionController.getPermissionById));

router.post('/rolePermission/createRolePermission', errorHandler(RolePermissionController.create));
router.get('/rolePermission/getRolePermissions', errorHandler(RolePermissionController.getAllPermissions));
router.get('/rolePermission/getPermissionById', errorHandler(RolePermissionController.getPermissionById));
router.get('/rolePermission/getPermissionByRoleId', errorHandler(RolePermissionController.getAllPermissionByRoleId));
router.delete('/rolePermission/deleteRolePermission', errorHandler(RolePermissionController.deletePermission));

router.get('/location', errorHandler(LocationController.findAll));
router.post('/location', errorHandler(LocationController.create));
router.get('/location/:deviceId', errorHandler(LocationController.findByDeviceId));
router.get('/location/unassign/location', errorHandler(LocationController.findUnassignedLocations));
router.post('/location/change-location', errorHandler(LocationController.changeLocation));
router.post('/location/remove-assign-location', errorHandler(LocationController.removeAssignLocation));
router.delete('/location/delete-location/:id', errorHandler(LocationController.deleteLocation));
router.post('/location/update-location', errorHandler(LocationController.updateLocation));
router.post('/location/otto', errorHandler(LocationController.createOtto));
router.get('/location/otto/:locationId', errorHandler(LocationController.findByLocationIdOtto));
router.get('/location/otto/unassign/location', errorHandler(LocationController.findUnassignedLocationsOtto));
router.post('/location/otto/change-location', errorHandler(LocationController.changeLocationOtto));
router.post('/location/otto/remove-assign-location', errorHandler(LocationController.removeAssignLocationOtto));
router.delete('/location/otto/delete-location/:id', errorHandler(LocationController.deleteLocationOtto));

router.get('/device', errorHandler(DeviceController.getDevice));
router.get('/device/:deviceId', errorHandler(DeviceController.findByDeviceId));
router.get('/device/:deviceId/getRfidTags', errorHandler(DevicesController.getRfidTags));
router.get('/device/:deviceId/getPinCodes', errorHandler(DevicesController.getPinCodes));
// router.get('/device/:deviceId/configuration', errorHandler(DevicesController.getConfiguration));
router.get('/device/:deviceMac/configuration', errorHandler(DevicesController.getConfigurationByMac));
router.post('/device/:deviceId/recordEvent', errorHandler(DevicesController.recordEvent));
router.post('/device/openDoor', errorHandler(DevicesController.openDoor));
router.post('/device/:deviceId/transfer-ownership', errorHandler(DevicesController.transferOwnership));
router.post('/device/saveDeviceNote', errorHandler(DevicesController.saveDeviceNote));
router.get('/device/getDeviceNote/:deviceId', errorHandler(DevicesController.getDeviceNote));

router.get('/kb-device', errorHandler(KbDeviceController.getAllKbDevices));
router.get('/kb-device/:id', errorHandler(KbDeviceController.findById));
router.get('/kb-device/:baysId', errorHandler(KbDeviceController.findById));
router.post('/kb-device/:deviceId', errorHandler(KbDeviceController.updateDevice));

router.get('/user', errorHandler(UserController.getUsers));
router.get('/user/user/:id', errorHandler(UserController.getUser));
router.post('/user/createUsers', errorHandler(UserController.createUsers));
router.post('/user/create', errorHandler(UserController.create));
router.get('/user/report/:id', errorHandler(UserController.report));
router.post('/user/user-by-orgid', errorHandler(UserController.getUsersByOrgId));
router.post('/user/assignBay', errorHandler(UserController.assignBay));
router.post('/user/updateUser/:id', errorHandler(UserController.updateUser));
router.post('/user/alerts', errorHandler(UserController.setalerts));
router.get('/user/get-Alerts/:id', errorHandler(UserController.getalerts));
router.post('/user/register', upload.none(), errorHandler(UserController.registerUser));
router.post('/user/assign-device-user', errorHandler(UserController.assignUser));
router.post('/user/unassign-device-user', errorHandler(UserController.unassignUser));
router.post('/user/assign-chamber-user', errorHandler(UserController.assignUserChamber));
router.post('/user/unassign-chamber-user', errorHandler(UserController.unassignUserChamber));
router.get('/timezones', errorHandler(UserController.getTimeZones));
router.get('/user/reservations/:id', errorHandler(UserController.getUserReservations));

router.get('/bay/:deviceId', errorHandler(BayController.findByUnitId));

router.get('/notification', errorHandler(NotificationController.findAll));

router.get('/email-notification', errorHandler(EmailnotificationController.getEmailNotification));
router.get('/email-notification/:userId', errorHandler(EmailnotificationController.getEmailByUserId));
router.post('/email-notification', errorHandler(EmailnotificationController.create));

router.post('/kb-device-event', errorHandler(KbDeviceEventController.getAllDeviceEvent));
router.get('/kb-device-event/:deviceId', errorHandler(KbDeviceEventController.getEventByDeviceId));
router.get('/kb-device-event/recent-activity/:deviceId', errorHandler(KbDeviceEventController.getRecentActivityByDeviceId));
router.get('/kb-device-event/device/:kbDeviceId', errorHandler(KbDeviceEventController.getEventByKbDeviceId));

router.post('/update-chamber-status', errorHandler(KbDeviceEventController.updateChamberStatus));

router.post('/webhook/bounce', WebhookController.customParser, errorHandler(WebhookController.processAwsSnsEvent));

router.get('/access-method', errorHandler(AccessMethodController.findAll));
router.get('/access-method/:userId', errorHandler(AccessMethodController.findByUserId));
router.post('/access-method/assign-user', errorHandler(AccessMethodController.assignUser));
router.post('/access-method/unassign-user', errorHandler(AccessMethodController.unassignUser));
router.post('/access-method/create', errorHandler(AccessMethodController.create));
router.put('/access-method/change-type', errorHandler(AccessMethodController.updateAccessMetholdType));

router.get('/dashboard/device-charging', errorHandler(DashboardController.getDeviceChargingStats));
router.get('/dashboard/avg-charge-time', errorHandler(DashboardController.getAverageChargingTimeStats));
router.get('/dashboard/active-users', errorHandler(DashboardController.getActiveUsersStats));
router.get('/dashboard/connectivity', errorHandler(DashboardController.getConnectivityStats));
router.get('/dashboard/alerts', errorHandler(DashboardController.getAlertStats));
router.get('/dashboard/devicereturned', errorHandler(DashboardController.getDeviceReturnedStats));
router.get('/dashboard/locations', errorHandler(DashboardController.getLocations));

router.get('/kb-chamber-reservation', errorHandler(KbChamberReservationController.findAll));

router.post('/events', errorHandler((req, res) => {
  const apiKey = req.query['x-api-key'];

  if (!apiKey) return res.json({ error: 'Missing API key' });
  if (apiKey !== 'enRZ7pA.V98TbXuv7Yr9mfjW4rJ6i7-3q3TR3Dxyv') return res.json({ error: 'Invalid API key' });

  return OttoController.saveEvent(req, res);
}));

// otto-only: req.body = payload: { "qrData": "$Data from QR code$" }, check authz bearer for JWT with user id
router.post('/v1/activateUser', errorHandler(OttoController.activateUser));

// otto-only: req.body = payload: { "qrData": "$Data from QR code$" }, check authz bearer for JWT with user id
router.post('/v1/deactivateUser', errorHandler(OttoController.deactivateUser));

router.delete('/events/otto', errorHandler((req, res) => OttoController.deleteAllEvents(req, res)));

router.get('/dashboard-chart/dashboard1', errorHandler(OttoController.getDash1Data));
router.get('/dashboard-chart/dashboard2', errorHandler(OttoController.getDash2Data));
router.get('/dashboard-chart/dashboard3', errorHandler(OttoController.getDash3Data));
router.get('/users/:userId/profile', errorHandler(OttoController.getUserProfile));
router.get('/dashboard-chart/dashboard5', errorHandler(OttoController.getDash5Data));
router.get('/dashboard-chart/get-site-data', errorHandler(OttoController.getSiteData));
router.get('/dashboard-chart/dashboard6', errorHandler(OttoController.getDash6Data));
router.get('/dashboard-chart/dashboard8', errorHandler(OttoController.getDash8Data));
router.get('/dashboard-chart/dashboard9', errorHandler(OttoController.getDash9Data));

router.get('/provider', errorHandler(ProviderController.findAll));
router.post('/provider', errorHandler(ProviderController.create));
router.get('/provider/:providerId', errorHandler(ProviderController.findByProviderId));

router.get('/directory', errorHandler(DirectoryController.findAll));
router.post('/directory', errorHandler(DirectoryController.create));
router.get('/directory/:directoryId', errorHandler(DirectoryController.findByDirectoryId));
router.put('/directory/update/:id', errorHandler(DirectoryController.updateDirectory));
router.delete('/directory/deleteDir', errorHandler(DirectoryController.deleteDirectory));

router.get('/domain', errorHandler(DomainController.findAll));
router.post('/domain', errorHandler(DomainController.create));
router.get('/domain/:domainId', errorHandler(DomainController.findByDomainId));

router.get('/azure-ad', errorHandler(AzureAdController.mainRoute));
router.get('/redirect', errorHandler(AzureAdController.redirectRoute));
router.get('/logout', errorHandler(AzureAdController.logoutRoute));

router.get('/scim/Users', errorHandler(ScimController.getUsers));
router.get('/scim/Users/:id', errorHandler(ScimController.getUser));
router.post('/scim/Users', bodyParser.text({ type: ['application/scim+json', 'json', 'text'] }), errorHandler(ScimController.createUser));
router.patch('/scim/Users/:id', bodyParser.text({ type: ['application/scim+json', 'json', 'text'] }), errorHandler(ScimController.modifyUser));

router.get('/samlprovider/:id', errorHandler(SamlController.getSamlProvider));
router.get('/samlprovider', errorHandler(SamlController.getSamlProviders));
router.post('/saml/consume', errorHandler(SamlController.consume));
router.post('/samlprovider/:id', errorHandler(SamlController.updateSamlProvider));
router.delete('/samlprovider/:id', errorHandler(SamlController.deleteSamlProvider));
router.post('/otto/inspection-report', errorHandler(OttoController.createReport));
router.get('/otto/inspection-reports', errorHandler(OttoController.getOttoReports));
router.get('/otto/inspection-report/:inspectionReportId', errorHandler(OttoController.getOttoReport));

router.post('/google/syncUsers', errorHandler(GoogleController.syncUser));
router.get('/google/oauthCallback', errorHandler(GoogleController.oauthCallback));
router.post('/google/authenticate', errorHandler(GoogleController.authenticateUser));
router.post('/google/webhookListener', errorHandler(GoogleController.webhookListener));
router.post('/google/stopWebhook', errorHandler(GoogleController.stopWebhook));

// This should be the last route in this file. Catch all handler for /api/* reqs
router.all('*', (req, res) => {
  if (req.is('application/json')) return res.status(404).json({ ok: false });
  return res.status(404).send('No handler registered for this URL');
});
