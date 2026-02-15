import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturedProducts from "@/components/FeaturedProducts";
import EditorialBanner from "@/components/EditorialBanner";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <FeaturedProducts />
        <EditorialBanner />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
};

export default Index;
