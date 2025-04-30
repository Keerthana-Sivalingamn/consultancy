import React, { useState, useEffect } from "react";
import axios from "axios";

const MyWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]); // State to store available products

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!token) {
        alert("Please login to view your wishlist.");
        return;
      }

      try {
        // Fetch the user ID (You might have this stored in the token or user context)
        const userId = "yourUserId"; // Replace this with actual user ID logic from your token or context

        // Fetch wishlist items from backend
        const res = await axios.get(`http://localhost:5000/api/wishlist/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWishlistItems(res.data);
      } catch (err) {
        console.error("Failed to fetch wishlist:", err);
        alert("❌ Failed to load wishlist.");
      } finally {
        setLoading(false);
      }
    };

    // Fetch available products (assuming there's an endpoint for this)
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/products", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(res.data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        alert("❌ Failed to load products.");
      }
    };

    fetchWishlist();
    fetchProducts();
  }, [token]);

  const handleAddToWishlist = async (productId) => {
    if (!token) {
      alert("Please login to add items to wishlist.");
      return;
    }

    try {
      // Make API call to add product to wishlist
      const res = await axios.post(
        "http://localhost:5000/api/wishlist/add", 
        { productId }, // Pass productId as data
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update wishlist state
      setWishlistItems((prev) => [...prev, res.data]);
      alert("✅ Product added to wishlist.");
    } catch (err) {
      console.error("Failed to add to wishlist:", err);
      alert("❌ Could not add product to wishlist.");
    }
  };

  const handleRemoveFromWishlist = async (itemId) => {
    if (!token) {
      alert("Please login to remove items.");
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/my-wishlist/remove/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setWishlistItems((prev) => prev.filter((item) => item._id !== itemId));
      alert("✅ Item removed from wishlist.");
    } catch (err) {
      console.error("Remove failed:", err);
      alert("❌ Could not remove item.");
    }
  };

  if (loading) {
    return <div className="text-center text-xl mt-12">Loading your wishlist...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">❤️ My Wishlist</h1>

      {wishlistItems.length === 0 ? (
        <p className="text-center text-gray-600">Your wishlist is empty.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <div
              key={item._id}
              className="bg-white p-4 rounded-xl shadow hover:shadow-xl transition flex flex-col"
            >
              <img
                src={item.image || "https://via.placeholder.com/150"}
                alt={item.name}
                className="w-full h-48 object-cover rounded mb-4"
              />
              <h2 className="text-xl font-semibold mb-1">{item.name}</h2>
              <p className="text-gray-700 font-medium">💰 ₹{item.price}</p>
              <p className="text-sm text-gray-600">🗂️ Category: {item.category}</p>
              <p
                className={`text-sm mt-1 ${
                  item.availability === "In Stock" ? "text-green-600" : "text-red-500"
                }`}
              >
                📦 {item.availability}
              </p>

              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={() => handleRemoveFromWishlist(item._id)}
                  className="text-red-500 hover:text-red-600 text-2xl"
                  title="Remove from Wishlist"
                >
                  ❌
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="text-2xl font-bold text-center text-gray-800 mt-8 mb-4">Add Products to Wishlist</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product._id}
            className="bg-white p-4 rounded-xl shadow hover:shadow-xl transition flex flex-col"
          >
            <img
              src={product.image || "https://via.placeholder.com/150"}
              alt={product.name}
              className="w-full h-48 object-cover rounded mb-4"
            />
            <h2 className="text-xl font-semibold mb-1">{product.name}</h2>
            <p className="text-gray-700 font-medium">💰 ₹{product.price}</p>
            <p className="text-sm text-gray-600">🗂️ Category: {product.category}</p>

            <div className="mt-4 flex justify-between items-center">
              <button
                onClick={() => handleAddToWishlist(product._id)}
                className="text-blue-500 hover:text-blue-600"
                title="Add to Wishlist"
              >
                ➕ Add to Wishlist
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyWishlist;
