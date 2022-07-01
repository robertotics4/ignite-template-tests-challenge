import { Connection } from "typeorm";
import request from 'supertest';
import { v4 as uuid } from 'uuid';

import createConnection from '../../../../database';
import { app } from "../../../../app";

let connection: Connection;
let token: string;

const userTest = {
  name: 'John Doe',
  email: 'johndoe@email.com',
  password: 'johndoe123'
};

describe('Get balance', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post('/api/v1/users').send(userTest);

    const response = await request(app).post('/api/v1/sessions').send({
      email: userTest.email,
      password: userTest.password,
    });

    token = response.body.token;

    await request(app).post('/api/v1/statements/deposit').send({
      amount: 100,
      description: 'test deposit'
    }).set({
      Authorization: `Bearer ${token}`
    });

    await request(app).post('/api/v1/statements/withdraw').send({
      amount: 30,
      description: 'test withdraw'
    }).set({
      Authorization: `Bearer ${token}`
    });

    await request(app).post('/api/v1/statements/withdraw').send({
      amount: 20,
      description: 'test withdraw'
    }).set({
      Authorization: `Bearer ${token}`
    });
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to get a balance', async () => {
    const response = await request(app).get('/api/v1/statements/balance').set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(200);
    expect(response.body.statement.length).toBe(3);
    expect(response.body.balance).toBe(50);
  });

  it('should not be able to get a balance with a invalid token', async () => {
    const response = await request(app).get('/api/v1/statements/balance').set({
      Authorization: 'invalid-token'
    });

    expect(response.status).toBe(401);
  });
});
