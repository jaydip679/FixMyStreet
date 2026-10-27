import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, test, expect, vi } from 'vitest';
import Login from '../pages/Login';
import * as AuthContext from '../context/AuthContext';

describe('Login Page — Frontend Tests', () => {
  test('renders_login_form_with_email_and_password_inputs', () => {
    // Arrange
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      login: vi.fn(),
      isAuthenticated: false
    });

    // Act
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    // Assert
    expect(screen.getByText('Sign in to FixMyStreet')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  test('submitting_invalid_credentials_displays_error_alert', async () => {
    // Arrange
    const mockLogin = vi.fn().mockRejectedValue({
      response: { data: { message: 'Invalid email or password' } }
    });
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      login: mockLogin,
      isAuthenticated: false
    });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    // Act
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'wrong@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'badpassword' }
    });
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    });
  });
});
