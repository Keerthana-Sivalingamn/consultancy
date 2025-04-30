import React, { useState, useEffect } from "react";
import axios from "axios";

const FurnitureGallery = () => {
  const [furnitureItems, setFurnitureItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/products");
        setFurnitureItems(res.data);
        setFilteredItems(res.data);

        const apiCategories = [...new Set(res.data.map(item => item.category))];
        const manualCategories = ["Sofa", "Chair", "Table", "Bed", "Shelf"];
        const uniqueCategories = ["All", ...new Set([...apiCategories, ...manualCategories])];

        setCategories(uniqueCategories);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };
    fetchProducts();
  }, []);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (category === "All") {
      setFilteredItems(furnitureItems);
    } else {
      setFilteredItems(furnitureItems.filter(item => item.category === category));
    }
  };

  const handleAddToCart = async (item) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login to add items to cart.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/cart/add",
        {
          productId: item._id,
          quantity: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(`${item.name} added to cart 🛒`);
      console.log("Cart item saved:", response.data);
    } catch (error) {
      console.error("Failed to add to cart:", error);
      alert("❌ Failed to add to cart. Please try again.");
    }
  };

  const handleAddToWishlist = async (item) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login to add items to wishlist.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/wishlist/add",
        {
          productId: item._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(`${item.name} added to wishlist ❤️`);
      console.log("Wishlist item saved:", response.data);
    } catch (error) {
      console.error("Failed to add to wishlist:", error);
      alert("❌ Failed to add to wishlist. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">🪑 Furniture Gallery</h1>

      {/* Category Filter Buttons */}
      <div className="mb-8 flex gap-3 flex-wrap justify-center">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-4 py-2 rounded-full border transition duration-200 ${
              selectedCategory === cat
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-800 hover:bg-blue-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item._id}
            className="bg-white p-4 rounded-xl shadow hover:shadow-xl transition flex flex-col"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-48 object-cover rounded mb-4"
            />
            <h2 className="text-xl font-semibold mb-1">{item.name}</h2>
            <p className="text-gray-700 font-medium">💰 ₹{item.price}</p>
            <p className="text-sm text-gray-600">🗂️ Category: {item.category}</p>

            {item.availability && (
              <p
                className={`text-sm ${
                  item.availability === "In Stock" ? "text-green-600" : "text-red-500"
                }`}
              >
                📦 {item.availability}
              </p>
            )}
            {"quantity" in item && (
              <p className="text-sm text-gray-800">🔢 Quantity: {item.quantity}</p>
            )}

            <div className="flex justify-between items-center mt-auto">
              <button
                onClick={() => handleAddToCart(item)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
              >
                Add to Cart 🛒
              </button>

              <button
                onClick={() => handleAddToWishlist(item)}
                className="text-red-500 hover:text-red-600 text-2xl"
              >
                ❤️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FurnitureGallery;
