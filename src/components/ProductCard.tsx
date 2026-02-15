import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/data/products";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const { toggleWishlist, isInWishlist } = useCart();
  const wishlisted = isInWishlist(product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="aspect-[3/4] overflow-hidden mb-3 img-zoom">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      </Link>

      {/* Wishlist button */}
      <button
        onClick={() => toggleWishlist(product.id)}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-luxury"
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart
          className={`h-5 w-5 ${wishlisted ? "fill-foreground" : ""}`}
        />
      </button>

      {/* New tag */}
      {product.isNew && (
        <span className="absolute top-3 left-3 text-[10px] tracking-editorial font-body bg-background px-2 py-0.5">
          NEW
        </span>
      )}

      <div className="space-y-1">
        <p className="text-xs font-body leading-relaxed">{product.name}</p>
        <div className="flex items-center gap-2">
          <p className="text-xs font-body">€{product.price.toFixed(2)}</p>
          {product.originalPrice && (
            <p className="text-xs font-body text-muted-foreground line-through">
              €{product.originalPrice.toFixed(2)}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
