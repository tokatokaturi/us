import Header from "@/components/Header";
import { useEffect, useState } from "react";
import API from "../api";

export default function Products() {

    const [products, setProducts] = useState<any[]>([]);
    const [color, setColor] = useState("");
    const [size, setSize] = useState("");

    useEffect(() => {
        API.get("/products").then((res) => {
            setProducts(res.data);
        });
    }, []);
    const addToCart = async (id: number) => {

        const token = localStorage.getItem("token");

        if (!token) {
            alert("Please login first");
            return;
        }

        try {

            await API.post("/cart", {
                product_id: id,
                quantity: 1,
            });

            alert("Added to cart");

        } catch (err) {
            alert("Login expired. Please login again.");
            localStorage.removeItem("token");
        }
    };

    return (
        <>
            {/* HEADER */}
            <Header />

            {/* PAGE CONTENT */}
            <div className="pt-20 p-6 grid grid-cols-4 gap-6">

                {products.map((p) => (

                    <div key={p.id} className="border p-4">

                        <img
                            src={p.image}
                            className="h-48 w-full object-cover"
                        />

                        <h3 className="font-bold mt-2">{p.name}</h3>

                        <p>₹{p.price}</p>

                        {/* COLORS */}
                        <select
                            onChange={(e) => setColor(e.target.value)}
                            className="border w-full mt-2"
                        >
                            <option>Select Color</option>

                            {p.colors.map((c: string) => (
                                <option key={c}>{c}</option>
                            ))}
                        </select>

                        {/* SIZES */}
                        <select
                            onChange={(e) => setSize(e.target.value)}
                            className="border w-full mt-2"
                        >
                            <option>Select Size</option>

                            {p.sizes.map((s: string) => (
                                <option key={s}>{s}</option>
                            ))}
                        </select>

                        <button
                            onClick={() => addToCart(p.id)}
                            className="bg-black text-white w-full mt-3 p-2"
                        >
                            Add to Cart
                        </button>

                    </div>
                ))}
            </div>
        </>
    );

}
