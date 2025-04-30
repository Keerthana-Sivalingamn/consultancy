import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/products/${id}`);
        setProduct(res.data);

        const similarRes = await axios.get(
          `http://localhost:5000/api/products?category=${res.data.category}`
        );
        const filteredSimilar = similarRes.data.filter((p) => p._id !== id);
        setSimilarProducts(filteredSimilar);
      } catch (err) {
        console.error("Error fetching product details:", err);
      }
    };

    fetchProduct();
  }, [id]);

  if (!product) return <div className="p-6 text-center text-xl">Loading...</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded-xl shadow mb-8 flex flex-col md:flex-row gap-6">
        <img
          src={product.image}
          alt={product.name}
          className="w-full md:w-1/3 h-auto object-cover rounded"
        />
        <div className="flex-1">
          <h2 className="text-3xl font-bold mb-2">{product.name}</h2>
          <p className="text-gray-700 text-lg mb-2">💰 ₹{product.price}</p>
          <p className="text-gray-600 mb-2">🗂️ Category: {product.category}</p>
          <p className="text-sm text-gray-500 mb-2">📦 {product.availability}</p>
          <p className="text-md mb-4">{product.description}</p>

          <button
            onClick={() => alert("Add to Cart logic here")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Add to Cart 🛒
          </button>
        </div>
      </div>

      <h3 className="text-2xl font-semibold mb-4">🔁 Similar Products</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {similarProducts.map((item) => (
          <div
            key={item._id}
            className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition cursor-pointer"
            onClick={() => navigate(`/products/${item._id}`)}
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-40 object-cover rounded mb-2"
            />
            <h4 className="text-lg font-medium">{item.name}</h4>
            <p className="text-sm text-gray-600">₹{item.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductDetails;
