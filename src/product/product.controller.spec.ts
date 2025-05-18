import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

describe('ProductController', () => {
  let controller: ProductController;
  let service: ProductService;

  const mockProductService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: mockProductService,
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    service = module.get<ProductService>(ProductService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const mockProducts = [
        {
          id: 1,
          name: 'Test Product',
          description: 'Test Description',
          price: 100,
          stock: 10,
          categoryId: 1,
          imageUrl: 'test.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
          category: {
            id: 1,
            name: 'Test Category',
            slug: 'test-category',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      ];

      mockProductService.findAll.mockResolvedValue(mockProducts);

      const result = await controller.findAll();
      expect(result).toEqual(mockProducts);
      expect(mockProductService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      const mockProduct = {
        id: 1,
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        stock: 10,
        categoryId: 1,
        imageUrl: 'test.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
        category: {
          id: 1,
          name: 'Test Category',
          slug: 'test-category',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      mockProductService.findOne.mockResolvedValue(mockProduct);

      const result = await controller.findOne('1');
      expect(result).toEqual(mockProduct);
      expect(mockProductService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const createProductDto = {
        name: 'New Product',
        description: 'New Description',
        price: 200,
        stock: 20,
        categoryId: 1,
        imageUrl: 'new.jpg',
      };

      const mockCreatedProduct = {
        id: 1,
        ...createProductDto,
        createdAt: new Date(),
        updatedAt: new Date(),
        category: {
          id: 1,
          name: 'Test Category',
          slug: 'test-category',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      mockProductService.create.mockResolvedValue(mockCreatedProduct);

      const result = await controller.create(createProductDto);
      expect(result).toEqual(mockCreatedProduct);
      expect(mockProductService.create).toHaveBeenCalledWith(createProductDto);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const updateProductDto = {
        name: 'Updated Product',
        price: 300,
      };

      const mockUpdatedProduct = {
        id: 1,
        name: 'Updated Product',
        description: 'Test Description',
        price: 300,
        stock: 10,
        categoryId: 1,
        imageUrl: 'test.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
        category: {
          id: 1,
          name: 'Test Category',
          slug: 'test-category',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      mockProductService.update.mockResolvedValue(mockUpdatedProduct);

      const result = await controller.update('1', updateProductDto);
      expect(result).toEqual(mockUpdatedProduct);
      expect(mockProductService.update).toHaveBeenCalledWith(
        1,
        updateProductDto,
      );
    });
  });

  describe('remove', () => {
    it('should delete a product', async () => {
      const mockDeletedProduct = {
        id: 1,
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        stock: 10,
        categoryId: 1,
        imageUrl: 'test.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
        category: {
          id: 1,
          name: 'Test Category',
          slug: 'test-category',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      mockProductService.remove.mockResolvedValue(mockDeletedProduct);

      const result = await controller.remove('1');
      expect(result).toEqual(mockDeletedProduct);
      expect(mockProductService.remove).toHaveBeenCalledWith(1);
    });
  });
});
