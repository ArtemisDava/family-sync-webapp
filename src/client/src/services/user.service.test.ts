import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UserService } from './user.service';
import type { LoginDto } from '../models/login.dto';
import type { SignUpDto } from '../models/signup.dto';

describe('UserService', () => {
  const mockToken = 'test-token-123';
  const mockUser = {
    _id: 'user123',
    userId: 'user123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user' as const,
    families: [],
  };

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('signUp', () => {
    it('should successfully sign up a user', async () => {
      const signUpData: SignUpDto = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
      };

      const mockResponse = {
        user: mockUser,
        token: mockToken,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await UserService.signUp(signUpData);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/signup'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(signUpData),
        })
      );

      expect(result).toEqual(mockResponse);
    });

    it('should throw error on failed sign up', async () => {
      const signUpData: SignUpDto = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
      };

      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      await expect(UserService.signUp(signUpData)).rejects.toThrow('Network error');
    });
  });

  describe('login', () => {
    it('should successfully login a user', async () => {
      const loginData: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockUser,
      });

      const result = await UserService.login(loginData);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/login'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginData),
        })
      );

      expect(result).toEqual(mockUser);
    });

    it('should throw error when login fails', async () => {
      const loginData: LoginDto = {
        email: 'wrong@example.com',
        password: 'wrongpassword',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({ message: 'Login failed' }),
      });

      await expect(UserService.login(loginData)).rejects.toThrow('Login failed');
    });
  });

  describe('updateUser', () => {
    it('should successfully update user', async () => {
      const updateData = {
        name: 'Updated Name',
        color: '#FF0000',
      };

      const updatedUser = {
        ...mockUser,
        ...updateData,
      };

      localStorage.setItem('token', mockToken);

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => updatedUser,
      });

      const result = await UserService.updateUser(updateData);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/users'),
        expect.objectContaining({
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          },
          body: JSON.stringify(updateData),
        })
      );

      expect(result.userId).toBe(updatedUser._id);
      expect(localStorage.getItem('user')).toContain(updatedUser.name);
    });

    it('should throw error when update fails', async () => {
      localStorage.setItem('token', mockToken);

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
      });

      await expect(UserService.updateUser({ name: 'New Name' })).rejects.toThrow(
        'Failed to update user'
      );
    });
  });

  describe('getUser', () => {
    it('should retrieve user from localStorage', () => {
      localStorage.setItem('user', JSON.stringify(mockUser));

      const result = UserService.getUser();

      expect(result).toEqual(mockUser);
    });

    it('should return null when no user in localStorage', () => {
      const result = UserService.getUser();

      expect(result).toBeNull();
    });
  });

  describe('deleteUser', () => {
    it('should successfully delete user and logout', async () => {
      const userId = 'user123';
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
      });

      await UserService.deleteUser(userId);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/users/${userId}`),
        expect.objectContaining({
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          },
        })
      );

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });

    it('should throw error when delete fails', async () => {
      const userId = 'user123';
      localStorage.setItem('token', mockToken);

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
      });

      await expect(UserService.deleteUser(userId)).rejects.toThrow(
        'Failed to delete user'
      );
    });
  });

  describe('logout', () => {
    it('should clear localStorage on logout', () => {
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));

      UserService.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });
});
