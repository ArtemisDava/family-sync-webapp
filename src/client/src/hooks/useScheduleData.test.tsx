import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useScheduleData } from './useScheduleData';
import { UserProvider } from '../contexts/user.context';
import { FamiliesService } from '../services/families.service';
import { EventsService } from '../services/events.service';
import { UserService } from '../services/user.service';
import type { ReactNode } from 'react';

vi.mock('../services/families.service', () => ({
  FamiliesService: {
    getFamilies: vi.fn(),
  },
}));

vi.mock('../services/events.service', () => ({
  EventsService: {
    getEventsByChild: vi.fn(),
    getEventsByAdult: vi.fn(),
  },
}));

vi.mock('../services/user.service', () => ({
  UserService: {
    getUser: vi.fn(),
    logout: vi.fn(),
  },
}));

const mockUser = {
  userId: 'user123',
  name: 'Test User',
  email: 'test@example.com',
  families: ['family1'],
  role: 'user' as const,
  color: 'blue',
  accessToken: 'test-token',
};

const mockFamilies = [
  {
    _id: 'family1',
    name: 'Test Family',
    members: [{
      _id: 'user123',
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      birthDate: '1990-01-01',
      color: 'blue',
      role: 'user',
      families: ['family1'],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      isActive: true,
      isAdmin: false,
      __v: 0
    }],
    children: [
      {
        _id: 'child1',
        name: 'Alice',
        birthDate: '2018-01-01',
        color: '#FF0000',
        family: 'family1',
        guardians: ['user123'],
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        __v: 0
      },
      {
        _id: 'child2',
        name: 'Bob',
        birthDate: '2019-06-15',
        color: '#00FF00',
        family: 'family1',
        guardians: ['user123'],
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        __v: 0
      },
    ],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    createdBy: 'user123',
    isActive: true,
    __v: 0,
  },
];

const mockChildEvents = [
  {
    _id: 'event1',
    title: 'School Event',
    startDate: '2024-03-15T10:00:00.000Z',
    endDate: '2024-03-15T11:00:00.000Z',
    category: 'school',
    location: 'School',
    family: 'family1',
  },
];

const mockAdultEvents = [
  {
    _id: 'event2',
    title: 'Work Meeting',
    startDate: '2024-03-20T09:00:00.000Z',
    endDate: '2024-03-20T10:00:00.000Z',
    category: 'work',
    location: 'Office',
    family: 'family1',
  },
];

describe('useScheduleData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify(mockUser));
    vi.mocked(UserService.getUser).mockReturnValue(mockUser);
  });

  const wrapper = ({ children }: { children: ReactNode }) => {
    return <UserProvider>{children}</UserProvider>;
  };

  it('should fetch and return schedule data', async () => {
    vi.mocked(FamiliesService.getFamilies).mockResolvedValue(mockFamilies);
    vi.mocked(EventsService.getEventsByChild).mockResolvedValue(mockChildEvents);
    vi.mocked(EventsService.getEventsByAdult).mockResolvedValue(mockAdultEvents);

    const { result } = renderHook(() => useScheduleData(), { wrapper });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.families).toHaveLength(1);
    expect(result.current.families?.[0].name).toBe('Test Family');
    expect(result.current.children).toHaveLength(2);
    expect(result.current.error).toBeNull();
  });

  it('should populate familiesMap correctly', async () => {
    vi.mocked(FamiliesService.getFamilies).mockResolvedValue(mockFamilies);
    vi.mocked(EventsService.getEventsByChild).mockResolvedValue(mockChildEvents);
    vi.mocked(EventsService.getEventsByAdult).mockResolvedValue(mockAdultEvents);

    const { result } = renderHook(() => useScheduleData(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.familiesMap.size).toBe(1);
    expect(result.current.familiesMap.get('family1')?.name).toBe('Test Family');
  });

  it('should fetch events for all children', async () => {
    vi.mocked(FamiliesService.getFamilies).mockResolvedValue(mockFamilies);
    vi.mocked(EventsService.getEventsByChild).mockResolvedValue(mockChildEvents);
    vi.mocked(EventsService.getEventsByAdult).mockResolvedValue(mockAdultEvents);

    const { result } = renderHook(() => useScheduleData(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(EventsService.getEventsByChild).toHaveBeenCalledWith('child1', 'test-token');
    expect(EventsService.getEventsByChild).toHaveBeenCalledWith('child2', 'test-token');
    expect(result.current.eventsByChild).toHaveProperty('child1');
    expect(result.current.eventsByChild).toHaveProperty('child2');
  });

  it('should fetch adult events and add to eventsByChild', async () => {
    vi.mocked(FamiliesService.getFamilies).mockResolvedValue(mockFamilies);
    vi.mocked(EventsService.getEventsByChild).mockResolvedValue(mockChildEvents);
    vi.mocked(EventsService.getEventsByAdult).mockResolvedValue(mockAdultEvents);

    const { result } = renderHook(() => useScheduleData(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(EventsService.getEventsByAdult).toHaveBeenCalledWith('family1', 'test-token');
    expect(result.current.eventsByChild).toHaveProperty('user123');
    expect(result.current.eventsByChild['user123']).toEqual(mockAdultEvents);
  });

  it('should handle errors gracefully', async () => {
    const error = new Error('Failed to fetch families');
    vi.mocked(FamiliesService.getFamilies).mockRejectedValue(error);

    const { result } = renderHook(() => useScheduleData(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toEqual(error);
    expect(result.current.families).toBeNull();
  });

  it('should not fetch data when no token is available', async () => {
    localStorage.removeItem('token');

    const { result } = renderHook(() => useScheduleData(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(FamiliesService.getFamilies).not.toHaveBeenCalled();
    expect(EventsService.getEventsByChild).not.toHaveBeenCalled();
  });

  it('should refetch data when refetch is called', async () => {
    vi.mocked(FamiliesService.getFamilies).mockResolvedValue(mockFamilies);
    vi.mocked(EventsService.getEventsByChild).mockResolvedValue(mockChildEvents);
    vi.mocked(EventsService.getEventsByAdult).mockResolvedValue(mockAdultEvents);

    const { result } = renderHook(() => useScheduleData(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(FamiliesService.getFamilies).toHaveBeenCalledTimes(1);

    await result.current.refetch();

    await waitFor(() => {
      expect(FamiliesService.getFamilies).toHaveBeenCalledTimes(2);
    });
  });

  it('should add family id to children', async () => {
    vi.mocked(FamiliesService.getFamilies).mockResolvedValue(mockFamilies);
    vi.mocked(EventsService.getEventsByChild).mockResolvedValue(mockChildEvents);
    vi.mocked(EventsService.getEventsByAdult).mockResolvedValue(mockAdultEvents);

    const { result } = renderHook(() => useScheduleData(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.children).toHaveLength(2);
    expect(result.current.children[0].family).toBe('family1');
    expect(result.current.children[1].family).toBe('family1');
  });
});
