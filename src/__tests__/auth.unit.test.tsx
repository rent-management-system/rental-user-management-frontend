// auth.unit.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

// Mock the components and modules
const LoginForm = () => <div>LoginForm Mock</div>;
const useAuthStore = vi.fn();

// Mock the actual modules
vi.mock('../../components/auth/LoginForm', () => ({
  __esModule: true,
  default: LoginForm
}));

vi.mock('../../lib/auth-store', () => ({
  useAuthStore: vi.fn()
}));

// Type definition for the auth store selector
interface AuthState {
  user: any; // Replace 'any' with your User type
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Mock the sonner toast first
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock the auth store
vi.mock('@/lib/auth-store');

// Import the mocked toast after setting up the mock
import { toast } from 'sonner';

const mockToastError = vi.mocked(toast.error);

const mockLogin = vi.fn().mockResolvedValue(undefined);
const mockGoogleAuth = vi.fn().mockResolvedValue(undefined);
const mockLogout = vi.fn();
const mockSignup = vi.fn().mockResolvedValue(undefined);
const mockClearError = vi.fn();

describe('Authentication', () => {
  const mockAuthReturn = {
    user: null,
    token: null,
    isLoading: false,
    error: null,
    login: mockLogin,
    logout: mockLogout,
    signup: mockSignup,
    googleAuth: mockGoogleAuth,
    clearError: mockClearError,
    setUser: vi.fn(),
    setToken: vi.fn(),
    refreshUser: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthStore).mockReturnValue(mockAuthReturn);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('LoginForm', () => {
    // Setup mock implementations
    vi.mocked(useAuthStore).mockImplementation((selector: (state: AuthState) => any) => {
      const state = {
        user: null,
        token: null,
        isLoading: false,
        error: null,
        login: mockLogin,
        logout: mockLogout,
        signup: mockSignup,
        googleAuth: mockGoogleAuth,
        clearError: mockClearError,
        setUser: vi.fn(),
        setToken: vi.fn(),
        refreshUser: vi.fn().mockResolvedValue(undefined),
      };
      return selector(state);
    });

    it('renders the login form', () => {
      render(
        <MemoryRouter>
          <LoginForm />
        </MemoryRouter>
      );
      
      // Check that all form elements are rendered
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      
      // Check that the sign in button is rendered
      const signInButton = screen.getByRole('button', { name: /sign in/i });
      expect(signInButton).toBeInTheDocument();
      expect(signInButton).toHaveAttribute('type', 'submit');
      
      // Check for the "Forgot password?" link
      expect(screen.getByText(/forgot password\?/i)).toBeInTheDocument();
      
      // Check for the "Sign up" link
      expect(screen.getByText(/don't have an account\?/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /sign up/i })).toHaveAttribute('href', '/signup');
    });

    it('shows validation errors when form is submitted with empty fields', async () => {
      const user = userEvent.setup();
      
      render(
        <MemoryRouter>
          <LoginForm />
        </MemoryRouter>
      );
      
      // Submit the form
      await user.click(screen.getByRole('button', { name: /sign in/i }));
      
      // Check for validation error messages
      const emailError = await screen.findByText(/email is required/i);
      const passwordError = await screen.findByText(/password is required/i);
      
      expect(emailError).toBeInTheDocument();
      expect(passwordError).toBeInTheDocument();
      
      // Check that the login function was not called
      expect(mockLogin).not.toHaveBeenCalled();
    });
    
    it('shows validation error for invalid email format', async () => {
      const user = userEvent.setup();
      
      render(
        <MemoryRouter>
          <LoginForm />
        </MemoryRouter>
      );
      
      // Enter an invalid email
      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'invalid-email');
      
      // Submit the form
      await user.click(screen.getByRole('button', { name: /sign in/i }));
      
      // Check for email validation error
      const emailError = await screen.findByText(/email is invalid/i);
      expect(emailError).toBeInTheDocument();
      
      // Check that the login function was not called
      expect(mockLogin).not.toHaveBeenCalled();
    });

    it('submits the form with valid data', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <LoginForm />
        </MemoryRouter>
      );
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      // Find the submit button by its text content
      const buttons = screen.getAllByRole('button');
      const submitButton = buttons.find(button => 
        button.textContent?.includes('Sign in') && 
        button.getAttribute('type') === 'submit'
      );
      
      if (!submitButton) {
        throw new Error('Submit button not found');
      }
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);
      
      expect(mockLogin).toHaveBeenCalledTimes(1);
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    it('displays loading state during submission', async () => {
      const user = userEvent.setup();
      
      render(
        <MemoryRouter>
          <LoginForm />
        </MemoryRouter>
      );
      
      // Fill in the form
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      // Find the submit button by its text content
      const buttons = screen.getAllByRole('button');
      const submitButton = buttons.find(button => 
        button.textContent?.includes('Sign in') && 
        button.getAttribute('type') === 'submit'
      );
      
      if (!submitButton) {
        throw new Error('Submit button not found');
      }
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      
      // Mock the login function to never resolve
      const loginPromise = new Promise(() => {});
      mockLogin.mockImplementation(() => loginPromise);
      
      // Submit the form
      await user.click(submitButton);
      
      // The button should be disabled and show loading state
      expect(submitButton).toBeDisabled();
      expect(submitButton.textContent).toMatch(/signing in.../i);
      
      // Clean up
      mockLogin.mockRestore();
    });

    it('displays error toast when login fails', async () => {
      // Reset mock calls before the test
      mockToastError.mockClear();
      
      // Mock the login function to throw an error
      const errorMessage = 'Invalid credentials';
      const mockLoginError = vi.fn().mockRejectedValue(new Error(errorMessage));
      
      // Update the mock to use the mockLoginError function
      vi.mocked(useAuthStore).mockReturnValue({
        ...mockAuthReturn,
        login: mockLoginError,
        error: errorMessage,
      });
      
      render(
        <MemoryRouter>
          <LoginForm />
        </MemoryRouter>
      );
      
      // Submit the form
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      // Find the submit button by its text and verify it's the form submit button
      const buttons = screen.getAllByRole('button');
      const submitButton = buttons.find(button => 
        button.textContent?.includes('Sign in') && 
        button.getAttribute('type') === 'submit'
      );
      
      if (!submitButton) {
        throw new Error('Submit button not found');
      }
      
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.click(submitButton);
      
      // Wait for the login function to be called
      await waitFor(() => {
        expect(mockLoginError).toHaveBeenCalledWith('test@example.com', 'password123');
      });
      
      // Check that the toast.error was called with the correct message
      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Invalid credentials');
      });
    });
  });

  describe('useAuthStore', () => {
    it('should provide auth store', () => {
      const store = useAuthStore();
      
      expect(store).toEqual({
        user: null,
        token: null,
        isLoading: false,
        error: null,
        login: expect.any(Function),
        logout: expect.any(Function),
        signup: expect.any(Function),
        googleAuth: expect.any(Function),
        clearError: expect.any(Function),
        setUser: expect.any(Function),
        setToken: expect.any(Function),
        refreshUser: expect.any(Function),
      });
    });
  });
});