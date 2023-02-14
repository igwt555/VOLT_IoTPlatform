import 'dotenv/config';
import { expect } from 'chai';
import request from 'supertest';
import app from '../index.mjs';
import { createTestRoles, createTestUser, deleteAllLocations, deleteTestOrg, deleteTestRoles, deleteTestUser } from './common_function.mjs';
import Permission from '../models/permission.mjs';

describe('### Role Permission Process ###', () => {
  let user = null;
  let role = null;
  const permission = Permission.getAllPermissions();
  let rolePermission = null;
  before(async () => {
    const response = await createTestUser();
    user = response.body;
    const roleRes = await createTestRoles(user);
    role = roleRes.body;
  });

  after(async () => {
    await deleteTestUser(user?.user?.id);
    await deleteTestRoles(user?.user?.organization_id);
    await deleteAllLocations(user?.user?.organization_id);
    await deleteTestOrg(user?.user?.organization_id);
  });

  it('should create role permission in database', async () => {
    const res = await request(app)
      .post('/api/rolePermission/createRolePermission')
      .send({
        role_id: role?.org?.id,
        permission_id: permission[0]?.id,
        organization_id: user?.user?.organization_id,
      })
      .set('Authorization', `Bearer ${user.token}`);
    rolePermission = res.body?.rolePermission;
    expect(res.status).eq(200);
    expect(res.body?.rolePermission).to.have.all.keys(
      'id',
      'role_id',
      'permission_id',
      'organization_id',
      'updated_at',
      'created_at',
    );
  });

  it('should get all role permission from database', async () => {
    const res = await request(app)
      .get('/api/rolePermission/getRolePermissions')
      .set('Authorization', `Bearer ${user.token}`);
    expect(res.status).eq(200);
    expect(res.body?.permissions).to.be.an('array');
    expect(res.body?.permissions[0]).to.have.all.keys(
      'permission_id',
    );
  });

  it('should get permission by id from database', async () => {
    const res = await request(app)
      .get(`/api/rolePermission/getPermissionById?roleId=${role?.org?.id}`)
      .set('Authorization', `Bearer ${user.token}`);
    expect(res.status).eq(200);
    expect(res.body?.permission).to.be.an('array');
    expect(res.body?.permission[0]).to.have.all.keys(
      'permission_id',
    );
  });

  it('should get permission by role id from database', async () => {
    const res = await request(app)
      .get(`/api/rolePermission/getPermissionByRoleId?roleId=${rolePermission?.role_id}`)
      .set('Authorization', `Bearer ${user.token}`);
    expect(res.status).eq(200);
    expect(res.body?.permission).to.be.an('array');
    expect(res.body?.permission[0]).to.have.all.keys(
      'permission_id',
    );
  });

  it('should delete role permission from database', async () => {
    const res = await request(app)
      .delete(`/api/rolePermission/deleteRolePermission?roleId=${rolePermission?.role_id}&permissionId=${rolePermission?.permission_id}`)
      .set('Authorization', `Bearer ${user.token}`);
    expect(res.status).eq(200);
    expect(res.body?.message).eq('Permission unassigned');
    expect(res.body).to.have.all.keys(
      'message',
      'success',
    );
  });
});
