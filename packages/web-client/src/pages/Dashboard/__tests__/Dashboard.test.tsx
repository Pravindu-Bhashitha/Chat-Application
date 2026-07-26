import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../Dashboard';
import { userService } from '../../../api/userService/userService';
import { messageService } from '../../../api/messageService/messageService';
import { useSocket } from '../../../context/SocketContext';
import { useAuth } from '../../../context/AuthContext';

// --- Mocks ---
vi.mock('../../../api/userService/userService', () => ({
  userService: {
    getUsers: vi.fn(),
    updateUser: vi.fn(),
  },
}));

vi.mock('../../../api/messageService/messageService', () => ({
  messageService: {
    getRecentConversations: vi.fn(),
    getConversation: vi.fn(),
    markAsRead: vi.fn(),
  },
}));

// Replace your existing SocketContext & AuthContext mocks with this:
vi.mock('../../../context/SocketContext', () => ({
  useSocket: vi.fn(),
}));

vi.mock('../../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock child components to isolate Dashboard unit logic
vi.mock('../../../components/UserList/UserList', () => ({
  default: ({ users, onSelectUser }: any) => (
    <div data-testid="user-list">
      {users.map((user: any) => (
        <button key={user.id} onClick={() => onSelectUser(user)}>
          {user.username}
        </button>
      ))}
    </div>
  ),
}));

vi.mock('../../../components/ChatArea/ChatArea', () => ({
  default: ({ selectedUser, onSendMessage, inputMessage, onInputChange }: any) => (
    <div data-testid="chat-area">
      {selectedUser ? (
        <>
          <span>Chatting with {selectedUser.username}</span>
          <form onSubmit={onSendMessage}>
            <input
              aria-label="chat-input"
              value={inputMessage}
              onChange={(e) => onInputChange(e.target.value)}
            />
            <button type="submit">Send</button>
          </form>
        </>
      ) : (
        <span>No user selected</span>
      )}
    </div>
  ),
}));

vi.mock('../../../components/Header.tsx/Header', () => ({
  default: ({ username, onLogout }: any) => (
    <header>
      <span>User: {username}</span>
      <button onClick={onLogout}>Logout</button>
    </header>
  ),
}));

vi.mock('../../../components/Footer/Footer', () => ({
  default: () => <footer>Footer</footer>,
}));

describe('Dashboard Component', () => {
  const mockCurrentUser = { id: 'user-1', username: 'alice', email: 'alice@test.com' };
  const mockOtherUser = { id: 'user-2', username: 'bob', email: 'bob@test.com' };

  let mockSocket: any;
  const mockLogoutUser = vi.fn();
  const mockDisconnectSocket = vi.fn();
  const mockFetchOnlineUsers = vi.fn();
  const mockUpdateStatus = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    mockSocket = {
      emit: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
    };

    (useSocket as any).mockReturnValue({
      socket: mockSocket,
      onlineUserIds: ['user-2'],
      presences: {},
      updateStatus: mockUpdateStatus,
      fetchOnlineUsers: mockFetchOnlineUsers,
      disconnectSocket: mockDisconnectSocket,
    });

    (useAuth as any).mockReturnValue({
      loginUser: vi.fn(),
      logoutUser: mockLogoutUser,
      user: mockCurrentUser,
      loading: false,
      isAuthenticated: true,
    });
  });

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

  it('redirects to /login if token or user is missing in localStorage', () => {
    renderComponent();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('loads directory and recent messages when authenticated', async () => {
    localStorage.setItem('token', 'fake-jwt');
    localStorage.setItem('user', JSON.stringify(mockCurrentUser));

    vi.mocked(userService.getUsers).mockResolvedValueOnce([mockOtherUser]);
    vi.mocked(messageService.getRecentConversations).mockResolvedValueOnce([]);

    renderComponent();

    await waitFor(() => {
      expect(userService.getUsers).toHaveBeenCalled();
      expect(messageService.getRecentConversations).toHaveBeenCalled();
      expect(screen.getByText('bob')).toBeInTheDocument();
    });
  });

  it('fetches chat history and marks messages as read when selecting a user', async () => {
    localStorage.setItem('token', 'fake-jwt');
    localStorage.setItem('user', JSON.stringify(mockCurrentUser));

    vi.mocked(userService.getUsers).mockResolvedValueOnce([mockOtherUser]);
    vi.mocked(messageService.getRecentConversations).mockResolvedValueOnce([]);
    vi.mocked(messageService.getConversation).mockResolvedValueOnce([]);
    vi.mocked(messageService.markAsRead).mockResolvedValueOnce({ success: true });

    renderComponent();

    const userButton = await screen.findByRole('button', { name: 'bob' });
    fireEvent.click(userButton);

    await waitFor(() => {
      expect(messageService.getConversation).toHaveBeenCalledWith('user-2');
      expect(messageService.markAsRead).toHaveBeenCalledWith('user-2');
      expect(mockSocket.emit).toHaveBeenCalledWith('mark_as_read', { senderId: 'user-2' });
      expect(screen.getByText('Chatting with bob')).toBeInTheDocument();
    });
  });

  it('emits send_message via socket when submitting message form', async () => {
    localStorage.setItem('token', 'fake-jwt');
    localStorage.setItem('user', JSON.stringify(mockCurrentUser));

    vi.mocked(userService.getUsers).mockResolvedValueOnce([mockOtherUser]);
    vi.mocked(messageService.getRecentConversations).mockResolvedValueOnce([]);

    renderComponent();

    const userButton = await screen.findByRole('button', { name: 'bob' });
    fireEvent.click(userButton);

    const input = screen.getByLabelText('chat-input');
    fireEvent.change(input, { target: { value: 'Hello Bob!' } });

    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);

    expect(mockSocket.emit).toHaveBeenCalledWith('send_message', {
      receiverId: 'user-2',
      content: 'Hello Bob!',
    });
  });

  it('cleans up socket listeners and navigates to /login on logout', async () => {
    localStorage.setItem('token', 'fake-jwt');
    localStorage.setItem('user', JSON.stringify(mockCurrentUser));

    vi.mocked(userService.getUsers).mockResolvedValueOnce([]);
    vi.mocked(messageService.getRecentConversations).mockResolvedValueOnce([]);

    renderComponent();

    const logoutButton = await screen.findByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);

    expect(mockDisconnectSocket).toHaveBeenCalled();
    expect(mockLogoutUser).toHaveBeenCalled();
    expect(localStorage.getItem('token')).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});