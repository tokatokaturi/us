import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

export default function Signup() {

    const nav = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    });

    const submit = async (e: any) => {
        e.preventDefault();

        try {

            await API.post("/register", form);

            alert("Account created. Please login.");

            nav("/login");

        } catch {
            alert("Signup failed");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">

            <form
                onSubmit={submit}
                className="border p-8 w-96 space-y-4"
            >

                <h2 className="text-2xl text-center">
                    Sign Up
                </h2>

                <input
                    placeholder="Name"
                    className="border p-2 w-full"
                    value={form.name}
                    onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                    }
                />

                <input
                    placeholder="Email"
                    className="border p-2 w-full"
                    value={form.email}
                    onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                    }
                />

                <input
                    type="password"
                    placeholder="Password"
                    className="border p-2 w-full"
                    value={form.password}
                    onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                    }
                />

                <button className="bg-black text-white w-full p-2">
                    Create Account
                </button>

            </form>

        </div>
    );
}
