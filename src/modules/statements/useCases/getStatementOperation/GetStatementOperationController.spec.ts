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

describe('Get operation statement', () => {
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

  it('should be able to get a statement operation', async () => {
    const newStatementResponse = await request(app).post('/api/v1/statements/deposit').send({
      amount: 50,
      description: 'test deposit'
    }).set({
      Authorization: `Bearer ${token}`
    });

    const response = await request(app).get(`/api/v1/statements/${newStatementResponse.body.id}`).set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(200);
    expect(Number(response.body.amount)).toBe(50);
    expect(response.body.type).toBe('deposit');
  });

  it('should not be able to get a statement operation with invalid token', async () => {
    const newStatementResponse = await request(app).post('/api/v1/statements/withdraw').send({
      amount: 30,
      description: 'test withdraw'
    }).set({
      Authorization: `Bearer ${token}`
    });

    const response = await request(app).get(`/api/v1/statements/${newStatementResponse.body.id}`).set({
      Authorization: 'invalid-token'
    });

    expect(response.status).toBe(401);
  });

  it('should not be able to get a statement with invalid id', async () => {
    const anyUUID = uuid();
    const response = await request(app).get(`/api/v1/statements/${anyUUID}`).set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(404);
  });
});
