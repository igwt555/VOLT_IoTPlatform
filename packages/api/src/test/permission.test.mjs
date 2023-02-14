import 'dotenv/config';
import { expect } from 'chai';
import request from 'supertest';
import app from '../index.mjs';
import { createTestUser, deleteTestOrg, deleteTestRoles, deleteTestUser } from './common_function.mjs';

describe('### Permission Process ###', () => {
  let user = null;
  before(async () => {
    const response = await createTestUser();
    user = response.body;
  });

  after(async () => {
    await deleteTestUser(user?.user?.id);
    await deleteTestRoles(user?.user?.organization_id);
    await deleteTestOrg(user?.user?.organization_id);
  });

  it('should all permissions', async () => {
    const res = await request(app)
      .get('/api/permission/getPermissions')
      .set('Authorization', `Bearer ${user.token}`);
    expect(res.status).eq(200);
    expect(res.body?.permissions).to.be.an('array');
    expect(res.body?.permissions[0]).to.have.all.keys(
      'id',
      'organization_id',
      'name',
    );
  });

  it('should get permission by Id', async () => {
    const res = await request(app)
      .get('/api/permission/getPermissionById?id=dff4aad0-0616-4d97-aae1-45f1d7a465b0')
      .set('Authorization', `Bearer ${user.token}`);
    expect(res.status).eq(200);
    expect(res.body?.permission).to.be.an('array');
    expect(res.body?.permission[0]).to.have.all.keys(
      'id',
      'organization_id',
      'name',
    );
  });
});
