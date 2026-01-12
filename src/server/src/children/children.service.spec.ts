import { Test, TestingModule } from '@nestjs/testing';
import { ChildrenService } from './children.service';
import { getModelToken } from '@nestjs/mongoose';
import { Child } from './entities/child.entity';
import { Family } from '../families/entities/family.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ChildrenService', () => {
  let service: ChildrenService;
  let childModel: any;
  let familyModel: any;

  const mockChild = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Test Child',
    birthDate: new Date('2015-01-01'),
    family: '507f1f77bcf86cd799439012',
    guardians: ['507f1f77bcf86cd799439013'],
    color: '#ff0000',
    save: jest.fn(),
  };

  const mockFamily = {
    _id: '507f1f77bcf86cd799439012',
    name: 'Test Family',
    members: [],
    children: [],
  };

  const mockChildModel = jest.fn(() => ({
    ...mockChild,
    save: jest.fn().mockResolvedValue(mockChild),
  }));

  Object.assign(mockChildModel, {
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  });

  const mockFamilyModel = {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChildrenService,
        { provide: getModelToken(Child.name), useValue: mockChildModel },
        { provide: getModelToken(Family.name), useValue: mockFamilyModel },
      ],
    }).compile();

    service = module.get<ChildrenService>(ChildrenService);
    childModel = module.get(getModelToken(Child.name));
    familyModel = module.get(getModelToken(Family.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a child', async () => {
      const createChildDto = {
        name: 'Test Child',
        birthDate: '2015-01-01',
        family: '507f1f77bcf86cd799439012',
        guardians: ['507f1f77bcf86cd799439013'],
        color: '#ff0000',
      };

      familyModel.findById.mockResolvedValue(mockFamily);
      familyModel.findByIdAndUpdate.mockResolvedValue(mockFamily);

      const result = await service.create(createChildDto);

      expect(result).toBeDefined();
      expect(familyModel.findById).toHaveBeenCalledWith(createChildDto.family);
    });

    it('should throw NotFoundException if family not found', async () => {
      const createChildDto = {
        name: 'Test Child',
        birthDate: '2015-01-01',
        family: '507f1f77bcf86cd799439012',
        guardians: ['507f1f77bcf86cd799439013'],
        color: '#ff0000',
      };

      familyModel.findById.mockResolvedValue(null);

      await expect(service.create(createChildDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a child by ID', async () => {
      const populateMock = jest.fn().mockReturnThis();
      const execMock = jest.fn().mockResolvedValue(mockChild);

      childModel.findById.mockReturnValue({
        populate: populateMock,
      });
      populateMock.mockReturnValue({
        populate: jest.fn().mockReturnValue({ exec: execMock }),
      });

      const result = await service.findOne('507f1f77bcf86cd799439011');
      expect(result).toEqual(mockChild);
    });

    it('should throw BadRequestException for invalid ID', async () => {
      await expect(service.findOne('invalid-id')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if child not found', async () => {
      const populateMock = jest.fn().mockReturnThis();
      const execMock = jest.fn().mockResolvedValue(null);

      childModel.findById.mockReturnValue({
        populate: populateMock,
      });
      populateMock.mockReturnValue({
        populate: jest.fn().mockReturnValue({ exec: execMock }),
      });

      await expect(service.findOne('507f1f77bcf86cd799439011')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a child', async () => {
      const updateDto = { name: 'Updated Child' };
      const updatedChild = { ...mockChild, ...updateDto };

      const populateMock = jest.fn().mockReturnThis();
      const execMock = jest.fn().mockResolvedValue(updatedChild);

      childModel.findByIdAndUpdate.mockReturnValue({
        populate: populateMock,
      });
      populateMock.mockReturnValue({
        populate: jest.fn().mockReturnValue({ exec: execMock }),
      });

      const result = await service.update('507f1f77bcf86cd799439011', updateDto);
      expect(result.name).toBe('Updated Child');
    });

    it('should throw BadRequestException if guardians is empty', async () => {
      await expect(
        service.update('507f1f77bcf86cd799439011', { guardians: [] }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should remove a child', async () => {
      childModel.findById.mockResolvedValue(mockChild);
      familyModel.findByIdAndUpdate.mockResolvedValue(mockFamily);
      childModel.findByIdAndDelete.mockResolvedValue(mockChild);

      await expect(
        service.remove('507f1f77bcf86cd799439011'),
      ).resolves.toBeUndefined();
    });

    it('should throw BadRequestException for invalid ID', async () => {
      await expect(service.remove('invalid-id')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if child not found', async () => {
      childModel.findById.mockResolvedValue(null);

      await expect(service.remove('507f1f77bcf86cd799439011')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByUser', () => {
    it('should return children for a user', async () => {
      const populateMock = jest.fn().mockReturnThis();
      const execMock = jest.fn().mockResolvedValue([mockChild]);

      childModel.find.mockReturnValue({
        populate: populateMock,
      });
      populateMock.mockReturnValue({
        populate: jest.fn().mockReturnValue({ exec: execMock }),
      });

      const result = await service.findByUser('507f1f77bcf86cd799439013');
      expect(result).toEqual([mockChild]);
    });

    it('should throw BadRequestException for invalid user ID', async () => {
      await expect(service.findByUser('invalid-id')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
