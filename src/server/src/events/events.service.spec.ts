import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { getModelToken } from '@nestjs/mongoose';
import { Event } from './entities/event.entity';
import { User } from '../users/entities/user.entity';
import { Family } from '../families/entities/family.entity';
import { Child } from '../children/entities/child.entity';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Types } from 'mongoose';

describe('EventsService', () => {
  let service: EventsService;
  let eventModel: any;
  let userModel: any;
  let familyModel: any;
  let childModel: any;

  const userId = new Types.ObjectId().toString();
  const familyId = new Types.ObjectId().toString();
  const eventId = new Types.ObjectId().toString();
  const childId = new Types.ObjectId().toString();

  const mockEvent = {
    _id: eventId,
    title: 'Test Event',
    startDate: new Date(),
    endDate: new Date(),
    family: familyId,
    createdBy: new Types.ObjectId(userId),
    visibility: 'shared',
    sharedWith: [],
    save: jest.fn(),
  };

  const mockUser = {
    _id: userId,
    name: 'Test User',
    email: 'test@example.com',
  };

  const mockFamily = {
    _id: familyId,
    name: 'Test Family',
    members: [new Types.ObjectId(userId)],
    children: [],
  };

  const mockChild = {
    _id: childId,
    name: 'Test Child',
    family: new Types.ObjectId(familyId),
  };

  const mockEventModel = jest.fn(() => ({
    ...mockEvent,
    save: jest.fn().mockResolvedValue(mockEvent),
  }));

  Object.assign(mockEventModel, {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  });

  const mockUserModel = {
    findById: jest.fn(),
  };

  const mockFamilyModel = {
    findById: jest.fn(),
  };

  const mockChildModel = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: getModelToken(Event.name), useValue: mockEventModel },
        { provide: getModelToken(User.name), useValue: mockUserModel },
        { provide: getModelToken(Family.name), useValue: mockFamilyModel },
        { provide: getModelToken(Child.name), useValue: mockChildModel },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    eventModel = module.get(getModelToken(Event.name));
    userModel = module.get(getModelToken(User.name));
    familyModel = module.get(getModelToken(Family.name));
    childModel = module.get(getModelToken(Child.name));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return an event by ID', async () => {
      eventModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockEvent),
      });

      const result = await service.findOne(eventId);
      expect(result).toEqual(mockEvent);
    });

    it('should throw BadRequestException for invalid ID', async () => {
      await expect(service.findOne('invalid-id')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if event not found', async () => {
      eventModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne(eventId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByFamily', () => {
    it('should return events for a family', async () => {
      eventModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([mockEvent]),
          }),
        }),
      });

      const result = await service.findByFamily(familyId);
      expect(result).toEqual([mockEvent]);
    });

    it('should throw BadRequestException for invalid family ID', async () => {
      await expect(service.findByFamily('invalid-id')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should filter by userId if provided', async () => {
      eventModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([mockEvent]),
          }),
        }),
      });

      const result = await service.findByFamily(familyId, userId);
      expect(result).toEqual([mockEvent]);
      expect(eventModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          family: familyId,
          $or: expect.any(Array),
        }),
      );
    });
  });

  describe('findByChild', () => {
    it('should return events for a child', async () => {
      eventModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([mockEvent]),
        }),
      });

      const result = await service.findByChild(childId);
      expect(result).toEqual([mockEvent]);
    });

    it('should throw BadRequestException for invalid child ID', async () => {
      await expect(service.findByChild('invalid-id')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findByUser', () => {
    it('should return events for a user', async () => {
      eventModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([mockEvent]),
        }),
      });

      const result = await service.findByUser(userId);
      expect(result).toEqual([mockEvent]);
    });

    it('should throw BadRequestException for invalid user ID', async () => {
      await expect(service.findByUser('invalid-id')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findByDateRange', () => {
    it('should return events within date range', async () => {
      eventModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([mockEvent]),
        }),
      });

      const result = await service.findByDateRange(
        '2026-01-01',
        '2026-12-31',
        familyId,
      );
      expect(result).toEqual([mockEvent]);
    });

    it('should throw BadRequestException for invalid dates', async () => {
      await expect(
        service.findByDateRange('invalid', 'dates', familyId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if neither familyId nor userId provided', async () => {
      await expect(
        service.findByDateRange('2026-01-01', '2026-12-31'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should remove an event', async () => {
      eventModel.findById.mockResolvedValue({
        ...mockEvent,
        createdBy: { toString: () => userId },
      });
      eventModel.findByIdAndDelete.mockResolvedValue(mockEvent);

      await expect(service.remove(eventId, userId)).resolves.toBeUndefined();
    });

    it('should throw BadRequestException for invalid event ID', async () => {
      await expect(service.remove('invalid-id', userId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if event not found', async () => {
      eventModel.findById.mockResolvedValue(null);

      await expect(service.remove(eventId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user did not create the event', async () => {
      const otherUserId = new Types.ObjectId().toString();
      eventModel.findById.mockResolvedValue({
        ...mockEvent,
        createdBy: { toString: () => otherUserId },
      });

      await expect(service.remove(eventId, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('create', () => {
    it('should throw BadRequestException for invalid user ID', async () => {
      const createEventDto = {
        title: 'Test Event',
        startDate: '2026-01-15T10:00:00Z',
        endDate: '2026-01-15T12:00:00Z',
        family: familyId,
        visibility: 'shared' as const,
      };

      await expect(
        service.create(createEventDto, 'invalid-id'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if user not found', async () => {
      const createEventDto = {
        title: 'Test Event',
        startDate: '2026-01-15T10:00:00Z',
        endDate: '2026-01-15T12:00:00Z',
        family: familyId,
        visibility: 'shared' as const,
      };

      userModel.findById.mockResolvedValue(null);

      await expect(service.create(createEventDto, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if family not found', async () => {
      const createEventDto = {
        title: 'Test Event',
        startDate: '2026-01-15T10:00:00Z',
        endDate: '2026-01-15T12:00:00Z',
        family: familyId,
        visibility: 'shared' as const,
      };

      userModel.findById.mockResolvedValue(mockUser);
      familyModel.findById.mockResolvedValue(null);

      await expect(service.create(createEventDto, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user is not a family member', async () => {
      const createEventDto = {
        title: 'Test Event',
        startDate: '2026-01-15T10:00:00Z',
        endDate: '2026-01-15T12:00:00Z',
        family: familyId,
        visibility: 'shared' as const,
      };

      const otherUserId = new Types.ObjectId().toString();
      userModel.findById.mockResolvedValue({ ...mockUser, _id: otherUserId });
      familyModel.findById.mockResolvedValue(mockFamily);

      await expect(service.create(createEventDto, otherUserId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
