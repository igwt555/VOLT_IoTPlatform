import Permissions from '../models/permission.mjs';
import Locations from '../models/location.mjs';
import DevicesLocations from '../models/device_locations.mjs';
import Device from '../models/device.mjs';

export const create = async (req, res) => {
  if (!req.user.permissions.includes(Permissions.generalPermissions.createLocations.id)) {
    return res.status(403).json({ message: 'Access denied', success: false });
  }
  const data = req.body;
  await Locations.create({
    name: data.name,
    organization_id: data.org_id,
    device_id: data.device,
  });
  const locations = await Locations.findAll({
    where: { organization_id: req?.user?.organization_id },
    order: [['updated_at', 'DESC']],
  });
  return res.json({ locations, success: true, message: 'Location created successfully' });
};

export const findAll = async (req, res) => {
  if (!req.user.permissions.includes(Permissions.generalPermissions.viewLocations.id)) {
    return res.status(403).json({ message: 'Access denied', success: false });
  }
  const locations = await Locations.findAll({
    where: { organization_id: req?.user?.organization_id },
    order: [['updated_at', 'DESC']],
  });
  return res.json({ locations, success: true });
};

export const findByDeviceId = async (req, res) => {
  if (!req.user.permissions.includes(Permissions.generalPermissions.viewLocations.id)) {
    return res.status(403).json({ message: 'Access denied', success: false });
  }
  const { deviceId } = req.params;
  const deviceLocation = await Locations.findOne({
    where: { device_id: deviceId, organization_id: req?.user?.organization_id },
  });
  return res.json({ deviceLocation, success: true });
};

export const findUnassignedLocations = async (req, res) => {
  if (!req.user.permissions.includes(Permissions.generalPermissions.viewLocations.id)) {
    return res.status(403).json({ message: 'Access denied', success: false });
  }

  const unassignedLocation = await Locations.findAll({
    where: { device_id: null, organization_id: req?.user?.organization_id },
  });
  return res.json({ unassignedLocation, success: true });
};

export const changeLocation = async (req, res) => {
  if (!req.user.permissions.includes(Permissions.generalPermissions.editLocations?.id)) {
    return res.status(403).json({ message: 'Access denied', success: false });
  }

  const { newLocationId, deviceId, oldLocationId } = req.body;
  const location = await Locations.update({ device_id: deviceId }, {
    where: { id: newLocationId, organization_id: req?.user?.organization_id },
    returning: true,
    plain: true,
  });

  if (oldLocationId) {
    await Locations.update({ device_id: null }, {
      where: {
        id: oldLocationId,
        organization_id: req?.user?.organization_id,
      },
      returning: true,
      plain: true,
    });
  }
  return res.json({ location, success: true });
};

export const removeAssignLocation = async (req, res) => {
  if (!req.user.permissions.includes(Permissions.generalPermissions.editLocations?.id)) {
    return res.status(403).json({ message: 'Access denied', success: false });
  }
  const { locationId } = req.body;
  const location = await Locations.update(
    { device_id: null },
    {
      where: { id: locationId, organization_id: req?.user?.organization_id },
      returning: true,
      plain: true,
    },
  );
  return res.json({ location, success: true });
};
export const deleteLocation = async (req, res) => {
  if (!req.user.permissions.includes(Permissions.generalPermissions.deleteLocations.id)) {
    return res.status(403).json({ message: 'Access denied', success: false });
  }
  const { id } = req.params;
  const locationdelete = await Locations.destroy(
    { where: { id }, returning: true, plain: true },
  );
  if (locationdelete === 1) {
    const locations = await Locations.findAll({
      where: { organization_id: req?.user?.organization_id },
      order: [['updated_at', 'DESC']],
    }); return res.json({ locations, success: true, message: 'Location deleted successfully' });
  }
  return res.status(400).json({ message: 'something went wrong!', success: false });
};

