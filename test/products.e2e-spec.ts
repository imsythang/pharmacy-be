import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { Role } from '../generated/prisma';
import * as bcrypt from 'bcrypt';

describe('ProductsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await prisma.product.deleteMany({
      where: { name: { contains: 'Test Product' } },
    });
    await prisma.user.deleteMany({
      where: { email: { contains: 'admin@test.com' } },
    });
    await prisma.category.deleteMany({
      where: { name: { contains: 'Test Category' } },
    });
    await app.close();
  });

  describe('/products (GET)', () => {
    it('should return an array of products', () => {
      return request(app.getHttpServer())
        .get('/products')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/products (POST)', () => {
    let authToken: string;
    let testCategoryId: string;

    beforeAll(async () => {
      // Create test category
      const category = await prisma.category.create({
        data: { name: 'Test Category POST' },
      });
      testCategoryId = category.id;
      // Create admin user
      const adminPassword = await bcrypt.hash('admin123', 10);
      await prisma.user.upsert({
        where: { email: 'admin@test.com' },
        update: {},
        create: {
          email: 'admin@test.com',
          password: adminPassword,
          name: 'Test Admin',
          role: Role.ADMIN,
        },
      });
      // Login
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@test.com', password: 'admin123' });
      authToken = (loginResponse.body as { access_token: string }).access_token;
    });

    afterAll(async () => {
      await prisma.product.deleteMany({
        where: { categoryId: testCategoryId },
      });
      await prisma.category.deleteMany({ where: { id: testCategoryId } });
    });

    it('should create a new product', () => {
      const newProduct = {
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        stock: 10,
        categoryId: testCategoryId,
        imageUrl: 'test.jpg',
      };
      return request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newProduct)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(typeof res.body.name).toBe('string');
          expect(res.body.name).toBe(newProduct.name);
        });
    });

    it('should return 401 if not authenticated', () => {
      return request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Test Product',
          description: 'Test Description',
          price: 100,
          stock: 10,
          categoryId: testCategoryId,
          imageUrl: 'test.jpg',
        })
        .expect(401);
    });
  });

  describe('/products/:id (GET)', () => {
    let testProductId: string;
    let testCategoryId: string;

    beforeAll(async () => {
      const category = await prisma.category.create({
        data: { name: 'Test Category GET' },
      });
      testCategoryId = category.id;
      const product = await prisma.product.create({
        data: {
          name: 'Test Product for GET',
          description: 'Test Description',
          price: 100,
          stock: 10,
          categoryId: testCategoryId,
          imageUrl: 'test.jpg',
        },
      });
      testProductId = product.id.toString();
    });

    afterAll(async () => {
      await prisma.product.deleteMany({
        where: { categoryId: testCategoryId },
      });
      await prisma.category.deleteMany({ where: { id: testCategoryId } });
    });

    it('should return a product by id', () => {
      return request(app.getHttpServer())
        .get(`/products/${testProductId}`)
        .expect(200)
        .expect((res) => {
          expect(typeof res.body.id).toBe('string');
          expect(res.body.id).toBe(testProductId);
        });
    });

    it('should return 404 for non-existent product', () => {
      return request(app.getHttpServer()).get('/products/99999').expect(404);
    });
  });

  describe('/products/:id (PUT)', () => {
    let testProductId: string;
    let testCategoryId: string;
    let authToken: string;

    beforeAll(async () => {
      const category = await prisma.category.create({
        data: { name: 'Test Category PUT' },
      });
      testCategoryId = category.id;
      const product = await prisma.product.create({
        data: {
          name: 'Test Product for PUT',
          description: 'Test Description',
          price: 100,
          stock: 10,
          categoryId: testCategoryId,
          imageUrl: 'test.jpg',
        },
      });
      testProductId = product.id.toString();
      // Create admin user
      const adminPassword = await bcrypt.hash('admin123', 10);
      await prisma.user.upsert({
        where: { email: 'admin@test.com' },
        update: {},
        create: {
          email: 'admin@test.com',
          password: adminPassword,
          name: 'Test Admin',
          role: Role.ADMIN,
        },
      });
      // Login
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@test.com', password: 'admin123' });
      authToken = (loginResponse.body as { access_token: string }).access_token;
    });

    afterAll(async () => {
      await prisma.product.deleteMany({
        where: { categoryId: testCategoryId },
      });
      await prisma.category.deleteMany({ where: { id: testCategoryId } });
    });

    it('should update a product', () => {
      const updateData = {
        name: 'Updated Test Product',
        price: 200,
      };
      return request(app.getHttpServer())
        .put(`/products/${testProductId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(typeof res.body.name).toBe('string');
          expect(res.body.name).toBe(updateData.name);
          expect(typeof res.body.price).toBe('number');
          expect(res.body.price).toBe(updateData.price);
        });
    });

    it('should return 401 if not authenticated', () => {
      return request(app.getHttpServer())
        .put(`/products/${testProductId}`)
        .send({
          name: 'Updated Test Product',
          price: 200,
        })
        .expect(401);
    });
  });

  describe('/products/:id (DELETE)', () => {
    let testProductId: string;
    let testCategoryId: string;
    let authToken: string;

    beforeAll(async () => {
      const category = await prisma.category.create({
        data: { name: 'Test Category DELETE' },
      });
      testCategoryId = category.id;
      const product = await prisma.product.create({
        data: {
          name: 'Test Product for DELETE',
          description: 'Test Description',
          price: 100,
          stock: 10,
          categoryId: testCategoryId,
          imageUrl: 'test.jpg',
        },
      });
      testProductId = product.id.toString();
      // Create admin user
      const adminPassword = await bcrypt.hash('admin123', 10);
      await prisma.user.upsert({
        where: { email: 'admin@test.com' },
        update: {},
        create: {
          email: 'admin@test.com',
          password: adminPassword,
          name: 'Test Admin',
          role: Role.ADMIN,
        },
      });
      // Login
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@test.com', password: 'admin123' });
      authToken = (loginResponse.body as { access_token: string }).access_token;
    });

    afterAll(async () => {
      await prisma.product.deleteMany({
        where: { categoryId: testCategoryId },
      });
      await prisma.category.deleteMany({ where: { id: testCategoryId } });
    });

    it('should delete a product', () => {
      return request(app.getHttpServer())
        .delete(`/products/${testProductId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should return 401 if not authenticated', () => {
      return request(app.getHttpServer())
        .delete(`/products/${testProductId}`)
        .expect(401);
    });
  });
});
