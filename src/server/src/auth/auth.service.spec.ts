import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { ConnectionLogsService } from '../connection_logs/connection_logs.service';
import { BadRequestException } from '@nestjs/common';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<Partial<UsersService>>;
  let connectionLogsService: jest.Mocked<Partial<ConnectionLogsService>>;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    password: 'hashedPassword',
    name: 'Test User',
    color: '#ffffff',
    role: 'parent',
    isAdmin: false,
  };

  const mockRequest = {
    ip: '127.0.0.1',
    headers: { 'user-agent': 'test-agent' },
  } as any;

  beforeEach(async () => {
    usersService = {
      create: jest.fn(),
      findByEmail: jest.fn(),
    };

    connectionLogsService = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: ConnectionLogsService, useValue: connectionLogsService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signUp', () => {
    it('should call usersService.create with the provided DTO', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        birthDate: '1990-01-01',
        color: '#ffffff',
      };

      usersService.create!.mockResolvedValue(mockUser as any);

      const result = await service.signUp(createUserDto);

      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('login', () => {
    it('should return login response on valid credentials', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };

      usersService.findByEmail!.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      connectionLogsService.create!.mockResolvedValue({} as any);

      const result = await service.login(loginDto, mockRequest);

      expect(result).toHaveProperty('accessToken');
      expect(result.email).toBe(mockUser.email);
      expect(result.name).toBe(mockUser.name);
      expect(result.userId).toBe(mockUser._id);
      expect(connectionLogsService.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException on invalid email', async () => {
      const loginDto = { email: 'wrong@example.com', password: 'password123' };

      usersService.findByEmail!.mockResolvedValue(null);

      await expect(service.login(loginDto, mockRequest)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException on invalid password', async () => {
      const loginDto = { email: 'test@example.com', password: 'wrongpassword' };

      usersService.findByEmail!.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto, mockRequest)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
