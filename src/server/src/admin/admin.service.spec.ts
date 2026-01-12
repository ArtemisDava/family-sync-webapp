import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { UsersService } from '../users/users.service';
import { FamiliesService } from '../families/families.service';
import { ConnectionLogsService } from '../connection_logs/connection_logs.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../users/entities/user.entity';

describe('AdminService', () => {
  let service: AdminService;
  let usersService: jest.Mocked<Partial<UsersService>>;
  let familiesService: jest.Mocked<Partial<FamiliesService>>;
  let connectionLogsService: jest.Mocked<Partial<ConnectionLogsService>>;

  beforeEach(async () => {
    usersService = {
      getUserCount: jest.fn(),
      getAdminCount: jest.fn(),
    };

    familiesService = {
      getTotalFamiliesCount: jest.fn(),
    };

    connectionLogsService = {
      getTotalConnectionsByMonth: jest.fn(),
    };

    const mockUserModel = {
      find: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      aggregate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: UsersService, useValue: usersService },
        { provide: FamiliesService, useValue: familiesService },
        { provide: ConnectionLogsService, useValue: connectionLogsService },
        { provide: getModelToken(User.name), useValue: mockUserModel },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should return a placeholder string', () => {
      const result = service.create({});
      expect(result).toBe('This action adds a new admin');
    });
  });

  describe('findAll', () => {
    it('should return a placeholder string', () => {
      const result = service.findAll();
      expect(result).toBe('This action returns all admin');
    });
  });

  describe('findOne', () => {
    it('should return a placeholder string with ID', () => {
      const result = service.findOne(1);
      expect(result).toBe('This action returns a #1 admin');
    });
  });

  describe('update', () => {
    it('should return a placeholder string with ID', () => {
      const result = service.update(1, {});
      expect(result).toBe('This action updates a #1 admin');
    });
  });

  describe('remove', () => {
    it('should return a placeholder string with ID', () => {
      const result = service.remove(1);
      expect(result).toBe('This action removes a #1 admin');
    });
  });

  describe('getOverviewStats', () => {
    it('should return overview statistics', async () => {
      const mockConnectionsByMonth = [
        { _id: { year: 2026, month: 1 }, totalConnections: 100 },
        { _id: { year: 2026, month: 2 }, totalConnections: 50 },
      ];

      usersService.getUserCount!.mockResolvedValue(100);
      usersService.getAdminCount!.mockResolvedValue(5);
      familiesService.getTotalFamiliesCount!.mockResolvedValue(25);
      connectionLogsService.getTotalConnectionsByMonth!.mockResolvedValue(
        mockConnectionsByMonth,
      );

      const result = await service.getOverviewStats();

      expect(result.totalUsers).toBe(100);
      expect(result.totalFamilies).toBe(25);
      expect(result.totalAdmins).toBe(5);
      expect(result.totalFrequency.data).toEqual(mockConnectionsByMonth);
      expect(result.totalFrequency.total).toBe(150);
    });

    it('should handle empty connection data', async () => {
      usersService.getUserCount!.mockResolvedValue(0);
      usersService.getAdminCount!.mockResolvedValue(0);
      familiesService.getTotalFamiliesCount!.mockResolvedValue(0);
      connectionLogsService.getTotalConnectionsByMonth!.mockResolvedValue([]);

      const result = await service.getOverviewStats();

      expect(result.totalUsers).toBe(0);
      expect(result.totalFamilies).toBe(0);
      expect(result.totalAdmins).toBe(0);
      expect(result.totalFrequency.total).toBe(0);
    });
  });
});
