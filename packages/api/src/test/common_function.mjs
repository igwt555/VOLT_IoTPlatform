import 'dotenv/config';
import { faker } from '@faker-js/faker';
import request from 'supertest';
import app from '../index.mjs';
import User from '../models/user.mjs';
import Organization from '../models/organization.mjs';
import Role from '../models/role.mjs';
import Locations from '../models/location.mjs';
import AccessMethod from '../models/access_method.mjs';
import Alert from '../models/alerts.mjs';

export const deleteTestUser = async id => User.destroy({
  where: {
    id,
  },
  returning: true,
  plain: true,
});

export const deleteTestOrg = async id => Organization.destroy({
  where: {
    id,
  },
  returning: true,
  plain: true,
});

export const createTestUser = async () => request(app)
  .post('/api/user/register')
  .send({
    email: faker.internet.email(undefined, undefined, 'example.com'),
    full_name: faker.name.fullName(),
    password: faker.internet.password(20),
    role_id: Role.genralRoles.superAdmin.id,
    organization_id: '',
  });

export const deleteTestRoles = async id => Role.destroy({
  where: { organization_id: id },
  returning: true,
  plain: true,
});

export const createLocation = async user => request(app)
  .post('/api/location')
  .send({
    name: faker.random.word(),
    org_id: user?.user?.organization_id,
    device: faker.datatype.uuid(),
  })
  .set('Authorization', `Bearer ${user.token}`);

export const deleteAllLocations = async orgId => Locations.destroy(
  { where: { organization_id: orgId }, returning: true, plain: true },
);

export const deleteAllTestAccessMethod = async userId => AccessMethod.destroy({
  where: { user_id: userId },
  returning: true,
  plain: true,
});

export const createTestRoles = async user => request(app)
  .post('/api/role/createRole')
  .send({
    name: faker.name.jobType(),
    description: faker.name.jobDescriptor(),
  })
  .set('Authorization', `Bearer ${user.token}`);

export const createTestAlerts = async orgId => Alert.create({
  description: faker.lorem.words(5),
  organization_id: orgId,
});

export const deleteTestAlerts = async orgId => Alert.destroy({
  where: { organization_id: orgId },
});
