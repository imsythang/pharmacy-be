import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CategoryService', () => {
  let service: CategoryService;
  let prisma: PrismaService;

  const mockPrismaService = {
    category: {
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
        CategoryService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of categories', async () => {
      const mockCategories = [
        {
          id: 1,
          name: 'Test Category',
          slug: 'test-category',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.category.findMany.mockResolvedValue(mockCategories);

      const result = await service.findAll();
      expect(result).toEqual(mockCategories);
      expect(mockPrismaService.category.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a category by id', async () => {
      const mockCategory = {
        id: 1,
        name: 'Test Category',
        slug: 'test-category',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);

      const result = await service.findOne(1);
      expect(result).toEqual(mockCategory);
      expect(mockPrismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('create', () => {
    it('should create a new category', async () => {
      const createCategoryDto = {
        name: 'New Category',
        slug: 'new-category',
      };

      const mockCreatedCategory = {
        id: 1,
        ...createCategoryDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.category.create.mockResolvedValue(mockCreatedCategory);

      const result = await service.create(createCategoryDto);
      expect(result).toEqual(mockCreatedCategory);
      expect(mockPrismaService.category.create).toHaveBeenCalledWith({
        data: createCategoryDto,
      });
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const updateCategoryDto = {
        name: 'Updated Category',
      };

      const mockUpdatedCategory = {
        id: 1,
        name: 'Updated Category',
        slug: 'test-category',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.category.update.mockResolvedValue(mockUpdatedCategory);

      const result = await service.update(1, updateCategoryDto);
      expect(result).toEqual(mockUpdatedCategory);
      expect(mockPrismaService.category.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateCategoryDto,
      });
    });
  });

  describe('remove', () => {
    it('should delete a category', async () => {
      const mockDeletedCategory = {
        id: 1,
        name: 'Test Category',
        slug: 'test-category',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.category.delete.mockResolvedValue(mockDeletedCategory);

      const result = await service.remove(1);
      expect(result).toEqual(mockDeletedCategory);
      expect(mockPrismaService.category.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });
});
