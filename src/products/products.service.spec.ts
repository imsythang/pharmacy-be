import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Test Product',
          description: 'Test Description',
          price: 100,
          stock: 10,
          categoryId: 'cat1',
          imageUrl: 'test.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);

      const result = await service.findAll();
      expect(result).toEqual(mockProducts);
      expect(mockPrismaService.product.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      const mockProduct = {
        id: '1',
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        stock: 10,
        categoryId: 'cat1',
        imageUrl: 'test.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.findOne('1');
      expect(result).toEqual(mockProduct);
      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException if product not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const createProductDto = {
        name: 'New Product',
        description: 'New Description',
        price: 200,
        stock: 20,
        categoryId: 'cat1',
        imageUrl: 'new.jpg',
      };

      const mockCreatedProduct = {
        id: '1',
        ...createProductDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.product.create.mockResolvedValue(mockCreatedProduct);

      const result = await service.create(createProductDto);
      expect(result).toEqual(mockCreatedProduct);
      expect(mockPrismaService.product.create).toHaveBeenCalledWith({
        data: createProductDto,
      });
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const updateProductDto = {
        name: 'Updated Product',
        price: 300,
      };

      const mockUpdatedProduct = {
        id: '1',
        name: 'Updated Product',
        description: 'Test Description',
        price: 300,
        stock: 10,
        categoryId: 'cat1',
        imageUrl: 'test.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.product.update.mockResolvedValue(mockUpdatedProduct);

      const result = await service.update('1', updateProductDto);
      expect(result).toEqual(mockUpdatedProduct);
      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateProductDto,
      });
    });
  });

  describe('remove', () => {
    it('should delete a product', async () => {
      const mockDeletedProduct = {
        id: '1',
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        stock: 10,
        categoryId: 'cat1',
        imageUrl: 'test.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.product.delete.mockResolvedValue(mockDeletedProduct);

      const result = await service.remove('1');
      expect(result).toEqual(mockDeletedProduct);
      expect(mockPrismaService.product.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });
});
