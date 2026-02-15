import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import heroMain from "@/assets/hero-main.jpg";
import heroWomen from "@/assets/hero-women.jpg";
import heroMen from "@/assets/hero-men.jpg";

const HeroSection = () => {
  return (
    <section className="pt-14 md:pt-16">
      {/* Main Hero */}
      <div className="relative h-[85vh] md:h-screen overflow-hidden">
        <img
          src={heroMain}
          alt="Spring/Summer Collection"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-foreground/10" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="absolute bottom-12 md:bottom-16 left-4 md:left-8"
        >
          <h2 className="font-display text-background text-4xl md:text-6xl lg:text-7xl mb-4">
            Spring / Summer
          </h2>
          <p className="font-body text-background/90 text-xs tracking-editorial mb-6">
            THE NEW COLLECTION
          </p>
          <Link
            to="/collection/new-in"
            className="inline-block px-8 py-3 border border-background text-background text-xs tracking-editorial font-body hover:bg-background hover:text-foreground transition-luxury"
          >
            DISCOVER
          </Link>
        </motion.div>
      </div>

      {/* Two-column categories */}
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Women */}
        <Link to="/collection/women" className="relative group overflow-hidden">
          <div className="aspect-[3/4] md:aspect-[4/5]">
            <img
              src={heroWomen}
              alt="Women's Collection"
              className="w-full h-full object-cover group-hover:scale-105 transition-luxury"
            />
          </div>
          <div className="absolute inset-0 bg-foreground/5 group-hover:bg-foreground/10 transition-luxury" />
          <div className="absolute bottom-8 left-6">
            <p className="text-xs tracking-wide-editorial font-body text-background mb-3">
              WOMEN
            </p>
          </div>
        </Link>

        {/* Men */}
        <Link to="/collection/men" className="relative group overflow-hidden">
          <div className="aspect-[3/4] md:aspect-[4/5] bg-card flex items-center justify-center">
            <img
              src={heroMen}
              alt="Men's Collection"
              className="w-3/4 h-3/4 object-contain group-hover:scale-105 transition-luxury"
            />
          </div>
          <div className="absolute bottom-8 left-6">
            <p className="text-xs tracking-wide-editorial font-body">
              MEN
            </p>
          </div>
        </Link>
      </div>
    </section>
  );
};

export default HeroSection;
