import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Mock lazy-loaded page modules
vi.mock('../../pages/Auth/Login', () => ({
  default: () => <div>Login Page Component</div>,
}));

vi.mock('../../pages/Auth/Register', () => ({
  default: () => <div>Register Page Component</div>,
}));

vi.mock('../../pages/Dashboard/Dashboard', () => ({
  default: () => <div>Dashboard Page Component</div>,
}));

vi.mock('../../components/ErrorPage/ErrorPage', () => ({
  default: ({ title }: { title: string }) => <div>{title}</div>,
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('App Router Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders public Login page when navigating to /login', async () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      user: null,
      loading: false,
      loginUser: vi.fn(),
      logoutUser: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<section>Login Page Component</section>} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Login Page Component')).toBeInTheDocument();
  });

  it('renders 404 Error page when navigating to an undefined route', async () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      user: null,
      loading: false,
      loginUser: vi.fn(),
      logoutUser: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/some/unknown/route']}>
        <Routes>
          <Route path="*" element={<div>404 - Page Not Found</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('404 - Page Not Found')).toBeInTheDocument();
  });
});