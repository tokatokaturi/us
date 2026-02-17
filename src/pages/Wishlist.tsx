import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Trash2, ShoppingCart } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import API from "@/api";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export default function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchWishlist = async () => {
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("auth_token="))
          ?.split("=")[1];

        const response = await API.get("/wishlist", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setWishlistItems(response.data);
      } catch (error) {
        console.error("Failed to fetch wishlist:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [isAuthenticated, navigate]);

  const removeFromWishlist = async (productId: number) => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("auth_token="))
        ?.split("=")[1];

      await API.delete(`/wishlist/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setWishlistItems(wishlistItems.filter((item) => item.id !== productId));
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
    }
  };

  const addToCartAndRemove = (product: any) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });

    removeFromWishlist(product.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <main className="pt-14 md:pt-16 px-4 md:px-8 py-20 text-center">
          <p className="text-gray-400">Loading wishlist...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="pt-14 md:pt-16">
        {/* Title */}
        <div className="px-4 md:px-8 py-10 md:py-16 border-b border-neutral-700">
          <h1 className="text-3xl md:text-4xl font-bold">My Wishlist</h1>
          <p className="text-gray-400 mt-2">
            {wishlistItems.length} {wishlistItems.length === 1 ? "item" : "items"}
          </p>
        </div>

        {/* Content */}
        <div className="px-4 md:px-8 py-8 md:py-12">
          {wishlistItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistItems.map((product) => (
                <div
                  key={product.id}
                  className="bg-neutral-900 border border-neutral-700 rounded-lg overflow-hidden hover:border-neutral-500 transition group"
                >
                  {/* Product Image */}
                  <div className="relative aspect-square bg-neutral-800 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      className="absolute top-4 right-4 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
                      title="Remove from wishlist"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-white truncate">{product.name}</h3>
                    <p className="text-gray-400 text-sm mt-1">{product.category}</p>

                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <p className="text-lg font-bold">
                          ${product.price?.toFixed(2) || "0.00"}
                        </p>
                        {product.discount && (
                          <p className="text-sm text-green-400">
                            Save {product.discount}%
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => addToCartAndRemove(product)}
                        className="flex-1 bg-white text-black px-4 py-2 rounded font-semibold hover:bg-gray-200 transition flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Add to Cart
                      </button>
                      <button
                        onClick={() => navigate(`/product/${product.id}`)}
                        className="flex-1 border border-neutral-600 text-white px-4 py-2 rounded hover:border-neutral-400 transition"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4 opacity-50" />
              <p className="text-gray-400 text-lg mb-4">Your wishlist is empty</p>
              <button
                onClick={() => navigate("/products")}
                className="inline-block bg-white text-black px-6 py-3 rounded font-semibold hover:bg-gray-200 transition"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
