import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { Types } from 'mongoose';

describe('EventsController', () => {
  let controller: EventsController;
  let service: jest.Mocked<Partial<EventsService>>;

  const eventId = new Types.ObjectId().toString();
  const familyId = new Types.ObjectId().toString();
  const userId = new Types.ObjectId().toString();
  const childId = new Types.ObjectId().toString();

  const mockEvent = {
    _id: eventId,
    title: 'Test Event',
    startDate: new Date(),
    endDate: new Date(),
    family: familyId,
    createdBy: userId,
    visibility: 'shared',
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
      findOne: jest.fn(),
      findByFamily: jest.fn(),
      findByChild: jest.fn(),
      findByUser: jest.fn(),
      findByDateRange: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      createForChild: jest.fn(),
      createForAdult: jest.fn(),
      findByAdult: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [{ provide: EventsService, useValue: service }],
    }).compile();

    controller = module.get<EventsController>(EventsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findOne', () => {
    it('should return an event by ID', async () => {
      service.findOne!.mockResolvedValue(mockEvent as any);

      const result = await controller.findOne(eventId);

      expect(result).toEqual(mockEvent);
      expect(service.findOne).toHaveBeenCalledWith(eventId);
    });
  });

  describe('findByFamily', () => {
    it('should return events for a family', async () => {
      service.findByFamily!.mockResolvedValue([mockEvent] as any);

      const result = await controller.findByFamily(familyId, userId);

      expect(result).toEqual([mockEvent]);
      expect(service.findByFamily).toHaveBeenCalledWith(familyId, userId);
    });
  });

  describe('findByChild', () => {
    it('should return events for a child', async () => {
      service.findByChild!.mockResolvedValue([mockEvent] as any);

      const result = await controller.findByChild(childId);

      expect(result).toEqual([mockEvent]);
      expect(service.findByChild).toHaveBeenCalledWith(childId);
    });
  });

  describe('findByUser', () => {
    it('should return events for a user', async () => {
      service.findByUser!.mockResolvedValue([mockEvent] as any);

      const result = await controller.findByUser(userId);

      expect(result).toEqual([mockEvent]);
      expect(service.findByUser).toHaveBeenCalledWith(userId);
    });
  });

  describe('remove', () => {
    it('should remove an event', async () => {
      service.remove!.mockResolvedValue(undefined);

      await controller.remove(eventId, mockAuthRequest);

      expect(service.remove).toHaveBeenCalledWith(eventId, userId);
    });
  });

  describe('create', () => {
    it('should create an event', async () => {
      const createEventDto = {
        title: 'Test Event',
        startDate: '2026-01-15T10:00:00Z',
        endDate: '2026-01-15T12:00:00Z',
        family: familyId,
        visibility: 'shared' as const,
      };

      service.create!.mockResolvedValue(mockEvent as any);

      const result = await controller.create(createEventDto, userId);

      expect(result).toEqual(mockEvent);
      expect(service.create).toHaveBeenCalledWith(createEventDto, userId);
    });
  });
});
