import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventsService } from './events.service';

describe('EventsService', () => {
  const mockToken = 'test-token-123';
  const mockChildId = 'child123';
  const mockFamilyId = 'family123';
  const mockEventId = 'event123';

  const mockEvent = {
    _id: mockEventId,
    title: 'Test Event',
    startDate: '2024-03-15T10:00:00.000Z',
    endDate: '2024-03-15T11:00:00.000Z',
    category: 'school',
    location: 'School',
    family: mockFamilyId,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getEventsByChild', () => {
    it('should fetch events for a child with token', async () => {
      const mockEvents = [mockEvent];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockEvents,
      });

      const result = await EventsService.getEventsByChild(mockChildId, mockToken);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/events/child/${mockChildId}`),
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          },
        })
      );

      expect(result).toEqual(mockEvents);
    });

    it('should fetch events without token', async () => {
      const mockEvents = [mockEvent];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockEvents,
      });

      await EventsService.getEventsByChild(mockChildId);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/events/child/${mockChildId}`),
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    });

    it('should throw error when fetch fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
      });

      await expect(
        EventsService.getEventsByChild(mockChildId, mockToken)
      ).rejects.toThrow('Failed to fetch family');
    });
  });

  describe('addNewEventToChild', () => {
    it('should add new event to child', async () => {
      const eventData = {
        title: 'New Event',
        startDate: '2024-03-20T10:00:00.000Z',
        endDate: '2024-03-20T11:00:00.000Z',
        category: 'school',
        location: 'School',
        family: mockFamilyId,
      };

      const mockResponse = { ...eventData, _id: 'newEvent123' };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await EventsService.addNewEventToChild(
        mockChildId,
        eventData,
        mockToken
      );

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/events/child/${mockChildId}`),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          },
          body: JSON.stringify(eventData),
        })
      );

      expect(result).toEqual(mockResponse);
    });

    it('should throw error when adding event fails', async () => {
      const eventData = {
        title: 'New Event',
        startDate: '2024-03-20T10:00:00.000Z',
        endDate: '2024-03-20T11:00:00.000Z',
        category: 'school',
        location: 'School',
        family: mockFamilyId,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
      });

      await expect(
        EventsService.addNewEventToChild(mockChildId, eventData, mockToken)
      ).rejects.toThrow('Failed to add event');
    });
  });

  describe('deleteEvent', () => {
    it('should delete event successfully', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
      });

      await EventsService.deleteEvent(mockEventId, mockToken);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/events/${mockEventId}`),
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
        EventsService.deleteEvent(mockEventId, mockToken)
      ).rejects.toThrow('Failed to delete event');
    });
  });

  describe('addNewEventToAdult', () => {
    it('should add new event to adult', async () => {
      const eventData = {
        title: 'Work Meeting',
        startDate: '2024-03-25T09:00:00.000Z',
        endDate: '2024-03-25T10:00:00.000Z',
        category: 'work',
        location: 'Office',
        family: mockFamilyId,
        adult: 'adult123',
      };

      const mockResponse = { ...eventData, _id: 'adultEvent123' };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await EventsService.addNewEventToAdult(
        mockFamilyId,
        eventData,
        mockToken
      );

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/events/adult/${mockFamilyId}`),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          },
          body: JSON.stringify(eventData),
        })
      );

      expect(result).toEqual(mockResponse);
    });
  });
});
