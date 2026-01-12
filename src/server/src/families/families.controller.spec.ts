import { Test, TestingModule } from '@nestjs/testing';
import { FamiliesController } from './families.controller';
import { FamiliesService } from './families.service';
import { Types } from 'mongoose';
import { RolesGuard } from '../auth/role.guard';

describe('FamiliesController', () => {
  let controller: FamiliesController;
  let service: jest.Mocked<Partial<FamiliesService>>;

  const familyId = new Types.ObjectId().toString();
  const userId = new Types.ObjectId().toString();

  const mockFamily = {
    _id: familyId,
    name: 'Test Family',
    members: [userId],
    children: [],
    createdBy: userId,
  };

  const mockAuthRequest = {
    user: {
      userId: userId,
    },
    userRole: 'parent',
  } as any;

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByUserId: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      addMember: jest.fn(),
      removeMember: jest.fn(),
      joinToTheFamily: jest.fn(),
      removeChild: jest.fn(),
      getTotalFamiliesCount: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FamiliesController],
      providers: [{ provide: FamiliesService, useValue: service }],
    })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<FamiliesController>(FamiliesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all families', async () => {
      service.findAll!.mockResolvedValue([mockFamily] as any);

      const result = await controller.findAll();

      expect(result).toEqual([mockFamily]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a family by ID', async () => {
      service.findOne!.mockResolvedValue(mockFamily as any);

      const result = await controller.findOne(familyId);

      expect(result).toEqual(mockFamily);
      expect(service.findOne).toHaveBeenCalledWith(familyId);
    });
  });

  describe('findByUserId', () => {
    it('should return families for a user', async () => {
      service.findByUserId!.mockResolvedValue([mockFamily] as any);

      const result = await controller.findByUserId(mockAuthRequest);

      expect(result).toEqual([mockFamily]);
      expect(service.findByUserId).toHaveBeenCalledWith(userId);
    });
  });

  describe('update', () => {
    it('should update a family', async () => {
      const updateDto = { name: 'Updated Family' };
      const updatedFamily = { ...mockFamily, ...updateDto };
      service.update!.mockResolvedValue(updatedFamily as any);

      const result = await controller.update(familyId, updateDto);

      expect(result).toEqual(updatedFamily);
      expect(service.update).toHaveBeenCalledWith(familyId, updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a family', async () => {
      service.remove!.mockResolvedValue(undefined);

      await controller.remove(familyId, mockAuthRequest);

      expect(service.remove).toHaveBeenCalledWith(familyId, 'parent', userId);
    });
  });

  describe('joinToTheFamily', () => {
    it('should join a family with a code', async () => {
      service.joinToTheFamily!.mockResolvedValue(mockFamily as any);

      const result = await controller.joinToTheFamily(
        familyId,
        mockAuthRequest,
      );

      expect(result).toEqual(mockFamily);
      expect(service.joinToTheFamily).toHaveBeenCalledWith(familyId, userId);
    });
  });

  describe('create', () => {
    it('should create a new family', async () => {
      const createDto = { name: 'New Family' };
      service.create!.mockResolvedValue(mockFamily as any);

      const result = await controller.create(createDto, mockAuthRequest);

      expect(result).toEqual(mockFamily);
      expect(service.create).toHaveBeenCalledWith(createDto, userId);
    });
  });
});
