import { useParams } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";

const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
];

const Collection = () => {
  const { slug } = useParams();
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);

  const title = slug
    ? slug.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "All";

  let filtered = [...products];
  if (slug && slug !== "new-in") {
    filtered = filtered.filter((p) => p.category === slug || p.subcategory.toLowerCase() === slug);
  }
  if (slug === "new-in") {
    filtered = filtered.filter((p) => p.isNew);
  }

  // Sorting
  if (sortBy === "price-asc") filtered.sort((a, b) => a.price - b.price);
  if (sortBy === "price-desc") filtered.sort((a, b) => b.price - a.price);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-14 md:pt-16">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-4 md:px-8 py-10 md:py-16"
        >
          <h1 className="font-display text-3xl md:text-4xl">{title}</h1>
          <p className="text-xs text-muted-foreground font-body mt-2">
            {filtered.length} {filtered.length === 1 ? "item" : "items"}
          </p>
        </motion.div>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 md:px-8 pb-6 border-b border-border">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-xs tracking-editorial font-body"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            FILTER
          </button>

          <div className="relative">
            <button
              onClick={() => setShowSort(!showSort)}
              className="flex items-center gap-2 text-xs tracking-editorial font-body"
            >
              SORT BY
              <ChevronDown className="h-3 w-3" />
            </button>
            {showSort && (
              <div className="absolute right-0 top-full mt-2 bg-background border border-border py-2 min-w-[180px] z-10">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setSortBy(opt.value);
                      setShowSort(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-xs font-body hover:bg-muted transition-luxury ${
                      sortBy === opt.value ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-border px-4 md:px-8 py-6"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs tracking-editorial font-body">FILTERS</p>
              <button onClick={() => setShowFilters(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-xs font-body mb-2 text-muted-foreground">Category</p>
                {["All", "Tops", "Knitwear", "Blazers", "Trousers", "Accessories", "Shoes"].map((cat) => (
                  <label key={cat} className="flex items-center gap-2 text-xs font-body py-1 cursor-pointer">
                    <input type="checkbox" className="accent-foreground" />
                    {cat}
                  </label>
                ))}
              </div>
              <div>
                <p className="text-xs font-body mb-2 text-muted-foreground">Size</p>
                {["XS", "S", "M", "L", "XL"].map((size) => (
                  <label key={size} className="flex items-center gap-2 text-xs font-body py-1 cursor-pointer">
                    <input type="checkbox" className="accent-foreground" />
                    {size}
                  </label>
                ))}
              </div>
              <div>
                <p className="text-xs font-body mb-2 text-muted-foreground">Color</p>
                {["Black", "White", "Beige", "Grey", "Brown"].map((color) => (
                  <label key={color} className="flex items-center gap-2 text-xs font-body py-1 cursor-pointer">
                    <input type="checkbox" className="accent-foreground" />
                    {color}
                  </label>
                ))}
              </div>
              <div>
                <p className="text-xs font-body mb-2 text-muted-foreground">Price</p>
                {["Under €50", "€50 – €100", "€100 – €200", "Over €200"].map((range) => (
                  <label key={range} className="flex items-center gap-2 text-xs font-body py-1 cursor-pointer">
                    <input type="checkbox" className="accent-foreground" />
                    {range}
                  </label>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Products grid */}
        <div className="px-4 md:px-8 py-8 md:py-12">
          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-14">
              {filtered.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-sm text-muted-foreground font-body">
                No items found in this collection
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
};

export default Collection;
