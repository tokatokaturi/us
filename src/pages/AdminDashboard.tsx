import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";

export default function AdminDashboard() {
  const { user } = useAuth();

  // Block non-admins
  if (!user?.is_admin) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="mt-4 text-zinc-400">
        You are logged in as admin.
      </p>
    </div>
  );
}
