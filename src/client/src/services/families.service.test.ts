import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FamiliesService } from './families.service';

describe('FamiliesService', () => {
  const mockToken = 'test-token-123';
  const mockFamily = {
    _id: 'family123',
    name: 'Test Family',
    members: [],
    children: [],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createFamily', () => {
    it('should create a family successfully', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockFamily,
      });

      const result = await FamiliesService.createFamily('Test Family', mockToken);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/families'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          },
          body: JSON.stringify({ name: 'Test Family' }),
        })
      );

      expect(result).toEqual(mockFamily);
    });

    it('should throw error when creation fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
      });

      await expect(
        FamiliesService.createFamily('Test Family', mockToken)
      ).rejects.toThrow('Failed to create family');
    });
  });

  describe('getFamilies', () => {
    it('should fetch families successfully', async () => {
      const mockFamilies = [mockFamily];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockFamilies,
      });

      const result = await FamiliesService.getFamilies(mockToken);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/families/by-user'),
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          },
        })
      );

      expect(result).toEqual(mockFamilies);
    });

    it('should throw error when fetch fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
      });

      await expect(FamiliesService.getFamilies(mockToken)).rejects.toThrow(
        'Failed to fetch families'
      );
    });
  });

  describe('getFamilyById', () => {
    it('should fetch family by id successfully', async () => {
      const familyId = 'family123';

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockFamily,
      });

      const result = await FamiliesService.getFamilyById(familyId, mockToken);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/families/${familyId}`),
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          },
        })
      );

      expect(result).toEqual(mockFamily);
    });

    it('should throw error when fetch fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
      });

      await expect(
        FamiliesService.getFamilyById('family123', mockToken)
      ).rejects.toThrow('Failed to fetch family');
    });
  });

  describe('joinToTheFamily', () => {
    it('should join family successfully', async () => {
      const code = 'ABC123';
      const mockResponse = { success: true, family: mockFamily };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await FamiliesService.joinToTheFamily(code, mockToken);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/families/join/${code}`),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          },
        })
      );

      expect(result).toEqual(mockResponse);
    });

    it('should throw error when join fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
      });

      await expect(
        FamiliesService.joinToTheFamily('ABC123', mockToken)
      ).rejects.toThrow('Failed to join family');
    });
  });

  describe('deleteFamily', () => {
    it('should delete family successfully', async () => {
      const familyId = 'family123';

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
      });

      await FamiliesService.deleteFamily(familyId, mockToken);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/families/${familyId}`),
        expect.objectContaining({
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          },
        })
      );
    });

    it('should throw error when delete fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
      });

      await expect(
        FamiliesService.deleteFamily('family123', mockToken)
      ).rejects.toThrow('Failed to delete family');
    });
  });
});
