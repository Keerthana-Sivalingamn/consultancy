import React, { useState, useEffect } from "react";
import axios from "axios";

const AddProduct = () => {
  const [product, setProduct] = useState({
    name: "",
    image: "",
    price: "",
    category: "",
    availability: "In Stock",
    quantity: "", // NEW FIELD
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
        "http://localhost:5000/api/products", 
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
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Add Product</h1>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <input
          name="name"
          placeholder="Product Name"
          value={product.name}
          onChange={handleChange}
          className="border p-3 w-full rounded"
          required
        />

        <input
          name="image"
          placeholder="Image URL"
          value={product.image}
          onChange={handleChange}
          className="border p-3 w-full rounded"
          required
        />

        {product.image && (
          <img
            src={product.image}
            alt="Preview"
            className="w-32 h-32 object-cover border rounded"
          />
        )}

        <input
          name="price"
          type="number"
          placeholder="Price"
          value={product.price}
          onChange={handleChange}
          className="border p-3 w-full rounded"
          required
        />

        <input
          name="quantity"
          type="number"
          placeholder="Quantity Available"
          value={product.quantity}
          onChange={handleChange}
          className="border p-3 w-full rounded"
          required
        />

        <select
          name="category"
          value={product.category}
          onChange={handleChange}
          className="border p-3 w-full rounded"
          required
        >
          <option value="">Select Category</option>
          <option value="Sofa">Sofa</option>
          <option value="Chair">Chair</option>
          <option value="Table">Table</option>
          <option value="Bed">Bed</option>
          <option value="Shelf">Shelf</option>
        </select>

        <select
          name="availability"
          value={product.availability}
          onChange={handleChange}
          className="border p-3 w-full rounded"
        >
          <option value="In Stock">In Stock</option>
          <option value="Out of Stock">Out of Stock</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded transition ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Adding..." : "Add Product"}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
