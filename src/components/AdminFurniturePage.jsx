import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminFurniturePage = () => {
  const [furnitureItems, setFurnitureItems] = useState([]);
  const [editItemId, setEditItemId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    image: "",
    price: "",
    category: "",
    availability: "In Stock",
    quantity: 1,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("https://consultancysrc.onrender.com/api/products");
      console.log("Fetched products:", res.data);
      setFurnitureItems(res.data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  };

  const handleDelete = async (productId) => {
    const cleanId = productId.replace(/^"(.*)"$/, '$1');
    try {
      await axios.delete(`https://consultancysrc.onrender.com/api/products/${cleanId}`);
      const updatedItems = furnitureItems.filter((item) => item._id !== productId);
      setFurnitureItems(updatedItems);
      console.log("✅ Item deleted:", productId);
    } catch (error) {
      console.error("❌ Delete error:", error);
    }
  };
  
  
  
  
  

  const handleEditClick = (item) => {
    setEditItemId(item._id);
    setForm({
      name: item.name || "",
      image: item.image || "",
      price: item.price || 0,
      category: item.category || "",
      availability: item.availability || "",
      quantity: item.quantity || 0,
    });
  };
  

  const handleUpdate = async () => {
    try {
      const cleanId = editItemId.trim();
      const token = localStorage.getItem("token");
  
      // Convert price and quantity to numbers
      const updatedForm = {
        ...form,
        price: Number(form.price),
        quantity: Number(form.quantity),
      };
  
      console.log("📦 Payload to update:", updatedForm);
      console.log("🆔 ID to update:", cleanId);
  
      await axios.put(
        `https://consultancysrc.onrender.com/api/products/${cleanId}`,
        updatedForm,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("🔐 Token being sent:", token);

      setEditItemId(null);
      fetchProducts();
    } catch (err) {
      console.error("❌ Failed to update product:", err);
    }
  };
  
  
  
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
        🛠️ Admin - Manage Furniture
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {furnitureItems.map((item) => (
          <div key={item._id} className="bg-white p-4 rounded-xl shadow">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-48 object-cover rounded mb-4"
            />
            <h2 className="text-xl font-semibold">{item.name}</h2>
            <p>💰 ₹{item.price}</p>
            <p>🗂️ {item.category}</p>
            <p className={item.availability === "In Stock" ? "text-green-600" : "text-red-600"}>
              📦 {item.availability}
            </p>
            <p>🔢 {item.quantity}</p>

            <div className="mt-3 flex gap-2">
              <button
                onClick={() => handleEditClick(item)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => handleDelete(item._id)}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {editItemId && (
        <div className="fixed bottom-0 left-0 right-0 bg-white p-6 border-t shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">✏️ Edit Product</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {["name", "image", "price", "category", "availability", "quantity"].map((field) => (
              <input
                key={field}
                type={field === "price" || field === "quantity" ? "number" : "text"}
                name={field}
                value={form[field]}
                onChange={handleInputChange}
                placeholder={`Enter ${field}`}
                className="border rounded px-3 py-2"
              />
            ))}
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setEditItemId(null)}
              className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFurniturePage;
