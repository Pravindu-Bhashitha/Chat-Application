import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../AuthContext';

const TestComponent = () => {
  const { isAuthenticated, user, loginUser, logoutUser, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <span data-testid="auth-status">{isAuthenticated ? 'Logged In' : 'Logged Out'}</span>
      <span data-testid="user-name">{user?.username || 'No User'}</span>
      <button onClick={() => loginUser('mock-token', { id: '1', username: 'john_doe', email: 'john@example.com' })}>
        Login
      </button>
      <button onClick={logoutUser}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes with unauthenticated state when localStorage is empty', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged Out');
    expect(screen.getByTestId('user-name')).toHaveTextContent('No User');
  });

  it('restores auth state from localStorage on boot', () => {
    localStorage.setItem('token', 'valid-token');
    localStorage.setItem('user', JSON.stringify({ id: '1', username: 'john_doe', email: 'john@example.com' }));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged In');
    expect(screen.getByTestId('user-name')).toHaveTextContent('john_doe');
  });

  it('logs in user and persists credentials to localStorage', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    act(() => {
      screen.getByText('Login').click();
    });

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged In');
    expect(screen.getByTestId('user-name')).toHaveTextContent('john_doe');
    expect(localStorage.getItem('token')).toBe('mock-token');
  });

  it('logs out user and clears localStorage', () => {
    localStorage.setItem('token', 'valid-token');
    localStorage.setItem('user', JSON.stringify({ id: '1', username: 'john_doe', email: 'john@example.com' }));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    act(() => {
      screen.getByText('Logout').click();
    });

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged Out');
    expect(localStorage.getItem('token')).toBeNull();
  });
});