import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from './login';
import { UserService } from '../services/user.service';
import { UserProvider } from '../contexts/user.context';

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

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LoginPage', () => {
  const renderLoginPage = () => {
    return render(
      <BrowserRouter>
        <UserProvider>
          <LoginPage />
        </UserProvider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(UserService.getUser).mockReturnValue(null);
  });

  it('should render login form', () => {
    renderLoginPage();

    expect(screen.getByText('Welcome back!')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    expect(screen.getByText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  it('should handle successful login', async () => {
    const user = userEvent.setup();
    const mockLoginResponse = {
      userId: 'user123',
      name: 'Test User',
      email: 'test@example.com',
      accessToken: 'test-token',
      families: [],
      role: 'user' as const,
      color: 'blue',
    };

    vi.mocked(UserService.login).mockResolvedValue(mockLoginResponse);

    renderLoginPage();

    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /Login/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(loginButton);

    await waitFor(() => {
      expect(UserService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('should display error message on login failure', async () => {
    const user = userEvent.setup();
    vi.mocked(UserService.login).mockRejectedValue(new Error('Invalid credentials'));

    renderLoginPage();

    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /Login/i });

    await user.type(emailInput, 'wrong@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
    });
  });

  it('should require email and password fields', () => {
    renderLoginPage();

    const emailInput = screen.getByRole('textbox', { name: /email/i }) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;

    expect(emailInput.required).toBe(true);
    expect(passwordInput.required).toBe(true);
  });

  it('should clear form after successful login', async () => {
    const user = userEvent.setup();
    const mockLoginResponse = {
      userId: 'user123',
      name: 'Test User',
      email: 'test@example.com',
      accessToken: 'test-token',
      families: [],
      role: 'user' as const,
      color: 'blue',
    };

    vi.mocked(UserService.login).mockResolvedValue(mockLoginResponse);

    renderLoginPage();

    const emailInput = screen.getByRole('textbox', { name: /email/i }) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
      expect(emailInput.value).toBe('');
      expect(passwordInput.value).toBe('');
    });
  });

  it('should navigate back when back button is clicked', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    const backButton = screen.getByText('Back');
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('should show link to signup page', () => {
    renderLoginPage();

    expect(screen.getByText(/Don't have an account yet?/i)).toBeInTheDocument();
  });
});
