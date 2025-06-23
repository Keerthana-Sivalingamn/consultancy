import React, { useState, useEffect } from "react";
import axios from "axios";
import { Upload, DollarSign, Package, Grid, Tag, Check, X, ShoppingBag } from "lucide-react";

const AddProduct = () => {
  const [product, setProduct] = useState({
    name: "",
    image: "",
    price: "",
    category: "",
    availability: "In Stock",
    quantity: "",
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (parseFloat(product.price) <= 0) {
      setErrorMessage("❌ Price must be greater than 0");
      return;
    }
  
    if (parseInt(product.quantity) < 0 || product.quantity === "") {
      setErrorMessage("❌ Quantity must be a non-negative number");
      return;
    }
  
    setLoading(true);
  
    // Get the token from localStorage
    const token = localStorage.getItem("token");
  
    if (!token) {
      setErrorMessage("❌ You need to log in first.");
      setLoading(false);
      return;
    }
  
    try {
      // Include the token in the Authorization header
      await axios.post(
        "https://consultancysrc.onrender.com/api/products", 
        product, 
        {
          headers: {
            Authorization: `Bearer ${token}`,  // Include the token in the Authorization header
          }
        }
      );
  
      setSuccessMessage("✅ Product added successfully!");
      setProduct({
        name: "",
        image: "",
        price: "",
        category: "",
        availability: "In Stock",
        quantity: "",
      });
    } catch (err) {
      console.error("Error adding product:", err);
      setErrorMessage("❌ Failed to add product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Left sidebar with illustration */}
          <div className="bg-blue-600 text-white p-8 md:w-1/3 flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-6">Add New Product</h2>
              <p className="mb-4 text-blue-100">
                Fill in the details to add a new product to your inventory.
              </p>
              <div className="space-y-4 mt-8">
                <div className="flex items-center">
                  <Check className="text-green-300 mr-2" size={20} />
                  <span>Easy product management</span>
                </div>
                <div className="flex items-center">
                  <Check className="text-green-300 mr-2" size={20} />
                  <span>Real-time inventory tracking</span>
                </div>
                <div className="flex items-center">
                  <Check className="text-green-300 mr-2" size={20} />
                  <span>Automatic availability updates</span>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <ShoppingBag size={64} className="text-blue-300" />
            </div>
          </div>

          {/* Main form area */}
          <div className="p-8 md:w-2/3">
            <h1 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
              <Package className="mr-2 text-blue-600" />
              Product Details
            </h1>

            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded flex items-center">
                <Check className="mr-2" size={20} />
                {successMessage}
              </div>
            )}
            
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded flex items-center">
                <X className="mr-2" size={20} />
                {errorMessage}
              </div>
            )}

            <div className="space-y-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Product Name</label>
                <input
                  name="name"
                  placeholder="Enter product name"
                  value={product.name}
                  onChange={handleChange}
                  className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Image URL</label>
                <div className="flex items-center">
                  <input
                    name="image"
                    placeholder="https://example.com/image.jpg"
                    value={product.image}
                    onChange={handleChange}
                    className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required
                  />
                  <Upload className="ml-2 text-gray-400" size={20} />
                </div>
              </div>

              {product.image && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700 mb-2">Image Preview</p>
                  <div className="bg-gray-100 p-2 rounded-lg inline-block">
                    <img
                      src={product.image}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-md border border-gray-200"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <DollarSign className="mr-1 text-gray-500" size={16} />
                    Price
                  </label>
                  <input
                    name="price"
                    type="number"
                    placeholder="0.00"
                    value={product.price}
                    onChange={handleChange}
                    className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <Package className="mr-1 text-gray-500" size={16} />
                    Quantity
                  </label>
                  <input
                    name="quantity"
                    type="number"
                    placeholder="0"
                    value={product.quantity}
                    onChange={handleChange}
                    className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <Grid className="mr-1 text-gray-500" size={16} />
                    Category
                  </label>
                  <select
                    name="category"
                    value={product.category}
                    onChange={handleChange}
                    className="border border-gray-300 p-3 w-full rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Sofa">Sofa</option>
                    <option value="Chair">Chair</option>
                    <option value="Table">Table</option>
                    <option value="Bed">Bed</option>
                    <option value="Shelf">Shelf</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <Tag className="mr-1 text-gray-500" size={16} />
                    Availability
                  </label>
                  <select
                    name="availability"
                    value={product.availability}
                    onChange={handleChange}
                    className="border border-gray-300 p-3 w-full rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition flex items-center justify-center ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding Product...
                  </>
                ) : (
                  <>
                    <Check className="mr-2" size={20} />
                    Add Product
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;