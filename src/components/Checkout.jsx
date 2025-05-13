import React, { useEffect, useState } from "react";
import axios from "axios";

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchCart = async () => {
      if (!user || !token) {
        setMessage("User not logged in.");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`http://localhost:5000/api/cart/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setCartItems(res.data);
        const totalAmount = res.data.reduce((sum, item) => sum + item.price * item.quantity, 0);
        setTotal(totalAmount);
      } catch (err) {
        console.error("Error fetching cart:", err);
        setMessage("Failed to load cart.");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [user, token]);

  const handleCheckout = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/checkout",
        { userId: user.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(res.data.message);
      setCartItems([]);
      setTotal(0);
    } catch (err) {
      console.error("Checkout error:", err);
      setMessage(err.response?.data?.message || "Checkout failed.");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">🛍 Checkout</h2>

      {message && <div className="mb-4 text-blue-600">{message}</div>}

      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item._id} className="flex items-center justify-between border-b pb-2">
                <div>
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-gray-600">₹{item.price} x {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">₹{item.price * item.quantity}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-right">
            <p className="text-lg font-semibold">Total: ₹{total}</p>
          </div>

          <div className="mt-6">
            <button
              onClick={handleCheckout}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
