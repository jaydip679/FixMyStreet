import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, test, expect, vi } from 'vitest';
import Navbar from '../components/layout/Navbar';
import * as AuthContext from '../context/AuthContext';
import * as apiModule from '../services/api';

vi.mock('../services/api', () => ({
  notificationsApi: {
    list: vi.fn().mockResolvedValue({ data: { data: { notifications: [] } } })
  }
}));

describe('Navbar Component — Frontend Tests', () => {
  test('renders_brand_name_and_signin_register_links_for_unauthenticated_visitor', () => {
    // Arrange
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      isCitizen: false,
      logout: vi.fn()
    });

    // Act
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    // Assert
    expect(screen.getByText(/Fix/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Sign In/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Register/i })).toBeInTheDocument();
  });

  test('renders_citizen_controls_when_authenticated_as_citizen', () => {
    // Arrange
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { name: 'Ramesh Citizen', role: 'CITIZEN' },
      isAuthenticated: true,
      isAdmin: false,
      isCitizen: true,
      logout: vi.fn()
    });

    // Act
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    // Assert
    expect(screen.getByText('Report Issue')).toBeInTheDocument();
    expect(screen.getByText('My Reports')).toBeInTheDocument();
    expect(screen.getByText('Ramesh Citizen')).toBeInTheDocument();
    expect(screen.getByText('CITIZEN')).toBeInTheDocument();
  });

  test('renders_admin_controls_when_authenticated_as_admin', () => {
    // Arrange
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { name: 'Admin Sharma', role: 'ADMIN' },
      isAuthenticated: true,
      isAdmin: true,
      isCitizen: false,
      logout: vi.fn()
    });

    // Act
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    // Assert
    expect(screen.getByText('Admin Console')).toBeInTheDocument();
    expect(screen.getByText('Admin Sharma')).toBeInTheDocument();
    expect(screen.getByText('ADMIN')).toBeInTheDocument();
  });
});
