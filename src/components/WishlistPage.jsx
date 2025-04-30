import { useEffect, useState } from "react";
import axios from "axios";

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      // Debugging log to check user and token
      console.log("User:", user);
      console.log("Token:", token);

      // Ensure both user and token exist
      if (!user || !token) {
        setError("User or token not found.");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`http://localhost:5000/api/cart/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setWishlist(res.data); // Set fetched wishlist items
        setLoading(false); // Stop loading state
      } catch (err) {
        console.error("Error fetching wishlist:", err);
        setError("Failed to fetch wishlist.");
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []); // Empty dependency array, will run only on mount

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">🛒 My Wishlist</h2>
      {wishlist.length === 0 ? (
        <p>No items in wishlist.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {wishlist.map((item) => (
            <div key={item._id} className="border rounded p-4 shadow-md">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-40 object-cover"
              />
              <h3 className="text-lg font-medium mt-2">{item.name}</h3>
              <p className="text-gray-600">₹{item.price}</p>
              <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
