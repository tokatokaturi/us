import { useState } from "react";
import API from "../../api";
import { Upload, X, Plus, Image as ImageIcon, AlertCircle } from "lucide-react";

export default function AddProduct() {
    const [form, setForm] = useState({
        name: "",
        description: "",
        price: "",
        images: [] as string[],
        colors: [],
        sizes: [],
        stock: "",
        supplier: "",
        category: "",
        sku: "",
        brand: "",
        weight: "",
        dimensions: {
            length: "",
            width: "",
            height: ""
        },
        tags: [] as string[],
        featured: false,
        status: "active",
        discount: "",
        costPrice: "",
        taxRate: "",
        minOrderQuantity: "",
        maxOrderQuantity: "",
        specifications: [] as { key: string; value: string }[],
        warranty: "",
        returnPolicy: "",
        shippingClass: "",
        // Collection categories
        is_women: false,
        is_men: false,
        is_studio: false,
        is_new: false,
        is_unisex: false,
    });

    const [customColorInput, setCustomColorInput] = useState("");
    const [customSizeInput, setCustomSizeInput] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [imageInput, setImageInput] = useState("");
    const [tagInput, setTagInput] = useState("");
    const [activeTab, setActiveTab] = useState<"basic" | "media" | "inventory" | "shipping" | "advanced">("basic");

    // Predefined options
    const colorOptions = [
        "Black", "White", "Red", "Blue", "Green", "Yellow", 
        "Orange", "Purple", "Pink", "Gray", "Brown", "Beige",
        "Navy", "Teal", "Maroon", "Olive", "Coral", "Mint"
    ];

    const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "One Size"];

    const categoryOptions = [
        "Clothing", "Shoes", "Accessories", "Electronics", 
        "Home & Garden", "Sports & Outdoors", "Beauty & Personal Care",
        "Books & Media", "Toys & Games", "Food & Beverages"
    ];

    const supplierOptions = [
        "Supplier A", "Supplier B", "Supplier C", "Supplier D", "Supplier E"
    ];

    const statusOptions = [
        { value: "active", label: "Active" },
        { value: "draft", label: "Draft" },
        { value: "out_of_stock", label: "Out of Stock" },
        { value: "discontinued", label: "Discontinued" }
    ];

    const shippingClassOptions = [
        "Standard", "Express", "Free Shipping", "Heavy Item", "Fragile"
    ];

    const submit = async (e: any) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // Validation
            if (form.images.length === 0) {
                setError("Please add at least one product image");
                setLoading(false);
                return;
            }

            await API.post("/admin/product", {
                name: form.name,
                description: form.description,
                price: Number(form.price),
                images: form.images,
                image: form.images[0], // Primary image for backward compatibility
                colors: form.colors,
                sizes: form.sizes,
                stock: Number(form.stock),
                supplier: form.supplier,
                category: form.category,
                sku: form.sku,
                brand: form.brand,
                weight: form.weight ? Number(form.weight) : null,
                dimensions: {
                    length: form.dimensions.length ? Number(form.dimensions.length) : null,
                    width: form.dimensions.width ? Number(form.dimensions.width) : null,
                    height: form.dimensions.height ? Number(form.dimensions.height) : null,
                },
                tags: form.tags,
                featured: form.featured,
                status: form.status,
                discount: form.discount ? Number(form.discount) : null,
                costPrice: form.costPrice ? Number(form.costPrice) : null,
                taxRate: form.taxRate ? Number(form.taxRate) : null,
                minOrderQuantity: form.minOrderQuantity ? Number(form.minOrderQuantity) : null,
                maxOrderQuantity: form.maxOrderQuantity ? Number(form.maxOrderQuantity) : null,
                specifications: form.specifications.filter(spec => spec.key && spec.value),
                warranty: form.warranty,
                returnPolicy: form.returnPolicy,
                shippingClass: form.shippingClass,
                // Collection categories
                is_women: form.is_women,
                is_men: form.is_men,
                is_studio: form.is_studio,
                is_new: form.is_new,
                is_unisex: form.is_unisex,
            });

            alert("Product Added Successfully!");
            resetForm();
        } catch (err: any) {
            setError(err.response?.data?.msg || "Failed to add product. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setForm({
            name: "",
            description: "",
            price: "",
            images: [],
            colors: [],
            sizes: [],
            stock: "",
            supplier: "",
            category: "",
            sku: "",
            brand: "",
            weight: "",
            dimensions: { length: "", width: "", height: "" },
            tags: [],
            featured: false,
            status: "active",
            discount: "",
            costPrice: "",
            taxRate: "",
            minOrderQuantity: "",
            maxOrderQuantity: "",
            specifications: [],
            warranty: "",
            returnPolicy: "",
            shippingClass: "",
            is_women: false,
            is_men: false,
            is_studio: false,
            is_new: false,
            is_unisex: false,
        });
        setCustomColorInput("");
        setCustomSizeInput("");
        setActiveTab("basic");
    };

    const toggleArrayValue = (field: "colors" | "sizes", value: string) => {
        const currentArray = form[field];
        if (currentArray.includes(value)) {
            setForm({
                ...form,
                [field]: currentArray.filter((item) => item !== value),
            });
        } else {
            setForm({ ...form, [field]: [...currentArray, value] });
        }
    };

    const toggleCategory = (category: "is_women" | "is_men" | "is_studio" | "is_new" | "is_unisex") => {
        setForm({
            ...form,
            [category]: !form[category],
        });
    };

    const addImage = () => {
        if (imageInput.trim() && !form.images.includes(imageInput.trim())) {
            setForm({ ...form, images: [...form.images, imageInput.trim()] });
            setImageInput("");
        }
    };

    const removeImage = (index: number) => {
        setForm({
            ...form,
            images: form.images.filter((_, i) => i !== index)
        });
    };

    const moveImage = (index: number, direction: "up" | "down") => {
        const newImages = [...form.images];
        const newIndex = direction === "up" ? index - 1 : index + 1;
        if (newIndex >= 0 && newIndex < newImages.length) {
            [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
            setForm({ ...form, images: newImages });
        }
    };

    const addTag = () => {
        if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
            setForm({ ...form, tags: [...form.tags, tagInput.trim()] });
            setTagInput("");
        }
    };

    const removeTag = (tag: string) => {
        setForm({ ...form, tags: form.tags.filter(t => t !== tag) });
    };

    const addSpecification = () => {
        setForm({
            ...form,
            specifications: [...form.specifications, { key: "", value: "" }]
        });
    };

    const updateSpecification = (index: number, field: "key" | "value", value: string) => {
        const newSpecs = [...form.specifications];
        newSpecs[index][field] = value;
        setForm({ ...form, specifications: newSpecs });
    };

    const removeSpecification = (index: number) => {
        setForm({
            ...form,
            specifications: form.specifications.filter((_, i) => i !== index)
        });
    };

    const tabs = [
        { id: "basic", label: "Basic Info" },
        { id: "media", label: "Media & Images" },
        { id: "inventory", label: "Inventory & Pricing" },
        { id: "shipping", label: "Shipping & Logistics" },
        { id: "advanced", label: "Advanced" },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
                    <p className="text-gray-600 mt-2">Create a new product with complete details and specifications</p>
                </div>

                <form onSubmit={submit}>
                    {/* Tab Navigation */}
                    <div className="bg-white rounded-lg shadow-sm mb-6">
                        <div className="border-b border-gray-200">
                            <nav className="flex -mb-px overflow-x-auto">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                                            activeTab === tab.id
                                                ? "border-black text-black"
                                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        <div className="p-6">
                            {/* Basic Info Tab */}
                            {activeTab === "basic" && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Product Name */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold mb-2 text-gray-900">
                                            Product Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Enter product name"
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            required
                                        />
                                    </div>

                                    {/* Description */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold mb-2 text-gray-900">
                                            Description
                                        </label>
                                        <textarea
                                            placeholder="Enter detailed product description"
                                            rows={5}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all resize-none"
                                            value={form.description}
                                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">{form.description.length} characters</p>
                                    </div>

                                    {/* Category */}
                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-gray-900">
                                            Category <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white transition-all"
                                            value={form.category}
                                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                                            required
                                        >
                                            <option value="">Select category</option>
                                            {categoryOptions.map((cat) => (
                                                <option key={cat} value={cat}>
                                                    {cat}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Brand */}
                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-gray-900">
                                            Brand
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Enter brand name"
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                                            value={form.brand}
                                            onChange={(e) => setForm({ ...form, brand: e.target.value })}
                                        />
                                    </div>

                                    {/* SKU */}
                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-gray-900">
                                            SKU (Stock Keeping Unit)
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g., PROD-12345"
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                                            value={form.sku}
                                            onChange={(e) => setForm({ ...form, sku: e.target.value })}
                                        />
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-gray-900">
                                            Status <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white transition-all"
                                            value={form.status}
                                            onChange={(e) => setForm({ ...form, status: e.target.value })}
                                            required
                                        >
                                            {statusOptions.map((status) => (
                                                <option key={status.value} value={status.value}>
                                                    {status.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Collection Categories */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold mb-2 text-gray-900">
                                            Collection Categories
                                        </label>
                                        <p className="text-xs text-gray-500 mb-3">Add this product to these collections:</p>
                                        <div className="flex flex-wrap gap-3">
                                            {[
                                                { key: "is_women", label: "Women" },
                                                { key: "is_men", label: "Men" },
                                                { key: "is_studio", label: "Studio" },
                                                { key: "is_new", label: "New" },
                                                { key: "is_unisex", label: "Unisex" }
                                            ].map(({ key, label }) => (
                                                <label
                                                    key={key}
                                                    className={`flex items-center space-x-2 cursor-pointer px-4 py-2 rounded-lg border-2 transition-all ${
                                                        form[key as keyof typeof form]
                                                            ? "bg-black text-white border-black"
                                                            : "bg-white border-gray-200 hover:border-gray-400"
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={form[key as keyof typeof form] as boolean}
                                                        onChange={() => toggleCategory(key as any)}
                                                        className="hidden"
                                                    />
                                                    <span className="text-sm font-medium">{label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Colors */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold mb-2 text-gray-900">
                                            Available Colors
                                        </label>
                                        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 mb-3">
                                            <p className="text-xs text-gray-500 mb-3">Select from presets or add custom colors:</p>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                                {colorOptions.map((color) => (
                                                    <label
                                                        key={color}
                                                        className={`flex items-center space-x-2 cursor-pointer p-3 rounded-lg border-2 transition-all ${
                                                            form.colors.includes(color)
                                                                ? "bg-black text-white border-black"
                                                                : "bg-white border-gray-200 hover:border-gray-400"
                                                        }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={form.colors.includes(color)}
                                                            onChange={() => toggleArrayValue("colors", color)}
                                                            className="hidden"
                                                        />
                                                        <span className="text-sm font-medium">{color}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        {/* Custom Color Input */}
                                        <div className="flex gap-2 mb-3">
                                            <input
                                                type="text"
                                                placeholder="Add custom color (e.g., Rose Gold)"
                                                className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                                                value={customColorInput}
                                                onChange={(e) => setCustomColorInput(e.target.value)}
                                                onKeyPress={(e) => {
                                                    if (e.key === "Enter" && customColorInput.trim()) {
                                                        e.preventDefault();
                                                        if (!form.colors.includes(customColorInput.trim())) {
                                                            setForm({
                                                                ...form,
                                                                colors: [...form.colors, customColorInput.trim()]
                                                            });
                                                        }
                                                        setCustomColorInput("");
                                                    }
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (customColorInput.trim() && !form.colors.includes(customColorInput.trim())) {
                                                        setForm({
                                                            ...form,
                                                            colors: [...form.colors, customColorInput.trim()]
                                                        });
                                                        setCustomColorInput("");
                                                    }
                                                }}
                                                className="px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 font-medium"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Add
                                            </button>
                                        </div>
                                        {form.colors.length > 0 && (
                                            <div className="mt-3 text-sm text-gray-600">
                                                Selected: <span className="font-medium">{form.colors.join(", ")}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Sizes */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold mb-2 text-gray-900">
                                            Available Sizes
                                        </label>
                                        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 mb-3">
                                            <p className="text-xs text-gray-500 mb-3">Select from presets or add custom sizes:</p>
                                            <div className="flex flex-wrap gap-3">
                                                {sizeOptions.map((size) => (
                                                    <label
                                                        key={size}
                                                        className={`flex items-center justify-center cursor-pointer px-6 py-3 rounded-lg border-2 transition-all min-w-[80px] ${
                                                            form.sizes.includes(size)
                                                                ? "bg-black text-white border-black"
                                                                : "bg-white border-gray-200 hover:border-gray-400"
                                                        }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={form.sizes.includes(size)}
                                                            onChange={() => toggleArrayValue("sizes", size)}
                                                            className="hidden"
                                                        />
                                                        <span className="text-sm font-bold">{size}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        {/* Custom Size Input */}
                                        <div className="flex gap-2 mb-3">
                                            <input
                                                type="text"
                                                placeholder="Add custom size (e.g., 32, Medium Tall)"
                                                className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                                                value={customSizeInput}
                                                onChange={(e) => setCustomSizeInput(e.target.value)}
                                                onKeyPress={(e) => {
                                                    if (e.key === "Enter" && customSizeInput.trim()) {
                                                        e.preventDefault();
                                                        if (!form.sizes.includes(customSizeInput.trim())) {
                                                            setForm({
                                                                ...form,
                                                                sizes: [...form.sizes, customSizeInput.trim()]
                                                            });
                                                        }
                                                        setCustomSizeInput("");
                                                    }
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (customSizeInput.trim() && !form.sizes.includes(customSizeInput.trim())) {
                                                        setForm({
                                                            ...form,
                                                            sizes: [...form.sizes, customSizeInput.trim()]
                                                        });
                                                        setCustomSizeInput("");
                                                    }
                                                }}
                                                className="px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 font-medium"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Add
                                            </button>
                                        </div>
                                        {form.sizes.length > 0 && (
                                            <div className="mt-3 text-sm text-gray-600">
                                                Selected: <span className="font-medium">{form.sizes.join(", ")}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Media & Images Tab */}
                            {activeTab === "media" && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-gray-900">
                                            Product Images <span className="text-red-500">*</span>
                                        </label>
                                        <p className="text-sm text-gray-600 mb-4">Add multiple images. The first image will be the primary image.</p>
                                        
                                        {/* Image Input */}
                                        <div className="flex gap-2 mb-4">
                                            <input
                                                type="url"
                                                placeholder="https://example.com/image.jpg"
                                                className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                                                value={imageInput}
                                                onChange={(e) => setImageInput(e.target.value)}
                                                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addImage())}
                                            />
                                            <button
                                                type="button"
                                                onClick={addImage}
                                                className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 font-medium"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Add Image
                                            </button>
                                        </div>

                                        {/* Image Gallery */}
                                        {form.images.length > 0 ? (
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                {form.images.map((img, index) => (
                                                    <div key={index} className="relative group border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
                                                        <div className="aspect-square bg-gray-100 flex items-center justify-center">
                                                            <img
                                                                src={img}
                                                                alt={`Product ${index + 1}`}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.currentTarget.style.display = 'none';
                                                                    e.currentTarget.parentElement!.innerHTML += '<div class="text-gray-400 text-sm">Invalid Image</div>';
                                                                }}
                                                            />
                                                        </div>
                                                        {index === 0 && (
                                                            <div className="absolute top-2 left-2 bg-black text-white text-xs px-2 py-1 rounded font-medium">
                                                                Primary
                                                            </div>
                                                        )}
                                                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {index > 0 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => moveImage(index, "up")}
                                                                    className="p-1.5 bg-white rounded shadow hover:bg-gray-100 transition-colors"
                                                                    title="Move left"
                                                                >
                                                                    <Upload className="w-4 h-4 rotate-90" />
                                                                </button>
                                                            )}
                                                            {index < form.images.length - 1 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => moveImage(index, "down")}
                                                                    className="p-1.5 bg-white rounded shadow hover:bg-gray-100 transition-colors"
                                                                    title="Move right"
                                                                >
                                                                    <Upload className="w-4 h-4 -rotate-90" />
                                                                </button>
                                                            )}
                                                            <button
                                                                type="button"
                                                                onClick={() => removeImage(index)}
                                                                className="p-1.5 bg-red-500 text-white rounded shadow hover:bg-red-600 transition-colors"
                                                                title="Remove"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                        <div className="p-2 bg-gray-50 border-t">
                                                            <p className="text-xs text-gray-600 truncate">Image {index + 1}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-gray-50">
                                                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                                <p className="text-gray-600 mb-2">No images added yet</p>
                                                <p className="text-sm text-gray-500">Add image URLs above to display them here</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Tags */}
                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-gray-900">
                                            Product Tags
                                        </label>
                                        <p className="text-sm text-gray-600 mb-4">Add tags to help customers find your product</p>
                                        
                                        <div className="flex gap-2 mb-4">
                                            <input
                                                type="text"
                                                placeholder="e.g., summer, sale, new arrival"
                                                className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                                                value={tagInput}
                                                onChange={(e) => setTagInput(e.target.value)}
                                                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                                            />
                                            <button
                                                type="button"
                                                onClick={addTag}
                                                className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 font-medium"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Add Tag
                                            </button>
                                        </div>

                                        {form.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {form.tags.map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm font-medium"
                                                    >
                                                        {tag}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeTag(tag)}
                                                            className="hover:text-red-500 transition-colors"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Inventory & Pricing Tab */}
                            {activeTab === "inventory" && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Price */}
                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-gray-900">
                                            Selling Price <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                                            <input
                                                type="number"
                                                placeholder="0.00"
                                                step="0.01"
                                                className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                                                value={form.price}
                                                onChange={(e) => setForm({ ...form, price: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Cost Price */}
                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-gray-900">
                                            Cost Price
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                                            <input
                                                type="number"
                                                placeholder="0.00"
                                                step="0.01"
                                                className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                                                value={form.costPrice}
                                                onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
                                            />
                                        </div>
                                        {form.price && form.costPrice && (
                                            <p className="text-sm text-gray-600 mt-1">
                                                Profit Margin: <span className="font-medium text-green-600">
                                                    ${(Number(form.price) - Number(form.costPrice)).toFixed(2)} 
                                                    ({(((Number(form.price) - Number(form.costPrice)) / Number(form.price)) * 100).toFixed(1)}%)
                                                </span>
                                            </p>
                                        )}
                                    </div>

                                    {/* Discount */}
                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-gray-900">
                                            Discount (%)
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                                            value={form.discount}
                                            onChange={(e) => setForm({ ...form, discount: e.target.value })}
                                        />
                                        {form.price && form.discount && (
                                            <p className="text-sm text-gray-600 mt-1">
                                                Final Price: <span className="font-medium">
                                                    ${(Number(form.price) * (1 - Number(form.discount) / 100)).toFixed(2)}
                                                </span>
                                            </p>
                                        )}
                                    </div>

                                    {/* Tax Rate */}
                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-gray-900">
                                            Tax Rate (%)
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            min="0"
                                            step="0.01"
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                                            value={form.taxRate}
                                            onChange={(e) => setForm({ ...form, taxRate: e.target.value })}
                                        />
                                    </div>

                                    {/* Stock */}
                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-gray-900">
                                            Stock Quantity <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            min="0"
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                                            value={form.stock}
                                            onChange={(e) => setForm({ ...form, stock: e.target.value })}
                                            required
                                        />
                                    </div>

                                    {/* Supplier */}
                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-gray-900">
                                            Supplier <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white transition-all"
                                            value={form.supplier}
                                            onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                                            required
                                        >
                                            <option value="">Select supplier</option>
                                            {supplierOptions.map((supplier) => (
                                                <option key={supplier} value={supplier}>
                                                    {supplier}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Min Order Quantity */}
                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-gray-900">
                                            Min Order Quantity
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="1"
                                            min="1"
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                                            value={form.minOrderQuantity}
                                            onChange={(e) => setForm({ ...form, minOrderQuantity: e.target.value })}
                                        />
                                    </div>

                                    {/* Max Order Quantity */}
                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-gray-900">
                                            Max Order Quantity
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="No limit"
                                            min="1"
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                                            value={form.maxOrderQuantity}
                                            onChange={(e) => setForm({ ...form, maxOrderQuantity: e.target.value })}
                                        />
                                    </div>

                                    {/* Featured Product */}
                                    <div className="md:col-span-2">
                                        <label className="flex items-center space-x-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={form.featured}
                                                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                                                className="w-5 h-5 text-black border-gray-300 rounded focus:ring-2 focus:ring-black"
                                            />
                                            <div>
                                                <span className="text-sm font-semibold text-gray-900">Feature this product</span>
                                                <p className="text-xs text-gray-600">Featured products appear prominently on your store</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* Shipping & Logistics Tab */}
                            {activeTab === "shipping" && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Weight */}
                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-gray-900">
                                            Weight (kg)
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            step="0.01"
                                            min="0"
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                                            value={form.weight}
                                            onChange={(e) => setForm({ ...form, weight: e.target.value })}
                                        />
                                    </div>

                                    {/* Shipping Class */}
                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-gray-900">
                                            Shipping Class
                                        </label>
                                        <select
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white transition-all"
                                            value={form.shippingClass}
                                            onChange={(e) => setForm({ ...form, shippingClass: e.target.value })}
                                        >
                                            <option value="">Select shipping class</option>
                                            {shippingClassOptions.map((sc) => (
                                                <option key={sc} value={sc}>
                                                    {sc}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Dimensions */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold mb-2 text-gray-900">
                                            Dimensions (cm)
                                        </label>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <input
                                                    type="number"
                                                    placeholder="Length"
                                                    step="0.01"
                                                    min="0"
                                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                                                    value={form.dimensions.length}
                                                    onChange={(e) => setForm({
                                                        ...form,
                                                        dimensions: { ...form.dimensions, length: e.target.value }
                                                    })}
                                                />
                                                <p className="text-xs text-gray-500 mt-1">Length</p>
                                            </div>
                                            <div>
                                                <input
                                                    type="number"
                                                    placeholder="Width"
                                                    step="0.01"
                                                    min="0"
                                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                                                    value={form.dimensions.width}
                                                    onChange={(e) => setForm({
                                                        ...form,
                                                        dimensions: { ...form.dimensions, width: e.target.value }
                                                    })}
                                                />
                                                <p className="text-xs text-gray-500 mt-1">Width</p>
                                            </div>
                                            <div>
                                                <input
                                                    type="number"
                                                    placeholder="Height"
                                                    step="0.01"
                                                    min="0"
                                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                                                    value={form.dimensions.height}
                                                    onChange={(e) => setForm({
                                                        ...form,
                                                        dimensions: { ...form.dimensions, height: e.target.value }
                                                    })}
                                                />
                                                <p className="text-xs text-gray-500 mt-1">Height</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Warranty */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold mb-2 text-gray-900">
                                            Warranty Information
                                        </label>
                                        <textarea
                                            placeholder="e.g., 1 year manufacturer warranty"
                                            rows={3}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all resize-none"
                                            value={form.warranty}
                                            onChange={(e) => setForm({ ...form, warranty: e.target.value })}
                                        />
                                    </div>

                                    {/* Return Policy */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold mb-2 text-gray-900">
                                            Return Policy
                                        </label>
                                        <textarea
                                            placeholder="e.g., 30-day return policy, free returns"
                                            rows={3}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all resize-none"
                                            value={form.returnPolicy}
                                            onChange={(e) => setForm({ ...form, returnPolicy: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Advanced Tab */}
                            {activeTab === "advanced" && (
                                <div className="space-y-6">
                                    {/* Product Specifications */}
                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-gray-900">
                                            Product Specifications
                                        </label>
                                        <p className="text-sm text-gray-600 mb-4">Add detailed specifications and technical details</p>
                                        
                                        <div className="space-y-3">
                                            {form.specifications.map((spec, index) => (
                                                <div key={index} className="flex gap-3">
                                                    <input
                                                        type="text"
                                                        placeholder="Specification name (e.g., Material)"
                                                        className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                                                        value={spec.key}
                                                        onChange={(e) => updateSpecification(index, "key", e.target.value)}
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Value (e.g., 100% Cotton)"
                                                        className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                                                        value={spec.value}
                                                        onChange={(e) => updateSpecification(index, "value", e.target.value)}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeSpecification(index)}
                                                        className="p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={addSpecification}
                                            className="mt-4 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors flex items-center gap-2 w-full justify-center"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add Specification
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-red-800">Error</h3>
                                <p className="text-red-700 text-sm mt-1">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="bg-white rounded-lg shadow-sm p-6 flex justify-between items-center">
                        <button
                            type="button"
                            onClick={resetForm}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                            Reset Form
                        </button>
                        
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={loading}
                                onClick={(e) => {
                                    setForm({ ...form, status: "draft" });
                                }}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Save as Draft
                            </button>
                            <button
                                type="submit"
                                disabled={loading || form.images.length === 0}
                                className="px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 min-w-[180px] justify-center"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Publish Product"
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
