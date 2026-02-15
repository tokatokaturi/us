import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const EditorialBanner = () => {
  return (
    <section className="bg-card py-20 md:py-32 px-4 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl mx-auto text-center"
      >
        <p className="text-xs tracking-wide-editorial text-muted-foreground font-body mb-6">
          EDITORIAL
        </p>
        <h2 className="font-display text-3xl md:text-5xl leading-tight mb-6">
          The Art of Simplicity
        </h2>
        <p className="text-sm md:text-base text-muted-foreground font-body leading-relaxed mb-10 max-w-lg mx-auto">
          Discover our curated selection of timeless pieces designed for the modern wardrobe. 
          Where minimalism meets craftsmanship.
        </p>
        <Link
          to="/collection/studio"
          className="inline-block px-8 py-3 border border-foreground text-xs tracking-editorial font-body hover:bg-foreground hover:text-background transition-luxury"
        >
          EXPLORE STUDIO
        </Link>
      </motion.div>
    </section>
  );
};

export default EditorialBanner;
