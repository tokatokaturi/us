import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import API from "@/api";

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
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const title = slug
    ? slug.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "All";

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await API.get("/products");
        setProducts(response.data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  let filtered = [...products];
  
  // Filter by collection category
  if (slug === "women") {
    filtered = filtered.filter((p) => p.is_women);
  } else if (slug === "men") {
    filtered = filtered.filter((p) => p.is_men);
  } else if (slug === "studio") {
    filtered = filtered.filter((p) => p.is_studio);
  } else if (slug === "new") {
    filtered = filtered.filter((p) => p.is_new);
  } else if (slug === "unisex") {
    filtered = filtered.filter((p) => p.is_unisex);
  }

  // Sorting
  if (sortBy === "price-asc") filtered.sort((a, b) => a.price - b.price);
  if (sortBy === "price-desc") filtered.sort((a, b) => b.price - a.price);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-14 md:pt-16 px-4 md:px-8 py-20">
          <div className="text-center">
            <p className="text-sm text-muted-foreground font-body">Loading collection...</p>
          </div>
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-4 md:px-8 py-10 md:py-16"
        >
          <h1 className="font-display text-3xl md:text-4xl">{title}</h1>
          <p className="text-xs text-gray-400 font-body mt-2">
            {filtered.length} {filtered.length === 1 ? "item" : "items"}
          </p>
        </motion.div>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 md:px-8 pb-6 border-b border-neutral-700">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-xs tracking-editorial font-body text-gray-300 hover:text-white transition"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            FILTER
          </button>

          <div className="relative">
            <button
              onClick={() => setShowSort(!showSort)}
              className="flex items-center gap-2 text-xs tracking-editorial font-body text-gray-300 hover:text-white transition"
            >
              SORT BY
              <ChevronDown className="h-3 w-3" />
            </button>
            {showSort && (
              <div className="absolute right-0 top-full mt-2 bg-neutral-900 border border-neutral-700 py-2 min-w-[180px] z-10">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setSortBy(opt.value);
                      setShowSort(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-xs font-body transition-luxury ${
                      sortBy === opt.value ? "text-white" : "text-gray-400 hover:text-gray-200"
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
            className="border-b border-neutral-700 px-4 md:px-8 py-6"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs tracking-editorial font-body">FILTERS</p>
              <button onClick={() => setShowFilters(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-xs font-body mb-2 text-gray-400">Category</p>
                {["All", "Tops", "Knitwear", "Blazers", "Trousers", "Accessories", "Shoes"].map((cat) => (
                  <label key={cat} className="flex items-center gap-2 text-xs font-body py-1 cursor-pointer text-gray-300 hover:text-white transition">
                    <input type="checkbox" className="accent-white" />
                    {cat}
                  </label>
                ))}
              </div>
              <div>
                <p className="text-xs font-body mb-2 text-gray-400">Size</p>
                {["XS", "S", "M", "L", "XL"].map((size) => (
                  <label key={size} className="flex items-center gap-2 text-xs font-body py-1 cursor-pointer text-gray-300 hover:text-white transition">
                    <input type="checkbox" className="accent-white" />
                    {size}
                  </label>
                ))}
              </div>
              <div>
                <p className="text-xs font-body mb-2 text-gray-400">Color</p>
                {["Black", "White", "Beige", "Grey", "Brown"].map((color) => (
                  <label key={color} className="flex items-center gap-2 text-xs font-body py-1 cursor-pointer text-gray-300 hover:text-white transition">
                    <input type="checkbox" className="accent-white" />
                    {color}
                  </label>
                ))}
              </div>
              <div>
                <p className="text-xs font-body mb-2 text-gray-400">Price</p>
                {["Under €50", "€50 – €100", "€100 – €200", "Over €200"].map((range) => (
                  <label key={range} className="flex items-center gap-2 text-xs font-body py-1 cursor-pointer text-gray-300 hover:text-white transition">
                    <input type="checkbox" className="accent-white" />
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
              <p className="text-sm text-gray-400 font-body">
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
