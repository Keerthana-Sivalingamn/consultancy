import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentPage = () => {
  const [selectedMethod, setSelectedMethod] = useState('');
  const [paymentStatus, setPaymentStatus] = useState(null);
  const navigate = useNavigate();

  const handlePayment = () => {
    if (!selectedMethod) {
      alert('Please select a payment method.');
      return;
    }

    // Simulate payment process
    setPaymentStatus('Processing...');
    setTimeout(() => {
      setPaymentStatus('Payment Successful ✅');
      setTimeout(() => {
        navigate('/order-success');
      }, 2000); // Redirect after 2 seconds
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <h2 className="text-2xl font-semibold mb-4">💳 Payment Page</h2>

      <div className="w-full max-w-md">
        <label className="block mb-2 font-medium">Select Payment Method:</label>
        <select
          value={selectedMethod}
          onChange={(e) => setSelectedMethod(e.target.value)}
          className="w-full border rounded p-2 mb-4"
        >
          <option value="">-- Select --</option>
          <option value="credit">Credit Card</option>
          <option value="debit">Debit Card</option>
          <option value="upi">UPI</option>
          <option value="cod">Cash on Delivery</option>
        </select>

        <button
          onClick={handlePayment}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Pay Now
        </button>

        {paymentStatus && (
          <div className="mt-4 text-center text-green-600 font-semibold">
            {paymentStatus}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