export const updateLocation = async (req, res) => {
  if (!req.user.permissions.includes(Permissions.generalPermissions.updateLocations.id)) {
    return res.status(403).json({ message: 'Access denied', success: false });
  }
  const { name, id } = req.body;
  const updatelocation = await Locations.update(
    { id, name },
    { where: { id }, returning: true, plain: true },
  );
  if (updatelocation.length > 0) {
    const locations = await Locations.findAll({
      where: { organization_id: req?.user?.organization_id },
      order: [['updated_at', 'DESC']],
    });
    return res.json({ locations, success: true, message: 'Location updated successfully' });
  }
  return res.status(400).json({ message: 'value not updated', success: false });
};
export const createOtto = async (req, res) => {
  if (!req.user.permissions.includes(Permissions.generalPermissions.createLocations.id)) {
    return res.status(403).json({ message: 'Access denied', success: false });
  }
  const data = req.body;
  const createdlocation = await Locations.create({
    name: data.name,
    organization_id: data.org_id,
    device_id: data.device,
  });
  await DevicesLocations.create({
    location_id: createdlocation.id,
    device_id: data.device,
  });
  const locations = await Locations.findAll({
    where: { organization_id: req?.user?.organization_id },
    order: [['updated_at', 'DESC']],
  });
  return res.json({ locations, success: true, message: 'Location created successfully' });
};

export const findByLocationIdOtto = async (req, res) => {
  if (!req.user.permissions.includes(Permissions.generalPermissions.viewLocations.id)) {
    return res.status(403).json({ message: 'Access denied', success: false });
  }
  const { locationId } = req.params;
  const deviceLocation = await DevicesLocations.findAll({
    where: { location_id: locationId },
    include: { model: Device,
      where: {
        organization_id: req?.user?.organization_id,
      },
    },
  });
  return res.json({ deviceLocation, success: true });
};
export const findUnassignedLocationsOtto = async (req, res) => {
  if (!req.user.permissions.includes(Permissions.generalPermissions.viewLocations.id)) {
    return res.status(403).json({ message: 'Access denied', success: false });
  }

  const unassignLocation = await DevicesLocations.findAll({
    where: { device_id: null },
    include: { model: Locations,
      where: {
        organization_id: req?.user?.organization_id,
      },
    },
  });
  return res.json({ Location: unassignLocation.Location, success: true });
};
export const changeLocationOtto = async (req, res) => {
  if (!req.user.permissions.includes(Permissions.generalPermissions.editLocations.id)) {
    return res.status(403).json({ message: 'Access denied', success: false });
  }

  const { newLocationId, deviceId } = req.body;
  await DevicesLocations.update({ location_id: newLocationId }, {
    where: { device_id: deviceId },
    returning: true,
    plain: true,
  });

  const location = await DevicesLocations.findOne({
    where: { device_id: deviceId },
    include: { model: Locations,
      where: {
        organization_id: req?.user?.organization_id,
      },
    },
  });
  return res.json({ location: location.Location, success: true });
};
export const removeAssignLocationOtto = async (req, res) => {
  if (!req.user.permissions.includes(Permissions.generalPermissions.editLocations.id)) {
    return res.status(403).json({ message: 'Access denied', success: false });
  }
  const { locationId } = req.body;
  await DevicesLocations.update({ device_id: null }, {
    where: {
      location_id: locationId,
    },
    returning: true,
    plain: true,
  });
  const location = await DevicesLocations.findOne(
    {
      where: { location_id: locationId },
      include: { model: Locations,
        where: {
          organization_id: req?.user?.organization_id,
        },
      },
    },
  );
  return res.json({ location: location.Location, success: true });
};
export const deleteLocationOtto = async (req, res) => {
  if (!req.user.permissions.includes(Permissions.generalPermissions.deleteLocations.id)) {
    return res.status(403).json({ message: 'Access denied', success: false });
  }
  const { id } = req.params;
  const locationDeviceDelete = await DevicesLocations.destroy({
    where: { location_id: id }, returning: true, plain: true,
  });
  const locationdelete = await Locations.destroy(
    { where: { id }, returning: true, plain: true },
  );
  if (locationdelete === 1 && locationDeviceDelete === 1) {
    const locations = await Locations.findAll({
      where: { organization_id: req?.user?.organization_id },
    }); return res.json({ locations, success: true, message: 'Location deleted successfully' });
  }
  return res.status(400).json({ message: 'something went wrong!', success: false });
};
