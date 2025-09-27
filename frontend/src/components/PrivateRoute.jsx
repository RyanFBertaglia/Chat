import { Navigate } from "react-router-dom";
import { useAuth } from "../services/useAuth";

export default function PrivateRoute({ children }) {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}
