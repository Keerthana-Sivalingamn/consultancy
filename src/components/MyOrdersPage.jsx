import React, { useEffect, useState, useRef } from "react";
import { Package, Check, AlertCircle, RefreshCw } from "lucide-react";

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [statusUpdates, setStatusUpdates] = useState({});
  
  // Store previous orders to detect changes
  const previousOrders = useRef({});
  
  // Auto refresh interval (in milliseconds)
  const refreshInterval = 60000; // 1 minute
  const refreshTimerRef = useRef(null);

  const fetchOrders = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    }
    
    try {
      const response = await fetch("https://consultancysrc.onrender.com/api/orders/my", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      
      const data = await response.json();
      
      // Check for status changes
      const updates = {};
      data.forEach(order => {
        const prevOrder = previousOrders.current[order._id];
        if (prevOrder && prevOrder.status !== order.status) {
          updates[order._id] = {
            previous: prevOrder.status,
            current: order.status,
            timestamp: new Date()
          };
        }
      });
      
      // Update previous orders for future comparison
      const orderMap = {};
      data.forEach(order => {
        orderMap[order._id] = order;
      });
      previousOrders.current = orderMap;
      
      // Set updates if any found
      if (Object.keys(updates).length > 0) {
        setStatusUpdates(prev => ({...prev, ...updates}));
      }
      
      setOrders(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError("Could not load orders");
    } finally {
      setLoading(false);
      if (isManualRefresh) {
        setRefreshing(false);
      }
    }
  };

  // Initial load
  useEffect(() => {
    fetchOrders();
    
    // Set up initial previous orders reference
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, []);
  
  // Handle auto-refresh toggle
  useEffect(() => {
    if (autoRefresh) {
      refreshTimerRef.current = setInterval(() => {
        fetchOrders();
      }, refreshInterval);
    } else if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
    }
    
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [autoRefresh]);

  const handleRefresh = () => {
    fetchOrders(true);
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(prev => !prev);
  };
  
  const clearStatusUpdate = (orderId) => {
    setStatusUpdates(prev => {
      const newUpdates = {...prev};
      delete newUpdates[orderId];
      return newUpdates;
    });
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
  
  if (error) return (
    <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center">
      <AlertCircle className="mr-2" size={20} />
      <p>{error}</p>
    </div>
  );

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'placed':
        return <Package className="text-purple-500" />;
      case 'delivered':
        return <Check className="text-green-500" />;
      default:
        return <Package className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'placed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">My Orders</h2>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            {lastUpdated && (
              <span>Last updated: {formatDate(lastUpdated)}</span>
            )}
          </div>
          
          <button 
            onClick={toggleAutoRefresh}
            className={`px-3 py-1 rounded text-sm font-medium ${
              autoRefresh 
                ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                : 'bg-gray-100 text-gray-700 border border-gray-300'
            }`}
          >
            {autoRefresh ? 'Auto-refresh: On' : 'Auto-refresh: Off'}
          </button>
          
          <button 
            onClick={handleRefresh} 
            disabled={refreshing}
            className="flex items-center px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:bg-blue-300"
          >
            <RefreshCw size={16} className={`mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>
      
      {orders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <Package size={48} className="mx-auto text-gray-400 mb-3" />
          <p className="text-lg text-gray-600">No orders found.</p>
          <p className="mt-2 text-gray-500">Your order history will appear here once you make a purchase.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const hasStatusUpdate = statusUpdates[order._id];
            
            return (
              <div key={order._id} className={`bg-white rounded-lg shadow-md overflow-hidden border ${
                hasStatusUpdate ? 'border-green-400 ring-2 ring-green-200' : 'border-gray-200'
              }`}>
                {hasStatusUpdate && (
                  <div className="bg-green-50 p-3 border-b border-green-200 flex justify-between items-center">
                    <div className="text-green-700">
                      <span className="font-medium">Status updated: </span>
                      <span>{hasStatusUpdate.previous} → {hasStatusUpdate.current}</span>
                    </div>
                    <button 
                      onClick={() => clearStatusUpdate(order._id)}
                      className="text-green-700 hover:text-green-900"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
                
                <div className="p-5 border-b border-gray-200 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Order ID</p>
                      <h3 className="text-lg font-semibold text-gray-800">{order._id}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Ordered On</p>
                      <p className="text-gray-700">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-5">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                      <span className="mr-2">{getStatusIcon(order.status || "Placed")}</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status || "Placed")}`}>
                        {order.status || "Placed"}
                      </span>
                    </div>
                    <div className="text-xl font-bold text-gray-800">₹{order.totalAmount}</div>
                  </div>
                  
                  {/* Order Status Timeline - Simplified to just Placed and Delivered */}
                  <div className="mb-6 mt-2">
                    <div className="flex items-center">
                      <div className="relative flex items-center justify-center w-full">
                        {['Placed', 'Delivered'].map((step, index) => {
                          const isDelivered = order.status?.toLowerCase() === 'delivered';
                          const isCompleted = (step === 'Placed') || (step === 'Delivered' && isDelivered);
                          const isActive = (step === 'Placed' && !isDelivered) || (step === 'Delivered' && isDelivered);
                          
                          return (
                            <React.Fragment key={step}>
                              <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  isCompleted ? 'bg-green-500' : 'bg-gray-200'
                                } ${isActive ? 'ring-2 ring-offset-2 ring-green-500' : ''}`}>
                                  {isCompleted && <Check size={16} className="text-white" />}
                                </div>
                                <span className={`text-xs mt-1 ${isCompleted ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                                  {step}
                                </span>
                              </div>
                              {index < 1 && (
                                <div className={`flex-1 h-0.5 ${
                                  isDelivered ? 'bg-green-500' : 'bg-gray-200'
                                }`}></div>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <h4 className="font-semibold mb-3 text-gray-700">Order Items</h4>
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <img
                          src={item.image || "/placeholder.jpg"}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-md mr-4 border border-gray-200"
                        />
                        <div className="flex-grow">
                          <h5 className="font-medium text-gray-800">{item.name}</h5>
                          <p className="text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-800">₹{item.total}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;