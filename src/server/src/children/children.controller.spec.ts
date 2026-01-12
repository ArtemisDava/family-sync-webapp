import { Test, TestingModule } from '@nestjs/testing';
import { ChildrenController } from './children.controller';
import { ChildrenService } from './children.service';
import { Types } from 'mongoose';
import { RolesGuard } from '../auth/role.guard';

describe('ChildrenController', () => {
  let controller: ChildrenController;
  let service: jest.Mocked<Partial<ChildrenService>>;

  const childId = new Types.ObjectId().toString();
  const familyId = new Types.ObjectId().toString();
  const userId = new Types.ObjectId().toString();

  const mockChild = {
    _id: childId,
    name: 'Test Child',
    birthDate: new Date('2015-01-01'),
    family: familyId,
    guardians: [userId],
    color: '#ff0000',
  };

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findByUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChildrenController],
      providers: [{ provide: ChildrenService, useValue: service }],
    })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ChildrenController>(ChildrenController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all children', async () => {
      service.findAll!.mockResolvedValue([mockChild] as any);

      const result = await controller.findAll();

      expect(result).toEqual([mockChild]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a child by ID', async () => {
      service.findOne!.mockResolvedValue(mockChild as any);

      const result = await controller.findOne(childId);

      expect(result).toEqual(mockChild);
      expect(service.findOne).toHaveBeenCalledWith(childId);
    });
  });

  describe('update', () => {
    it('should update a child', async () => {
      const updateDto = { name: 'Updated Child' };
      const updatedChild = { ...mockChild, ...updateDto };
      service.update!.mockResolvedValue(updatedChild as any);

      const result = await controller.update(childId, updateDto);

      expect(result).toEqual(updatedChild);
      expect(service.update).toHaveBeenCalledWith(childId, updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a child', async () => {
      service.remove!.mockResolvedValue(undefined);

      await controller.remove(childId);

      expect(service.remove).toHaveBeenCalledWith(childId);
    });
  });
});
