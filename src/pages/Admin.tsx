import { useState, useEffect } from "react";
import API from "../api";

export default function Admin() {

    const [products, setProducts] = useState<any[]>([]);

    const [form, setForm] = useState({
        name: "",
        price: "",
        image: "",
        colors: "",
        sizes: "",
        stock: "",
        supplier: "",
    });

    const load = () => {
        API.get("/admin/products").then((res) => {
            setProducts(res.data);
        });
    };

    useEffect(() => {
        load();
    }, []);

    const submit = async (e: any) => {
        e.preventDefault();

        await API.post("/admin/product", {
            name: form.name,
            price: Number(form.price),
            image: form.image,
            colors: form.colors.split(","),
            sizes: form.sizes.split(","),
            stock: Number(form.stock),
            supplier: form.supplier,
        });

        alert("Added");

        load();
    };

    return (
        <div className="p-10">

            <h1 className="text-3xl mb-6">Admin Dashboard</h1>

            {/* FORM */}

            <form onSubmit={submit} className="grid grid-cols-2 gap-4 mb-10">

                {Object.keys(form).map((k) => (
                    <input
                        key={k}
                        placeholder={k}
                        className="border p-2"
                        value={(form as any)[k]}
                        onChange={(e) =>
                            setForm({ ...form, [k]: e.target.value })
                        }
                    />
                ))}

                <button className="bg-black text-white p-2 col-span-2">
                    Add Product
                </button>

            </form>

            {/* TABLE */}

            <table className="w-full border">

                <thead>
                    <tr className="bg-gray-200">
                        <th>Name</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Colors</th>
                        <th>Sizes</th>
                    </tr>
                </thead>

                <tbody>

                    {products.map((p) => (
                        <tr key={p.id} className="border text-center">

                            <td>{p.name}</td>
                            <td>₹{p.price}</td>
                            <td>{p.stock}</td>
                            <td>{p.colors}</td>
                            <td>{p.sizes}</td>

                        </tr>
                    ))}

                </tbody>

            </table>

        </div>
    );
}
