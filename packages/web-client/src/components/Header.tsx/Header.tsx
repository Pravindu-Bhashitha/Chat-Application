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
      <Navbar
        className="px-4 py-2 justify-content-between border-bottom shadow-sm"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12px)',
          zIndex: 10,
        }}
      >
        {/* Brand Logo */}
        <Navbar.Brand className="d-flex align-items-center gap-2 fw-bold fs-4 m-0">
          <div
            className="d-flex align-items-center justify-content-center rounded-3 text-white shadow-sm"
            style={{
              width: 36,
              height: 36,
              background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
            }}
          >
            💬
          </div>
          <span
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #1e40af 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Chat App
          </span>
        </Navbar.Brand>

        {/* Right Controls */}
        <div className="d-flex align-items-center gap-3">
          {/* Status Dropdown Badge */}
          <div
            className="d-flex align-items-center gap-2 px-3 py-1 rounded-pill border bg-white shadow-sm"
            style={{ transition: 'all 0.2s ease' }}
          >
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: '50%',
                backgroundColor: getStatusColor(currentStatus),
                boxShadow: `0 0 6px ${getStatusColor(currentStatus)}`,
              }}
            />
            <Form.Select
              size="sm"
              value={currentStatus}
              onChange={handleStatusChange}
              disabled={!socket?.connected}
              className="border-0 bg-transparent shadow-none fw-semibold p-0 pe-4 text-secondary"
              style={{ cursor: 'pointer', fontSize: '0.85rem' }}
            >
              <option value="Available">Available</option>
              <option value="Away">Away</option>
              <option value="Busy">Busy</option>
            </Form.Select>
          </div>

          {/* User Profile Pill */}
          {username && (
            <div
              className="d-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-light border cursor-pointer hover-shadow"
              style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
              onClick={() => setShowModal(true)}
            >
              <div
                className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold"
                style={{
                  width: 26,
                  height: 26,
                  backgroundColor: '#0284c7',
                  fontSize: '0.75rem',
                }}
              >
                {username.charAt(0).toUpperCase()}
              </div>
              <span className="small text-secondary fw-medium me-1">
                {username}
              </span>
            </div>
          )}

          {/* Logout Button */}
          <Button
            variant="light"
            size="sm"
            onClick={onLogout}
            className="rounded-pill px-3 border text-danger fw-semibold shadow-none"
            style={{ fontSize: '0.825rem' }}
          >
            Logout
          </Button>
        </div>
      </Navbar>

      {/* Edit Profile Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        contentClassName="rounded-4 border-0 shadow-lg"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fs-5 fw-bold text-dark">
            Edit Profile
          </Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleSaveProfile}>
          <Modal.Body className="py-3">
            {errorMsg && (
              <div className="alert alert-danger py-2 rounded-3 small border-0 mb-3">
                {errorMsg}
              </div>
            )}

            <Form.Group className="mb-3" controlId="formUsername">
              <Form.Label className="fw-medium text-secondary small">
                Username
              </Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="rounded-3 shadow-none border-light-subtle py-2"
                required
              />
            </Form.Group>

            <Form.Group className="mb-2" controlId="formEmail">
              <Form.Label className="fw-medium text-secondary small">
                Email Address
              </Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="rounded-3 shadow-none border-light-subtle py-2"
                required
              />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer className="border-0 pt-0">
            <Button
              variant="light"
              size="sm"
              className="rounded-pill px-3 text-secondary fw-semibold"
              onClick={() => setShowModal(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              className="rounded-pill px-4 fw-semibold border-0"
              disabled={isLoading}
              style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
              }}
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