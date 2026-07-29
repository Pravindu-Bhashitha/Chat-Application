import { Alert } from 'react-bootstrap';
import { Message, User } from '../../types';
import UserCard from '../UserCard/UserCard';
import Loading from '../Loading/Loading';
import { StatusType } from '../../context/SocketContext';

interface UserListProps {
  users: User[];
  currentUserId?: string;
  selectedUserId?: string;
  onlineUserIds: string[];
  loading: boolean;
  error: string;
  onSelectUser: (user: User) => void;
  lastMessages?: Record<string, Message>;
  presences: Record<string, { status: StatusType; customNote?: string }>;
  unreadCounts: Record<string, number>;
}

const UserList = ({
  users,
  currentUserId,
  selectedUserId,
  onlineUserIds,
  loading,
  error,
  onSelectUser,
  lastMessages = {},
  presences,
  unreadCounts,
}: UserListProps) => {
  if (loading) {
    return <Loading fullScreen={false} />;
  }

  if (error) {
    return (
      <div className="p-3">
        <Alert variant="danger">{error}</Alert>
      </div>
    );
  }

  const otherUsers = users.filter((u) => u.id !== currentUserId);

  return (
    <div className="d-flex flex-column h-100 overflow-hidden bg-white">
      {/* Sidebar Header */}
      <div className="p-3 border-bottom d-flex align-items-center justify-content-between bg-white">
        <span className="fw-bold text-dark fs-6">Messages</span>
        <span className="badge rounded-pill bg-light text-secondary border px-2 py-1 fw-semibold">
          {otherUsers.length} user{otherUsers.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Contacts List */}
      <div className="flex-grow-1 overflow-auto py-2 custom-scrollbar">
        {otherUsers.length === 0 ? (
          <div className="text-center text-muted p-4 small">
            No contacts available yet.
          </div>
        ) : (
          [...otherUsers]
            .sort((a, b) => {
              const aOnline = onlineUserIds.includes(a.id);
              const bOnline = onlineUserIds.includes(b.id);

              if (aOnline && !bOnline) return -1;
              if (!aOnline && bOnline) return 1;
              return a.username.localeCompare(b.username);
            })
            .map((user) => {
              const isOnline = onlineUserIds.includes(user.id);
              const isSelected = selectedUserId === user.id;
              const lastMsg = lastMessages[user.id];
              const status = presences[user.id]?.status || 'Offline';
              const unreadCount = unreadCounts[user.id] || 0;

              return (
                <div
                  key={user.id}
                  className="mx-2 mb-1 rounded-3 transition-all"
                  style={{
                    backgroundColor: isSelected
                      ? '#f0f9ff'
                      : 'transparent',
                    borderLeft: isSelected
                      ? '4px solid #0284c7'
                      : '4px solid transparent',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease, border-color 0.2s ease',
                  }}
                >
                  <UserCard
                    username={user.username}
                    email={user.email}
                    isCurrentUser={false}
                    isOnline={isOnline}
                    lastMessage={lastMsg?.content}
                    timestamp={lastMsg?.timestamp}
                    onSelect={() => onSelectUser(user)}
                    status={status}
                    unreadCount={unreadCount}
                  />
                </div>
              );
            })
        )}
      </div>
    </div>
  );
};

export default UserList;