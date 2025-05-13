import React from 'react';

const OrderStatusTracker = ({ currentStep }) => {
  const steps = ['Cart', 'Payment', 'Order Confirmed', 'Delivery'];

  return (
    <div className="flex justify-center items-center mt-8">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold 
                ${index <= currentStep ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'}`}
            >
              {index < currentStep ? '✓' : index + 1}
            </div>
            <span className="mt-2 text-xs text-center w-24">{step}</span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-16 h-1 mx-2 ${index < currentStep ? 'bg-green-500' : 'bg-gray-300'}`}
            ></div>
          )}
        </div>
      ))}
    </div>
  );
};

export default OrderStatusTracker;
