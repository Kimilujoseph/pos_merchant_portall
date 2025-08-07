import request from 'supertest';
import express from 'express';
import { App } from '../src/express-app.js';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import config from '../src/Config/index.js';

const prisma = new PrismaClient();
const app = express();
App(app);

const { APP_SECRET } = config;

describe('Shop Creation', () => {
  let createdUsers = [];
  let createdShops = [];
  let superuserAuthToken;
  let managerAuthToken;
  let sellerAuthToken;
  let superuser;
  let managerUser;
  let sellerUser;

  beforeAll(async () => {
    // Create Superuser
    const superuserPassword = 'superuserpassword';
    const superuserEmail = `superuser_${Date.now()}@example.com`;
    const superuserPhone = `+2547${Date.now().toString().slice(-8)}`;
    const hashedSuperuserPassword = await bcrypt.hash(superuserPassword, 10);
    superuser = await prisma.actors.create({
      data: {
        name: 'Test Superuser',
        email: superuserEmail,
        nextofkinname: 'Super Kin',
        nextofkinphonenumber: `+2547${Date.now().toString().slice(-8)}`,
        password: hashedSuperuserPassword,
        phone: superuserPhone,
        role: 'superuser',
        workingstatus: 'active',
      },
    });
    createdUsers.push(superuser);

    const superuserLoginRes = await request(app)
      .post('/api/user/user/signin')
      .send({
        email: superuserEmail,
        password: superuserPassword,
      });
    superuserAuthToken = superuserLoginRes.headers['set-cookie'][0].split(';')[0].split('=')[1];

    // Create Manager
    const managerPassword = 'managerpassword';
    const managerEmail = `manager_${Date.now()}@example.com`;
    const managerPhone = `+2547${Date.now().toString().slice(-8)}`;
    const hashedManagerPassword = await bcrypt.hash(managerPassword, 10);
    managerUser = await prisma.actors.create({
      data: {
        name: 'Test Manager',
        email: managerEmail,
        nextofkinname: 'Manager Kin',
        nextofkinphonenumber: `+2547${Date.now().toString().slice(-8)}`,
        password: hashedManagerPassword,
        phone: managerPhone,
        role: 'manager',
        workingstatus: 'active',
      },
    });
    createdUsers.push(managerUser);

    const managerLoginRes = await request(app)
      .post('/api/user/user/signin')
      .send({
        email: managerEmail,
        password: managerPassword,
      });
    managerAuthToken = managerLoginRes.headers['set-cookie'][0].split(';')[0].split('=')[1];

    // Create Seller
    const sellerPassword = 'sellerpassword';
    const sellerEmail = `seller_${Date.now()}@example.com`;
    const sellerPhone = `+2547${Date.now().toString().slice(-8)}`;
    const hashedSellerPassword = await bcrypt.hash(sellerPassword, 10);
    sellerUser = await prisma.actors.create({
      data: {
        name: 'Test Seller',
        email: sellerEmail,
        nextofkinname: 'Seller Kin',
        nextofkinphonenumber: `+2547${Date.now().toString().slice(-8)}`,
        password: hashedSellerPassword,
        phone: sellerPhone,
        role: 'seller',
        workingstatus: 'active',
      },
    });
    createdUsers.push(sellerUser);

    const sellerLoginRes = await request(app)
      .post('/api/user/user/signin')
      .send({
        email: sellerEmail,
        password: sellerPassword,
      });
    sellerAuthToken = sellerLoginRes.headers['set-cookie'][0].split(';')[0].split('=')[1];

  }, 40000); // Increased timeout for all user creations and logins

  afterAll(async () => {
    // Clean up created shops
    for (let shop of createdShops) {
      await prisma.shops.delete({ where: { id: shop.id } });
    }
    // Clean up created users
    for (let user of createdUsers) {
      await prisma.actors.delete({ where: { id: user.id } });
    }
    await prisma.$disconnect();
  });

  it('should successfully create a new shop as a manager', async () => {
    const shopName = `ManagerShop_${Date.now()}`;
    const address = 'Manager Address';

    const res = await request(app)
      .post('/api/shop/create')
      .set('Cookie', `usertoken=${managerAuthToken}`)
      .send({
        shopName,
        address,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'successfully created');
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('shopName', shopName);

    const createdShop = await prisma.shops.findUnique({ where: { id: res.body.data.id } });
    expect(createdShop).not.toBeNull();
    expect(createdShop.shopName).toBe(shopName);
    createdShops.push(createdShop);
  });

  it('should successfully create a new shop as a superuser', async () => {
    const shopName = `SuperuserShop_${Date.now()}`;
    const address = 'Superuser Address';

    const res = await request(app)
      .post('/api/shop/create')
      .set('Cookie', `usertoken=${superuserAuthToken}`)
      .send({
        shopName,
        address,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'successfully created');
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('shopName', shopName);

    const createdShop = await prisma.shops.findUnique({ where: { id: res.body.data.id } });
    expect(createdShop).not.toBeNull();
    expect(createdShop.shopName).toBe(shopName);
    createdShops.push(createdShop);
  });

  it('should return 403 when a seller tries to create a shop', async () => {
    const shopName = `SellerShop_${Date.now()}`;
    const address = 'Seller Address';

    const res = await request(app)
      .post('/api/shop/create-shop')
      .set('Cookie', `usertoken=${sellerAuthToken}`)
      .send({
        shopName,
        address,
      });

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('message', 'not authorised to create shop');
  });

  it('should return 401 when an unauthenticated user tries to create a shop', async () => {
    const shopName = `UnauthorizedShop_${Date.now()}`;
    const address = 'Unauthorized Address';

    const res = await request(app)
      .post('/api/shop/create')
      .send({
        shopName,
        address,
      });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message', 'not authorised');
  });

  it('should return 400 when creating a shop with a duplicate name', async () => {
    const shopName = `DuplicateShop_${Date.now()}`;
    const address = 'Duplicate Address';

    // Create the first shop successfully
    const firstRes = await request(app)
      .post('/api/shop/create')
      .set('Cookie', `usertoken=${managerAuthToken}`)
      .send({
        shopName,
        address,
      });
    expect(firstRes.statusCode).toBe(201);
    createdShops.push(firstRes.body.data);

    // Attempt to create a second shop with the same name
    const secondRes = await request(app)
      .post('/api/shop/create')
      .set('Cookie', `usertoken=${managerAuthToken}`)
      .send({
        shopName,
        address,
      });

    expect(secondRes.statusCode).toBe(400);
    expect(secondRes.body).toHaveProperty('message', `A shop with the same shopName already exists.`);
  });
});
