import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { RolesGuard } from '../auth/role.guard';

describe('AdminController', () => {
  let controller: AdminController;
  let service: jest.Mocked<Partial<AdminService>>;

  const mockOverviewStats = {
    totalUsers: 100,
    totalFamilies: 25,
    totalAdmins: 5,
    totalFrequency: {
      data: [{ _id: { year: 2026, month: 1 }, totalConnections: 150 }],
      total: 150,
    },
  };

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      getOverviewStats: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [{ provide: AdminService, useValue: service }],
    })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AdminController>(AdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new admin', () => {
      service.create!.mockReturnValue('This action adds a new admin');

      const result = controller.create({});

      expect(result).toBe('This action adds a new admin');
    });
  });

  describe('findAll', () => {
    it('should return all admins', () => {
      service.findAll!.mockReturnValue('This action returns all admin');

      const result = controller.findAll();

      expect(result).toBe('This action returns all admin');
    });
  });

  describe('findOne', () => {
    it('should return an admin by ID', () => {
      service.findOne!.mockReturnValue('This action returns a #1 admin');

      const result = controller.findOne('1');

      expect(result).toBe('This action returns a #1 admin');
    });
  });

  describe('getOverviewStats', () => {
    it('should return overview statistics', async () => {
      service.getOverviewStats!.mockResolvedValue(mockOverviewStats);

      const result = await controller.getOverviewStats();

      expect(result).toEqual(mockOverviewStats);
      expect(service.getOverviewStats).toHaveBeenCalled();
    });
  });
});
