// auth.unit.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAuth } from '@/hooks/useAuth';

// Mock the auth hook
vi.mock('@/hooks/useAuth');

const mockLogin = vi.fn().mockResolvedValue(undefined);
const mockLogout = vi.fn();
const mockSignup = vi.fn().mockResolvedValue(undefined);
const mockGoogleAuth = vi.fn().mockResolvedValue(undefined);
const mockClearError = vi.fn();

describe('Authentication', () => {
  const mockAuthReturn = {
    user: null,
    token: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,
    login: mockLogin,
    logout: mockLogout,
    signup: mockSignup,
    googleAuth: mockGoogleAuth,
    clearError: mockClearError,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue(mockAuthReturn);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('LoginForm', () => {
    it('renders login form with email and password fields', () => {
      render(<LoginForm />);
      
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('validates required fields', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);
      
      expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
      expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
      expect(mockLogin).not.toHaveBeenCalled();
    });

    it('submits the form with valid data', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);
      
      expect(mockLogin).toHaveBeenCalledTimes(1);
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    it('displays loading state during submission', () => {
      vi.mocked(useAuth).mockReturnValue({
        ...mockAuthReturn,
        isLoading: true,
      });
      
      render(<LoginForm />);
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent(/signing in.../i);
    });

    it('displays error message when login fails', async () => {
      const errorMessage = 'Invalid credentials';
      vi.mocked(useAuth).mockReturnValue({
        ...mockAuthReturn,
        error: errorMessage,
      });
      
      render(<LoginForm />);
      
      expect(await screen.findByText(errorMessage)).toBeInTheDocument();
    });
  });

  describe('useAuth Hook', () => {
    it('should provide auth context', () => {
      const { result } = renderHook(() => useAuth());
      
      expect(result.current).toEqual({
        user: null,
        token: null,
        isLoading: false,
        error: null,
        isAuthenticated: false,
        login: expect.any(Function),
        logout: expect.any(Function),
        signup: expect.any(Function),
        googleAuth: expect.any(Function),
        clearError: expect.any(Function),
      });
    });
  });
});