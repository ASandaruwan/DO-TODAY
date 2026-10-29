import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-page-light dark:bg-page-dark flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-[18px] bg-logo-gradient flex items-center justify-center shadow-logo-glow animate-pulse">
          <span className="text-white font-outfit font-bold text-2xl tracking-tight">DO</span>
        </div>
        <p className="mt-4 text-content-muted font-medium text-sm animate-pulse">Loading DO-TODAY...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
