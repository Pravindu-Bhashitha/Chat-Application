import { useState, useEffect } from 'react';
import { Container, Navbar, Card, ListGroup, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface User {
  id: string;
  username: string;
  email: string;
}

const Dashboard = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    // 1. Get stored auth state
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (!token || !savedUser) {
      navigate('/login');
      return;
    }

    setCurrentUser(JSON.parse(savedUser));

    // 2. Fetch all users from Auth Service
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:4001/api/auth/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(response.data);
      } catch (err: any) {
        setError('Failed to load user directory.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={{ backgroundColor: '#eef2f7', minHeight: '100vh' }}>
      {/* Top Navigation Bar */}
      <Navbar bg="white" className="shadow-sm px-4 justify-content-between mb-4">
        <Navbar.Brand className="fw-bold fs-4" style={{ color: '#0284c7' }}>
          💬 Chat App
        </Navbar.Brand>
        <div className="d-flex align-items-center gap-3">
          {currentUser && (
            <span className="text-muted">
              Logged in as <strong style={{ color: '#0284c7' }}>{currentUser.username}</strong>
            </span>
          )}
          <Button variant="outline-danger" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </Navbar>

      {/* Main Dashboard Content */}
      <Container style={{ maxWidth: '800px' }}>
        <Card className="auth-card p-3 mb-4">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h4 className="fw-bold mb-1" style={{ color: '#0284c7' }}>
                  User Directory
                </h4>
                <p className="text-muted small mb-0">
                  Registered users ready to connect
                </p>
              </div>
              <Badge bg="info" className="fs-6 px-3 py-2 text-wrap">
                {users.length} Users
              </Badge>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="text-muted mt-2">Fetching users...</p>
              </div>
            ) : (
              <ListGroup variant="flush" className="border rounded-3 overflow-hidden">
                {users.map((user) => (
                  <ListGroup.Item
                    key={user.id}
                    className="d-flex justify-content-between align-items-center py-3 px-4"
                  >
                    <div>
                      <div className="fw-bold text-dark">{user.username}</div>
                      <div className="text-muted small">{user.email}</div>
                    </div>
                    {currentUser?.id === user.id && (
                      <Badge bg="success" pill>
                        You
                      </Badge>
                    )}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default Dashboard;