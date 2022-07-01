import { Connection } from "typeorm";
import request from 'supertest';

import createConnection from '../../../../database';
import { app } from "../../../../app";

let connection: Connection;

describe('Create user', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to create a new user', async () => {
    const response = await request(app).post('/api/v1/users').send({
      name: 'John Doe',
      email: 'johndoe@email.com',
      password: 'johndoe123'
    });

    expect(response.status).toBe(201);
  });

  it('should not be able to create a new user with the same email', async () => {
    await request(app).post('/api/v1/users').send({
      name: 'John Doe',
      email: 'johndoe@email.com',
      password: 'johndoe123'
    });

    const response = await request(app).post('/api/v1/users').send({
      name: 'Doe John',
      email: 'johndoe@email.com',
      password: 'johndoe123'
    });

    expect(response.status).toBe(400);
  });
});
