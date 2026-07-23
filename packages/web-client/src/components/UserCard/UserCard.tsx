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
}

const UserCard = ({ username, isCurrentUser, isOnline, onSelect, lastMessage, timestamp, status }: UserCardProps) => {
  return (
    <ListGroup.Item action onClick={onSelect} className="d-flex justify-content-between align-items-center py-3 px-4">
      <div className="d-flex align-items-center gap-3">
        <span
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: getStatusColor(status),
            display: 'inline-block',
          }}
          title={isOnline ? 'Online' : 'Offline'}
        />
        <div>
          <div className="fw-bold text-dark d-flex align-items-center gap-2">
            {username}{getStatusBadge(status)}
            {isCurrentUser && <Badge bg="secondary" style={{ fontSize: '0.65rem' }}>You</Badge>}
          </div>
          <small
            className="text-muted d-block text-truncate"
            style={{ maxWidth: "220px" }}
          >
            {lastMessage || "No messages yet"}
          </small>
        </div>
      </div>

      {/* <Badge bg={isOnline ? 'success' : 'light'} text={isOnline ? 'white' : 'dark'} pill>
        {isOnline ? 'Online' : 'Offline'}
      </Badge> */}
      <div className="text-end">
        {timestamp && (
          <small className="text-muted d-block">
           {formatTimestamp(timestamp)}
          </small>
        )}

        <Badge
          bg={isOnline ? "success" : "light"}
          text={isOnline ? "white" : "dark"}
          pill
        >
          {isOnline ? "Online" : "Offline"}
        </Badge>
      </div>
    </ListGroup.Item>
  );
};

export default UserCard;