import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import { Package, ArrowLeft, ChevronDown } from "lucide-react";
import { toast } from "sonner";

interface Order {
  id: number;
  total: number;
  status: string;
  item_count: number;
  created_at: string;
}

interface OrderDetail {
  id: number;
  status: string;
  total: number;
  shipping_address: string;
  items: any[];
  created_at: string;
  updated_at: string;
}

export default function OrderHistory() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [orderDetails, setOrderDetails] = useState<{ [key: number]: OrderDetail }>({});
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = process.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      toast.error("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId: number) => {
    if (orderDetails[orderId]) {
      setExpandedOrder(expandedOrder === orderId ? null : orderId);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/order/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrderDetails({ ...orderDetails, [orderId]: data });
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
      }
    } catch (error) {
      toast.error("Failed to load order details");
    }
  };

  const getStatusColor = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: "text-yellow-500",
      processing: "text-blue-500",
      shipped: "text-purple-500",
      delivered: "text-green-500",
      cancelled: "text-red-500",
    };
    return statusMap[status] || "text-zinc-400";
  };

  const getStatusBg = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: "bg-yellow-950",
      processing: "bg-blue-950",
      shipped: "bg-purple-950",
      delivered: "bg-green-950",
      cancelled: "bg-red-950",
    };
    return statusMap[status] || "bg-zinc-800";
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/")}
            className="text-zinc-400 hover:text-white transition"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-4xl font-bold text-white font-display">Order History</h1>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-zinc-400">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800 p-12 text-center">
            <Package className="h-16 w-16 mx-auto text-zinc-600 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">No orders yet</h2>
            <p className="text-zinc-400 mb-8">Start shopping to place your first order!</p>
            <Button
              onClick={() => navigate("/products")}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Continue Shopping
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="bg-zinc-900 border-zinc-800">
                <button
                  onClick={() => fetchOrderDetails(order.id)}
                  className="w-full p-6 text-left hover:bg-zinc-800/50 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-white font-semibold">Order #{order.id}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBg(
                            order.status
                          )} ${getStatusColor(order.status)}`}
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-zinc-400 text-sm mb-1">
                        {new Date(order.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-zinc-400 text-sm">{order.item_count} item(s)</p>
                    </div>
                    <div className="text-right">
                      <p className="text-amber-600 font-bold text-lg">₹{order.total.toFixed(2)}</p>
                      <ChevronDown
                        className={`h-5 w-5 text-zinc-400 transition ml-auto mt-2 ${
                          expandedOrder === order.id ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </div>
                </button>

                {expandedOrder === order.id && orderDetails[order.id] && (
                  <div className="border-t border-zinc-800 p-6 bg-zinc-800/30">
                    <h4 className="text-white font-semibold mb-4">Order Details</h4>

                    <div className="space-y-4 mb-6">
                      {orderDetails[order.id].items.map((item: any, index: number) => (
                        <div key={index} className="flex gap-4">
                          <img
                            src={item.image}
                            alt={item.product_name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="text-white font-semibold">{item.product_name}</p>
                            {item.color && (
                              <p className="text-zinc-400 text-sm">Color: {item.color}</p>
                            )}
                            {item.size && <p className="text-zinc-400 text-sm">Size: {item.size}</p>}
                            <p className="text-zinc-400 text-sm">
                              Qty: {item.quantity} × ₹{item.price.toFixed(2)}
                            </p>
                          </div>
                          <p className="text-amber-600 font-semibold">
                            ₹{(item.quantity * item.price).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-zinc-700 pt-4 mb-4">
                      <p className="text-zinc-400 text-sm mb-2">
                        <strong>Shipping Address:</strong>
                      </p>
                      <p className="text-zinc-300 text-sm">{orderDetails[order.id].shipping_address}</p>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={() => navigate("/products")}
                        className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                      >
                        Shop More
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
                      >
                        Track Order
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
