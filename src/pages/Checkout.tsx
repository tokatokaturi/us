import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import { Loader, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface CheckoutForm {
  email: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  coupon_code: string;
}

export default function Checkout() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [form, setForm] = useState<CheckoutForm>({
    email: user?.email || "",
    name: user?.name || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipcode: "",
    coupon_code: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [cartTotal, setCartTotal] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);

  const API_BASE_URL = process.env.VITE_API_URL || "http://localhost:5000";

  // Load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const validateCoupon = async () => {
    if (!form.coupon_code) return;

    try {
      const response = await fetch(`${API_BASE_URL}/validate-coupon`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: form.coupon_code }),
      });

      if (response.ok) {
        const coupon = await response.json();
        let discount = 0;
        if (coupon.discount_type === "percentage") {
          discount = (cartTotal * coupon.discount_value) / 100;
        } else {
          discount = coupon.discount_value;
        }
        const newTotal = Math.max(0, cartTotal - discount);
        setFinalTotal(newTotal);
        toast.success("Coupon applied successfully!");
      } else {
        toast.error("Invalid coupon code");
      }
    } catch (error) {
      toast.error("Failed to validate coupon");
    }
  };

  const handlePayment = async (e: any) => {
    e.preventDefault();

    if (!form.address || !form.city || !form.state || !form.zipcode) {
      toast.error("Please fill in all address fields");
      return;
    }

    setIsLoading(true);

    try {
      // Create Razorpay order
      const orderResponse = await fetch(`${API_BASE_URL}/razorpay-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shipping_address: `${form.address}, ${form.city}, ${form.state} ${form.zipcode}`,
          coupon_code: form.coupon_code,
        }),
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to create order");
      }

      const orderData = await orderResponse.json();

      // Load Razorpay
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load Razorpay");
      }

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || "",
        amount: Math.round(finalTotal * 100),
        currency: "INR",
        name: "ECommerce Store",
        description: "Purchase Order",
        order_id: orderData.razorpay_order_id,
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyResponse = await fetch(`${API_BASE_URL}/verify-payment`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                order_id: orderData.order_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (verifyResponse.ok) {
              toast.success("Payment successful!");
              navigate(`/order-confirmation/${orderData.order_id}`);
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (error) {
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },
        theme: {
          color: "#b45309",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      toast.error(error.message || "Payment failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/cart")}
            className="text-zinc-400 hover:text-white transition"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-4xl font-bold text-white font-display">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="bg-zinc-900 border-zinc-800 p-8">
              <form onSubmit={handlePayment} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Delivery Information</h2>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-sm text-zinc-300 block mb-2">Full Name</label>
                      <Input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="bg-zinc-800 border-zinc-700 text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm text-zinc-300 block mb-2">Email</label>
                      <Input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="bg-zinc-800 border-zinc-700 text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="text-sm text-zinc-300 block mb-2">Phone Number</label>
                    <Input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="bg-zinc-800 border-zinc-700 text-white"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="text-sm text-zinc-300 block mb-2">Street Address</label>
                    <Input
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      className="bg-zinc-800 border-zinc-700 text-white"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-zinc-300 block mb-2">City</label>
                      <Input
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        className="bg-zinc-800 border-zinc-700 text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm text-zinc-300 block mb-2">State</label>
                      <Input
                        value={form.state}
                        onChange={(e) => setForm({ ...form, state: e.target.value })}
                        className="bg-zinc-800 border-zinc-700 text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm text-zinc-300 block mb-2">Zip Code</label>
                      <Input
                        value={form.zipcode}
                        onChange={(e) => setForm({ ...form, zipcode: e.target.value })}
                        className="bg-zinc-800 border-zinc-700 text-white"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-zinc-700">
                  <h3 className="text-lg font-bold text-white mb-4">Promo Code</h3>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter promo code"
                      value={form.coupon_code}
                      onChange={(e) => setForm({ ...form, coupon_code: e.target.value })}
                      className="bg-zinc-800 border-zinc-700 text-white flex-1"
                    />
                    <Button
                      type="button"
                      onClick={validateCoupon}
                      className="bg-zinc-700 hover:bg-zinc-600 text-white"
                    >
                      Apply
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white h-11 font-semibold"
                >
                  {isLoading ? (
                    <>
                      <Loader className="animate-spin mr-2 h-4 w-4" />
                      Processing...
                    </>
                  ) : (
                    "Complete Payment"
                  )}
                </Button>
              </form>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="bg-zinc-900 border-zinc-800 p-6 sticky top-20">
              <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6 pb-6 border-b border-zinc-700">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span>₹{(finalTotal || cartTotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Tax (est.)</span>
                  <span>₹0</span>
                </div>
              </div>

              <div className="flex justify-between text-white font-bold text-lg">
                <span>Total</span>
                <span className="text-amber-600">₹{(finalTotal || cartTotal).toFixed(2)}</span>
              </div>

              <p className="text-zinc-500 text-xs mt-4">
                By placing this order, you agree to our terms and conditions.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
