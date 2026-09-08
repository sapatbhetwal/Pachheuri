import React, { useState } from "react";
import { assets } from "../assets/frontend_assets/assets";
import Title from "../components/Title";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [sent, setSent] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setSent(true);

    setTimeout(() => {
      setSent(false);
    }, 3000);

    setFormData({
      name: "",
      email: "",
      message: "",
    });
  };

  return (
    <div className="section-padding py-16">
      <Title text1="Contact" />

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-start">
        {/* Left Section */}
        <div>
          <img
            src={assets.contact_img}
            alt="Contact"
            className="w-full h-[430px] object-cover rounded-lg shadow-md"
          />

          <div className="mt-8 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Our Store
              </h3>
              <p className="text-gray-600 mt-1">
                Main Road, Biratnagar
                <br />
                Nepal
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Email
              </h3>
              <p className="text-gray-600 mt-1">
                support@pachheuri.com
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Phone
              </h3>
              <p className="text-gray-600 mt-1">
                +977 9868713835
              </p>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="bg-gray-100 rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Send us a Message
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Your name"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Message
              </label>

              <textarea
                rows="5"
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Write your message..."
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition duration-300"
            >
              {sent ? "✓ Message Sent!" : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;