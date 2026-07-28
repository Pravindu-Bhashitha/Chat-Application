import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Login from '../Login';
import { authService } from '../../../api/authService/authService';
import { useAuth } from '../../../context/AuthContext';

// Mock authService
vi.mock('../../../api/authService/authService', () => ({
  authService: {
    login: vi.fn(),
  },
}));

// Mock AuthContext
vi.mock('../../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock useNavigate from react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Login Component', () => {
  const mockLoginUser = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      loginUser: mockLoginUser,
      user: null,
      loading: false,
      logoutUser: vi.fn(),
      isAuthenticated: false,
    });
  });

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

  it('renders initial form inputs and controls correctly', () => {
    renderComponent();

    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /register/i })).toHaveAttribute('href', '/register');
  });

  it('toggles password field visibility when eye icon is clicked', () => {
    renderComponent();

    const passwordInput = screen.getByLabelText(/password/i);
    const toggleBtn = screen.getByRole('button', { name: '👁️' });

    // Initial state
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Toggle to visible
    fireEvent.click(toggleBtn);
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: '🙈' })).toBeInTheDocument();

    // Toggle back to hidden
    fireEvent.click(screen.getByRole('button', { name: '🙈' }));
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('submits form successfully, calls loginUser, and redirects to home page', async () => {
    const mockResponse = {
      token: 'fake-jwt-token',
      user: { id: '1', email: 'user@example.com', username: 'John Doe' },
    };

    vi.mocked(authService.login).mockResolvedValueOnce(mockResponse);

    renderComponent();

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Verify service payload
    expect(authService.login).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
    });

    // Verify Context + Navigation execution
    await waitFor(() => {
      expect(mockLoginUser).toHaveBeenCalledWith('fake-jwt-token', mockResponse.user);
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('displays API error message when login request fails', async () => {
    vi.mocked(authService.login).mockRejectedValueOnce({
      response: { data: { error: 'Invalid email or password' } },
    });

    renderComponent();

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpassword' },
    });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument();
  });

  it('displays fallback error message when server response is unavailable', async () => {
    vi.mocked(authService.login).mockRejectedValueOnce(new Error('Network error'));

    renderComponent();

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(
      await screen.findByText('Login failed. Please check your credentials.')
    ).toBeInTheDocument();
  });
});