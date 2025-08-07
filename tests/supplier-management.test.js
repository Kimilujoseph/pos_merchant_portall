import request from 'supertest';
import express from 'express';
import { App } from '../src/express-app.js';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const app = express();
App(app);

describe('Supplier Management', () => {
  let createdUsers = [];
  let createdSuppliers = [];
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
    // Clean up created suppliers
    for (let supplier of createdSuppliers) {
      await prisma.supplier.delete({ where: { id: supplier.id } });
    }
    // Clean up created users
    for (let user of createdUsers) {
      await prisma.actors.delete({ where: { id: user.id } });
    }
    await prisma.$disconnect();
  });

  it('should successfully create a new supplier as a manager', async () => {
    const supplierName = `ManagerSupplier_${Date.now()}`;
    const supplierEmail = `manager_supplier_${Date.now()}@example.com`;
    const supplierPhone = `+2547${Date.now().toString().slice(-8)}`;

    const res = await request(app)
      .post('/api/supplier/supplier')
      .set('Cookie', `usertoken=${managerAuthToken}`)
      .send({
        name: supplierName,
        contactName: 'Manager Contact',
        phone: supplierPhone,
        email: supplierEmail,
        address: 'Manager Supplier Address',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'Supplier created successfully');
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('name', supplierName);

    const createdSupplier = await prisma.supplier.findUnique({ where: { id: res.body.data.id } });
    expect(createdSupplier).not.toBeNull();
    expect(createdSupplier.name).toBe(supplierName);
    createdSuppliers.push(createdSupplier);
  });

  it('should successfully create a new supplier as a superuser', async () => {
    const supplierName = `SuperuserSupplier_${Date.now()}`;
    const supplierEmail = `superuser_supplier_${Date.now()}@example.com`;
    const supplierPhone = `+2547${Date.now().toString().slice(-8)}`;

    const res = await request(app)
      .post('/api/supplier/supplier')
      .set('Cookie', `usertoken=${superuserAuthToken}`)
      .send({
        name: supplierName,
        contactName: 'Superuser Contact',
        phone: supplierPhone,
        email: supplierEmail,
        address: 'Superuser Supplier Address',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'Supplier created successfully');
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('name', supplierName);

    const createdSupplier = await prisma.supplier.findUnique({ where: { id: res.body.data.id } });
    expect(createdSupplier).not.toBeNull();
    expect(createdSupplier.name).toBe(supplierName);
    createdSuppliers.push(createdSupplier);
  });

  it('should return 403 when a seller tries to create a supplier', async () => {
    const supplierName = `SellerSupplier_${Date.now()}`;
    const supplierEmail = `seller_supplier_${Date.now()}@example.com`;
    const supplierPhone = `+2547${Date.now().toString().slice(-8)}`;

    const res = await request(app)
      .post('/api/supplier/supplier')
      .set('Cookie', `usertoken=${sellerAuthToken}`)
      .send({
        name: supplierName,
        contactName: 'Seller Contact',
        phone: supplierPhone,
        email: supplierEmail,
        address: 'Seller Supplier Address',
      });

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('message', 'Not authorized to create suppliers');
  });

  it('should return 401 when an unauthenticated user tries to create a supplier', async () => {
    const supplierName = `UnauthorizedSupplier_${Date.now()}`;
    const supplierEmail = `unauth_supplier_${Date.now()}@example.com`;
    const supplierPhone = `+2547${Date.now().toString().slice(-8)}`;

    const res = await request(app)
      .post('/api/supplier/supplier')
      .send({
        name: supplierName,
        contactName: 'Unauthorized Contact',
        phone: supplierPhone,
        email: supplierEmail,
        address: 'Unauthorized Supplier Address',
      });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message', 'not authorised');
  });

  it('should return 400 when creating a supplier with a duplicate name', async () => {
    const supplierName = `DuplicateSupplier_${Date.now()}`;
    const supplierEmail = `duplicate_supplier_${Date.now()}@example.com`;
    const supplierPhone = `+2547${Date.now().toString().slice(-8)}`;

    // Create the first supplier successfully
    const firstRes = await request(app)
      .post('/api/supplier/supplier')
      .set('Cookie', `usertoken=${managerAuthToken}`)
      .send({
        name: supplierName,
        contactName: 'Duplicate Contact 1',
        phone: supplierPhone,
        email: supplierEmail,
        address: 'Duplicate Supplier Address 1',
      });
    expect(firstRes.statusCode).toBe(201);
    createdSuppliers.push(firstRes.body.data);

    // Attempt to create a second supplier with the same name
    const secondRes = await request(app)
      .post('/api/supplier/supplier')
      .set('Cookie', `usertoken=${managerAuthToken}`)
      .send({
        name: supplierName,
        contactName: 'Duplicate Contact 2',
        phone: `+2547${Date.now().toString().slice(-8)}`,
        email: `another_duplicate_${Date.now()}@example.com`,
        address: 'Duplicate Supplier Address 2',
      });

    expect(secondRes.statusCode).toBe(400);
    expect(secondRes.body).toHaveProperty('message', `A supplier with the same name already exists.`);
  });

  it('should return 400 when creating a supplier with a duplicate email', async () => {
    const supplierName1 = `EmailSupplier1_${Date.now()}`;
    const supplierName2 = `EmailSupplier2_${Date.now()}`;
    const supplierEmail = `duplicate_email_${Date.now()}@example.com`;
    const supplierPhone1 = `+2547${Date.now().toString().slice(-8)}`;
    const supplierPhone2 = `+2547${Date.now().toString().slice(-8)}`;

    // Create the first supplier successfully
    const firstRes = await request(app)
      .post('/api/supplier/supplier')
      .set('Cookie', `usertoken=${managerAuthToken}`)
      .send({
        name: supplierName1,
        contactName: 'Email Contact 1',
        phone: supplierPhone1,
        email: supplierEmail,
        address: 'Email Supplier Address 1',
      });
    expect(firstRes.statusCode).toBe(201);
    createdSuppliers.push(firstRes.body.data);

    // Attempt to create a second supplier with the same email
    const secondRes = await request(app)
      .post('/api/supplier/supplier')
      .set('Cookie', `usertoken=${managerAuthToken}`)
      .send({
        name: supplierName2,
        contactName: 'Email Contact 2',
        phone: supplierPhone2,
        email: supplierEmail,
        address: 'Email Supplier Address 2',
      });

    expect(secondRes.statusCode).toBe(400);
    expect(secondRes.body).toHaveProperty('message', `A supplier with the same email already exists.`);
  });

  it('should return 400 when creating a supplier with a duplicate phone', async () => {
    const supplierName1 = `PhoneSupplier1_${Date.now()}`;
    const supplierName2 = `PhoneSupplier2_${Date.now()}`;
    const supplierEmail1 = `duplicate_phone1_${Date.now()}@example.com`;
    const supplierEmail2 = `duplicate_phone2_${Date.now()}@example.com`;
    const supplierPhone = `+2547${Date.now().toString().slice(-8)}`;

    // Create the first supplier successfully
    const firstRes = await request(app)
      .post('/api/supplier/supplier')
      .set('Cookie', `usertoken=${managerAuthToken}`)
      .send({
        name: supplierName1,
        contactName: 'Phone Contact 1',
        phone: supplierPhone,
        email: supplierEmail1,
        address: 'Phone Supplier Address 1',
      });
    expect(firstRes.statusCode).toBe(201);
    createdSuppliers.push(firstRes.body.data);

    // Attempt to create a second supplier with the same phone
    const secondRes = await request(app)
      .post('/api/supplier/supplier')
      .set('Cookie', `usertoken=${managerAuthToken}`)
      .send({
        name: supplierName2,
        contactName: 'Phone Contact 2',
        phone: supplierPhone,
        email: supplierEmail2,
        address: 'Phone Supplier Address 2',
      });

    expect(secondRes.statusCode).toBe(400);
    expect(secondRes.body).toHaveProperty('message', `A supplier with the same phone already exists.`);
  });
});
