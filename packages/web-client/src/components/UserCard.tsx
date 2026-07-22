import { ListGroup, Badge } from 'react-bootstrap';

interface UserCardProps {
  username: string;
  email: string;
  isCurrentUser: boolean;
}

const UserCard = ({ username, email, isCurrentUser }: UserCardProps) => {
  return (
    <ListGroup.Item className="d-flex justify-content-between align-items-center py-3 px-4">
      <div>
        <div className="fw-bold text-dark">{username}</div>
        <div className="text-muted small">{email}</div>
      </div>
      {isCurrentUser && (
        <Badge bg="success" pill>
          You
        </Badge>
      )}
    </ListGroup.Item>
  );
};

export default UserCard;