import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';

describe('CategoryController', () => {
  let controller: CategoryController;
  let service: CategoryService;

  const mockCategoryService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          provide: CategoryService,
          useValue: mockCategoryService,
        },
      ],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
    service = module.get<CategoryService>(CategoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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

      mockCategoryService.findAll.mockResolvedValue(mockCategories);

      const result = await controller.findAll();
      expect(result).toEqual(mockCategories);
      expect(mockCategoryService.findAll).toHaveBeenCalled();
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

      mockCategoryService.findOne.mockResolvedValue(mockCategory);

      const result = await controller.findOne('1');
      expect(result).toEqual(mockCategory);
      expect(mockCategoryService.findOne).toHaveBeenCalledWith(1);
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

      mockCategoryService.create.mockResolvedValue(mockCreatedCategory);

      const result = await controller.create(createCategoryDto);
      expect(result).toEqual(mockCreatedCategory);
      expect(mockCategoryService.create).toHaveBeenCalledWith(
        createCategoryDto,
      );
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

      mockCategoryService.update.mockResolvedValue(mockUpdatedCategory);

      const result = await controller.update('1', updateCategoryDto);
      expect(result).toEqual(mockUpdatedCategory);
      expect(mockCategoryService.update).toHaveBeenCalledWith(
        1,
        updateCategoryDto,
      );
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

      mockCategoryService.remove.mockResolvedValue(mockDeletedCategory);

      const result = await controller.remove('1');
      expect(result).toEqual(mockDeletedCategory);
      expect(mockCategoryService.remove).toHaveBeenCalledWith(1);
    });
  });
});
