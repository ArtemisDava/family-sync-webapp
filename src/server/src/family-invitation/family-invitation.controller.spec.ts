import { Test, TestingModule } from '@nestjs/testing';
import { FamilyInvitationController } from './family-invitation.controller';
import { FamilyInvitationService } from './family-invitation.service';
import { Types } from 'mongoose';

describe('FamilyInvitationController', () => {
  let controller: FamilyInvitationController;
  let service: jest.Mocked<Partial<FamilyInvitationService>>;

  const invitationId = new Types.ObjectId().toString();
  const familyId = new Types.ObjectId().toString();
  const userId = new Types.ObjectId().toString();

  const mockInvitation = {
    _id: invitationId,
    familyId: familyId,
    invitedUser: userId,
    invitedByUser: new Types.ObjectId().toString(),
    status: 'pending',
  };

  const mockAuthRequest = {
    user: {
      userId: userId,
    },
  } as any;

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      accept: jest.fn(),
      reject: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FamilyInvitationController],
      providers: [{ provide: FamilyInvitationService, useValue: service }],
    }).compile();

    controller = module.get<FamilyInvitationController>(
      FamilyInvitationController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all invitations for a user', async () => {
      service.findAll!.mockResolvedValue([mockInvitation] as any);

      const result = await controller.findAll(mockAuthRequest);

      expect(result).toEqual([mockInvitation]);
      expect(service.findAll).toHaveBeenCalledWith(userId);
    });
  });

  describe('accept', () => {
    it('should accept an invitation', async () => {
      const acceptedInvitation = { ...mockInvitation, status: 'accepted' };
      service.accept!.mockResolvedValue(acceptedInvitation as any);

      const result = await controller.accept(invitationId, mockAuthRequest);

      expect(result).toEqual(acceptedInvitation);
      expect(service.accept).toHaveBeenCalledWith(invitationId);
    });
  });

  describe('reject', () => {
    it('should reject an invitation', async () => {
      const rejectedInvitation = { ...mockInvitation, status: 'rejected' };
      service.reject!.mockResolvedValue(rejectedInvitation as any);

      const result = await controller.reject(invitationId, mockAuthRequest);

      expect(result).toEqual(rejectedInvitation);
      expect(service.reject).toHaveBeenCalledWith(invitationId);
    });
  });

  describe('remove', () => {
    it('should remove an invitation', () => {
      service.remove!.mockReturnValue(
        'This action removes a #1 familyInvitation',
      );

      const result = controller.remove('1');

      expect(result).toBe('This action removes a #1 familyInvitation');
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should create an invitation', async () => {
      const createDto = {
        familyId: familyId,
        invitedUser: new Types.ObjectId().toString(),
      };
      service.create!.mockResolvedValue(mockInvitation as any);

      const result = await controller.create(createDto, mockAuthRequest);

      expect(result).toEqual(mockInvitation);
      expect(service.create).toHaveBeenCalledWith(createDto, userId);
    });
  });
});
