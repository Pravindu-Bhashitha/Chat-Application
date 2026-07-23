import { Navigate, Outlet } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  // Show a quick loader while checking localStorage on startup
  if (loading) {
    return (
      <div className="d-flex vh-100 justify-content-center align-items-center">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  // Deny entry if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};