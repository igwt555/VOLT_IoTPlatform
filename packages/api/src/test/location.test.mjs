import 'dotenv/config';
import { faker } from '@faker-js/faker';
import { expect } from 'chai';
import request from 'supertest';
import app from '../index.mjs';
import { createLocation, createTestUser, deleteAllLocations, deleteTestOrg, deleteTestRoles, deleteTestUser } from './common_function.mjs';

describe('### Location Process ###', () => {
  let user = null;
  let location = null;
  before(async () => {
    const response = await createTestUser();
    user = response.body;
  });

  after(async () => {
    await deleteTestUser(user?.user?.id);
    await deleteTestRoles(user?.user?.organization_id);
    await deleteAllLocations(user?.user?.organization_id);
    await deleteTestOrg(user?.user?.organization_id);
  });

  it('should create a location in database', async () => {
    const res = await createLocation(user);
    location = res.body?.locations;
    expect(res.status).eq(200);
    expect(res.body?.locations).to.be.an('array');
    expect(res.body?.message).eq('Location created successfully');
    expect(res.body?.locations[0]).to.have.all.keys(
      'id',
      'name',
      'organization_id',
      'device_id',
      'created_at',
      'updated_at',
    );
  });

  it('should get all the locations from database', async () => {
    const res = await request(app)
      .get('/api/location')
      .set('Authorization', `Bearer ${user.token}`);
    expect(res.status).eq(200);
    expect(res.body?.locations).to.be.an('array');
    expect(res.body?.locations[0]).to.have.all.keys(
      'id',
      'name',
      'organization_id',
      'device_id',
      'created_at',
      'updated_at',
    );
  });

  it('should get location by device ID from database', async () => {
    const res = await request(app)
      .get(`/api/location/${location[0]?.device_id}`)
      .set('Authorization', `Bearer ${user.token}`);
    expect(res.status).eq(200);
    expect(res.body?.deviceLocation).to.have.all.keys(
      'id',
      'name',
      'organization_id',
      'device_id',
      'created_at',
      'updated_at',
    );
  });

  it('should change the location', async () => {
    const result = await createLocation(user);
    location = result.body?.locations;
    const res = await request(app)
      .post('/api/location/change-location')
      .send({
        newLocationId: location[1]?.id,
        deviceId: location[0]?.device_id,
        oldLocationId: location[0]?.id,
      })
      .set('Authorization', `Bearer ${user.token}`);
    expect(res.status).to.be.oneOf([200, 403]);
  });

  it('should unassgin a location', async () => {
    const res = await request(app)
      .get('/api/location/unassign/location')
      .set('Authorization', `Bearer ${user.token}`);
    expect(res.status).eq(200);
    /* expect(res.body?.unassignLocation).to.be.an('array');
    expect(res.body?.unassignLocation[0]).to.have.all.keys(
      'id',
      'name',
      'organization_id',
      'device_id',
      'created_at',
      'updated_at',
    ); */
  });

  it('should update the location', async () => {
    const res = await request(app)
      .post('/api/location/update-location')
      .send({
        name: faker.random.word(),
        id: location[0]?.id,
      })
      .set('Authorization', `Bearer ${user.token}`);
    expect(res.status).eq(200);
    expect(res.body?.locations).to.be.an('array');
    expect(res.body).to.have.all.keys(
      'locations',
      'success',
      'message',
    );
    expect(res.body?.message).eq('Location updated successfully');
    expect(res.body?.locations[0]).to.have.all.keys(
      'id',
      'name',
      'organization_id',
      'device_id',
      'created_at',
      'updated_at',
    );
  });

  it('should remove-assign the location', async () => {
    const res = await request(app)
      .post('/api/location/remove-assign-location')
      .send({
        locationId: location[0]?.id,
      })
      .set('Authorization', `Bearer ${user.token}`);
    if (res.status === 200) {
      expect(res.body?.location).to.be.an('array');
      expect(res.body).to.have.all.keys('location', 'success');
      expect(res.body?.location[1]).to.have.all.keys(
        'id',
        'name',
        'organization_id',
        'device_id',
        'created_at',
        'updated_at',
      );
    }
    if (res.status === 403) {
      expect(res.body?.message).eq('Access denied');
    }
  });

  it('should delete the location', async () => {
    const res = await request(app)
      .delete(`/api/location/delete-location/${location[0]?.id}`)
      .set('Authorization', `Bearer ${user.token}`);
    expect(res.status).eq(200);
    expect(res.body?.locations).to.be.an('array');
    expect(res.body).to.have.all.keys('locations', 'success', 'message');
    expect(res.body?.message).eq('Location deleted successfully');
  });
});
