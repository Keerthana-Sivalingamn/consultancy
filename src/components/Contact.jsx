import { FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

const Contact = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 via-purple-500 to-indigo-700 px-6 py-10">
      {/* Title */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white">Contact Us</h1>
        <p className="text-gray-200 mt-2">Feel free to get in touch with us!</p>
      </div>

      {/* Contact Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
        {/* Address */}
        <div className="flex flex-col items-center bg-white shadow-lg p-6 rounded-lg transform transition duration-300 hover:scale-105 hover:shadow-2xl">
          <FaMapMarkerAlt className="text-3xl text-green-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-800">ADDRESS</h3>
          <p className="text-gray-600 text-center">
            No.123/70, Dhanalakshmi Complex, <br />
            Peramanur Main Road, Salem - 636 007.
          </p>
        </div>

        {/* Phone */}
        <div className="flex flex-col items-center bg-white shadow-lg p-6 rounded-lg transform transition duration-300 hover:scale-105 hover:shadow-2xl">
          <FaPhone className="text-3xl text-blue-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-800">PHONE</h3>
          <p className="text-gray-600">89733 87788</p>
          <p className="text-gray-600">99657 70788</p>
        </div>

        {/* Email */}
        <div className="flex flex-col items-center bg-white shadow-lg p-6 rounded-lg transform transition duration-300 hover:scale-105 hover:shadow-2xl">
          <FaEnvelope className="text-3xl text-red-500 mb-3" />
          <h3 className="text-lg font-semibold text-gray-800">EMAIL</h3>
          <p className="text-gray-600">asfurnitures.2014@gmail.com</p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
