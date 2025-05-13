import { FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

const Contact = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 via-purple-500 to-indigo-700 px-6 py-16 text-white">
      {/* Title */}
      <div className="text-center mb-14">
        <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
          Get in Touch With Us
        </h1>
        <p className="mt-3 text-lg text-gray-200">
          We're here to help — reach out with any questions or feedback!
        </p>
      </div>

      {/* Contact Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full max-w-6xl">
        {/* Address */}
        <div className="bg-white/10 backdrop-blur-md shadow-xl rounded-xl p-8 text-center border border-white/20 transition-transform hover:scale-105">
          <FaMapMarkerAlt className="text-4xl text-green-300 mb-4 animate-pulse" />
          <h3 className="text-xl font-semibold mb-2 text-white">ADDRESS</h3>
          <p className="text-gray-200 leading-relaxed">
            D.No:142/90,SND Road<br />
            Thiruchengode-637211.
          </p>
        </div>

        {/* Phone */}
        <div className="bg-white/10 backdrop-blur-md shadow-xl rounded-xl p-8 text-center border border-white/20 transition-transform hover:scale-105">
          <FaPhone className="text-4xl text-blue-300 mb-4 animate-bounce" />
          <h3 className="text-xl font-semibold mb-2 text-white">PHONE</h3>
          <p className="text-gray-200">9842710130</p>
          <p className="text-gray-200">9994370130</p>
        </div>

        {/* Email */}
        <div className="bg-white/10 backdrop-blur-md shadow-xl rounded-xl p-8 text-center border border-white/20 transition-transform hover:scale-105">
          <FaEnvelope className="text-4xl text-pink-300 mb-4 animate-fade-in" />
          <h3 className="text-xl font-semibold mb-2 text-white">EMAIL</h3>
          <p className="text-gray-200">arumugamele1965@gmail.com</p>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-16 text-center">
        <h2 className="text-2xl font-semibold mb-4">Need a quick response?</h2>
        <button className="bg-white text-blue-700 font-semibold px-6 py-3 rounded-full hover:bg-gray-100 transition shadow-lg">
          Send Us a Message
        </button>
      </div>
    </div>
  );
};

export default Contact;
