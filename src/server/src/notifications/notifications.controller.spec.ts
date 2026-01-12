import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let service: jest.Mocked<Partial<NotificationsService>>;

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [{ provide: NotificationsService, useValue: service }],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a notification', () => {
      service.create!.mockReturnValue('This action adds a new notification');

      const result = controller.create({});

      expect(result).toBe('This action adds a new notification');
    });
  });

  describe('findAll', () => {
    it('should return all notifications', () => {
      service.findAll!.mockReturnValue('This action returns all notifications');

      const result = controller.findAll();

      expect(result).toBe('This action returns all notifications');
    });
  });

  describe('findOne', () => {
    it('should return a notification by ID', () => {
      service.findOne!.mockReturnValue('This action returns a #1 notification');

      const result = controller.findOne('1');

      expect(result).toBe('This action returns a #1 notification');
    });
  });

  describe('update', () => {
    it('should update a notification', () => {
      service.update!.mockReturnValue('This action updates a #1 notification');

      const result = controller.update('1', {});

      expect(result).toBe('This action updates a #1 notification');
    });
  });

  describe('remove', () => {
    it('should remove a notification', () => {
      service.remove!.mockReturnValue('This action removes a #1 notification');

      const result = controller.remove('1');

      expect(result).toBe('This action removes a #1 notification');
    });
  });
});
