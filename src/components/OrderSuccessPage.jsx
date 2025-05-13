import { useEffect, useState } from 'react';
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom'; // Import useLocation
import axios from 'axios';

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();  // Access state passed through the navigation
  const orderId = state?.orderId;   // Get orderId from the state

  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const email = user?.email;

    if (email && orderId) {
      axios.post("http://localhost:5000/api/send-confirmation", {
        email,
        orderId,
      })
      .then(() => {
        console.log('Confirmation email sent');
      })
      .catch((err) => {
        console.error('Error sending email:', err);
      });
    }

    // Redirect to dashboard after 3 seconds
    const timer = setTimeout(() => {
      navigate('/dashboard'); // Actual navigation to the dashboard
    }, 3000);

    // Countdown logic
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(countdownInterval);
    };
  }, [navigate, orderId]);  // Ensure orderId is a dependency

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">
          <div className="bg-green-100 p-4 rounded-full">
            <CheckCircle className="text-green-500 w-16 h-16" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Successful!</h1>
        <p className="text-gray-600 mb-6">
          Your order has been placed successfully. You will receive a confirmation email shortly.
        </p>

        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <ShoppingBag className="text-indigo-500 mr-3" />
              <span className="font-medium">Order tracking</span>
            </div>
            <span className="text-indigo-600 font-medium">#{orderId}</span>
          </div>

          <div className="bg-indigo-50 p-4 rounded-lg text-indigo-700">
            <p className="font-medium">Thank you for your purchase!</p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4 mb-4">
          <p className="text-gray-500 flex items-center justify-center">
            Redirecting to dashboard in <span className="mx-2 font-bold">{countdown}</span> seconds
          </p>
        </div>

        <button 
          onClick={() => navigate('/dashboard')} 
          className="flex items-center justify-center w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          Go to Dashboard Now
          <ArrowRight className="ml-2 w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
