import 'dotenv/config';
import { faker } from '@faker-js/faker';
import { expect } from 'chai';
import request from 'supertest';
import app from '../index.mjs';
import Role from '../models/role.mjs';

describe('### USER Process ----user  create ###', () => {
  it('should not create a user in database with invalid org-id`', async () => {
    const res = await request(app)
      .post('/api/user/create')
      .send({
        email: faker.internet.email(undefined, undefined, 'example.com'),
        full_name: faker.name.fullName(),
        password: faker.internet.password(20),
        role_id: Role.genralRoles.superAdmin.id,
        organization_id: '',
      })
      .set('Accept', 'application/json');
    expect(res.status).eq(500);
  });
});
