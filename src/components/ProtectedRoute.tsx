import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const { user, isLoading } = useAuth();
  console.log("USER STATE:", user)


  // ✅ WAIT until verify-token finishes
  if (isLoading) {
    return null; // or loading spinner
  }

  // ❌ Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ❌ Not admin but admin route
  if (adminOnly && !user.is_admin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
