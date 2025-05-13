import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkoutSummary, setCheckoutSummary] = useState(null);
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const fetchWishlist = async () => {
    if (!user || !token) {
      setError("User or token not found.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`http://localhost:5000/api/cart/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log("Cart data received:", res.data);
      
      const updated = res.data.map((item) => {
        return { 
          ...item, 
          quantity: item.quantity || 1 
        };
      });
      
      setWishlist(updated);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching wishlist:", err);
      setError("Failed to fetch wishlist.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user, token]);
  const handleRemove = async (cartItemId) => {
  if (!cartItemId || !token) {
    console.error("Invalid cartItemId or token");
    return;
  }

  try {
    // Optimistic UI update - remove the item from the UI immediately
    setWishlist(prevWishlist => prevWishlist.filter(item => item._id !== cartItemId));
    
    // Make API call to remove item from backend
    const response = await axios.delete(
      `http://localhost:5000/api/cart/remove/${cartItemId}`,
      { 
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      }
    );
    
    console.log("Item removed successfully:", response.data);
    
  } catch (err) {
    console.error("Error removing item from cart:", err.response?.data || err.message);
    
    // Log additional details for debugging
    if (err.response) {
      console.error("Response status:", err.response.status);
      console.error("Response data:", err.response.data);
    }
    
    // Revert the optimistic update if the API call fails
    fetchWishlist();
    
    // Show error to user
    setError("Failed to remove item from cart. Please try again.");
  }
};

 const handleQuantityChange = async (cartItemId, productId, newQuantity) => {
  if (newQuantity < 1) return;
  
  console.log("Starting quantity update:", { cartItemId, productId, newQuantity });

  // Trim IDs and ensure they're not undefined or null
  const userId = user?.id?.trim() || "";
  const productIdTrimmed = productId?.toString()?.trim() || "";
  
  if (!userId || !productIdTrimmed) {
    console.error("Invalid userId or productId");
    return;
  }

  // DEBUG: Log the wishlist before update
  console.log("Wishlist before update:", wishlist);

  // Update UI immediately for better UX (optimistic update)
  setWishlist(prevWishlist => {
    const updatedWishlist = prevWishlist.map(item => {
      if (item._id === cartItemId) {
        console.log(`Updating item ${cartItemId} from quantity ${item.quantity} to ${newQuantity}`);
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    
    // DEBUG: Log the updated wishlist
    console.log("Updated wishlist (optimistic):", updatedWishlist);
    return updatedWishlist;
  });

  try {
    // Log the values being sent
    console.log(`API call params: userId=${userId}, productId=${productIdTrimmed}, quantity=${newQuantity}`);
    
    // Make the API call
    const response = await axios.put(
      `http://localhost:5000/api/cart/update/${userId}/${productIdTrimmed}`,
      { quantity: newQuantity },
      { 
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      }
    );
    
    console.log("API response:", response.data);
    
    // Force a re-fetch to ensure UI is in sync with backend
    // Uncomment this if optimistic updates aren't working:
    // await fetchWishlist();
    
  } catch (err) {
    console.error("Error updating quantity:", err.response?.data || err.message);
    
    // Log additional details for debugging
    if (err.response) {
      console.error("Response status:", err.response.status);
      console.error("Response data:", err.response.data);
    }
    
    // Revert the optimistic update if the API call fails
    fetchWishlist();
  } finally {
    // DEBUG: Log the final wishlist state
    console.log("Wishlist after operation:", wishlist);
  }
};

  // Validate phone number
  const validatePhone = (phone) => {
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      setPhoneError("Please enter a valid 10-digit phone number");
      return false;
    }
    setPhoneError("");
    return true;
  };

  // Checkout Logic
  const handleCheckout = () => {
    const summary = wishlist.map((item) => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity || 1,
      total: item.price * (item.quantity || 1),
      image: item.image || "",
      category: item.category || "General",
    }));
    const totalAmount = summary.reduce((sum, item) => sum + item.total, 0);
    setCheckoutSummary({ items: summary, totalAmount });
  };

  // Confirm Order
  const handleConfirmOrder = async () => {
    // Validate phone number before proceeding
    if (!validatePhone(phoneNumber)) {
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/orders",
        {
          userId: user.id,
          items: checkoutSummary.items,
          totalAmount: checkoutSummary.totalAmount,
          address,
          phoneNumber,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      const orderId = response.data.orderId;
  
      alert("Order placed successfully!");
      navigate("/order-success", { state: { orderId } });
    } catch (err) {
      console.error("Error placing order:", err);
      setError("Failed to place order.");
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-700 font-medium">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-red-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-center text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-red-500 text-center">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full mt-6 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            My Cart
          </h2>
          <p className="mt-1 text-lg text-gray-500">
            {wishlist.length === 0 ? 'Your cart is empty' : `You have ${wishlist.length} item${wishlist.length !== 1 ? 's' : ''} in your cart`}
          </p>
        </div>

        {wishlist.length === 0 ? (
          <div className="bg-white shadow-md rounded-lg p-8 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
            <button 
              onClick={() => navigate('/products')} 
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-2/3">
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900">Cart Items</h3>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {wishlist.map((item) => {
                    // Extract the product ID properly
                    const productId = item.productId && typeof item.productId === 'object'
                      ? item.productId._id
                      : item.productId;
                    
                    return (
                      <div key={item._id} className="p-6 flex flex-col sm:flex-row">
                        <div className="sm:w-24 sm:h-24 h-32 w-full flex-shrink-0 bg-gray-100 rounded-md overflow-hidden mb-4 sm:mb-0">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-center object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                            }}
                          />
                        </div>
                        
                        <div className="sm:ml-6 flex-1 flex flex-col">
                          <div className="flex justify-between">
                            <div>
                              <h4 className="text-lg font-medium text-gray-900">{item.name}</h4>
                              <p className="mt-1 text-sm text-gray-500">Item #{item._id.slice(-6)}</p>
                            </div>
                            <p className="text-lg font-medium text-gray-900">₹{item.price}</p>
                          </div>
                          
                          <div className="mt-4 flex justify-between items-end">
                            <div className="flex items-center">
                              <label htmlFor={`quantity-${item._id}`} className="sr-only">Quantity</label>
                              <div className="flex border border-gray-300 rounded-md">
                                <button 
                                  type="button"
                                  onClick={() => handleQuantityChange(item._id, productId, (item.quantity || 1) - 1)}
                                  className="p-2 text-gray-500 hover:text-gray-700"
                                  disabled={(item.quantity || 1) <= 1}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                  </svg>
                                </button>
                                <input
                                  id={`quantity-${item._id}`}
                                  type="number"
                                  min="1"
                                  value={item.quantity || 1}
                                  onChange={(e) => handleQuantityChange(item._id, productId, parseInt(e.target.value) || 1)}
                                  className="w-12 text-center border-x border-gray-300 py-1"
                                />
                                <button 
                                  type="button"
                                  onClick={() => handleQuantityChange(item._id, productId, (item.quantity || 1) + 1)}
                                  className="p-2 text-gray-500 hover:text-gray-700"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => handleRemove(item._id)}
                              className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="mt-6 flex justify-between items-center">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Continue Shopping
                </button>
                
                {!checkoutSummary && (
                  <button
                    onClick={handleCheckout}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Proceed to Checkout
                  </button>
                )}
              </div>
            </div>
            
            {checkoutSummary && (
              <div className="lg:w-1/3">
                <div className="bg-white shadow-md rounded-lg overflow-hidden sticky top-8">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900">Order Summary</h3>
                  </div>
                  
                  <div className="p-6">
                    <div className="flow-root">
                      <ul className="-my-4 divide-y divide-gray-200">
                        {checkoutSummary.items.map((item, index) => (
                          <li key={index} className="py-4 flex justify-between">
                            <div className="flex-1 flex">
                              {item.image && (
                                <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden mr-3">
                                  <img 
                                    src={item.image} 
                                    alt={item.name} 
                                    className="w-full h-full object-center object-cover"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                                    }}
                                  />
                                </div>
                              )}
                              <div>
                                <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                                <p className="mt-1 text-sm text-gray-500">Qty: {item.quantity}</p>
                              </div>
                            </div>
                            <p className="text-sm font-medium text-gray-900">₹{item.total}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <div className="flex justify-between items-center text-base font-medium text-gray-900">
                        <p>Total Amount</p>
                        <p>₹{checkoutSummary.totalAmount}</p>
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
                    </div>
                    
                    <div className="mt-6">
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                        Delivery Address
                      </label>
                      <textarea
                        id="address"
                        name="address"
                        rows="3"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Enter your full delivery address"
                        required
                      ></textarea>
                    </div>
                    
                    <div className="mt-6">
  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
    Phone Number
  </label>
  <textarea
    id="phoneNumber"
    name="phoneNumber"
    rows="3"
    value={phoneNumber}
    onChange={(e) => {
      setPhoneNumber(e.target.value);
      if (phoneError) validatePhone(e.target.value);
    }}
    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
      phoneError ? 'border-red-500' : ''
    }`}
    placeholder="Enter your 10-digit phone number"
    style={{ minHeight: '80px' }}
    required
  ></textarea>
  {phoneError && (
    <p className="mt-1 text-sm text-red-600">{phoneError}</p>
  )}
</div>
                    
                    <div className="mt-6">
                      <button
                        onClick={handleConfirmOrder}
                        disabled={!address.trim() || !phoneNumber.trim() || phoneError}
                        className={`w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white ${
                          address.trim() && phoneNumber.trim() && !phoneError ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-300 cursor-not-allowed'
                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                      >
                        Place Order
                      </button>
                      {!address.trim() && (
                        <p className="mt-2 text-sm text-red-600">Please enter your delivery address</p>
                      )}
                      {!phoneNumber.trim() && !phoneError && (
                        <p className="mt-2 text-sm text-red-600">Please enter your phone number</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;