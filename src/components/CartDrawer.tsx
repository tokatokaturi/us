import { X, Minus, Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

const CartDrawer = () => {
  const { items, isOpen, closeCart, removeFromCart, updateQuantity, totalPrice } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-[70] bg-foreground/30"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed top-0 right-0 bottom-0 z-[80] w-full max-w-md bg-background flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <h2 className="text-xs tracking-editorial font-body">
                SHOPPING BAG ({items.length})
              </h2>
              <button onClick={closeCart} aria-label="Close cart">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-hide">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-sm text-muted-foreground font-body mb-4">
                    Your shopping bag is empty
                  </p>
                  <button
                    onClick={closeCart}
                    className="text-xs tracking-editorial underline-animate font-body"
                  >
                    CONTINUE SHOPPING
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item.product.id + item.size + item.color} className="flex gap-4">
                      <Link
                        to={`/product/${item.product.id}`}
                        onClick={closeCart}
                        className="w-24 h-32 flex-shrink-0 overflow-hidden"
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </Link>
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <p className="text-xs font-body mb-1">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground font-body">
                            {item.color} | {item.size}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() =>
                                updateQuantity(item.product.id, item.quantity - 1)
                              }
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="text-xs font-body w-4 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.product.id, item.quantity + 1)
                              }
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <p className="text-xs font-body">
                            €{(item.product.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-[10px] tracking-editorial text-muted-foreground underline-animate self-start font-body mt-1"
                        >
                          REMOVE
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-border">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs tracking-editorial font-body">TOTAL</span>
                  <span className="text-sm font-body">€{totalPrice.toFixed(2)}</span>
                </div>
                <button className="w-full py-3.5 bg-foreground text-background text-xs tracking-editorial font-body hover:opacity-90 transition-luxury">
                  CHECKOUT
                </button>
                <button
                  onClick={closeCart}
                  className="w-full py-3 text-xs tracking-editorial font-body mt-2 underline-animate mx-auto block text-center"
                >
                  CONTINUE SHOPPING
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
