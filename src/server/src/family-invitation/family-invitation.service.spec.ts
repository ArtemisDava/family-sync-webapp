import { Test, TestingModule } from '@nestjs/testing';
import { FamilyInvitationService } from './family-invitation.service';
import { getModelToken } from '@nestjs/mongoose';
import { FamilyInvitation } from './entities/family-invitation.entity';
import { Family } from '../families/entities/family.entity';
import { User } from '../users/entities/user.entity';
import { Child } from '../children/entities/child.entity';
import { Event } from '../events/entities/event.entity';
import { FamiliesService } from '../families/families.service';

describe('FamilyInvitationService', () => {
  let service: FamilyInvitationService;
  let familyInvitationModel: any;
  let familiesService: jest.Mocked<Partial<FamiliesService>>;

  const mockInvitation = {
    _id: '507f1f77bcf86cd799439011',
    familyId: '507f1f77bcf86cd799439012',
    invitedUser: '507f1f77bcf86cd799439013',
    invitedByUser: '507f1f77bcf86cd799439014',
    status: 'pending',
    respondedAt: null,
    save: jest.fn(),
  };

  const mockFamilyInvitationModel = jest.fn(() => ({
    ...mockInvitation,
    save: jest.fn().mockResolvedValue(mockInvitation),
  }));

  Object.assign(mockFamilyInvitationModel, {
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
  });

  const mockModel = {
    find: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    familiesService = {
      addMember: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FamilyInvitationService,
        {
          provide: getModelToken(FamilyInvitation.name),
          useValue: mockFamilyInvitationModel,
        },
        { provide: getModelToken(Event.name), useValue: mockModel },
        { provide: getModelToken(User.name), useValue: mockModel },
        { provide: getModelToken(Family.name), useValue: mockModel },
        { provide: getModelToken(Child.name), useValue: mockModel },
        { provide: FamiliesService, useValue: familiesService },
      ],
    }).compile();

    service = module.get<FamilyInvitationService>(FamilyInvitationService);
    familyInvitationModel = module.get(getModelToken(FamilyInvitation.name));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new invitation', async () => {
      const createDto = {
        familyId: '507f1f77bcf86cd799439012',
        invitedUser: '507f1f77bcf86cd799439013',
      };

      familyInvitationModel.findOne.mockResolvedValue(null);

      const result = await service.create(createDto, '507f1f77bcf86cd799439014');

      expect(result).toBeDefined();
    });

    it('should return existing invitation if already pending', async () => {
      const createDto = {
        familyId: '507f1f77bcf86cd799439012',
        invitedUser: '507f1f77bcf86cd799439013',
      };

      familyInvitationModel.findOne.mockResolvedValue(mockInvitation);

      const result = await service.create(createDto, '507f1f77bcf86cd799439014');

      expect(result).toEqual(mockInvitation);
    });
  });

  describe('findAll', () => {
    it('should return all invitations for a user', async () => {
      const populateMock = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockInvitation]),
      });

      familyInvitationModel.find.mockReturnValue({
        populate: populateMock,
      });

      const result = await service.findAll('507f1f77bcf86cd799439013');

      expect(result).toEqual([mockInvitation]);
    });
  });

  describe('accept', () => {
    it('should accept an invitation', async () => {
      const acceptedInvitation = {
        ...mockInvitation,
        status: 'accepted',
        respondedAt: new Date(),
        save: jest.fn().mockResolvedValue({
          ...mockInvitation,
          status: 'accepted',
        }),
      };

      familyInvitationModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(acceptedInvitation),
      });

      familiesService.addMember!.mockResolvedValue({} as any);

      const result = await service.accept('507f1f77bcf86cd799439011');

      expect(result.status).toBe('accepted');
      expect(familiesService.addMember).toHaveBeenCalled();
    });

    it('should throw error if invitation not found', async () => {
      familyInvitationModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.accept('507f1f77bcf86cd799439011')).rejects.toThrow(
        'Invitation not found',
      );
    });
  });

  describe('reject', () => {
    it('should reject an invitation', async () => {
      const rejectedInvitation = {
        ...mockInvitation,
        status: 'rejected',
        respondedAt: new Date(),
        save: jest.fn().mockResolvedValue({
          ...mockInvitation,
          status: 'rejected',
        }),
      };

      familyInvitationModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(rejectedInvitation),
      });

      const result = await service.reject('507f1f77bcf86cd799439011');

      expect(result.status).toBe('rejected');
    });

    it('should throw error if invitation not found', async () => {
      familyInvitationModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.reject('507f1f77bcf86cd799439011')).rejects.toThrow(
        'Invitation not found',
      );
    });
  });

  describe('remove', () => {
    it('should return a placeholder string', () => {
      const result = service.remove(1);
      expect(result).toBe('This action removes a #1 familyInvitation');
    });
  });
});
