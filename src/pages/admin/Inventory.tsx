import { useEffect, useState } from "react";
import API from "../../api";

export default function Inventory() {

    const [products, setProducts] = useState<any[]>([]);

    const load = () => {
        API.get("/admin/products").then((res) => {
            setProducts(res.data);
        });
    };

    useEffect(() => {
        load();
    }, []);

    const updateStock = async (id: number, stock: number) => {

        await API.put(`/admin/product/${id}`, {
            stock,
        });

        load();
    };

    return (
        <div>

            <h1 className="text-2xl mb-6">
                Inventory
            </h1>

            <table className="w-full bg-white border">

                <thead>
                    <tr className="bg-gray-200">
                        <th>Name</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Update</th>
                    </tr>
                </thead>

                <tbody>

                    {products.map((p) => (
                        <tr key={p.id} className="border text-center">

                            <td>{p.name}</td>
                            <td>₹{p.price}</td>

                            <td>
                                <input
                                    type="number"
                                    defaultValue={p.stock}
                                    className="border w-20 text-center"
                                    id={`stock-${p.id}`}
                                />
                            </td>

                            <td>
                                <button
                                    className="bg-black text-white px-3 py-1"
                                    onClick={() => {
                                        const val = (
                                            document.getElementById(
                                                `stock-${p.id}`
                                            ) as HTMLInputElement
                                        ).value;

                                        updateStock(p.id, Number(val));
                                    }}
                                >
                                    Save
                                </button>
                            </td>

                        </tr>
                    ))}

                </tbody>

            </table>

        </div>
    );
}
