import 'dotenv/config';
import { faker } from '@faker-js/faker';
import { expect } from 'chai';
import request from 'supertest';
import app from '../index.mjs';
import { createTestAlerts, createTestRoles, createTestUser, deleteTestAlerts, deleteTestOrg, deleteTestRoles, deleteTestUser } from './common_function.mjs';

describe('### User Process ###', () => {
  let user = null;
  let role = null;
  let alert = null;
  before(async () => {
    const response = await createTestUser();
    user = response.body;
    const roleRes = await createTestRoles(user);
    role = roleRes?.body?.org;
    const alertRes = await createTestAlerts(user?.user?.organization_id);
    alert = alertRes;
  });

  after(async () => {
    await deleteTestUser(user?.user?.id);
    await deleteTestRoles(user?.user?.organization_id);
    await deleteTestAlerts(user?.user?.organization_id);
    await deleteTestOrg(user?.user?.organization_id);
  });

  it('should create a multiple users in database', async () => {
    const res = await request(app)
      .post('/api/user/createUsers')
      .send({
        users: [
          {
            password: faker.internet.password(12),
            full_name: faker.name.fullName(),
            role_id: role?.id,
            email: faker.internet.email(undefined, undefined, 'example.dev'),
            organization_id: user?.user?.organization_id,
          },
          {
            password: faker.internet.password(12),
            full_name: faker.name.fullName(),
            role_id: role?.id,
            email: faker.internet.email(undefined, undefined, 'example.dev'),
            organization_id: user?.user?.organization_id,
          },
        ],
      })
      .set('Authorization', `Bearer ${user.token}`);
    expect(res.status).eq(200);
    expect(res.body?.users).to.be.an('array');
    expect(res.body?.users[0]).to.have.all.keys(
      'id',
      'full_name',
      'email',
      // 'password',
      'role_id',
      'organization_id',
      'details',
      'is_active',
      'phoneNo',
      'timezoneid',
      'created_at',
      'updated_at',
    );
  });

  it('should create a user in database', async () => {
    const res = await request(app)
      .post('/api/user/create')
      .send({
        password: faker.internet.password(12),
        full_name: faker.name.fullName(),
        role_id: role?.id,
        email: faker.internet.email(undefined, undefined, 'example.dev'),
        organization_id: user?.user?.organization_id,
      })
      .set('Authorization', `Bearer ${user.token}`);
    expect(res.status).eq(200);
    expect(res.body?.users).to.be.an('array');
    expect(res.body?.users[0]).to.have.all.keys(
      'id',
      'full_name',
      'email',
      // 'password',
      'role_id',
      'organization_id',
      'details',
      'is_active',
      'phoneNo',
      'timezoneid',
      'created_at',
      'updated_at',
      'Role',
    );
  });

  it('should get a all user from database', async () => {
    const res = await request(app)
      .get('/api/user')
      .set('Authorization', `Bearer ${user.token}`);
    expect(res.status).eq(200);
    expect(res.body?.users).to.be.an('array');
    expect(res.body?.users[0]).to.have.all.keys(
      'id',
      'full_name',
      'email',
      // 'password',
      'role_id',
      'organization_id',
      'details',
      'is_active',
      'phoneNo',
      'timezoneid',
      'created_at',
      'updated_at',
      'Role',
    );
  });

  it('should get user by id from database', async () => {
    const res = await request(app)
      .get(`/api/user/user/${user?.user?.id}`)
      .set('Authorization', `Bearer ${user.token}`);
    expect(res.status).eq(200);
    expect(res.body?.user).to.have.all.keys(
      'id',
      'full_name',
      'email',
      // 'password',
      'role_id',
      'organization_id',
      'details',
      'is_active',
      'phoneNo',
      'timezoneid',
      'created_at',
      'updated_at',
      'Role',
      'Timezone',
    );
  });

  it('should get report by id', async () => {
    const res = await request(app)
      .get(`/api/user/report/${user?.user?.id}`)
      .set('Authorization', `Bearer ${user.token}`);
    expect(res.status).eq(200);
    expect(res.body?.report).to.be.an('array');
  });

  it('should get user by organization Id', async () => {
    const res = await request(app)
      .post('/api/user/user-by-orgid')
      .set('Authorization', `Bearer ${user.token}`);
    expect(res.status).eq(200);
    expect(res.body?.users).to.be.an('array');
    expect(res.body?.users[0]).to.have.all.keys(
      'id',
      'full_name',
      'email',
      // 'password',
      'role_id',
      'organization_id',
      'details',
      'is_active',
      'phoneNo',
      'timezoneid',
      'created_at',
      'updated_at',
    );
  });

  it('should update the user details in database', async () => {
    const res = await request(app)
      .post(`/api/user/updateUser/${user?.user?.id}`)
      .send({
        id: user?.user?.id,
        body: { is_active: false },
      })
      .set('Authorization', `Bearer ${user.token}`);
    expect(res.status).eq(200);
    expect(res.body?.user).to.have.all.keys(
      'id',
      'full_name',
      'email',
      // 'password',
      'role_id',
      'organization_id',
      'details',
      'is_active',
      'phoneNo',
      'timezoneid',
      'created_at',
      'updated_at',
      'Role',
      'Timezone',
    );
  });

  it('should set the alert for the user', async () => {
    const res = await request(app)
      .post('/api/user/alerts')
      .send({
        alert_id: alert?.id,
        user_id: user?.user?.id,
      })
      .set('Authorization', `Bearer ${user.token}`);
    expect(res.status).eq(200);
    expect(res.body?.alerts).to.be.an('array');
    expect(res.body?.totalAlerts).to.be.an('array');
    expect(res.body?.alerts[0]).to.have.all.keys(
      'id',
      'full_name',
      'email',
      // 'password',
      'role_id',
      'organization_id',
      'details',
      'is_active',
      'phoneNo',
      'timezoneid',
      'created_at',
      'updated_at',
      'Alerts',
    );
    expect(res.body?.totalAlerts[0]).to.have.all.keys(
      'id',
      'description',
      'organization_id',
      'created_at',
      'updated_at',
    );
  });

  it('should get all alerts by userId', async () => {
    const res = await request(app)
      .get(`/api/user/get-Alerts/${user?.user?.id}`)
      .set('Authorization', `Bearer ${user.token}`);
    expect(res.status).eq(200);
    expect(res.body?.alerts).to.be.an('array');
    expect(res.body?.totalAlerts).to.be.an('array');
    expect(res.body?.alerts[0]).to.have.all.keys(
      'id',
      'full_name',
      'email',
      // 'password',
      'role_id',
      'organization_id',
      'details',
      'is_active',
      'phoneNo',
      'timezoneid',
      'created_at',
      'updated_at',
      'Alerts',
    );
    expect(res.body?.totalAlerts[0]).to.have.all.keys(
      'id',
      'description',
      'organization_id',
      'created_at',
      'updated_at',
    );
  });
});
