import { Navigate, Outlet } from 'react-router-dom';
import { getToken } from '../utils/auth';

// Pages inside this route need a logged-in user.
function ProtectedRoute() {
  return getToken() ? <Outlet /> : <Navigate to="/" replace />;
}

export default ProtectedRoute;
