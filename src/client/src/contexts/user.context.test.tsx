import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProvider, useUser } from './user.context';
import { UserService } from '../services/user.service';

vi.mock('../services/user.service', () => ({
  UserService: {
    getUser: vi.fn(),
    logout: vi.fn(),
  },
}));

// Componente de prueba para acceder al contexto
const TestComponent = () => {
  const { user, token, isAuthenticated, login, logout } = useUser();

  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
      <div data-testid="user-name">{user?.name || 'no-user'}</div>
      <div data-testid="token">{token || 'no-token'}</div>
      <button
        onClick={() =>
          login(
            {
              userId: 'user123',
              name: 'Test User',
              email: 'test@example.com',
              families: [],
              role: 'user',
            },
            'test-token'
          )
        }
      >
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('UserContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should throw error when useUser is used outside provider', () => {
    // Suprimir console.error para este test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useUser must be used within a UserProvider');

    consoleSpy.mockRestore();
  });

  it('should initialize with no user when localStorage is empty', () => {
    vi.mocked(UserService.getUser).mockReturnValue(null);

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
    expect(screen.getByTestId('user-name')).toHaveTextContent('no-user');
    expect(screen.getByTestId('token')).toHaveTextContent('no-token');
  });

  it('should initialize with user from localStorage', () => {
    const mockUser = {
      userId: 'stored-user',
      name: 'Stored User',
      email: 'stored@example.com',
      families: [],
      role: 'user' as const,
    };

    localStorage.setItem('token', 'stored-token');
    vi.mocked(UserService.getUser).mockReturnValue(mockUser);

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    expect(screen.getByTestId('user-name')).toHaveTextContent('Stored User');
    expect(screen.getByTestId('token')).toHaveTextContent('stored-token');
  });

  it('should login user and update state', async () => {
    vi.mocked(UserService.getUser).mockReturnValue(null);

    const user = userEvent.setup();

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');

    await user.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    });

    expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
    expect(screen.getByTestId('token')).toHaveTextContent('test-token');
    expect(localStorage.getItem('token')).toBe('test-token');
    expect(localStorage.getItem('user')).toContain('Test User');
  });

  it('should logout user and clear state', async () => {
    const mockUser = {
      userId: 'user123',
      name: 'Test User',
      email: 'test@example.com',
      families: [],
      role: 'user' as const,
    };

    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify(mockUser));
    vi.mocked(UserService.getUser).mockReturnValue(mockUser);

    const user = userEvent.setup();

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');

    await user.click(screen.getByText('Logout'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
    });

    expect(screen.getByTestId('user-name')).toHaveTextContent('no-user');
    expect(screen.getByTestId('token')).toHaveTextContent('no-token');
    expect(UserService.logout).toHaveBeenCalled();
  });

  it('should provide setUser function', () => {
    vi.mocked(UserService.getUser).mockReturnValue(null);

    const SetUserComponent = () => {
      const { user, setUser } = useUser();

      return (
        <div>
          <div data-testid="user-name">{user?.name || 'no-user'}</div>
          <button
            onClick={() =>
              setUser({
                userId: 'new-user',
                name: 'New User',
                email: 'new@example.com',
                families: [],
                role: 'user',
              })
            }
          >
            Set User
          </button>
        </div>
      );
    };

    const user = userEvent.setup();

    render(
      <UserProvider>
        <SetUserComponent />
      </UserProvider>
    );

    expect(screen.getByTestId('user-name')).toHaveTextContent('no-user');

    user.click(screen.getByText('Set User'));

    waitFor(() => {
      expect(screen.getByTestId('user-name')).toHaveTextContent('New User');
    });
  });
});
