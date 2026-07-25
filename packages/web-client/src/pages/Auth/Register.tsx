import React, { useState } from 'react';
import { Card, Form, Button, Alert, Container, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../api/authService/authService';

const Register = () => {
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await authService.register({ username, email, password });

            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 1500);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed.');
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
                            <h2 className="auth-header">Create Account</h2>
                            <p className="text-muted">Join Chat App today</p>
                        </div>

                        {error && <Alert variant="danger">{error}</Alert>}
                        {success && <Alert variant="success">Account created! Redirecting to login...</Alert>}

                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3" controlId="formBasicUsername">
                                <Form.Label>Username</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Johndoe"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </Form.Group>

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
                                {loading ? <Spinner animation="border" size="sm" /> : 'Create Account'}
                            </Button>
                        </Form>

                        <div className="text-center mt-3">
                            <span className="text-muted">Already have an account? </span>
                            <Link to="/login" className="text-decoration-none small fw-semibold">
                                Sign In
                            </Link>
                        </div>
                    </Card.Body>
                </Card>
            </div>
        </Container>
    );
};

export default Register;