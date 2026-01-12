import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ChildrenService } from './children.service';
import type { CreateChildDto } from '../models/createChild.dto';

describe('ChildrenService', () => {
  const mockToken = 'test-token-123';
  const mockChild = {
    _id: 'child123',
    name: 'Test Child',
    birthDate: '2018-01-01',
    family: 'family123',
    guardians: ['user123'],
    color: '#FF0000',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createChild', () => {
    it('should create a child successfully', async () => {
      const childData: CreateChildDto = {
        name: 'Test Child',
        birthDate: '2018-01-01',
        family: 'family123',
        guardians: ['user123'],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockChild,
      });

      const result = await ChildrenService.createChild(childData, mockToken);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/children'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          },
          body: JSON.stringify(childData),
        })
      );

      expect(result).toEqual(mockChild);
    });

    it('should throw error when creation fails', async () => {
      const childData: CreateChildDto = {
        name: 'Test Child',
        birthDate: '2018-01-01',
        family: 'family123',
        guardians: [],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
      });

      await expect(
        ChildrenService.createChild(childData, mockToken)
      ).rejects.toThrow('Failed to create child');
    });
  });

  describe('getChildrenById', () => {
    it('should fetch child by id successfully', async () => {
      const childId = 'child123';

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockChild,
      });

      const result = await ChildrenService.getChildrenById(childId, mockToken);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/children/${childId}`),
        expect.objectContaining({
          method: 'GET',
          headers: {
            Authorization: `Bearer ${mockToken}`,
          },
        })
      );

      expect(result).toEqual(mockChild);
    });

    it('should throw error when fetch fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
      });

      await expect(
        ChildrenService.getChildrenById('child123', mockToken)
      ).rejects.toThrow('Failed to fetch child');
    });
  });

  describe('patchChild', () => {
    it('should update child successfully', async () => {
      const childId = 'child123';
      const updateData = {
        name: 'Updated Name',
        color: '#00FF00',
      };

      const updatedChild = { ...mockChild, ...updateData };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => updatedChild,
      });

      const result = await ChildrenService.patchChild(
        childId,
        updateData,
        mockToken
      );

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/children/${childId}`),
        expect.objectContaining({
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          },
          body: JSON.stringify(updateData),
        })
      );

      expect(result).toEqual(updatedChild);
    });

    it('should throw error when update fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
      });

      await expect(
        ChildrenService.patchChild('child123', { name: 'New Name' }, mockToken)
      ).rejects.toThrow('Failed to update child');
    });
  });

  describe('getChildrenByUser', () => {
    it('should fetch children by user successfully', async () => {
      const userId = 'user123';
      const mockChildren = [mockChild];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockChildren,
      });

      const result = await ChildrenService.getChildrenByUser(userId, mockToken);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/children/user/${userId}`),
        expect.objectContaining({
          method: 'GET',
          headers: {
            Authorization: `Bearer ${mockToken}`,
          },
        })
      );

      expect(result).toEqual(mockChildren);
    });

    it('should throw error when fetch fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
      });

      await expect(
        ChildrenService.getChildrenByUser('user123', mockToken)
      ).rejects.toThrow('Failed to fetch children by user');
    });
  });
});
