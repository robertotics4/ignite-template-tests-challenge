import { Connection } from "typeorm";
import request from 'supertest';

import createConnection from '../../../../database';
import { app } from "../../../../app";

let connection: Connection;
let token: string;

const userTest = {
  name: 'John Doe',
  email: 'johndoe@email.com',
  password: 'johndoe123'
};

describe('Create statement', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post('/api/v1/users').send(userTest);

    const response = await request(app).post('/api/v1/sessions').send({
      email: userTest.email,
      password: userTest.password,
    });

    token = response.body.token;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to create a new deposit', async () => {
    const response = await request(app).post('/api/v1/statements/deposit').send({
      amount: 50,
      description: 'test deposit'
    }).set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(201);
    expect(response.body.amount).toBe(50);
    expect(response.body.type).toBe('deposit');
  });

  it('should be able to create a new withdraw', async () => {
    const response = await request(app).post('/api/v1/statements/withdraw').send({
      amount: 30,
      description: 'test withdraw'
    }).set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(201);
    expect(response.body.amount).toBe(30);
    expect(response.body.type).toBe('withdraw');
  });

  it('should not be able to create a new statement with invalid token', async () => {
    const response = await request(app).post('/api/v1/statements/withdraw').send({
      amount: 10,
      description: 'test withdraw'
    }).set({
      Authorization: 'invalid-token'
    });

    expect(response.status).toBe(401);
  });

  it('should not be able to create a new withdrway with insufficient funds', async () => {
    const response = await request(app).post('/api/v1/statements/withdraw').send({
      amount: 60,
      description: 'test withdraw'
    }).set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(400);
  });
});
