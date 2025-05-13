import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Set this to your backend server's URL
const API_BASE_URL = 'http://localhost:5000';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Get token from localStorage or wherever you store it
      const token = localStorage.getItem('token');
      
      // Check if token exists before making the request
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      // Modified to include user details with populate
      const response = await axios.get(`${API_BASE_URL}/api/orders/placed`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log('Response:', response.data);
      
      if (response.data && Array.isArray(response.data.orders)) {
        setOrders(response.data.orders);
      } else if (Array.isArray(response.data)) {
        setOrders(response.data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsDelivered = async (orderId) => {
    try {
      // Get token from localStorage for this request too
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      const response = await axios.put(
        `${API_BASE_URL}/api/orders/${orderId}/deliver`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log('Order marked as delivered:', response.data);
      
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: 'Delivered' } : order
      ));
      
      alert('Order marked as Delivered');
    } catch (err) {
      console.error('Error marking order as delivered:', err);
      alert('Failed to update: ' + (err.response?.data?.error || err.message));
    }
  };

  // Format the date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Display phone number as normal without special formatting
  const formatPhoneNumber = (phoneStr) => {
    if (!phoneStr) return 'N/A';
    // Just return the phone number as is without any formatting
    return phoneStr;
  };

  // Get status badge styling
  const getStatusBadgeStyle = (status) => {
    const baseStyle = {
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    };

    if (status === 'Delivered') {
      return {
        ...baseStyle,
        backgroundColor: '#d4edda',
        color: '#155724',
        border: '1px solid #c3e6cb'
      };
    } else {
      return {
        ...baseStyle,
        backgroundColor: '#fff3cd',
        color: '#856404',
        border: '1px solid #ffeeba'
      };
    }
  };

  return (
    <div className="admin-orders-container" style={{ 
      padding: '30px', 
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    }}>
      <h2 style={{ 
        marginBottom: '30px', 
        color: '#343a40', 
        fontSize: '28px',
        fontWeight: '700',
        borderBottom: '2px solid #007bff',
        paddingBottom: '10px',
        display: 'inline-block'
      }}>
        Manage Orders
      </h2>
      
      {loading ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          padding: '50px'
        }}>
          <p style={{ 
            fontSize: '18px',
            color: '#6c757d'
          }}>Loading orders...</p>
        </div>
      ) : error ? (
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#f8d7da', 
          border: '1px solid #f5c6cb',
          borderRadius: '8px',
          color: '#721c24',
          marginBottom: '20px'
        }}>
          <p style={{ margin: 0 }}>Error: {error}</p>
        </div>
      ) : orders.length === 0 ? (
        <div style={{ 
          padding: '40px',
          textAlign: 'center',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
        }}>
          <p style={{ 
            fontSize: '18px',
            color: '#6c757d'
          }}>No placed orders available.</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div 
              key={order._id} 
              className="order-card"
              style={{
                border: 'none',
                borderRadius: '12px',
                padding: '25px',
                marginBottom: '30px',
                backgroundColor: 'white',
                boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
                transition: 'transform 0.2s',
                ':hover': {
                  transform: 'translateY(-5px)'
                }
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '20px',
                borderBottom: '1px solid #f1f1f1',
                paddingBottom: '15px'
              }}>
                <div>
                  <h3 style={{ 
                    margin: '0', 
                    color: '#343a40', 
                    fontSize: '18px',
                    fontWeight: '600'
                  }}>
                    Order <span style={{ color: '#007bff' }}>#{order._id.substring(order._id.length - 8)}</span>
                  </h3>
                  <p style={{ 
                    margin: '5px 0 0', 
                    color: '#6c757d', 
                    fontSize: '14px' 
                  }}>
                    {order.createdAt ? formatDate(order.createdAt) : 'N/A'}
                  </p>
                </div>
                <span style={getStatusBadgeStyle(order.status || 'Placed')}>
                  {order.status || 'Placed'}
                </span>
              </div>
              
              <div style={{ 
                display: 'flex', 
                flexDirection: 'row',
                gap: '25px'
              }}>
                <div style={{ 
                  flex: '1',
                  backgroundColor: '#f8f9fa',
                  padding: '20px',
                  borderRadius: '8px'
                }}>
                  <h4 style={{ 
                    margin: '0 0 15px',
                    color: '#495057',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}>Order Details</h4>
                  
                  <div style={{ marginBottom: '12px' }}>
                    <p style={{ 
                      margin: '0 0 5px', 
                      color: '#6c757d',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}>CUSTOMER</p>
                    <p style={{ 
                      margin: '0',
                      color: '#212529',
                      fontSize: '15px',
                      fontWeight: '500'
                    }}>
                      {/* If userId has been populated with user data */}
                      {order.userId && typeof order.userId === 'object' && order.userId.name ? 
                        order.userId.name : 
                        'Customer #' + (order.userId ? String(order.userId).substring(0, 8) : 'Unknown')
                      }
                    </p>
                  </div>
                  
                  {/* Phone number section - newly added */}
                  <div style={{ marginBottom: '12px' }}>
                    <p style={{ 
                      margin: '0 0 5px', 
                      color: '#6c757d',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}>PHONE</p>
                    <p style={{ 
                      margin: '0',
                      color: '#212529',
                      fontSize: '15px',
                      fontWeight: '500'
                    }}>
                      {formatPhoneNumber(order.phoneNumber)}
                    </p>
                  </div>
                  
                  <div style={{ marginBottom: '12px' }}>
                    <p style={{ 
                      margin: '0 0 5px', 
                      color: '#6c757d',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}>TOTAL AMOUNT</p>
                    <p style={{ 
                      margin: '0',
                      color: '#212529',
                      fontSize: '18px',
                      fontWeight: '700'
                    }}>${order.totalAmount?.toFixed(2) || '0.00'}</p>
                  </div>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <p style={{ 
                      margin: '0 0 5px', 
                      color: '#6c757d',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}>SHIPPING ADDRESS</p>
                    <p style={{ 
                      margin: '0',
                      color: '#212529',
                      fontSize: '15px',
                      lineHeight: '1.4'
                    }}>{order.address || 'Not provided'}</p>
                  </div>
                  
                  <button
                    onClick={() => handleMarkAsDelivered(order._id)}
                    disabled={order.status === 'Delivered'}
                    style={{
                      backgroundColor: order.status === 'Delivered' ? '#6c757d' : '#007bff',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '6px',
                      cursor: order.status === 'Delivered' ? 'not-allowed' : 'pointer',
                      fontWeight: '600',
                      fontSize: '14px',
                      width: '100%',
                      transition: 'background-color 0.2s',
                      boxShadow: order.status === 'Delivered' ? 'none' : '0 3px 8px rgba(0,123,255,0.2)'
                    }}
                  >
                    {order.status === 'Delivered' ? 'Already Delivered' : 'Mark as Delivered'}
                  </button>
                </div>
                
                <div style={{ flex: '2' }}>
                  <h4 style={{ 
                    margin: '0 0 15px',
                    color: '#495057',
                    fontSize: '16px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    Order Items 
                    <span style={{ 
                      marginLeft: '10px',
                      backgroundColor: '#e9ecef',
                      color: '#495057',
                      fontSize: '14px',
                      fontWeight: '600',
                      padding: '2px 8px',
                      borderRadius: '20px'
                    }}>
                      {order.items?.length || 0}
                    </span>
                  </h4>
                  
                  <div style={{
                    maxHeight: '400px',
                    overflowY: 'auto',
                    paddingRight: '10px'
                  }}>
                    {order.items && order.items.map((item, index) => (
                      <div 
                        key={index}
                        style={{ 
                          display: 'flex', 
                          marginBottom: '15px',
                          padding: '15px',
                          backgroundColor: '#f8f9fa',
                          borderRadius: '8px',
                          border: '1px solid #f1f1f1'
                        }}
                      >
                        <div style={{ 
                          width: '100px', 
                          height: '100px', 
                          marginRight: '20px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          boxShadow: '0 3px 10px rgba(0,0,0,0.1)'
                        }}>
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.name || 'Product'} 
                              style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover'
                              }}
                            />
                          ) : (
                            <div 
                              style={{ 
                                width: '100%', 
                                height: '100%', 
                                backgroundColor: '#e9ecef',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#6c757d',
                                fontWeight: '500',
                                fontSize: '13px'
                              }}
                            >
                              No Image
                            </div>
                          )}
                        </div>
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center'
                        }}>
                          <p style={{ 
                            margin: '0 0 8px 0', 
                            fontWeight: '600',
                            fontSize: '16px',
                            color: '#343a40'
                          }}>
                            {item.name || 'Unknown Product'}
                          </p>
                          <div style={{
                            display: 'flex',
                            gap: '25px'
                          }}>
                            <p style={{ 
                              margin: '0', 
                              color: '#6c757d',
                              fontSize: '15px'
                            }}>
                              <span style={{ fontWeight: '500' }}>Qty:</span> {item.quantity}
                            </p>
                            <p style={{ 
                              margin: '0',
                              color: '#343a40',
                              fontWeight: '600',
                              fontSize: '15px'
                            }}>
                              ${item.price?.toFixed(2) || '0.00'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;