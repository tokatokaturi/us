import { products } from "@/data/products";
import ProductCard from "./ProductCard";
import { motion } from "framer-motion";

const FeaturedProducts = () => {
  const featured = products.slice(0, 6);

  return (
    <section className="px-4 md:px-8 py-16 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-10"
      >
        <h2 className="font-display text-2xl md:text-3xl mb-2">New In</h2>
        <p className="text-xs tracking-editorial text-muted-foreground font-body">
          LATEST ARRIVALS
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-14">
        {featured.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>
    </section>
  );
};

export default FeaturedProducts;
