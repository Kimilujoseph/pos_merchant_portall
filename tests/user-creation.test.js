import request from 'supertest';
import express from 'express';
import { App } from '../src/express-app.js';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const app = express();
App(app);

describe('User Creation', () => {
  let createdUsers = [];
  let superuserAuthToken;
  let superuser;

  beforeAll(async () => {
    // Create a superuser to authenticate seller creation
    const hashedPassword = await bcrypt.hash('superuserpassword', 10);
    superuser = await prisma.actors.create({
      data: {
        name: 'Test Superuser',
        email: `superuser_${Date.now()}@example.com`,
        nextofkinname: 'Super Kin',
        nextofkinphonenumber: `+2547${Date.now().toString().slice(-8)}`,
        password: hashedPassword,
        phone: `+2547${Date.now().toString().slice(-8)}`,
        role: 'superuser',
        workingstatus: 'active',
      },
    });
    createdUsers.push(superuser);

    const res = await request(app)
      .post('/api/user/user/signin')
      .send({
        email: superuser.email,
        password: 'superuserpassword',
      });
    superuserAuthToken = res.headers['set-cookie'][0].split(';')[0].split('=')[1];
  }, 30000); // Increase timeout for setup

  afterAll(async () => {
    // Clean up created users
    for (let user of createdUsers) {
      await prisma.actors.delete({ where: { id: user.id } });
    }
    await prisma.$disconnect();
  });

  it('should successfully create a new manager user', async () => {
    const uniqueEmail = `manager_${Date.now()}@example.com`;
    const uniquePhone = `+2547${Date.now().toString().slice(-8)}`;
    const password = 'testpassword';

    const res = await request(app)
      .post('/api/user/superuser/signup')
      .send({
        name: 'Test Manager',
        email: uniqueEmail,
        nextofkinname: 'Manager Kin',
        nextofkinphonenumber: `+2547${Date.now().toString().slice(-8)}`,
        password: password,
        phonenumber: uniquePhone,
        role: 'manager',
        workingstatus: 'active',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toHaveProperty('id');
    expect(res.body.message).toHaveProperty('email', uniqueEmail);
    expect(res.body.message).toHaveProperty('role', 'superuser');

    const createdUser = await prisma.actors.findUnique({ where: { id: res.body.message.id } });
    expect(createdUser).not.toBeNull();
    expect(createdUser.email).toBe(uniqueEmail);
    expect(createdUser.role).toBe('superuser')

    createdUsers.push(createdUser);
  });

  it('should successfully create a new seller user', async () => {
    const uniqueEmail = `seller_${Date.now()}@example.com`;
    const uniquePhone = `+2547${Date.now().toString().slice(-8)}`;
    const password = 'testpassword';

    const res = await request(app)
      .post('/api/user/seller/signup')
      .set('Cookie', `usertoken=${superuserAuthToken}`)
      .send({
        name: 'Test Seller',
        email: uniqueEmail,
        nextofkinname: 'Seller Kin',
        nextofkinphonenumber: `+2547${Date.now().toString().slice(-8)}`,
        password: password,
        phonenumber: uniquePhone,
        role: 'seller',
        workingstatus: 'active',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.newuser).toHaveProperty('id');
    expect(res.body.newuser).toHaveProperty('email', uniqueEmail);
    expect(res.body.newuser).toHaveProperty('role', 'seller');

    const createdUser = await prisma.actors.findUnique({ where: { id: res.body.newuser.id } });
    expect(createdUser).not.toBeNull();
    expect(createdUser.email).toBe(uniqueEmail);
    expect(createdUser.role).toBe('seller');

    createdUsers.push(createdUser);
  });
});