import { useEffect, useState } from "react";
import API from "../../api";

export default function Orders() {

    const [orders, setOrders] = useState<any[]>([]);

    useEffect(() => {
        API.get("/admin/orders").then((res) => {
            setOrders(res.data);
        });
    }, []);

    return (
        <div>

            <h1 className="text-2xl mb-6">
                Orders
            </h1>

            <table className="w-full bg-white border">

                <thead>
                    <tr className="bg-gray-200">
                        <th>ID</th>
                        <th>User</th>
                        <th>Total</th>
                    </tr>
                </thead>

                <tbody>

                    {orders.map((o) => (
                        <tr key={o.id} className="border text-center">

                            <td>{o.id}</td>
                            <td>{o.user_id}</td>
                            <td>₹{o.total}</td>

                        </tr>
                    ))}

                </tbody>

            </table>

        </div>
    );
}
