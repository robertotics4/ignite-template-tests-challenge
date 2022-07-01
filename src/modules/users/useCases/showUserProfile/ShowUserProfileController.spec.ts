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

describe('Show user profile', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post('/api/v1/users').send(userTest);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to show the user profile', async () => {
    const authenticationResponse = await request(app).post('/api/v1/sessions').send({
      email: userTest.email,
      password: userTest.password,
    });

    const response = await request(app).get('/api/v1/profile').set({
      Authorization: `Bearer ${authenticationResponse.body.token}`
    });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe(userTest.name);
    expect(response.body.email).toBe(userTest.email);
  });

  it('should not be able to show the user profile with invalid token', async () => {
    const response = await request(app).get('/api/v1/profile').set({
      Authorization: 'invalid-token',
    });

    expect(response.status).toBe(401);
  });
});
