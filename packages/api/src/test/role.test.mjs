import 'dotenv/config';
import { faker } from '@faker-js/faker';
import { expect } from 'chai';
import request from 'supertest';
import app from '../index.mjs';
import { createTestUser, deleteTestOrg, deleteTestRoles, deleteTestUser } from './common_function.mjs';

describe('### Roles Process ###', () => {
  let user = null;
  let role = null;
  before(async () => {
    const response = await createTestUser();
    user = response.body;
  });

  after(async () => {
    await deleteTestUser(user?.user?.id);
    await deleteTestRoles(user?.user?.organization_id);
    await deleteTestOrg(user?.user?.organization_id);
  });

  it('should create a role in database', async () => {
    const res = await request(app)
      .post('/api/role/createRole')
      .send({
        name: faker.name.jobType(),
        description: faker.name.jobDescriptor(),
      })
      .set('Authorization', `Bearer ${user.token}`);
    role = res.body;
    expect(res.status).eq(200);
    expect(res.body?.org).to.have.all.keys(
      'id',
      'name',
      'description',
      'organization_id',
      'updated_at',
      'created_at',
    );
  });

  it('should update a role in database', async () => {
    const res = await request(app)
      .post('/api/role/updateRole')
      .send({
        name: faker.name.jobType(),
        id: role?.org?.id,
      })
      .set('Authorization', `Bearer ${user.token}`);
    expect(res.status).eq(200);
    expect(res.body?.role).to.have.all.keys(
      'id',
      'name',
      'description',
      'organization_id',
      'updated_at',
      'created_at',
    );
  });

  it('should get all roles from database', async () => {
    const res = await request(app)
      .get('/api/role/getRoles')
      .set('Authorization', `Bearer ${user.token}`);
    expect(res.status).eq(200);
    expect(res.body?.roles).to.be.an('array');
    expect(res.body?.roles[0]).to.have.all.keys(
      'id',
      'name',
      // 'description',
      // 'organization_id',
      // 'updated_at',
      // 'created_at',
    );
  });

  it('should get a role by id from database', async () => {
    const res = await request(app)
      .get('/api/role/getRoleById')
      .set('Authorization', `Bearer ${user.token}`)
      .query({
        id: role?.org?.id,
      });
    expect(res.status).eq(200);
    expect(res.body?.role).to.be.an('array');
    expect(res.body?.role[0]).to.have.all.keys(
      'id',
      'name',
      'description',
      'organization_id',
      'updated_at',
      'created_at',
    );
  });

  it('should delete a role from database', async () => {
    const res = await request(app)
      .delete(`/api/role/deleteRole/${role?.org?.id}`)
      .set('Authorization', `Bearer ${user.token}`);
    expect(res.status).eq(200);
    expect(res.body).to.have.all.keys('message', 'success');
    expect(res.body?.message).eq('Role deleted successfully!');
  });
});
