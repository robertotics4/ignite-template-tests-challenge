import { Connection } from "typeorm";
import request from 'supertest';

import createConnection from '../../../../database';
import { app } from "../../../../app";

let connection: Connection;
const userTest = {
  name: 'John Doe',
  email: 'johndoe@email.com',
  password: 'johndoe123'
};

describe('Authenticate user', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post('/api/v1/users').send(userTest);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to authenticate an user', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: userTest.email,
      password: userTest.password,
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.token).toBeTruthy();
  });

  it('should not be able to authenticate an user with invalid email', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: 'invalid-email',
      password: userTest.password,
    });

    expect(response.status).toBe(401);
  });

  it('should not be able to authenticate an user with incorrect password', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: userTest.email,
      password: 'incorrect-password',
    });

    expect(response.status).toBe(401);
  });
});
