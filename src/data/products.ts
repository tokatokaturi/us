import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";
import product6 from "@/assets/product-6.jpg";

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  hoverImage?: string;
  category: "women" | "men" | "kids" | "studio";
  subcategory: string;
  isNew?: boolean;
  colors: string[];
  sizes: string[];
  material: string;
  description: string;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Leather Crossbody Bag",
    price: 89.90,
    image: product1,
    category: "women",
    subcategory: "Accessories",
    isNew: true,
    colors: ["Black", "Tan", "Burgundy"],
    sizes: ["One Size"],
    material: "100% Genuine Leather",
    description: "Minimalist crossbody bag crafted from premium leather with gold-tone hardware and adjustable strap.",
  },
  {
    id: "2",
    name: "Cashmere Blend Sweater",
    price: 59.90,
    image: product2,
    category: "women",
    subcategory: "Knitwear",
    colors: ["Cream", "Black", "Grey"],
    sizes: ["XS", "S", "M", "L", "XL"],
    material: "70% Cashmere, 30% Wool",
    description: "Luxuriously soft round-neck sweater in a cashmere-wool blend. Relaxed fit with ribbed cuffs and hem.",
  },
  {
    id: "3",
    name: "Silk Satin Blouse",
    price: 49.90,
    originalPrice: 69.90,
    image: product3,
    category: "women",
    subcategory: "Tops",
    isNew: true,
    colors: ["White", "Black", "Blush"],
    sizes: ["XS", "S", "M", "L"],
    material: "100% Mulberry Silk",
    description: "Elegant silk satin blouse with button-front closure and balloon sleeves. A versatile wardrobe essential.",
  },
  {
    id: "4",
    name: "Tailored Wool Trousers",
    price: 79.90,
    image: product4,
    category: "men",
    subcategory: "Trousers",
    colors: ["Black", "Navy", "Charcoal"],
    sizes: ["28", "30", "32", "34", "36", "38"],
    material: "98% Wool, 2% Elastane",
    description: "Impeccably tailored trousers in premium wool with a modern slim fit. Features pressed creases and hidden clasp closure.",
  },
  {
    id: "5",
    name: "Structured Wool Blazer",
    price: 129.00,
    image: product5,
    category: "women",
    subcategory: "Blazers",
    isNew: true,
    colors: ["Camel", "Black", "Grey"],
    sizes: ["XS", "S", "M", "L", "XL"],
    material: "100% Virgin Wool",
    description: "Oversized structured blazer with peak lapels and silver-tone buttons. A sophisticated layering piece.",
  },
  {
    id: "6",
    name: "Leather Chelsea Boots",
    price: 149.00,
    originalPrice: 189.00,
    image: product6,
    category: "men",
    subcategory: "Shoes",
    colors: ["Black", "Brown"],
    sizes: ["39", "40", "41", "42", "43", "44", "45"],
    material: "100% Calfskin Leather",
    description: "Classic Chelsea boots in polished calfskin leather with elastic side panels and leather sole.",
  },
];

export const categories = [
  { id: "women", label: "WOMEN" },
  { id: "men", label: "MEN" },
  { id: "kids", label: "KIDS" },
  { id: "studio", label: "STUDIO" },
] as const;

export const collections = [
  { id: "new-in", label: "NEW IN", href: "/collection/new-in" },
  { id: "coats", label: "COATS", href: "/collection/coats" },
  { id: "blazers", label: "BLAZERS", href: "/collection/blazers" },
  { id: "knitwear", label: "KNITWEAR", href: "/collection/knitwear" },
  { id: "shoes", label: "SHOES", href: "/collection/shoes" },
  { id: "accessories", label: "ACCESSORIES", href: "/collection/accessories" },
];
