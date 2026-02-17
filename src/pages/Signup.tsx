import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

export default function Signup() {
    const nav = useNavigate();
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        date_of_birth: "",
        gender: "",
        address: "",
        city: "",
        state: "",
        postal_code: "",
        country: "",
    });

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        
        if (!form.name.trim()) newErrors.name = "Name is required";
        if (!form.email.trim()) newErrors.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Invalid email format";
        if (!form.password) newErrors.password = "Password is required";
        else if (form.password.length < 6) newErrors.password = "Password must be at least 6 characters";
        if (!form.phone.trim()) newErrors.phone = "Phone number is required";
        if (!form.date_of_birth) newErrors.date_of_birth = "Date of birth is required";
        if (!form.gender) newErrors.gender = "Gender is required";
        if (!form.address.trim()) newErrors.address = "Address is required";
        if (!form.city.trim()) newErrors.city = "City is required";
        if (!form.state.trim()) newErrors.state = "State is required";
        if (!form.postal_code.trim()) newErrors.postal_code = "Postal code is required";
        if (!form.country.trim()) newErrors.country = "Country is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const submit = async (e: any) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setLoading(true);
        try {
            const response = await API.post("/register", form);
            
            // Store token in cookie
            const token = response.data.token;
            document.cookie = `auth_token=${token}; path=/; max-age=2592000; SameSite=Lax`;
            
            // Also store in sessionStorage for immediate access
            sessionStorage.setItem("auth_token", token);
            sessionStorage.setItem("user_id", response.data.user_id);

            alert("Account created successfully!");
            nav("/");
        } catch (error: any) {
            const errorMsg = error.response?.data?.msg || "Signup failed";
            setErrors({ submit: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
            <form
                onSubmit={submit}
                className="bg-neutral-900 border border-neutral-700 rounded-lg p-8 w-full max-w-2xl space-y-4"
            >
                <h2 className="text-3xl font-bold text-center mb-8">Create Account</h2>

                {errors.submit && <div className="bg-red-900/20 border border-red-700 text-red-300 p-3 rounded">{errors.submit}</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="John Doe"
                            className="bg-neutral-800 border border-neutral-600 text-white rounded p-3 w-full focus:outline-none focus:border-neutral-400 transition"
                            value={form.name}
                            onChange={handleChange}
                        />
                        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="john@example.com"
                            className="bg-neutral-800 border border-neutral-600 text-white rounded p-3 w-full focus:outline-none focus:border-neutral-400 transition"
                            value={form.email}
                            onChange={handleChange}
                        />
                        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Phone Number</label>
                        <input
                            type="tel"
                            name="phone"
                            placeholder="+1 (555) 123-4567"
                            className="bg-neutral-800 border border-neutral-600 text-white rounded p-3 w-full focus:outline-none focus:border-neutral-400 transition"
                            value={form.phone}
                            onChange={handleChange}
                        />
                        {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            className="bg-neutral-800 border border-neutral-600 text-white rounded p-3 w-full focus:outline-none focus:border-neutral-400 transition"
                            value={form.password}
                            onChange={handleChange}
                        />
                        {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                    </div>

                    {/* Date of Birth */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Date of Birth</label>
                        <input
                            type="date"
                            name="date_of_birth"
                            className="bg-neutral-800 border border-neutral-600 text-white rounded p-3 w-full focus:outline-none focus:border-neutral-400 transition"
                            value={form.date_of_birth}
                            onChange={handleChange}
                        />
                        {errors.date_of_birth && <p className="text-red-400 text-xs mt-1">{errors.date_of_birth}</p>}
                    </div>

                    {/* Gender */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Gender</label>
                        <select
                            name="gender"
                            className="bg-neutral-800 border border-neutral-600 text-white rounded p-3 w-full focus:outline-none focus:border-neutral-400 transition"
                            value={form.gender}
                            onChange={handleChange}
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                        {errors.gender && <p className="text-red-400 text-xs mt-1">{errors.gender}</p>}
                    </div>

                    {/* Address */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">Street Address</label>
                        <input
                            type="text"
                            name="address"
                            placeholder="123 Main Street"
                            className="bg-neutral-800 border border-neutral-600 text-white rounded p-3 w-full focus:outline-none focus:border-neutral-400 transition"
                            value={form.address}
                            onChange={handleChange}
                        />
                        {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address}</p>}
                    </div>

                    {/* City */}
                    <div>
                        <label className="block text-sm font-medium mb-2">City</label>
                        <input
                            type="text"
                            name="city"
                            placeholder="New York"
                            className="bg-neutral-800 border border-neutral-600 text-white rounded p-3 w-full focus:outline-none focus:border-neutral-400 transition"
                            value={form.city}
                            onChange={handleChange}
                        />
                        {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city}</p>}
                    </div>

                    {/* State */}
                    <div>
                        <label className="block text-sm font-medium mb-2">State/Province</label>
                        <input
                            type="text"
                            name="state"
                            placeholder="NY"
                            className="bg-neutral-800 border border-neutral-600 text-white rounded p-3 w-full focus:outline-none focus:border-neutral-400 transition"
                            value={form.state}
                            onChange={handleChange}
                        />
                        {errors.state && <p className="text-red-400 text-xs mt-1">{errors.state}</p>}
                    </div>

                    {/* Postal Code */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Postal Code</label>
                        <input
                            type="text"
                            name="postal_code"
                            placeholder="10001"
                            className="bg-neutral-800 border border-neutral-600 text-white rounded p-3 w-full focus:outline-none focus:border-neutral-400 transition"
                            value={form.postal_code}
                            onChange={handleChange}
                        />
                        {errors.postal_code && <p className="text-red-400 text-xs mt-1">{errors.postal_code}</p>}
                    </div>

                    {/* Country */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Country</label>
                        <input
                            type="text"
                            name="country"
                            placeholder="United States"
                            className="bg-neutral-800 border border-neutral-600 text-white rounded p-3 w-full focus:outline-none focus:border-neutral-400 transition"
                            value={form.country}
                            onChange={handleChange}
                        />
                        {errors.country && <p className="text-red-400 text-xs mt-1">{errors.country}</p>}
                    </div>
                </div>

                <button 
                    type="submit"
                    disabled={loading}
                    className="bg-white text-black font-semibold w-full p-3 rounded mt-6 hover:bg-neutral-200 transition disabled:opacity-50"
                >
                    {loading ? "Creating Account..." : "Create Account"}
                </button>

                <p className="text-center text-neutral-400 text-sm">
                    Already have an account? <a href="/login" className="text-white hover:underline">Sign in</a>
                </p>
            </form>
        </div>
    );
}
