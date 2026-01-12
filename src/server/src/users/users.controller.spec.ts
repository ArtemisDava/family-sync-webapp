import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Types } from 'mongoose';
import { ForbiddenException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../auth/role.guard';

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<Partial<UsersService>>;

  const userId = new Types.ObjectId().toString();

  const mockUser = {
    _id: userId,
    email: 'test@example.com',
    name: 'Test User',
    birthDate: '1990-01-01',
    color: '#ffffff',
    role: 'parent',
  };

  const mockAuthRequest = {
    user: {
      userId: userId,
      role: 'parent',
    },
  } as any;

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByEmail: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      getUserCount: jest.fn(),
      getAdminCount: jest.fn(),
      searchByName: jest.fn(),
    };

    const mockUserModel = {
      find: jest.fn(),
      findById: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(mockUser) }),
      findByIdAndUpdate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: service },
        { provide: getModelToken(User.name), useValue: mockUserModel },
        Reflector,
        RolesGuard,
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      service.findAll!.mockResolvedValue([mockUser] as any);

      const result = await controller.findAll(mockAuthRequest);

      expect(result).toEqual([mockUser]);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if no user in request', () => {
      const noAuthRequest = { user: undefined } as any;

      expect(() => controller.findAll(noAuthRequest)).toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a user by ID', async () => {
      service.findOne!.mockResolvedValue(mockUser as any);

      const result = await controller.findOne(userId);

      expect(result).toEqual(mockUser);
      expect(service.findOne).toHaveBeenCalledWith(userId);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateDto = { name: 'Updated User' };
      const updatedUser = { ...mockUser, ...updateDto };
      service.update!.mockResolvedValue(updatedUser as any);

      const result = await controller.update(updateDto, mockAuthRequest);

      expect(result).toEqual(updatedUser);
      expect(service.update).toHaveBeenCalledWith(userId, updateDto);
    });

    it('should throw ForbiddenException if no user in request', () => {
      const noAuthRequest = { user: undefined } as any;

      expect(() => controller.update({}, noAuthRequest)).toThrow(
        ForbiddenException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      service.remove!.mockResolvedValue(undefined);

      await controller.remove(userId, mockAuthRequest);

      expect(service.remove).toHaveBeenCalledWith(userId);
    });

    it('should throw ForbiddenException if user tries to delete another user', () => {
      const otherUserId = new Types.ObjectId().toString();

      expect(() => controller.remove(otherUserId, mockAuthRequest)).toThrow(
        ForbiddenException,
      );
    });
  });

  describe('searchByName', () => {
    it('should search users by name', async () => {
      service.searchByName!.mockResolvedValue([mockUser] as any);

      const result = await controller.searchByName('Test', mockAuthRequest);

      expect(result).toEqual([mockUser]);
      expect(service.searchByName).toHaveBeenCalledWith('Test');
    });

    it('should return empty array for empty search', () => {
      const result = controller.searchByName('', mockAuthRequest);

      expect(result).toEqual([]);
    });

    it('should throw ForbiddenException if no user in request', () => {
      const noAuthRequest = { user: undefined } as any;

      expect(() => controller.searchByName('Test', noAuthRequest)).toThrow(
        ForbiddenException,
      );
    });
  });
});
