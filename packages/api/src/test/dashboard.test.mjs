import 'dotenv/config';
import { expect } from 'chai';
import request from 'supertest';
import app from '../index.mjs';
import { createTestUser, deleteAllLocations, deleteTestOrg, deleteTestRoles, deleteTestUser } from './common_function.mjs';

describe('### Dashboard Method Process ###', () => {
  let user = null;
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

  it('should get the device charging stats', async () => {
    const res = await request(app)
      .get('/api/dashboard/device-charging')
      .set('Authorization', `Bearer ${user.token}`);
    expect(res.status).eq(200);
    expect(res.body?.deviceCharging).to.have.all.keys(
      'charging',
      'deposited',
    );
  });

  it('should get the device avg charge time', async () => {
    const res = await request(app)
      .get('/api/dashboard/avg-charge-time')
      .set('Authorization', `Bearer ${user.token}`);
    expect(res.status).eq(200);
    expect(res.body?.avgChargeTime).to.have.all.keys(
      'percentage',
      'time',
    );
  });

  it('should get the count of active users', async () => {
    const res = await request(app)
      .get('/api/dashboard/active-users')
      .set('Authorization', `Bearer ${user.token}`);

    expect(res.status).eq(200);
    expect(res.body?.aciveUsers).to.have.all.keys(
      'activeUsers',
      'enrolledUsers',
    );
  });

  it('should get the count od connected devices', async () => {
    const res = await request(app)
      .get('/api/dashboard/connectivity')
      .set('Authorization', `Bearer ${user.token}`);

    expect(res.status).eq(200);
    expect(res.body?.connectivity).to.have.all.keys(
      'online',
      'total',
    );
  });

  it('should get the alerts', async () => {
    const res = await request(app)
      .get('/api/dashboard/alerts')
      .set('Authorization', `Bearer ${user.token}`);
    expect(res.status).eq(200);
    expect(res.body?.alert).to.have.all.keys(
      'issues',
    );
  });

  it('should get the returned devices', async () => {
    const res = await request(app)
      .get('/api/dashboard/devicereturned')
      .set('Authorization', `Bearer ${user.token}`);
    expect(res.status).eq(200);
    expect(res.body?.deviceReturned).to.have.all.keys(
      'returned',
      'unaccounted',
    );
  });

  it('should get the locations', async () => {
    const res = await request(app)
      .get('/api/dashboard/locations')
      .set('Authorization', `Bearer ${user.token}`);
    expect(res.status).eq(200);
    expect(res?.body?.locations?.data).to.be.an('array');
    expect(res.body?.locations).to.have.all.keys(
      'data',
    );
    /* expect(res?.body?.locations?.data[0]).to.have.all.keys(
      'date',
      'location',
    ); */
  });
});
