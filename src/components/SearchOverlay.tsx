import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { products } from "@/data/products";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchOverlay = ({ isOpen, onClose }: SearchOverlayProps) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  const filtered = query.length > 1
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.subcategory.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const trending = ["Blazers", "Knitwear", "Leather", "Wool Coat", "Silk"];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[60] bg-background"
        >
          <div className="max-w-3xl mx-auto px-4 pt-20">
            <div className="flex items-center gap-4 border-b border-foreground pb-3">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="SEARCH"
                className="flex-1 bg-transparent text-lg tracking-editorial font-body outline-none placeholder:text-muted-foreground"
              />
              <button onClick={onClose} aria-label="Close search">
                <X className="h-5 w-5" />
              </button>
            </div>

            {query.length < 2 && (
              <div className="mt-10">
                <p className="text-xs tracking-editorial text-muted-foreground mb-4">TRENDING SEARCHES</p>
                <div className="flex flex-wrap gap-3">
                  {trending.map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="px-4 py-2 border border-border text-xs tracking-editorial font-body hover:bg-foreground hover:text-background transition-luxury"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {filtered.length > 0 && (
              <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
                {filtered.map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    onClick={onClose}
                    className="group"
                  >
                    <div className="aspect-[3/4] overflow-hidden mb-2">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-luxury"
                      />
                    </div>
                    <p className="text-xs font-body">{product.name}</p>
                    <p className="text-xs text-muted-foreground font-body">
                      €{product.price.toFixed(2)}
                    </p>
                  </Link>
                ))}
              </div>
            )}

            {query.length >= 2 && filtered.length === 0 && (
              <p className="mt-10 text-sm text-muted-foreground font-body">
                No results found for "{query}"
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchOverlay;
