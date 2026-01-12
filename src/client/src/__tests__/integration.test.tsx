import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { UserProvider, useUser } from '../contexts/user.context';
import { ModalProvider } from '../contexts/modal.context';
import LoginPage from '../pages/login';
import { UserService } from '../services/user.service';

// Mock de Ionic
vi.mock('@ionic/react', () => ({
  IonIcon: ({ icon }: { icon: string }) => <span data-testid="ion-icon">{icon}</span>,
}));

vi.mock('ionicons/icons', () => ({
  arrowBack: 'arrow-back-icon',
}));

vi.mock('../services/user.service', () => ({
  UserService: {
    login: vi.fn(),
    getUser: vi.fn(),
    logout: vi.fn(),
  },
}));

vi.mock('../components/organisms/hero', () => ({
  default: () => <div>Hero Component</div>,
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Integration: User Authentication Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(UserService.getUser).mockReturnValue(null);
  });

  it('should complete full login flow with context updates', async () => {
    const user = userEvent.setup();

    const mockLoginResponse = {
      userId: 'user123',
      name: 'Test User',
      email: 'test@example.com',
      accessToken: 'test-token-123',
      families: ['family1'],
      role: 'user' as const,
      color: 'blue',
    };

    vi.mocked(UserService.login).mockResolvedValue(mockLoginResponse);

    // Render the app with all providers
    render(
      <BrowserRouter>
        <UserProvider>
          <ModalProvider>
            <LoginPage />
          </ModalProvider>
        </UserProvider>
      </BrowserRouter>
    );

    // Verify initial state
    expect(screen.getByText('Welcome back!')).toBeInTheDocument();

    // Fill in login form
    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /Login/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    // Submit login
    await user.click(loginButton);

    // Verify login was called
    await waitFor(() => {
      expect(UserService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    // Verify localStorage was updated
    expect(localStorage.getItem('token')).toBe('test-token-123');
    expect(localStorage.getItem('user')).toContain('Test User');

    // Verify navigation happened
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('should handle authentication errors gracefully', async () => {
    const user = userEvent.setup();

    vi.mocked(UserService.login).mockRejectedValue(
      new Error('Invalid credentials')
    );

    render(
      <BrowserRouter>
        <UserProvider>
          <ModalProvider>
            <LoginPage />
          </ModalProvider>
        </UserProvider>
      </BrowserRouter>
    );

    // Fill and submit form
    await user.type(screen.getByRole('textbox', { name: /email/i }), 'wrong@example.com');
    const passwordInput = screen.getByLabelText(/password/i);
    await user.type(passwordInput, 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /Login/i }));

    // Verify error is displayed
    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
    });

    // Verify localStorage was NOT updated
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();

    // Verify navigation did NOT happen
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should restore user session from localStorage', () => {
    const storedUser = {
      userId: 'stored-user',
      name: 'Stored User',
      email: 'stored@example.com',
      families: ['family1'],
      role: 'user' as const,
      color: 'blue',
      accessToken: 'stored-token',
    };

    localStorage.setItem('token', 'stored-token');
    localStorage.setItem('user', JSON.stringify(storedUser));
    vi.mocked(UserService.getUser).mockReturnValue(storedUser);

    const TestComponent = () => {
      const { user, isAuthenticated } = useUser();
      return (
        <div>
          <div data-testid="auth-status">
            {isAuthenticated ? 'authenticated' : 'not-authenticated'}
          </div>
          <div data-testid="user-name">{user?.name || 'no-user'}</div>
        </div>
      );
    };

    render(
      <BrowserRouter>
        <UserProvider>
          <TestComponent />
        </UserProvider>
      </BrowserRouter>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    expect(screen.getByTestId('user-name')).toHaveTextContent('Stored User');
  });
});
