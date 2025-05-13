import React, { useState, useEffect } from "react";
import { FileText, Download, Filter, Calendar, CheckCircle } from "lucide-react";

const AdminOrderReport = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState([]);

  const token = localStorage.getItem("token");

  const fetchOrders = async () => {
    setError("");
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (status !== "all") params.append("status", status);

      const response = await fetch(`http://localhost:5000/api/orders?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch orders");

      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [startDate, endDate, status]);

  const generateReport = async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (status !== "all") params.append("status", status);

      const url = `http://localhost:5000/api/orders/report?${params.toString()}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to generate report");

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `orders-report-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to render order status with appropriate color
  const renderOrderStatus = (status) => {
    if (status === "Placed") {
      return (
        <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
          {status}
        </span>
      );
    } else if (status === "Delivered") {
      return (
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
          <CheckCircle size={14} className="inline mr-1" />
          {status}
        </span>
      );
    } else {
      return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">{status}</span>;
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-lg shadow-lg border border-blue-100">
      <div className="flex items-center mb-6">
        <div className="bg-blue-500 p-3 rounded-lg shadow-md">
          <FileText size={24} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 ml-3">Order Reports</h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex items-center mb-4">
          <Calendar size={18} className="text-blue-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-700">Filter Options</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Orders</option>
              <option value="Placed">Placed</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg border border-blue-100">
        <div className="text-sm text-gray-600 flex items-center">
          <Filter size={16} className="text-blue-500 mr-2" />
          <span>Filter orders to generate a detailed report</span>
        </div>

        <button
          onClick={generateReport}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 shadow-md transition-all duration-200 transform hover:scale-105"
        >
          {loading ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Generating...
            </>
          ) : (
            <>
              <Download size={16} className="mr-2" />
              Generate PDF Report
            </>
          )}
        </button>
      </div>

      {orders.length > 0 && (
        <div className="mt-6 overflow-x-auto bg-white rounded-lg shadow-md">
          <table className="w-full table-auto">
            <thead className="bg-gray-50 text-sm border-b">
              <tr>
                <th className="p-3 text-left font-semibold text-gray-600">Order ID</th>
                <th className="p-3 text-left font-semibold text-gray-600">Customer</th>
                <th className="p-3 text-left font-semibold text-gray-600">Status</th>
                <th className="p-3 text-left font-semibold text-gray-600">Date</th>
                <th className="p-3 text-left font-semibold text-gray-600">Total Amount</th>
                <th className="p-3 text-left font-semibold text-gray-600">Product</th>
                <th className="p-3 text-left font-semibold text-gray-600">Quantity</th>
                <th className="p-3 text-left font-semibold text-gray-600">Address</th>

              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-blue-50 transition-colors duration-150">
                  <td className="p-3 text-sm font-medium text-blue-600">{order._id}</td>
                  <td className="p-3">{order.userId?.name || "N/A"}</td>
                  <td className="p-3">{renderOrderStatus(order.status)}</td>
                  <td className="p-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="p-3 font-medium">₹{order.totalAmount.toFixed(2)}</td>
                  <td className="p-3">
                    <ul className="space-y-1">
                      {order.items.map((item, idx) => (
                        <li key={idx} className="text-sm flex items-center">
                          <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                          {item.name}
                        </li>
                      ))}
                    </ul>
                  </td>
                
                  <td className="p-3">
                    <ul className="space-y-1">
                      {order.items.map((item, idx) => (
                        <li key={idx} className="text-sm text-center font-medium">
                          {item.quantity}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="p-3 text-sm text-gray-700">{order.address || "N/A"}</td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOrderReport;