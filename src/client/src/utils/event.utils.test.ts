import { describe, it, expect } from 'vitest';
import {
  createFamiliesMap,
  getFamilyById,
  populateEventFamily,
  transformToCalendarEvents,
} from './event.utils';
import type { Event, Family, Children } from '../models/event';
import type LoginInformation from '../models/loginInformation';

describe('event.utils', () => {
  const mockFamilies: Family[] = [
    {
      _id: 'family1',
      name: 'Smith Family',
      members: [],
      children: [],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      _id: 'family2',
      name: 'Johnson Family',
      members: [],
      children: [],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
  ];

  describe('createFamiliesMap', () => {
    it('should create a map from families array', () => {
      const map = createFamiliesMap(mockFamilies);

      expect(map.size).toBe(2);
      expect(map.get('family1')?.name).toBe('Smith Family');
      expect(map.get('family2')?.name).toBe('Johnson Family');
    });

    it('should handle empty array', () => {
      const map = createFamiliesMap([]);
      expect(map.size).toBe(0);
    });
  });

  describe('getFamilyById', () => {
    it('should retrieve family by id', () => {
      const map = createFamiliesMap(mockFamilies);
      const family = getFamilyById(map, 'family1');

      expect(family).toBeDefined();
      expect(family?.name).toBe('Smith Family');
    });

    it('should return undefined for non-existent id', () => {
      const map = createFamiliesMap(mockFamilies);
      const family = getFamilyById(map, 'nonexistent');

      expect(family).toBeUndefined();
    });
  });

  describe('populateEventFamily', () => {
    it('should populate event with family data from map', () => {
      const unpopulatedEvent = {
        _id: 'event1',
        title: 'Test Event',
        startDate: '2024-01-01',
        endDate: '2024-01-02',
        category: 'school',
        location: 'School',
        family: 'family1',
      };

      const map = createFamiliesMap(mockFamilies);
      const populatedEvent = populateEventFamily(unpopulatedEvent, map);

      expect(populatedEvent.family).toBeDefined();
      expect((populatedEvent.family as Family).name).toBe('Smith Family');
    });

    it('should populate event with family data from array', () => {
      const unpopulatedEvent = {
        _id: 'event1',
        title: 'Test Event',
        startDate: '2024-01-01',
        endDate: '2024-01-02',
        category: 'school',
        location: 'School',
        family: 'family2',
      };

      const populatedEvent = populateEventFamily(unpopulatedEvent, mockFamilies);

      expect(populatedEvent.family).toBeDefined();
      expect((populatedEvent.family as Family).name).toBe('Johnson Family');
    });

    it('should handle non-existent family', () => {
      const unpopulatedEvent = {
        _id: 'event1',
        title: 'Test Event',
        startDate: '2024-01-01',
        endDate: '2024-01-02',
        category: 'school',
        location: 'School',
        family: 'nonexistent',
      };

      const map = createFamiliesMap(mockFamilies);
      const populatedEvent = populateEventFamily(unpopulatedEvent, map);

      expect(populatedEvent.family).toBeNull();
    });
  });

  describe('transformToCalendarEvents', () => {
    const mockChildren: Children[] = [
      {
        _id: 'child1',
        name: 'Alice',
        birthDate: '2018-01-01',
        family: 'family1',
        color: '#FF0000',
      },
      {
        _id: 'child2',
        name: 'Bob',
        birthDate: '2019-06-15',
        family: 'family1',
        color: '#00FF00',
      },
    ];

    const mockUser: LoginInformation = {
      userId: 'user1',
      name: 'Parent User',
      email: 'parent@test.com',
      families: [],
      role: 'user',
      color: '#0000FF',
    };

    const mockEventsByChild = {
      child1: [
        {
          _id: 'event1',
          title: 'School Event',
          startDate: '2024-03-15T10:00:00.000Z',
          endDate: '2024-03-15T11:00:00.000Z',
          category: 'school',
          location: 'School',
          family: 'family1',
        },
      ],
      child2: [
        {
          _id: 'event2',
          title: 'Doctor Appointment',
          startDate: '2024-03-20T14:00:00.000Z',
          endDate: '2024-03-20T15:00:00.000Z',
          category: 'health',
          location: 'Clinic',
          family: 'family1',
        },
      ],
    };

    it('should transform child events to calendar events', () => {
      const disabledChildren = new Set<string>();
      const membersColorsMap = new Map<string, string>();

      const calendarEvents = transformToCalendarEvents(
        mockEventsByChild,
        mockChildren,
        disabledChildren,
        mockUser,
        membersColorsMap
      );

      expect(calendarEvents).toHaveLength(2);
      expect(calendarEvents[0].title).toBe('School Event');
      expect(calendarEvents[0].color).toBe('#FF0000');
      expect(calendarEvents[0].childId).toBe('child1');
      expect(calendarEvents[1].title).toBe('Doctor Appointment');
      expect(calendarEvents[1].color).toBe('#00FF00');
    });

    it('should filter out disabled children', () => {
      const disabledChildren = new Set(['child1-family1']);
      const membersColorsMap = new Map<string, string>();

      const calendarEvents = transformToCalendarEvents(
        mockEventsByChild,
        mockChildren,
        disabledChildren,
        mockUser,
        membersColorsMap
      );

      expect(calendarEvents).toHaveLength(1);
      expect(calendarEvents[0].title).toBe('Doctor Appointment');
    });

    it('should handle adult events', () => {
      const eventsByChild = {
        user1: [
          {
            _id: 'event3',
            title: 'Work Meeting',
            startDate: '2024-03-25T09:00:00.000Z',
            endDate: '2024-03-25T10:00:00.000Z',
            category: 'work',
            location: 'Office',
            family: 'family1',
          },
        ],
      };

      const disabledChildren = new Set<string>();
      const membersColorsMap = new Map<string, string>();

      const calendarEvents = transformToCalendarEvents(
        eventsByChild,
        [],
        disabledChildren,
        mockUser,
        membersColorsMap
      );

      expect(calendarEvents).toHaveLength(1);
      expect(calendarEvents[0].title).toBe('Work Meeting');
      expect(calendarEvents[0].color).toBe('#0000FF');
      expect(calendarEvents[0].childId).toBe('user1');
    });

    it('should handle events without endDate', () => {
      const eventsByChild = {
        child1: [
          {
            _id: 'event4',
            title: 'All Day Event',
            startDate: '2024-03-30T00:00:00.000Z',
            category: 'other',
            location: 'Home',
            family: 'family1',
          },
        ],
      };

      const disabledChildren = new Set<string>();
      const membersColorsMap = new Map<string, string>();

      const calendarEvents = transformToCalendarEvents(
        eventsByChild,
        mockChildren,
        disabledChildren,
        mockUser,
        membersColorsMap
      );

      expect(calendarEvents).toHaveLength(1);
      expect(calendarEvents[0].start).toEqual(calendarEvents[0].end);
    });
  });
});
