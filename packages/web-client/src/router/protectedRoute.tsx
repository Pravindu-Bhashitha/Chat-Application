import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading/Loading';

export const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  // Show a quick loader while checking localStorage on startup
  if (loading) {
    return (
    //   <div className="d-flex vh-100 justify-content-center align-items-center">
    //     <Spinner animation="border" variant="primary" />
    //   </div>
    <Loading fullScreen={true} message='Verifying Session ...'/>
    );
  }

  // Deny entry if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};