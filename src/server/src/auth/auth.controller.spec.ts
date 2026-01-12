import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Types } from 'mongoose';

describe('AuthController', () => {
  let controller: AuthController;
  let service: jest.Mocked<Partial<AuthService>>;

  const userId = new Types.ObjectId().toString();

  const mockUser = {
    _id: userId,
    email: 'test@example.com',
    name: 'Test User',
    birthDate: '1990-01-01',
    color: '#ffffff',
  };

  const mockLoginResponse = {
    accessToken: 'jwt-token',
    email: 'test@example.com',
    name: 'Test User',
    userId: userId,
    color: '#ffffff',
    role: 'parent',
  };

  beforeEach(async () => {
    service = {
      signUp: jest.fn(),
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: service }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signUp', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        birthDate: '1990-01-01',
        color: '#ffffff',
      };

      service.signUp!.mockResolvedValue(mockUser as any);

      const result = await controller.signUp(createUserDto);

      expect(result).toEqual(mockUser);
      expect(service.signUp).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('login', () => {
    it('should return login response', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };
      const mockRequest = { ip: '127.0.0.1', headers: {} } as any;

      service.login!.mockResolvedValue(mockLoginResponse);

      const result = await controller.login(loginDto, mockRequest);

      expect(result).toEqual(mockLoginResponse);
      expect(service.login).toHaveBeenCalledWith(loginDto, mockRequest);
    });
  });
});
