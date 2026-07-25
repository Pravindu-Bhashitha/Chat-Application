import { Navbar, Button, Form } from 'react-bootstrap';
import { StatusType, useSocket } from '../../context/SocketContext';
import { getStatusColor } from '../../utils/statusColor';

interface HeaderProps {
  username?: string;
  onLogout: () => void;
}

const Header = ( { username, onLogout }: HeaderProps ) => {
  const { updateStatus, presences, socket } = useSocket();

  const savedUser = localStorage.getItem('user');
  const currentUserId = savedUser ? JSON.parse(savedUser).id : null;

  const currentStatus: StatusType = (currentUserId && presences[currentUserId]?.status) || 'Available';

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as StatusType;
    updateStatus(newStatus);
  };
  return (
    <Navbar bg="white" className="shadow-sm px-4 justify-content-between mb-4">
      <Navbar.Brand className="fw-bold fs-4" style={{ color: '#0284c7' }}>
        💬 Chat App
      </Navbar.Brand>
      <div className="d-flex align-items-center gap-3">
        <div className="d-flex align-items-center gap-2 bg-light px-3 py-1 rounded-pill border">
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: getStatusColor(currentStatus),
              display: 'inline-block',
            }}
          />
          <Form.Select
            size="sm"
            value={currentStatus}
            onChange={handleStatusChange}
            disabled={!socket?.connected}
            className="border-0 bg-transparent shadow-none fw-semibold p-0 pe-4"
            style={{ cursor: 'pointer', fontSize: '0.85rem' }}
          >
            <option value="Available">Available</option>
            <option value="Away">Away</option>
            <option value="Busy">Busy</option>
          </Form.Select>
        </div>
        {username && (
          <span className="text-muted">
            Logged in as <strong style={{ color: '#0284c7' }}>{username}</strong>
          </span>
        )}
        <Button variant="outline-danger" size="sm" onClick={onLogout}>
          Logout
        </Button>
      </div>
    </Navbar>
  );
};

export default Header;