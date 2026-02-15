import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Heart, ShoppingBag, Menu, X, User, LogOut, Settings } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import SearchOverlay from "./SearchOverlay";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { label: "PRODUCTS", href: "/products" },
  { label: "WOMEN", href: "/collection/women" },
  { label: "MEN", href: "/collection/men" },
  { label: "KIDS", href: "/collection/kids" },
  { label: "STUDIO", href: "/collection/studio" },
  { label: "NEW IN", href: "/collection/new-in" },
];

const Header = () => {
  const { totalItems, toggleCart, wishlist } = useCart();
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 md:px-8 h-14 md:h-16">
          {/* Left: Menu + Nav */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-xs tracking-editorial font-body underline-animate"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Center: Logo */}
          <Link to="/" className="absolute left-1/2 -translate-x-1/2">
            <h1 className="font-display text-xl md:text-2xl font-semibold tracking-wide">
              ATELIER
            </h1>
          </Link>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSearchOpen(true)}
              className="transition-luxury hover:opacity-60"
              aria-label="Search"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="hidden md:flex items-center gap-2 transition-luxury hover:opacity-60"
                    aria-label="Account menu"
                  >
                    <User className="h-[18px] w-[18px]" />
                    <span className="text-xs">{user?.name?.split(" ")[0]}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-zinc-900 border-zinc-800">
                  <DropdownMenuItem className="text-zinc-300 cursor-pointer">
                    {user?.email}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-zinc-800" />
                  <DropdownMenuItem
                    className="text-zinc-300 cursor-pointer"
                    onClick={() => navigate("/orders")}
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    My Orders
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem
                      className="text-amber-600 cursor-pointer"
                      onClick={() => navigate("/admin")}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-zinc-800" />
                  <DropdownMenuItem
                    className="text-red-500 cursor-pointer"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden md:block text-xs transition-luxury hover:opacity-60"
                >
                  LOG IN
                </Link>
                <Link
                  to="/signup"
                  className="hidden md:block text-xs bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 transition"
                >
                  SIGN UP
                </Link>
              </>
            )}


            <Link
              to="/wishlist"
              className="relative transition-luxury hover:opacity-60"
              aria-label="Wishlist"
            >
              <Heart className="h-[18px] w-[18px]" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-4 w-4 flex items-center justify-center bg-foreground text-background text-[9px] font-body">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <Link
              to="/cart"
              className="relative transition-luxury hover:opacity-60"
              aria-label="Shopping bag"
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-4 w-4 flex items-center justify-center bg-amber-600 text-white text-[9px] font-body">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="md:hidden overflow-hidden border-t border-border"
            >
              <nav className="flex flex-col py-6 px-4 gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.href}
                    className="text-sm tracking-editorial font-body py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  to="/login"
                  className="text-sm tracking-editorial font-body py-2 border-t border-border pt-4 mt-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  LOG IN
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Header;
