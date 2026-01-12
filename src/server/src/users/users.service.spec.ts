import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { FamilyInvitationService } from 'src/family-invitation/family-invitation.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let model: any;
  let familyInvitationService: any;

  const mockUser = {
    _id: 'someId',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword',
    save: jest.fn(),
    toObject: jest.fn(),
  };

  const mockUserModel = jest.fn(() => ({
    ...mockUser,
    save: mockUser.save,
  }));

  Object.assign(mockUserModel, {
    findOne: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn(),
  });

  const mockFamilyInvitationService = {
    create: jest.fn(),
    accept: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: FamilyInvitationService,
          useValue: mockFamilyInvitationService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    model = module.get(getModelToken(User.name));
    familyInvitationService = module.get(FamilyInvitationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password',
        birthDate: '1990-01-01',
        color: '#ffffff',
      };

      model.findOne.mockReturnValue(null);
      mockUser.save.mockResolvedValue({
        ...mockUser,
        toObject: jest
          .fn()
          .mockReturnValue({ ...mockUser, password: undefined }),
      });

      const result = await service.create(createUserDto);

      expect(model.findOne).toHaveBeenCalledWith({
        email: createUserDto.email,
      });
      expect(result).toBeDefined();
      expect(result.email).toEqual(createUserDto.email);
    });

    it('should throw ConflictException if user exists', async () => {
      const createUserDto = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password',
        birthDate: '1990-01-01',
        color: '#ffffff',
      };

      model.findOne.mockReturnValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findByEmail', () => {
    it('should return a user if found', async () => {
      const exec = jest.fn().mockResolvedValue(mockUser);
      model.findOne.mockReturnValue({ exec });

      const result = await service.findByEmail('test@example.com');
      expect(result).toEqual(mockUser);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const exec = jest.fn().mockResolvedValue(mockUser);
      model.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({ exec }),
      });

      const result = await service.findOne('someId');
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      const exec = jest.fn().mockResolvedValue(null);
      model.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({ exec }),
      });

      await expect(service.findOne('someId')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
