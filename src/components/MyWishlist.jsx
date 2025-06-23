import React, { useState, useEffect } from "react";

const MyWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!token) {
        setError("Please login to view your wishlist.");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching wishlist with token:", token.substring(0, 10) + "...");
        
        // Fetch wishlist items from the backend using fetch instead of axios
        const response = await fetch("https://consultancysrc.onrender.com/api/wishlist", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${await response.text()}`);
        }
        
        const data = await response.json();
        console.log("Wishlist API response:", data);
        
        if (Array.isArray(data)) {
          setWishlistItems(data);
        } else if (data.items && Array.isArray(data.items)) {
          // Handle if API returns { items: [] } format
          setWishlistItems(data.items);
        } else {
          console.error("Unexpected API response format:", data);
          setError("Received invalid data format from server");
        }
      } catch (err) {
        console.error("Failed to fetch wishlist:", err);
        setError(err.message || "Failed to load wishlist");
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [token]);

  const handleRemoveFromWishlist = async (productId) => {
    if (!token) {
      setError("Please login to remove items.");
      return;
    }

    try {
      // Send the productId in the request body using fetch instead of axios
      const response = await fetch("https://consultancysrc.onrender.com/api/wishlist/remove", {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ productId }) // Pass productId to the backend
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${await response.text()}`);
      }

      // If successful, remove the item from the state
      setWishlistItems((prev) => 
        prev.filter((item) => {
          // Handle both possible data structures
          const itemId = item.productId?._id || item.productId || item._id;
          return itemId !== productId;
        })
      );
      
      // Use a temporary notification instead of an alert
      const notification = document.createElement("div");
      notification.className = "fixed top-4 right-4 bg-green-500 text-white p-3 rounded-md shadow-md";
      notification.textContent = "✅ Product removed from wishlist";
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
      
    } catch (err) {
      console.error("Remove failed:", err);
      setError(err.message || "Could not remove product");
    }
  };

  // Function to render each wishlist item based on different possible data structures
  const renderWishlistItem = (item) => {
    // Handle different possible data structures
    const product = item.productId || item;
    const id = product._id || product.id;
    const name = product.name || "Unknown Product";
    const price = product.price || 0;
    const category = product.category || "Uncategorized";
    const image = product.image || "https://via.placeholder.com/150";

    return (
      <div
        key={id}
        className="bg-white p-4 rounded-xl shadow hover:shadow-xl transition flex flex-col"
      >
        <img
          src={image}
          alt={name}
          className="w-full h-48 object-cover rounded mb-4"
        />
        <h2 className="text-xl font-semibold mb-1">{name}</h2>
        <p className="text-gray-700 font-medium">💰 ₹{price}</p>
        <p className="text-sm text-gray-600">🗂️ Category: {category}</p>

        <div className="mt-4 flex justify-end items-center">
          <button
            onClick={() => handleRemoveFromWishlist(id)}
            className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition"
            title="Remove from Wishlist"
          >
            Remove
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 border-l-gray-200 border-r-gray-200 rounded-full animate-spin mb-4"></div>
          <p className="text-xl text-gray-700">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">❤️ My Wishlist</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      {!error && wishlistItems.length === 0 ? (
        <div className="text-center bg-white p-8 rounded-xl shadow max-w-md mx-auto">
          <p className="text-gray-600 text-lg mb-4">Your wishlist is empty.</p>
          <button 
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition"
            onClick={() => window.location.href = "/dashboard"}
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistItems.map(renderWishlistItem)}
        </div>
      )}
      
      {/* Debug section - toggle visibility with a button */}
      
    </div>
  );
};

// Separate debug component with collapsible state


export default MyWishlist;