import React from 'react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ForgotPassword from '../components/auth/ForgotPassword';
import ResetPassword from '../components/auth/ResetPassword';

// Mock the fetch function
global.fetch = vi.fn();

const createFetchResponse = (ok: boolean, data: any) => {
  return {
    ok,
    json: () => new Promise((resolve) => resolve(data)),
  };
};

describe('Forgot and Reset Password Integration', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('ForgotPassword', () => {
    it('should display success message after submitting a valid email', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <ForgotPassword />
        </MemoryRouter>
      );

      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      const mockResponse = { message: 'Reset link sent successfully!' };
      (fetch as vi.Mock).mockResolvedValue(createFetchResponse(true, mockResponse));

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          'https://rent-managment-system-user-magt.onrender.com/api/v1/auth/forgot-password',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test@example.com' }),
          }
        );
      });

      await waitFor(() => {
        expect(screen.getByText('Reset link sent successfully!')).toBeInTheDocument();
      });
    });

    it('should display an error message if the email is not found', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <ForgotPassword />
        </MemoryRouter>
      );

      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      const mockErrorResponse = { detail: 'User with that email does not exist' };
      (fetch as vi.Mock).mockResolvedValue(createFetchResponse(false, mockErrorResponse));

      await user.type(emailInput, 'nonexistent@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('User with that email does not exist')).toBeInTheDocument();
      });
    });
  });

  describe('ResetPassword', () => {
    it('should display success message after submitting a valid new password', async () => {
        const user = userEvent.setup();
        render(
          <MemoryRouter initialEntries={['/reset-password?token=valid-token']}>
            <Routes>
                <Route path="/reset-password" element={<ResetPassword />} />
            </Routes>
          </MemoryRouter>
        );
  
        const passwordInput = screen.getByLabelText(/new password/i);
        const passwordConfirmInput = screen.getByLabelText(/confirm new password/i);
        const submitButton = screen.getByRole('button', { name: /reset password/i });
  
        const mockResponse = { message: 'Password updated successfully!' };
        (fetch as vi.Mock).mockResolvedValue(createFetchResponse(true, mockResponse));
  
        await user.type(passwordInput, 'newpassword123');
        await user.type(passwordConfirmInput, 'newpassword123');
        await user.click(submitButton);
  
        await waitFor(() => {
          expect(fetch).toHaveBeenCalledWith(
            'https://rent-managment-system-user-magt.onrender.com/api/v1/auth/reset-password',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                token: 'valid-token',
                password: 'newpassword123',
                passwordConfirm: 'newpassword123',
              }),
            }
          );
        });
  
        await waitFor(() => {
          expect(screen.getByText('Password updated successfully!')).toBeInTheDocument();
        });
      });
  
      it('should display an error message if passwords do not match', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter initialEntries={['/reset-password?token=valid-token']}>
                <Routes>
                    <Route path="/reset-password" element={<ResetPassword />} />
                </Routes>
            </MemoryRouter>
        );
  
        const passwordInput = screen.getByLabelText(/new password/i);
        const passwordConfirmInput = screen.getByLabelText(/confirm new password/i);
        const submitButton = screen.getByRole('button', { name: /reset password/i });
  
        await user.type(passwordInput, 'newpassword123');
        await user.type(passwordConfirmInput, 'differentpassword');
        await user.click(submitButton);
  
        await waitFor(() => {
          expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
        });
  
        expect(fetch).not.toHaveBeenCalled();
      });
  
      it('should display an error message if the token is invalid', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter initialEntries={['/reset-password?token=invalid-token']}>
                <Routes>
                    <Route path="/reset-password" element={<ResetPassword />} />
                </Routes>
            </MemoryRouter>
        );
  
        const passwordInput = screen.getByLabelText(/new password/i);
        const passwordConfirmInput = screen.getByLabelText(/confirm new password/i);
        const submitButton = screen.getByRole('button', { name: /reset password/i });
  
        const mockErrorResponse = { detail: 'Invalid token' };
        (fetch as vi.Mock).mockResolvedValue(createFetchResponse(false, mockErrorResponse));
  
        await user.type(passwordInput, 'newpassword123');
        await user.type(passwordConfirmInput, 'newpassword123');
        await user.click(submitButton);
  
        await waitFor(() => {
          expect(screen.getByText('Invalid token')).toBeInTheDocument();
        });
      });
    });
});
