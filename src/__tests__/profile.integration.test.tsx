import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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
  phone: '+1234567890',
  role: 'tenant' as UserRole,
  preferred_language: 'en',
  preferredLanguage: 'en',
  profile_photo: '',
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
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      token: 'test-token',
      isLoading: false,
      error: null,
      isAuthenticated: true,
      login: vi.fn().mockResolvedValue(undefined),
      logout: vi.fn(),
      signup: vi.fn().mockResolvedValue(undefined),
      googleAuth: vi.fn().mockResolvedValue(undefined),
      clearError: vi.fn(),
    } as any); // Using type assertion to avoid type errors

    vi.mocked(useProfile).mockReturnValue({
      profile: mockProfile,
      isLoading: false,
      error: null,
      fetchProfile: vi.fn(),
      updateProfile: mockUpdateProfile,
      clearError: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('ProfileView', () => {
    it('renders user profile information', () => {
      render(<ProfileView />);
      
      // Check for both name and full_name
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('+1234567890')).toBeInTheDocument();
      // Role is displayed with first letter capitalized
      expect(screen.getByText('Tenant')).toBeInTheDocument();
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
      // saveButton is not used in assertions, so we can remove it

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
        
        // Get the first argument of the first call
        const formData = mockUpdateProfile.mock.calls[0][0];
        
        let formDataObj;
        
        // Handle both FormData and plain object submissions
        if (formData instanceof FormData) {
          // Convert FormData to object for easier assertions
          formDataObj = Object.fromEntries(formData.entries());
        } else if (typeof formData === 'object' && formData !== null) {
          // If it's already a plain object, use it as is
          formDataObj = formData;
        } else {
          // If it's neither FormData nor a plain object, fail the test
          throw new Error(`Expected FormData or plain object, got ${typeof formData}`);
        }
        
        // Check that the form data contains the updated name
        expect(formDataObj.name).toBe('Updated Name');
        
        // The original full_name should remain unchanged in the form submission
        // as we only updated the name field
        expect(formDataObj.full_name).toBe('Test User');
        
        // Verify other form fields are present with expected values
        expect(formDataObj.phone || formDataObj.phone_number).toBe('+1234567890');
        expect(formDataObj.preferred_language).toBe('en');
      });
    });
  });
});
