import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Package, ShoppingCart, LogOut, Menu } from "lucide-react";
import { useState } from "react";

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { icon: ShoppingCart, label: "Orders", path: "/admin/orders" },
    { icon: Package, label: "Inventory", path: "/admin/inventory" },
    { icon: LayoutDashboard, label: "Add Product", path: "/admin/add" },
  ];

  return (
    <div className="flex min-h-screen bg-black">
      {/* SIDEBAR */}
      <div
        className={`fixed lg:static inset-y-0 left-0 w-64 bg-zinc-900 border-r border-zinc-800 transform transition-transform duration-300 z-50 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white font-display mb-2">Admin Panel</h2>
            <p className="text-zinc-400 text-sm">Welcome, {user?.name}</p>
          </div>

          <nav className="space-y-2 flex-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>

          <Button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="lg:hidden bg-zinc-900 border-b border-zinc-800 p-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white font-display">Admin</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white hover:bg-zinc-800 p-2 rounded"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 lg:p-8 overflow-auto">
          <Outlet />
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}
