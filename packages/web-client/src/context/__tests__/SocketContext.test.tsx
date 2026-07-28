import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SocketProvider, useSocket } from '../SocketContext';
import { AuthProvider } from '../AuthContext';

// Mock socket.io-client
const mockSocket = {
  on: vi.fn(),
  emit: vi.fn(),
  disconnect: vi.fn(),
  connected: true,
};

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => mockSocket),
}));

const TestComponent = () => {
  const { onlineUserIds, updateStatus } = useSocket();
  return (
    <div>
      <span data-testid="online-count">{onlineUserIds.length}</span>
      <button onClick={() => updateStatus('Away', 'In a meeting')}>Set Away</button>
    </div>
  );
};

describe('SocketContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('does not initialize socket when user is not authenticated', () => {
    render(
      <AuthProvider>
        <SocketProvider>
          <TestComponent />
        </SocketProvider>
      </AuthProvider>
    );

    expect(screen.getByTestId('online-count')).toHaveTextContent('0');
  });

  it('initializes socket connection when user is authenticated', () => {
    localStorage.setItem('token', 'valid-token');
    localStorage.setItem('user', JSON.stringify({ id: '1', username: 'john_doe', email: 'john@example.com' }));

    render(
      <AuthProvider>
        <SocketProvider>
          <TestComponent />
        </SocketProvider>
      </AuthProvider>
    );

    expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('online_users_list', expect.any(Function));
  });

  it('emits update_presence when updateStatus is called', () => {
    localStorage.setItem('token', 'valid-token');
    localStorage.setItem('user', JSON.stringify({ id: '1', username: 'john_doe', email: 'john@example.com' }));

    render(
      <AuthProvider>
        <SocketProvider>
          <TestComponent />
        </SocketProvider>
      </AuthProvider>
    );

    act(() => {
      screen.getByText('Set Away').click();
    });

    expect(mockSocket.emit).toHaveBeenCalledWith('update_presence', {
      status: 'Away',
      customNote: 'In a meeting',
    });
  });
});