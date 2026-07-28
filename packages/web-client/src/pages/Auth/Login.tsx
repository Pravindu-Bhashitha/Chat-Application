import React, { useState } from 'react';
import { Card, Form, Button, Alert, Container, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../api/authService/authService';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const { loginUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { token, user } = await authService.login({ email, password });
      loginUser(token, user);
      navigate('/');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <div style={{ maxWidth: '420px', width: '100%' }}>
        <Card className="auth-card p-4">
          <Card.Body>
            <div className="text-center mb-4">
              <h2 className="auth-header">Welcome Back</h2>
              <p className="text-muted">Sign in to continue to Chat App</p>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4" controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <Button
                    variant="link"
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    tabIndex={-1}
                    className="position-absolute top-50 end-0 translate-middle-y text-muted text-decoration-none shadow-none p-0 me-3"
                    style={{ zIndex: 5 }}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </Button>
                </div>
              </Form.Group>

              <Button
                type="submit"
                className="btn-primary-custom w-100 mb-3"
                disabled={loading}
              >
                {loading ? <Spinner animation="border" size="sm" /> : 'Sign In'}
              </Button>
            </Form>

            <div className="text-center mt-3">
              <span className="text-muted">Don't have an account? </span>
              <Link to="/register" className="text-decoration-none small fw-semibold">
                Register
              </Link>
            </div>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default Login;