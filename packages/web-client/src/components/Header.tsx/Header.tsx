import { Navbar, Button, Form, Modal } from 'react-bootstrap';
import { StatusType, useSocket } from '../../context/SocketContext';
import { getStatusColor } from '../../utils/statusColor';
import { useEffect, useState } from 'react';
import { User } from '../../types';

interface HeaderProps {
  username?: string;
  email?: string;
  onLogout: () => void;
  onUpdateUser?: (userData: Partial<User>) => Promise<User>;
}

const Header = ({ username, email, onLogout, onUpdateUser }: HeaderProps) => {
  const { updateStatus, presences, socket } = useSocket();

  const savedUser = localStorage.getItem('user');
  const currentUserId = savedUser ? JSON.parse(savedUser).id : null;


  const currentStatus: StatusType = (currentUserId && presences[currentUserId]?.status) || 'Available';

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    username: username || '',
    email: email || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (username && email) {
      setFormData({ username, email });
    }
  }, [username, email]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as StatusType;
    updateStatus(newStatus);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId || !onUpdateUser) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const updatedUser = await onUpdateUser({
        username: formData.username,
        email: formData.email,
      });

      // Update local storage so the session keeps updated info
      const existingData = savedUser ? JSON.parse(savedUser) : {};
      localStorage.setItem('user', JSON.stringify({ ...existingData, ...updatedUser }));

      setFormData({
        username: updatedUser.username,
        email: updatedUser.email,
      });

      setShowModal(false);
    } catch (err: any) {
      // Handles 400 validation error (e.g., Username/Email taken) from API
      setErrorMsg(
        err.response?.data?.message || 'Failed to update profile. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
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
              Logged in as{" "}
              <strong
                style={{
                  color: "#0284c7",
                  cursor: "pointer",
                }}
                onClick={() => setShowModal(true)}
              >
                {username}
              </strong>
            </span>
          )}
          <Button variant="outline-danger" size="sm" onClick={onLogout}>
            Logout
          </Button>
        </div>
      </Navbar>
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-5 fw-bold">Edit Profile</Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleSaveProfile}>
          <Modal.Body>
            {errorMsg && (
              <div className="alert alert-danger py-2 small" role="alert">
                {errorMsg}
              </div>
            )}

            <Form.Group className="mb-3" controlId="formUsername">
              <Form.Label className="fw-semibold small">Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label className="fw-semibold small">Email Address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowModal(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={isLoading}
              style={{ backgroundColor: '#0284c7', borderColor: '#0284c7' }}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default Header;