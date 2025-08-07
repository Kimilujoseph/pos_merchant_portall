import request from 'supertest';
import express from 'express';
import { App } from '../src/express-app.js';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const app = express();
App(app);

describe('User Login', () => {
  let createdUser;
  let userPassword = 'testpassword123';

  beforeAll(async () => {
    // Create a user to test login with
    const uniqueEmail = `login_test_${Date.now()}@example.com`;
    const uniquePhone = `+2547${Date.now().toString().slice(-8)}`;
    const hashedPassword = await bcrypt.hash(userPassword, 10);

    createdUser = await prisma.actors.create({
      data: {
        name: 'Login Test User',
        email: uniqueEmail,
        nextofkinname: 'Login Kin',
        nextofkinphonenumber: `+2547${Date.now().toString().slice(-8)}`,
        password: hashedPassword,
        phone: uniquePhone,
        role: 'seller',
        workingstatus: 'active',
      },
    });
  }, 30000); // Increase timeout for setup

  afterAll(async () => {
    // Clean up the created user
    if (createdUser) {
      await prisma.actors.delete({ where: { id: createdUser.id } });
    }
    await prisma.$disconnect();
  });

  it('should successfully log in a user with valid credentials', async () => {
    const res = await request(app)
      .post('/api/user/user/signin')
      .send({
        email: createdUser.email,
        password: userPassword,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('email', createdUser.email);
    expect(res.headers['set-cookie']).toBeDefined();
    expect(res.headers['set-cookie'][0]).toContain('usertoken=');
  });

  it('should return 404 for a non-existent user', async () => {
    const res = await request(app)
      .post('/api/user/user/signin')
      .send({
        email: `nonexistent_${Date.now()}@example.com`,
        password: 'anypassword',
      });

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message', 'The specified user does not exist');
  });

  it('should return 401 for invalid password', async () => {
    const res = await request(app)
      .post('/api/user/user/signin')
      .send({
        email: createdUser.email,
        password: 'wrongpassword',
      });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message', 'Invalid password');
  });
});
