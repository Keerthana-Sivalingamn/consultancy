import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(true);
  // New states for update functionality
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [currentReviewId, setCurrentReviewId] = useState(null);

  const userId = localStorage.getItem("userId");

  const fetchReviews = async () => {
    try {
      const reviewsRes = await axios.get(
        `http://localhost:5000/api/reviews/${id}`
      );
      setReviews(reviewsRes.data);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        // Fetch product details
        const res = await axios.get(`http://localhost:5000/api/products/${id}`);
        setProduct(res.data);

        // Fetch similar products
        const similarRes = await axios.get(
          `http://localhost:5000/api/products/similar/${id}`
        );
        setSimilarProducts(similarRes.data);

        // Fetch wishlist status if user is logged in
        if (userId) {
          const wishlistRes = await axios.get(
            `http://localhost:5000/api/wishlist/${userId}`
          );
          const isInList = wishlistRes.data.some((item) => item._id === id);
          setIsInWishlist(isInList);
        }

        // Fetch reviews separately
        await fetchReviews();
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching product details:", err);
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id, userId]);

  const handleAddToCart = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/cart/add`,
        { productId: id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Product added to cart!");
    } catch (err) {
      console.error("Error adding to cart:", err.response?.data || err.message);
      alert("Failed to add to cart");
    }
  };

  const handleToggleWishlist = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in to manage wishlist");
        return;
      }

      if (isInWishlist) {
        const res = await axios.delete(`http://localhost:5000/api/wishlist/remove`, {
          data: { productId: id },
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 200) {
          setIsInWishlist(false);
          alert("Removed from wishlist");
        }
      } else {
        const res = await axios.post(
          `http://localhost:5000/api/wishlist/add`,
          { productId: id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.status === 201) {
          setIsInWishlist(true);
          alert("Added to wishlist!");
        }
      }
    } catch (err) {
      console.error("Error updating wishlist:", err);
      alert("Failed to update wishlist");
    }
  };

  const handleSubmitReview = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in to submit a review");
        return;
      }
  
      // If we're editing an existing review
      if (isEditingReview && currentReviewId) {
        const res = await axios.put(
          `http://localhost:5000/api/reviews/update`,
          { reviewId: currentReviewId, reviewText, rating },
          { headers: { Authorization: `Bearer ${token}` } }
        );
  
        if (res.status === 200) {
          // After successfully updating the review, fetch the updated reviews
          await fetchReviews();
  
          setReviewText("");
          setRating(5);
          setShowReviewForm(false);
          setIsEditingReview(false);
          setCurrentReviewId(null);
          alert("Review updated successfully!");
        }
      } else {
        // Original code for adding a new review
        const res = await axios.post(
          `http://localhost:5000/api/reviews/add`,
          { productId: id, reviewText, rating },
          { headers: { Authorization: `Bearer ${token}` } }
        );
    
        if (res.status === 201) {
          // After successfully adding the review, fetch the updated reviews
          await fetchReviews();
    
          setReviewText("");
          setRating(5);
          setShowReviewForm(false);
          alert("Review added successfully!");
        }
      }
    } catch (err) {
      console.error("Error handling review:", err);
      alert(`Failed to ${isEditingReview ? 'update' : 'add'} review`);
    }
  };

  // New function to handle editing a review
  const handleEditReview = (review) => {
    setCurrentReviewId(review._id);
    setReviewText(review.reviewText);
    setRating(review.rating);
    setIsEditingReview(true);
    setShowReviewForm(true);
    // Scroll to the review form
    window.scrollTo({
      top: document.querySelector('.review-form-section')?.offsetTop - 100 || 0,
      behavior: 'smooth'
    });
  };

  // New function to handle deleting a review
  const handleDeleteReview = async (reviewId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in to delete a review");
        return;
      }
  
      // Ask for confirmation before deleting
      if (!window.confirm("Are you sure you want to delete this review?")) {
        return;
      }
  
      const res = await axios.delete(
        `http://localhost:5000/api/reviews/delete`,
        { 
          data: { reviewId },
          headers: { Authorization: `Bearer ${token}` } 
        }
      );
  
      if (res.status === 200) {
        // After successfully deleting the review, fetch the updated reviews
        await fetchReviews();
        alert("Review deleted successfully!");
        
        // If we were editing this review, reset the form
        if (currentReviewId === reviewId) {
          setReviewText("");
          setRating(5);
          setShowReviewForm(false);
          setIsEditingReview(false);
          setCurrentReviewId(null);
        }
      }
    } catch (err) {
      console.error("Error deleting review:", err);
      alert("Failed to delete review");
    }
  };

  // Function to cancel editing and reset the form
  const handleCancelEdit = () => {
    setIsEditingReview(false);
    setCurrentReviewId(null);
    setReviewText("");
    setRating(5);
    setShowReviewForm(false);
  };

  // Function to get random user initials for review avatars
  const getUserInitials = (reviewId) => {
    const nameOptions = ["JD", "AR", "SK", "PT", "MN", "LR", "BK", "GS", "VK", "DP"];
    // Use the reviewId to deterministically pick an initial
    const index = parseInt(reviewId.substring(0, 6), 16) % nameOptions.length;
    return nameOptions[index];
  };

  // Function to get background color for avatar
  const getAvatarColor = (reviewId) => {
    const colors = [
      "bg-blue-500", "bg-green-500", "bg-yellow-500", 
      "bg-red-500", "bg-purple-500", "bg-pink-500",
      "bg-indigo-500", "bg-teal-500", "bg-orange-500", "bg-cyan-500"
    ];
    const index = parseInt(reviewId.substring(0, 6), 16) % colors.length;
    return colors[index];
  };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
  
  if (!product) return (
    <div className="p-6 text-center text-xl">
      <div className="bg-red-50 p-6 rounded-lg text-red-700">Product not found</div>
    </div>
  );

  // Calculate average rating
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-gray-50">
      {/* Product Details Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="flex flex-col md:flex-row">
          {/* Product Image */}
          <div className="md:w-2/5">
            <div className="h-96 overflow-hidden bg-gray-100">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain p-4"
              />
            </div>
          </div>
          
          {/* Product Info */}
          <div className="md:w-3/5 p-6">
            <div className="flex justify-between items-center mb-2">
              <h1 className="text-2xl font-bold text-gray-800">{product.name}</h1>
              <button 
                onClick={handleToggleWishlist} 
                className="focus:outline-none transition duration-300 transform hover:scale-110"
              >
                {isInWishlist ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-red-500">
                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                )}
              </button>
            </div>
            
            {/* Rating Summary */}
            {reviews.length > 0 && (
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400 mr-2">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" 
                      className={`w-5 h-5 ${i < Math.round(averageRating) ? "text-yellow-400" : "text-gray-300"}`}>
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                  ))}
                </div>
                <span className="text-gray-600 text-sm">
                  {averageRating} ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
                </span>
              </div>
            )}
            
            {/* Price and Category */}
            <div className="mb-4">
              <p className="text-2xl font-bold text-gray-900 mb-2">₹{product.price}</p>
              <div className="flex items-center text-sm text-gray-600">
                <span className="mr-4">🗂️ Category: {product.category}</span>
                <span className={`${product.availability.toLowerCase().includes('in stock') ? 'text-green-600' : 'text-red-600'}`}>
                  📦 {product.availability}
                </span>
              </div>
            </div>
            
            
            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md font-medium transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Add to Cart 🛒
              </button>
              <button
                onClick={() => {
                  if (isEditingReview) {
                    handleCancelEdit();
                  } else {
                    setShowReviewForm(!showReviewForm);
                  }
                }}
                className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 py-3 px-6 rounded-md font-medium transition duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
              >
                {showReviewForm ? (isEditingReview ? "Cancel Edit" : "Cancel Review") : "Write a Review ✍️"}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 review-form-section">
          <h3 className="text-lg font-semibold mb-4">
            {isEditingReview ? "Edit Your Review" : "Write a Review"}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
              <div className="flex items-center">
                {[5, 4, 3, 2, 1].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRating(r)}
                    className="focus:outline-none"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" 
                      className={`w-6 h-6 ${r <= rating ? "text-yellow-400" : "text-gray-300"}`}>
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Share your experience with this product..."
                rows="4"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleSubmitReview}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                {isEditingReview ? "Update Review" : "Submit Review"}
              </button>
              {isEditingReview && (
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md font-medium transition duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="border-b p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Customer Reviews</h2>
          {!showReviewForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Write a review
            </button>
          )}
        </div>
        
        {reviews && reviews.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {reviews.map((review) => (
              <div key={review._id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 ${getAvatarColor(review._id)} rounded-full flex items-center justify-center text-white text-xs font-medium`}>
                    {getUserInitials(review._id)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900">
                        {review.userName || `User${review._id.substring(0, 4)}`}
                      </p>
                      <div className="flex items-center space-x-3">
                        <span className="text-xs text-gray-500">
                          {formatDate(review.createdAt)}
                        </span>
                        
                        {/* Show edit and delete buttons for all reviews - removed the check */}
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleEditReview(review)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit review"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleDeleteReview(review._id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete review"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex text-yellow-400 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" 
                          className={`w-4 h-4 ${i < review.rating ? "text-yellow-400" : "text-gray-300"}`}>
                          <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                        </svg>
                      ))}
                    </div>
                    
                    <p className="text-sm text-gray-700">{review.reviewText}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
            </div>
            <p className="text-gray-600 mb-2">No reviews yet</p>
            <button
              onClick={() => setShowReviewForm(true)}
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Be the first to write a review
            </button>
          </div>
        )}
      </div>

      {/* Similar Products Section */}
      {similarProducts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Similar Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {similarProducts.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-300"
                onClick={() => navigate(`/products/${item._id}`)}
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-1">{item.name}</h3>
                  <p className="text-blue-600 font-bold">₹{item.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;