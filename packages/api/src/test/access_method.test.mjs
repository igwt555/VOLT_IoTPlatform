import 'dotenv/config';
import { faker } from '@faker-js/faker';
import { expect } from 'chai';
import request from 'supertest';
import app from '../index.mjs';
import { createTestUser, deleteAllLocations, deleteAllTestAccessMethod, deleteTestOrg, deleteTestRoles, deleteTestUser } from './common_function.mjs';

describe('### Access Method Process ###', () => {
  let user = null;
  let accessMethod = null;
  before(async () => {
    const response = await createTestUser();
    user = response.body;
  });

  after(async () => {
    await deleteAllTestAccessMethod(user?.user?.id);
    await deleteTestUser(user?.user?.id);
    await deleteTestRoles(user?.user?.organization_id);
    await deleteAllLocations(user?.user?.organization_id);
    await deleteTestOrg(user?.user?.organization_id);
  });

  it('should create access method in database', async () => {
    const res = await request(app)
      .post('/api/access-method/create')
      .send({
        type: 'pin_code',
        data: faker.random.numeric(5),
        user_id: null,
        active_from: faker.date.future(1),
        active_until: faker.date.future(10),
      })
      .set('Authorization', `Bearer ${user.token}`);
    accessMethod = res.body?.userAccessMethod;
    expect(res.status).eq(200);
    expect(res.body?.userAccessMethod).to.be.an('array');
    expect(res.body?.userAccessMethod[0]).to.have.all.keys(
      'active_from',
      'active_until',
      'created_at',
      'data',
      'id',
      'type',
      'updated_at',
      'user_id',
    );
  });

  it('should get all access method from database', async () => {
    const res = await request(app)
      .get('/api/access-method')
      .set('Authorization', `Bearer ${user.token}`);
    expect(res.status).eq(200);
    expect(res.body?.accessMethod).to.be.an('array');
    expect(res.body?.accessMethod[0]).to.have.all.keys(
      'active_from',
      'active_until',
      'created_at',
      'data',
      'id',
      'type',
      'updated_at',
      'user_id',
    );
  });

  it('should assign access method to user', async () => {
    const res = await request(app)
      .post('/api/access-method/assign-user')
      .send({
        accessMethodId: accessMethod[0]?.id,
        userId: user?.user?.id,
      })
      .set('Authorization', `Bearer ${user.token}`);
    expect(res.status).eq(200);
    expect(res.body?.accessMethod).to.be.an('array');
    expect(res.body?.accessMethod[1]).to.have.all.keys(
      'active_from',
      'active_until',
      'created_at',
      'data',
      'id',
      'type',
      'updated_at',
      'user_id',
    );
  });

  it('should get access methods by user Id', async () => {
    const res = await request(app)
      .get(`/api/access-method/${user?.user?.id}`)
      .set('Authorization', `Bearer ${user.token}`);
    expect(res.status).eq(200);
    expect(res.body?.userAccessMethod).to.be.an('array');
    expect(res.body?.userAccessMethod[0]).to.have.all.keys(
      'active_from',
      'active_until',
      'created_at',
      'data',
      'id',
      'type',
      'updated_at',
      'user_id',
    );
  });

  it('should change type of access method', async () => {
    const res = await request(app)
      .put('/api/access-method/change-type')
      .send({
        accessMethodId: accessMethod[0]?.id,
        type: 'rfid_tag',
      })
      .set('Authorization', `Bearer ${user.token}`);
    expect(res.status).eq(200);
    expect(res.body?.accessMethod).to.be.an('array');
    expect(res.body?.accessMethod[1]).to.have.all.keys(
      'active_from',
      'active_until',
      'created_at',
      'data',
      'id',
      'type',
      'updated_at',
      'user_id',
    );
  });

  it('should unassign the access method', async () => {
    const res = await request(app)
      .post('/api/access-method/unassign-user')
      .send({
        accessMethodId: accessMethod[0]?.id,
      })
      .set('Authorization', `Bearer ${user.token}`);
    expect(res.status).eq(200);
    expect(res.body?.accessMethod).to.be.an('array');
    expect(res.body?.accessMethod[1]).to.have.all.keys(
      'active_from',
      'active_until',
      'created_at',
      'data',
      'id',
      'type',
      'updated_at',
      'user_id',
    );
  });
});
