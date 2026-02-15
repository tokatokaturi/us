import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import { Trash2, ShoppingCart, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface CartItem {
  id: number;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  color: string;
  size: string;
  image: string;
  item_total: number;
}

export default function Cart() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
  if (token) {
    fetchCart();
  } else {
    setIsLoading(false);
  }
}, [token]);


  const fetchCart = async () => {
  if (!token) return;

  try {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      setItems(data.items || []);
      setTotal(data.total || 0);
    } else {
      console.error("Cart fetch failed:", response.status);
    }
  } catch (error) {
    console.error("Failed to fetch cart:", error);
  } finally {
    setIsLoading(false);
  }
};

  const removeItem = async (cartId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/${cartId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success("Item removed from cart");
        fetchCart();
      }
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const updateQuantity = async (cartId: number, quantity: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/${cartId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity }),
      });

      if (response.ok) {
        fetchCart();
      }
    } catch (error) {
      toast.error("Failed to update quantity");
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/products")}
            className="text-zinc-400 hover:text-white transition"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-4xl font-bold text-white font-display">Shopping Cart</h1>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-zinc-400">Loading cart...</p>
          </div>
        ) : items.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800 p-12 text-center">
            <ShoppingCart className="h-16 w-16 mx-auto text-zinc-600 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Your cart is empty</h2>
            <p className="text-zinc-400 mb-8">Add some items to get started!</p>
            <Button
              onClick={() => navigate("/products")}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Continue Shopping
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.id} className="bg-zinc-900 border-zinc-800 p-6">
                  <div className="flex gap-6">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">{item.name}</h3>
                      {item.color && <p className="text-zinc-400 text-sm">Color: {item.color}</p>}
                      {item.size && <p className="text-zinc-400 text-sm">Size: {item.size}</p>}
                      <p className="text-amber-600 font-semibold mt-2">₹{item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                      <div className="flex items-center gap-2 bg-zinc-800 rounded">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-1 text-zinc-400 hover:text-white"
                          disabled={item.quantity <= 1}
                        >
                          −
                        </button>
                        <span className="px-3 text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-1 text-zinc-400 hover:text-white"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="lg:col-span-1">
              <Card className="bg-zinc-900 border-zinc-800 p-6 sticky top-20">
                <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>
                
                <div className="space-y-3 mb-6 pb-6 border-b border-zinc-700">
                  <div className="flex justify-between text-zinc-400">
                    <span>Subtotal</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Tax</span>
                    <span>Calculated at checkout</span>
                  </div>
                </div>

                <div className="flex justify-between text-white font-bold text-lg mb-6">
                  <span>Total</span>
                  <span className="text-amber-600">₹{total.toFixed(2)}</span>
                </div>

                <Button
                  onClick={() => navigate("/checkout")}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white h-11 font-semibold"
                >
                  Proceed to Checkout
                </Button>

                <Button
                  onClick={() => navigate("/products")}
                  variant="outline"
                  className="w-full mt-3 bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
                >
                  Continue Shopping
                </Button>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
