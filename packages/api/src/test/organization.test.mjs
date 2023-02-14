import 'dotenv/config';
import { faker } from '@faker-js/faker';
import { expect } from 'chai';
import request from 'supertest';
import app from '../index.mjs';
import { createTestUser, deleteTestOrg, deleteTestRoles, deleteTestUser } from './common_function.mjs';

describe('### Organization Process ###', () => {
  let user = null;
  let organizationDetails = null;
  before(async () => {
    const response = await createTestUser();
    user = response.body;
  });

  after(async () => {
    await deleteTestUser(user?.user?.id);
    await deleteTestRoles(user?.user?.organization_id);
    await deleteTestOrg(user?.user?.organization_id);
  });

  it('should create a Sub organization in the database', async () => {
    const res = await request(app)
      .post('/api/organization/createSubOrg')
      .send({
        parent_org_id: user.user.organization_id,
        name: faker.company.name(),
      })
      .set('Authorization', `Bearer ${user.token}`);
    organizationDetails = res.body;
    expect(res.status).eq(200);
    expect(res.body?.org).to.have.all.keys(
      'id',
      'name',
      'logo_filename',
      'parent_org_id',
      'settings',
      'updated_at',
      'created_at',
      'favicon_filename',
      'config',
      'manual',
      'azure_ad_secret',
      'google_workspace_token',
    );
  });

  it('should get all child organizations from database', async () => {
    const res = await request(app)
      .post('/api/organization/get-child-orgs')
      .send({
        id: user.user.organization_id,
      })
      .set('Authorization', `Bearer ${user.token}`);
    expect(res.status).eq(200);
    expect(res.body?.organizations).to.be.an('array');
    expect(res.body?.organizations[0]).to.include.all.keys('key', 'label', 'parentId', 'manual', 'children');
  });

  it('should get detail of the organizations from database', async () => {
    const res = await request(app)
      .get(`/api/organization/${organizationDetails.org.id}`)
      .set('Authorization', `Bearer ${user.token}`);
    expect(res.status).eq(200);
    expect(res.body?.organization).to.have.all.keys(
      'id',
      'name',
      'logo_filename',
      'parent_org_id',
      'settings',
      'updated_at',
      'created_at',
      'favicon_filename',
      'config',
      'manual',
      'azure_ad_secret',
      'google_workspace_token',
    );
  });

  it('should create a azure AD secret', async () => {
    const res = await request(app)
      .post('/api/organization/createAzureADSecret')
      .send({
        id: user.user.organization_id,
      })
      .set('Authorization', `Bearer ${user.token}`);
    expect(res.status).eq(200);
    expect(res.body).to.have.all.keys(
      'azure_ad_secret',
      'success',
    );
  });

  it('should update the alert phone number in database', async () => {
    const res = await request(app)
      .post('/api/organization/update/alertPhoneNumbers')
      .send({
        id: user.user.organization_id,
        phoneNumbers: faker.phone.number('501-###-###'),
      })
      .set('Authorization', `Bearer ${user.token}`);
    expect(res.status).eq(200);
    expect(res.body?.organization).to.have.all.keys(
      'id',
      'name',
      'logo_filename',
      'parent_org_id',
      'settings',
      'updated_at',
      'created_at',
      'favicon_filename',
      'config',
      'manual',
      'azure_ad_secret',
      'google_workspace_token',
    );
  });

  it('should not update the alert phone number in database', async () => {
    const res = await request(app)
      .post('/api/organization/update/alertPhoneNumbers')
      .send({
        id: user.user.organization_id,
        phoneNumbers: null,
      })
      .set('Authorization', `Bearer ${user.token}`);
    expect(res.status).eq(200);
    expect(res.body).to.have.all.keys(
      'message',
      'success',
    );
    expect(res.body?.message).to.equal('Please enter a valid phone number');
    expect(res.body?.success).to.equal(false);
  });

  it('should update the name of the organization in the database', async () => {
    const res = await request(app)
      .post('/api/organization')
      .send({
        id: user.user.organization_id,
        name: faker.company.name(),
      })
      .set('Authorization', `Bearer ${user.token}`);
    expect(res.status).eq(200);
    expect(res.body?.organization).to.have.all.keys(
      'id',
      'name',
      'logo_filename',
      'parent_org_id',
      'settings',
      'updated_at',
      'created_at',
      'favicon_filename',
      'config',
      'manual',
      'azure_ad_secret',
      'google_workspace_token',
    );
  });
});
