import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileView } from '@/components/profile/ProfileView';
import { ProfileEditor } from '@/components/profile/ProfileEditor';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import type { User, UserRole } from '@/types';

// Mock the hooks
vi.mock('@/hooks/useAuth');
vi.mock('@/hooks/useProfile');

// Helper function to create mock user data
const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: '1',
  email: 'test@example.com',
  full_name: 'Test User',
  name: 'Test User',
  phone_number: '+1234567890',
  role: 'tenant' as UserRole,
  preferred_language: 'en',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  ...overrides,
});

describe('Profile Components', () => {
  const mockUser = createMockUser();
  const mockProfile = createMockUser({ role: 'landlord' });
  const mockUpdateProfile = vi.fn();

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Setup mock implementations
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      isLoading: false,
      error: null,
    });

    (useProfile as jest.Mock).mockReturnValue({
      profile: mockProfile,
      isLoading: false,
      error: null,
      updateProfile: mockUpdateProfile,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('ProfileView', () => {
    it('renders user profile information', () => {
      render(<ProfileView />);
      
      expect(screen.getByText(/Test User/)).toBeInTheDocument();
      expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
      expect(screen.getByText(/\+1234567890/)).toBeInTheDocument();
      expect(screen.getByText(/landlord/)).toBeInTheDocument();
    });
  });

  describe('ProfileEditor', () => {
    it('renders the profile edit form', () => {
      render(<ProfileEditor />);
      
      expect(screen.getByLabelText(/Full Name/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Phone Number/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Preferred Language/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Save Changes/ })).toBeInTheDocument();
    });

    it('allows editing profile information', async () => {
      const user = userEvent.setup();
      render(<ProfileEditor />);
      
      const nameInput = screen.getByLabelText(/Full Name/);
      const phoneInput = screen.getByLabelText(/Phone Number/);
      const saveButton = screen.getByRole('button', { name: /Save Changes/ });

      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Name');
      await user.clear(phoneInput);
      await user.type(phoneInput, '+1987654321');
      
      expect(nameInput).toHaveValue('Updated Name');
      expect(phoneInput).toHaveValue('+1987654321');
    });

    it('submits the form with updated data', async () => {
      const user = userEvent.setup();
      render(<ProfileEditor />);
      
      const nameInput = screen.getByLabelText(/Full Name/);
      const saveButton = screen.getByRole('button', { name: /Save Changes/ });

      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Name');
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalledTimes(1);
        expect(mockUpdateProfile).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Updated Name',
            full_name: 'Updated Name',
          })
        );
      });
    });
  });
});
