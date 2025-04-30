// src/components/CartPage.js

import React, { useEffect, useState } from "react";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(cart);
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>🛒 Your Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <ul>
          {cartItems.map((item) => (
            <li key={item._id} style={{ marginBottom: "10px" }}>
              <img src={item.image} alt={item.name} width={100} />
              <div>
                <strong>{item.name}</strong> - ₹{item.price}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CartPage;
