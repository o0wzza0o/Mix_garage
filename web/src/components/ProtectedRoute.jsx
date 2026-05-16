import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, profile, loading } = useAuthStore();
  const loc = useLocation();
  if (loading) return <div className="p-10 text-center text-slate-500">Loading…</div>;
  if (!user) return <Navigate to={`/auth?redirect=${encodeURIComponent(loc.pathname)}`} replace />;
  if (requireAdmin && profile?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}
