import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function ProtectedRoute({ role, children }) {
  const { session, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-white">
        <div className="text-brand-900 font-display text-2xl tracking-wide uppercase">Loading</div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && profile?.role && profile.role !== role) {
    return <Navigate to={profile.role === "trainer" ? "/trainer" : "/client"} replace />;
  }

  return children;
}
