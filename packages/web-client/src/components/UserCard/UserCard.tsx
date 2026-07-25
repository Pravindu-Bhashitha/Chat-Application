import { ListGroup, Badge } from 'react-bootstrap';
import { formatTimestamp } from '../../utils/timeFormatStamp';
import { getStatusBadge } from '../../utils/statusBadge';
import { getStatusColor } from '../../utils/statusColor';
import { StatusType } from '../../context/SocketContext';

interface UserCardProps {
  username: string;
  email: string;
  isCurrentUser: boolean;
  isOnline: boolean;
  onSelect?: () => void;
  lastMessage?: string;
  timestamp?: string;
  status?: StatusType;
  unreadCount?: number;
}

const UserCard = ({ username, isCurrentUser, isOnline, onSelect, lastMessage, timestamp, status, unreadCount }: UserCardProps) => {
  if (!unreadCount) unreadCount = 0;
  const hasUnread = unreadCount > 0 || false;
  return (
    <ListGroup.Item
      action
      onClick={onSelect}
      className="py-2 px-3 border-0"
      style={{ overflow: 'hidden' }}
    >
      <div className="d-flex align-items-center gap-2" style={{ minWidth: 0 }}>
        {/* Status Dot */}
        <span
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: getStatusColor(status),
            flexShrink: 0,
          }}
          title={isOnline ? 'Online' : 'Offline'}
        />

        {/* Content Area */}
        <div className="flex-grow-1" style={{ minWidth: 0 }}>
          {/* Top Row: Username + Status Badges + Timestamp */}
          <div className="d-flex align-items-center justify-content-between gap-1 mb-1">
            <div className="d-flex align-items-center gap-1 text-truncate" style={{ minWidth: 0 }}>
              <span className={`text-truncate ${hasUnread ? 'fw-bold text-dark' : 'fw-semibold text-dark'}`}>
                {username}
              </span>
              {getStatusBadge(status)}
              {isCurrentUser && (
                <Badge bg="secondary" style={{ fontSize: '0.6rem' }}>
                  You
                </Badge>
              )}
            </div>

            {timestamp && (
              <small
                className={`flex-shrink-0 ${hasUnread ? 'fw-bold text-primary' : 'text-muted'}`}
                style={{ fontSize: '0.75rem' }}
              >
                {formatTimestamp(timestamp)}
              </small>
            )}
          </div>

          {/* Bottom Row: Message Preview + Unread Counter / Online Badge */}
          <div className="d-flex align-items-center justify-content-between gap-2" style={{ minWidth: 0 }}>
            <small
              className={`text-truncate flex-grow-1 ${
                hasUnread ? 'fw-bold text-dark' : 'text-muted'
              }`}
              style={{ minWidth: 0 }}
            >
              {lastMessage || 'No messages yet'}
            </small>

            <div className="d-flex align-items-center gap-1 flex-shrink-0">
              {hasUnread ? (
                <Badge bg="danger" pill style={{ fontSize: '0.65rem' }}>
                  {unreadCount}
                </Badge>
              ) : (
                <Badge
                  bg={isOnline ? 'success' : 'light'}
                  text={isOnline ? 'white' : 'dark'}
                  pill
                  style={{ fontSize: '0.65rem' }}
                >
                  {isOnline ? 'Online' : 'Offline'}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </ListGroup.Item>
  );
};

export default UserCard;