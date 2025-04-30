import React, { useState } from "react";

const ProductCard = ({ product }) => {
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    // Get existing cart from localStorage or start new one
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    // Check if product already exists in cart
    const isAlreadyInCart = cart.some(item => item._id === product._id);

    if (!isAlreadyInCart) {
      cart.push(product); // Add new product
      localStorage.setItem("cart", JSON.stringify(cart)); // Update localStorage
      alert("✅ Item added to cart!");
      setAdded(true);

      // Reset button after 2 seconds
      setTimeout(() => {
        setAdded(false);
      }, 2000);
    } else {
      alert("⚠️ Item already in cart!");
    }
  };

  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} width={200} />
      <h3>{product.name}</h3>
      <p>₹ {product.price}</p>
      <button onClick={handleAddToCart} disabled={added}>
        {added ? "Added ✅" : "Add to Cart"}
      </button>
    </div>
  );
};

export default ProductCard;
