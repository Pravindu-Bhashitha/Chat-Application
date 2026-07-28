import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

interface ErrorPageProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorPage: React.FC<ErrorPageProps> = ({
  title = 'Something Went Wrong',
  message = 'An unexpected error occurred while loading this page.',
  onRetry,
}) => {
  const navigate = useNavigate();

  return (
    <Container className="d-flex flex-column vh-100 justify-content-center align-items-center text-center">
      <div className="p-5 bg-white rounded shadow-sm border" style={{ maxWidth: '480px' }}>
        <div className="mb-3 text-danger fs-1">⚠️</div>
        <h3 className="fw-bold mb-2">{title}</h3>
        <p className="text-muted mb-4">{message}</p>
        <div className="d-flex justify-content-center gap-2">
          {onRetry ? (
            <Button variant="primary" onClick={onRetry}>
              Try Again
            </Button>
          ) : (
            <Button variant="primary" onClick={() => navigate('/')}>
              Back to Home
            </Button>
          )}
        </div>
      </div>
    </Container>
  );
};

export default ErrorPage;