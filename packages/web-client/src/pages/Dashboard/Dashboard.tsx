import { useState, useEffect } from 'react';
import { Container, Card, ListGroup, Badge, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header.tsx/Header';
import UserCard from '../../components/UserCard';
import Footer from '../../components/Footer/Footer';
import { authService } from '../../api/authService/authService';

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
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (!token || !savedUser) {
      navigate('/login');
      return;
    }

    setCurrentUser(JSON.parse(savedUser));

    const fetchUsers = async () => {
      try {
        const data = await authService.getUsers();
        setUsers(data);
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
    <div className="d-flex flex-column" style={{ backgroundColor: '#eef2f7', minHeight: '100vh' }}>
      <Header username={currentUser?.username} onLogout={handleLogout} />
      <Container style={{ maxWidth: '800px' }} className="my-auto">
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
                  <UserCard
                    key={user.id}
                    username={user.username}
                    email={user.email}
                    isCurrentUser={currentUser?.id === user.id}
                  />
                ))}
              </ListGroup>
            )}
          </Card.Body>
        </Card>
      </Container>
      <Footer />
    </div>
  );
};

export default Dashboard;