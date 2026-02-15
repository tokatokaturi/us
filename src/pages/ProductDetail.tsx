import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Heart, ChevronDown, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

const ProductDetail = () => {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-body text-sm text-muted-foreground">Product not found</p>
      </div>
    );
  }

  const wishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) return;
    addToCart(product, selectedSize, selectedColor);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-14 md:pt-16">
        {/* Breadcrumb */}
        <div className="px-4 md:px-8 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-xs tracking-editorial text-muted-foreground font-body hover:text-foreground transition-luxury">
            <ArrowLeft className="h-3 w-3" />
            BACK
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="aspect-[3/4] md:aspect-auto md:h-[calc(100vh-4rem)] sticky top-16 overflow-hidden"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="px-6 md:px-12 py-8 md:py-16"
          >
            {product.isNew && (
              <span className="text-[10px] tracking-editorial font-body text-muted-foreground mb-3 block">
                NEW
              </span>
            )}
            <h1 className="font-display text-2xl md:text-3xl mb-3">{product.name}</h1>
            <div className="flex items-center gap-3 mb-8">
              <p className="text-sm font-body">€{product.price.toFixed(2)}</p>
              {product.originalPrice && (
                <p className="text-sm font-body text-muted-foreground line-through">
                  €{product.originalPrice.toFixed(2)}
                </p>
              )}
            </div>

            {/* Color selector */}
            <div className="mb-6">
              <p className="text-xs tracking-editorial font-body mb-3">
                COLOR {selectedColor && `— ${selectedColor}`}
              </p>
              <div className="flex gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 border text-xs font-body transition-luxury ${
                      selectedColor === color
                        ? "border-foreground"
                        : "border-border hover:border-foreground"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Size selector */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs tracking-editorial font-body">
                  SIZE {selectedSize && `— ${selectedSize}`}
                </p>
                <button
                  onClick={() => setShowSizeGuide(!showSizeGuide)}
                  className="text-xs font-body underline-animate text-muted-foreground"
                >
                  Size Guide
                </button>
              </div>
              <div className="grid grid-cols-4 md:grid-cols-5 gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 border text-xs font-body transition-luxury ${
                      selectedSize === size
                        ? "border-foreground"
                        : "border-border hover:border-foreground"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Add to cart + wishlist */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={!selectedSize || !selectedColor}
                className="flex-1 py-3.5 bg-foreground text-background text-xs tracking-editorial font-body hover:opacity-90 transition-luxury disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ADD TO BAG
              </button>
              <button
                onClick={() => toggleWishlist(product.id)}
                className="w-14 flex items-center justify-center border border-border hover:border-foreground transition-luxury"
                aria-label="Add to wishlist"
              >
                <Heart className={`h-4 w-4 ${wishlisted ? "fill-foreground" : ""}`} />
              </button>
            </div>

            {/* Details accordion */}
            <div className="border-t border-border">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center justify-between w-full py-4"
              >
                <span className="text-xs tracking-editorial font-body">PRODUCT DETAILS</span>
                <ChevronDown
                  className={`h-4 w-4 transition-luxury ${showDetails ? "rotate-180" : ""}`}
                />
              </button>
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="pb-4"
                >
                  <p className="text-xs text-muted-foreground font-body leading-relaxed mb-3">
                    {product.description}
                  </p>
                  <p className="text-xs text-muted-foreground font-body">
                    Material: {product.material}
                  </p>
                </motion.div>
              )}
            </div>

            {/* Size guide */}
            {showSizeGuide && (
              <div className="border-t border-border py-4">
                <p className="text-xs tracking-editorial font-body mb-3">SIZE GUIDE</p>
                <p className="text-xs text-muted-foreground font-body leading-relaxed">
                  Our sizes follow European standard sizing. If you're between sizes, we recommend choosing the larger size for a relaxed fit.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
};

export default ProductDetail;
