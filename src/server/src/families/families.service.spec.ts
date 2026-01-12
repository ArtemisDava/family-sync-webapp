import { Test, TestingModule } from '@nestjs/testing';
import { FamiliesService } from './families.service';
import { getModelToken } from '@nestjs/mongoose';
import { Family } from './entities/family.entity';
import { User } from '../users/entities/user.entity';
import { Child } from '../children/entities/child.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('FamiliesService', () => {
  let service: FamiliesService;
  let familyModel: any;
  let userModel: any;
  let childModel: any;

  const mockFamily = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Test Family',
    members: ['507f1f77bcf86cd799439012'],
    children: [],
    createdBy: '507f1f77bcf86cd799439012',
    save: jest.fn(),
    populate: jest.fn(),
  };

  const mockFamilyModel = jest.fn(() => ({
    ...mockFamily,
    save: jest.fn().mockResolvedValue(mockFamily),
  }));

  Object.assign(mockFamilyModel, {
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findOneAndUpdate: jest.fn(),
    countDocuments: jest.fn(),
    updateMany: jest.fn(),
  });

  const mockUserModel = {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    updateMany: jest.fn(),
  };

  const mockChildModel = {
    findByIdAndDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FamiliesService,
        { provide: getModelToken(Family.name), useValue: mockFamilyModel },
        { provide: getModelToken(User.name), useValue: mockUserModel },
        { provide: getModelToken(Child.name), useValue: mockChildModel },
      ],
    }).compile();

    service = module.get<FamiliesService>(FamiliesService);
    familyModel = module.get(getModelToken(Family.name));
    userModel = module.get(getModelToken(User.name));
    childModel = module.get(getModelToken(Child.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a family by ID', async () => {
      const populateMock = jest.fn().mockReturnThis();
      const execMock = jest.fn().mockResolvedValue(mockFamily);
      
      familyModel.findById.mockReturnValue({
        populate: populateMock,
      });
      populateMock.mockReturnValue({
        populate: jest.fn().mockReturnValue({ exec: execMock }),
      });

      const result = await service.findOne('507f1f77bcf86cd799439011');
      expect(result).toEqual(mockFamily);
    });

    it('should throw BadRequestException for invalid ID', async () => {
      await expect(service.findOne('invalid-id')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if family not found', async () => {
      const populateMock = jest.fn().mockReturnThis();
      const execMock = jest.fn().mockResolvedValue(null);
      
      familyModel.findById.mockReturnValue({
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

  describe('findByUserId', () => {
    it('should return families for a user', async () => {
      const populateMock = jest.fn().mockReturnThis();
      const execMock = jest.fn().mockResolvedValue([mockFamily]);
      
      familyModel.find.mockReturnValue({
        populate: populateMock,
      });
      populateMock.mockReturnValue({
        populate: jest.fn().mockReturnValue({ exec: execMock }),
      });

      const result = await service.findByUserId('507f1f77bcf86cd799439012');
      expect(result).toEqual([mockFamily]);
    });

    it('should throw BadRequestException for invalid user ID', async () => {
      await expect(service.findByUserId('invalid-id')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    it('should update a family', async () => {
      const updateDto = { name: 'Updated Family' };
      const updatedFamily = { ...mockFamily, ...updateDto };
      
      familyModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedFamily),
      });

      const result = await service.update('507f1f77bcf86cd799439011', updateDto);
      expect(result.name).toBe('Updated Family');
    });

    it('should throw NotFoundException if family not found during update', async () => {
      familyModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.update('507f1f77bcf86cd799439011', { name: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getTotalFamiliesCount', () => {
    it('should return total count of families', async () => {
      familyModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(5),
      });

      const result = await service.getTotalFamiliesCount();
      expect(result).toBe(5);
    });
  });
});
